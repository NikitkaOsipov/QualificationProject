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
use Illuminate\Support\Facades\Cache;
use Throwable;

class UserController extends Controller
{
    // How long will online indicator will live in cash
    private const ONLINE_TTL_SECONDS = 90;

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
     * Return authenticated user friends with computed online state.
     */
    public function friends(Request $request)
    {
        $authUser = Auth::user();

        $search = trim((string) $request->query('search', ''));
        $limit = (int) $request->query('limit', 200);
        $limit = max(1, min($limit, 500));

        $query = $authUser->friends()->select(['users.id', 'users.name', 'users.email', 'users.avatar_path']);

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('users.name', 'like', "%{$search}%")
                    ->orWhere('users.email', 'like', "%{$search}%");
            });
        }

        $friends = $query
            ->orderBy('users.name')
            ->limit($limit)
            ->get();

        $now = now();

        $friendsPayload = $friends->map(function (User $friend) use ($now) {
                $lastSeenAt = Cache::get($this->onlineCacheKey($friend->id));
                $isOnline = false;

                if ($lastSeenAt) {
                    try {
                        $isOnline = $now->diffInSeconds(\Carbon\Carbon::parse($lastSeenAt)) <= self::ONLINE_TTL_SECONDS;
                    } catch (\Throwable $exception) {
                        $isOnline = false;
                    }
                }

                return [
                    'id' => $friend->id,
                    'name' => $friend->name,
                    'email' => $friend->email,
                    'avatar_path' => $friend->avatar_path,
                    'is_online' => $isOnline,
                ];
            }) // Sort that online friends are on top, and then by name
            ->sort(function (array $left, array $right) {
                if ($left['is_online'] !== $right['is_online']) {
                    return $left['is_online'] ? -1 : 1;
                }

                return strcasecmp($left['name'], $right['name']);
            })
            ->values();

        return response()->json([
            'data' => $friendsPayload,
        ]);
    }

    // Help functions

    /**
     * Update authenticated user online status timestamp
     */
    public function updateOnlineStatus()
    {
        $authUser = Auth::user();
        Cache::put($this->onlineCacheKey($authUser->id), now()->toIso8601String(), now()->addSeconds(self::ONLINE_TTL_SECONDS * 2));

        return response()->json([
            'status' => 'ok',
            'is_online' => true,
        ]);
    }

    private function onlineCacheKey(int $userId): string
    {
        return "user-online:{$userId}";
    }
}
