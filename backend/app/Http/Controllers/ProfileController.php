<?php

namespace App\Http\Controllers;

use App\Http\Resources\EventResource;
use App\Http\Resources\UserResource;
use App\Models\Event;
use App\Models\Friend;
use App\Models\FriendshipRequest;
use App\Models\User;
use App\Support\EventHelper;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        $authUser = Auth::user();

        $eventsCount    = $user->events()
            ->with('visibility')
            ->get()
            ->filter(fn (Event $event) => EventHelper::canUserSeeEventInProfile($authUser, $event))
            ->count();
        $followersCount = $user->followers()->count();
        $friendsCount   = $user->friendsCount();

        $isFollowing      = false;
        $isOwner          = false;
        $friendshipStatus = 'none'; // none | pending_sent | pending_received | friends

        if ($authUser) {
            $isFollowing = $authUser->following()->where('target_id', $user->id)->exists();
            $isOwner     = $authUser->id === $user->id;

            if (!$isOwner) {
                if (Friend::areFriends($authUser->id, $user->id)) {
                    $friendshipStatus = 'friends';
                } else {
                    $req = FriendshipRequest::getBetween($authUser->id, $user->id);
                    if ($req) {
                        $friendshipStatus = $req->user_id === $authUser->id
                            ? 'pending_sent'
                            : 'pending_received';
                    }
                }
            }
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar ?? null,
                'stats' => [
                    'events' => $eventsCount,
                    'followers' => $followersCount,
                    'friends' => $friendsCount,
                ]
            ],
            'meta' => [
                'isFollowing' => $isFollowing,
                'isOwner' => $isOwner,
                'friendshipStatus' => $friendshipStatus,
            ],
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function events(User $user)
    {
        $viewer = Auth::user();
        $perPage = 9;
        $currentPage = LengthAwarePaginator::resolveCurrentPage();

        $events = $user->events()
            ->with('visibility')
            ->latest()
            ->get()
            ->filter(fn (Event $event) => EventHelper::canUserSeeEventInProfile($viewer, $event))
            ->values();

        $paginator = new LengthAwarePaginator(
            $events->forPage($currentPage, $perPage)->values(),
            $events->count(),
            $perPage,
            $currentPage,
            [
                'path' => request()->url(),
                'query' => request()->query(),
            ]
        );

        return EventResource::collection($paginator);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function comments(User $user)
    {
        return response()->json(
            $user->comments()->latest()->paginate(10)
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function likes(User $user)
    {
        return response()->json(
            $user->likedEvents()->latest()->paginate(9)
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function following(User $user)
    {
        return UserResource::collection(
            $user->following()->paginate(10)
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function friends(User $user)
    {
        $friends = $user->friends()->paginate(10);
        return UserResource::collection($friends);
    }
}
