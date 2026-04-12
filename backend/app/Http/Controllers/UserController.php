<?php

namespace App\Http\Controllers;

use App\Models\Follower;
use App\Models\Friend;
use App\Models\FriendshipRequest;
use App\Models\User;
use App\Notifications\FriendRequestAcceptedNotification;
use App\Notifications\FriendRequestReceivedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Throwable;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    public function follow(User $targetUser)
    {
        try {
            $authUser = Auth::user();

            if ($authUser->id === $targetUser->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You cannot follow yourself'
                ], 400);
            }

            $existing = Follower::where([
                'follower_id' => $authUser->id,
                'target_id' => $targetUser->id,
            ])->first();

            if ($existing) {
                $existing->delete();
                $isFollowing = false;
            } else {
                Follower::create([
                    'follower_id' => $authUser->id,
                    'target_id' => $targetUser->id,
                ]);
                $isFollowing = true;
            }

            return response()->json([
                'status' => 'ok',
                'message' => $isFollowing ? 'You are successfully following' : 'You successfully unfollowed',
            ]);

        } catch (Throwable $e) {
            \Log::error('Follow failed', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Something went wrong',
            ], 500);
        }
    }

    /**
     * Send a friend request to $targetUser.
     */
    public function sendFriendRequest(User $targetUser)
    {
        try {
            $authUser = Auth::user();

            if ($authUser->id === $targetUser->id) {
                return response()->json(['status' => 'error', 'message' => 'You cannot add yourself'], 400);
            }

            if (Friend::areFriends($authUser->id, $targetUser->id)) {
                return response()->json(['status' => 'error', 'message' => 'Already friends'], 409);
            }

            if (FriendshipRequest::getBetween($authUser->id, $targetUser->id)) {
                return response()->json(['status' => 'error', 'message' => 'Request already exists'], 409);
            }

            FriendshipRequest::create([
                'user_id'     => $authUser->id,
                'receiver_id' => $targetUser->id,
                'status'      => 'pending',
            ]);

            $targetUser->notify(new FriendRequestReceivedNotification($authUser));

            return response()->json(['status' => 'ok', 'message' => 'Friend request sent']);
        } catch (Throwable $e) {
            \Log::error('sendFriendRequest failed', ['error' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => 'Something went wrong'], 500);
        }
    }

    /**
     * Accept or decline a friend request from $targetUser.
     */
    public function respondFriendRequest(User $targetUser, Request $request)
    {
        try {
            $request->validate(['action' => 'required|in:accept,decline']);

            $authUser = Auth::user();

            $friendRequest = FriendshipRequest::where('user_id', $targetUser->id)
                ->where('receiver_id', $authUser->id)
                ->where('status', 'pending')
                ->firstOrFail();

            if ($request->action === 'accept') {
                $friendRequest->update(['status' => 'accepted']);
                Friend::create(['user1_id' => $targetUser->id, 'user2_id' => $authUser->id]);

                $targetUser->notify(new FriendRequestAcceptedNotification($authUser));

                return response()->json(['status' => 'ok', 'message' => 'Friend request accepted']);
            } else {
                $friendRequest->update(['status' => 'declined']);
                return response()->json(['status' => 'ok', 'message' => 'Friend request declined']);
            }
        } catch (Throwable $e) {
            \Log::error('respondFriendRequest failed', ['error' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => 'Something went wrong'], 500);
        }
    }

    /**
     * Cancel an outgoing friend request OR remove an existing friendship.
     */
    public function removeFriend(User $targetUser)
    {
        try {
            $authUser = Auth::user();

            // Cancel outgoing request
            FriendshipRequest::where('user_id', $authUser->id)
                ->where('receiver_id', $targetUser->id)
                ->delete();

            // Remove friendship
            Friend::removeFriendship($authUser->id, $targetUser->id);

            return response()->json(['status' => 'ok', 'message' => 'Friendship removed']);
        } catch (Throwable $e) {
            \Log::error('removeFriend failed', ['error' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => 'Something went wrong'], 500);
        }
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
    public function show(user $targetUser)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(user $targetUser)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, user $targetUser)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(user $targetUser)
    {
        //
    }
}
