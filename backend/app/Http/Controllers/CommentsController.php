<?php

namespace App\Http\Controllers;

use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Event;
use App\Models\User;
use App\Notifications\CommentReceivedNotification;
use App\Support\EventHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CommentsController extends Controller
{
    /**
     * Store a newly created comment in storage.
     */
    public function store(Request $request)
    {
        $fields = $request->validate([
            'text' => 'required|string|max:500|min:3',
            'event_id' => 'required|integer|exists:events,id',
        ]);

        $event = Event::query()->find($fields['event_id']);
        if (! $event) {
            return EventHelper::errorResponse('Event not found.', 404);
        }

        if (! EventHelper::canUserAccessEvent(Auth::user(), $event)) {
            return EventHelper::errorResponse('You do not have access to this event.', 403);
        }

        $fields['user_id'] = Auth::id();

        try {
            $comment = Comment::query()->create($fields)->load('user');

            if ($event->user_id !== Auth::id()) {
                $eventOwner = User::query()->find($event->user_id);

                if ($eventOwner) {
                    $eventOwner->notify(new CommentReceivedNotification(
                        Auth::user(),
                        $event->id,
                        $event->title,
                    ));
                }
            }
        } catch (\Exception $exception) {
            Log::info('Error'. $exception->getMessage());

            return EventHelper::errorResponse('Failed to create comment. Please try again later.' . $exception->getMessage(), 500);
        }

        return EventHelper::successResponse('Comment created successfully', [
            'comment' => new CommentResource($comment),
        ], 201);
    }

    public function update(Request $request, Comment $comment)
    {
        if ((int) $comment->user_id !== (int) Auth::id()) {
            return EventHelper::errorResponse('You can only edit your own comments.', 403);
        }

        $fields = $request->validate([
            'text' => 'required|string|max:500|min:3',
        ]);

        $comment->text = $fields['text'];
        $comment->save();

        return EventHelper::successResponse('Comment updated successfully');
    }

    public function destroy(Comment $comment)
    {
        if ((int) $comment->user_id !== (int) Auth::id()) {
            return EventHelper::errorResponse('You can only delete your own comments.', 403);
        }

        $comment->delete();

        return EventHelper::successResponse('Comment deleted successfully');
    }

    /**
     * Display the specified resource.
     */
    public function eventComments(Event $event)
    {
        if (! EventHelper::canUserAccessEvent(Auth::user(), $event)) {
            return EventHelper::errorResponse('You do not have access to this event.', 403);
        }

        $comments = $event->comments()->with('user')->latest()->get();

        return CommentResource::collection($comments);
    }

    /**
     * Display the specified resource.
     */
    public function userComments(User $user)
    {
        return response()->json($user->comments());
    }

}
