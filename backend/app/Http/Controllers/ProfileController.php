<?php

namespace App\Http\Controllers;

use App\Http\Resources\EventResource;
use App\Http\Resources\UserResource;
use App\Models\Friend;
use App\Models\FriendshipRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        $authUser = Auth::user();

        $eventsCount    = $user->events()->count();
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
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function events(User $user)
    {
        return EventResource::collection(
            $user->events()->latest()->paginate(9)
        );
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
