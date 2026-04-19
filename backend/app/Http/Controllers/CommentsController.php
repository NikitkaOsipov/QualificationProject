<?php

namespace App\Http\Controllers;

use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Event;
use App\Models\User;
use App\Notifications\CommentReceivedNotification;
use App\Support\EventHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CommentsController extends Controller
{
    /**
     * Store a newly created comment in storage.
     */
    public function store(Request $request)
    {
        $fields = $request->validate([
            'text' => 'required|string|max:255|min:3',
            'event_id' => 'required|integer|exists:events,id',
        ]);

        $event = Event::query()->find($fields['event_id']);
        if (! $event) {
            return response()->json([
                'error' => 'Event not found.',
            ], 404);
        }

        if (! EventHelper::canUserAccessEvent(Auth::user(), $event)) {
            return response()->json([
                'error' => 'You do not have access to this event.',
            ], 403);
        }

        Log::info(Auth::id());
        $fields['user_id'] = Auth::id();

        try {
            $comment = Comment::create($fields);

            if ($event && $event->user_id !== Auth::id()) {
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

            return response()->json([
                'error' => 'Failed to create comment. Please try again later.' . $exception->getMessage(),
            ], 500);
        }

        return response()->json([
            'success' => 'Comment created successfully',
            'comment' => $comment,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function eventComments(Event $event)
    {
        if (! EventHelper::canUserAccessEvent(Auth::user(), $event)) {
            return response()->json([
                'error' => 'You do not have access to this event.',
            ], 403);
        }

        Log::info("---------------------------------Comments");
//        Log::info(CommentResource::collection($event->comments));
        Log::info("---------------------------------Comments");
        return CommentResource::collection($event->comments);
    }
    /**
     * Display the specified resource.
     */
    public function userComments(User $user)
    {
        return response()->json($user->comments());
    }

}
