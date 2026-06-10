<?php
/**
 * Šis kontrolieris nodrošina komentāru pārvaldību pasākumos.
 * Tas satur piecas galvenās funkcijas:
 * - store(): Izveido jaunu komentāru pie pasākuma.
 * - update(): Atjaunina esoša komentāra tekstu.
 * - destroy(): Dzēš komentāru.
 * - eventComments(): Atgriež visus komentārus konkrētam pasākumam.
 * - userComments(): Atgriež konkrētā lietotāja komentārus.
 */

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
     * Store a newly created comment for the specified event
     */
    public function store(Request $request)
    {
        $fields = $request->validate([
            'text' => 'required|string|max:500|min:3',
            'event_id' => 'required|integer|exists:events,id',
        ]);

        $event = Event::query()->find($fields['event_id']);
        if (! $event) {
            return EventHelper::errorResponse('Pasākums nav atrasts.', 404);
        }

        if (! EventHelper::canUserAccessEvent(Auth::user(), $event)) {
            return EventHelper::errorResponse('Jums nav piekļuves šim pasākumam.', 403);
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

            return EventHelper::errorResponse('Neizdevās izveidot komentāru. Lūdzu, mēģiniet vēlāk.' . $exception->getMessage(), 500);
        }

        return EventHelper::successResponse('Komentārs veiksmīgi izveidots', [
            'comment' => new CommentResource($comment),
        ], 201);
    }

    /**
     * Update the text of an existing comment
     */
    public function update(Request $request, Comment $comment)
    {
        if ((int) $comment->user_id !== (int) Auth::id()) {
            return EventHelper::errorResponse('Jūs varat rediģēt tikai savus komentārus.', 403);
        }

        $fields = $request->validate([
            'text' => 'required|string|max:500|min:3',
        ]);

        $comment->text = $fields['text'];
        $comment->save();

        return EventHelper::successResponse('Komentārs veiksmīgi atjaunināts');
    }

    /**
     * Delete the specified comment
     */
    public function destroy(Comment $comment)
    {
        if ((int) $comment->user_id !== (int) Auth::id()) {
            return EventHelper::errorResponse('Jūs varat dzēst tikai savus komentārus.', 403);
        }

        $comment->delete();

        return EventHelper::successResponse('Komentārs veiksmīgi dzēsts');
    }

    /**
     * Retrieve all comments for the specified event
     */
    public function eventComments(Event $event)
    {
        if (! EventHelper::canUserAccessEvent(Auth::user(), $event)) {
            return EventHelper::errorResponse('Jums nav piekļuves šim pasākumam.', 403);
        }

        $comments = $event->comments()->with('user')->latest()->get();

        return CommentResource::collection($comments);
    }

    /**
     * Retrieve all comments made by the specified user
     */
    public function userComments(User $user)
    {
        return response()->json($user->comments());
    }
}
