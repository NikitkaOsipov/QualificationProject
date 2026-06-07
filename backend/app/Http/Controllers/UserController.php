<?php

namespace App\Http\Controllers;

use App\Models\Follower;
use App\Models\Friend;
use App\Models\FriendshipRequest;
use App\Models\User;
use App\Notifications\FriendRequestAcceptedNotification;
use App\Notifications\FriendRequestReceivedNotification;
use App\Support\EventHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Throwable;

class UserController extends Controller
{
    // How long will online indicator will live in cash
    private const ONLINE_TTL_SECONDS = 90;

    public function update(Request $request) {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'avatar' => ['nullable', 'file', 'image', 'mimes:jpeg,png,jpg,webp,svg', 'max:4096'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $updated = [];

        if (isset($validated['name'])) {
            $updated['name'] = $validated['name'];
        }

        if (isset($validated['email'])) {
            if ($validated['email'] !== $user->email) {
                $updated['email_verified_at'] = null;
            }
            $updated['email'] = $validated['email'];
        }

        $oldAvatarPath = null;
        if ($request->hasFile('avatar')) {
            $newAvatarPath = Storage::disk('public')->putFile('AvatarImages', $request->file('avatar'));
            if (!$newAvatarPath) {
                return EventHelper::errorResponse('Neizdevās augšupielādēt profila attēlu.', 500);
            }
            $oldAvatarPath = $user->avatar_path;
            $updated['avatar_path'] = $newAvatarPath;
        }

        if (!empty($validated['password'])) {
            $updated['password'] = Hash::make($validated['password']);
        }

        if (!empty($updated)) {
            $user->update($updated);
        }

        if ($oldAvatarPath && $oldAvatarPath !== ($updated['avatar_path'] ?? null)) {
            Storage::disk('public')->delete($oldAvatarPath);
        }

        return $user->fresh();
    }

    public function follow(User $targetUser)
    {
        try {
            $authUser = Auth::user();

            if ($authUser->id === $targetUser->id) {
                return EventHelper::errorResponse('Jūs nevarat sekot pats sev', 400);
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

            return EventHelper::successResponse(
                message: $isFollowing ? 'Jūs veiksmīgi sekojat lietotājam' : 'Jūs veiksmīgi pārtraucāt sekošanu'
            );

        } catch (Throwable $e) {
            \Log::error('Follow failed', [
                'error' => $e->getMessage(),
            ]);

            return EventHelper::errorResponse('Radās kļūda', 500);
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
                return EventHelper::errorResponse('Jūs nevarat pievienot pats sevi', 400);
            }

            if (Friend::areFriends($authUser->id, $targetUser->id)) {
                return EventHelper::errorResponse('Jūs jau esat draugi', 409);
            }

            if (FriendshipRequest::getBetween($authUser->id, $targetUser->id)) {
                return EventHelper::errorResponse('Draudzības pieprasījums jau pastāv', 409);
            }

            FriendshipRequest::create([
                'user_id'     => $authUser->id,
                'receiver_id' => $targetUser->id,
                'status'      => 'pending',
            ]);

            $targetUser->notify(new FriendRequestReceivedNotification($authUser));

            return EventHelper::successResponse('Draudzības pieprasījums nosūtīts');
        } catch (Throwable $e) {
            \Log::error('sendFriendRequest failed', ['error' => $e->getMessage()]);
            return EventHelper::errorResponse('Radās kļūda', 500);
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

                return EventHelper::successResponse('Draudzības pieprasījums pieņemts');
            } else {
                $friendRequest->update(['status' => 'declined']);
                return EventHelper::successResponse('Draudzības pieprasījums noraidīts');
            }
        } catch (Throwable $e) {
            \Log::error('respondFriendRequest failed', ['error' => $e->getMessage()]);
            return EventHelper::errorResponse('Radās kļūda', 500);
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

            return EventHelper::successResponse('Draudzība noņemta');
        } catch (Throwable $e) {
            \Log::error('removeFriend failed', ['error' => $e->getMessage()]);
            return EventHelper::errorResponse('Radās kļūda', 500);
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
            ->values()
            ->all();

        return EventHelper::successResponse(data: $friendsPayload);
    }

    public function search(Request $request)
    {
        $authUser = Auth::user();

        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $search = trim($validated['search'] ?? '');
        $perPage = (int) ($validated['per_page'] ?? 15);

        $query = null;

        if ($authUser) {
            $query = User::query()
                ->select(['id', 'name', 'email', 'avatar_path'])
                ->where('id', '!=', $authUser->id);
        } else
        {
            $query = User::query()
                ->select(['id', 'name', 'email', 'avatar_path']);
        }

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query
            ->orderBy('name')
            ->paginate($perPage);

        return EventHelper::successResponse(
            data: $users->items(),
            meta: [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ],
        );
    }

    /**
     * Update authenticated user online status timestamp
     */
    public function updateOnlineStatus()
    {
        $authUser = Auth::user();
        Cache::put($this->onlineCacheKey($authUser->id), now()->toIso8601String(), now()->addSeconds(self::ONLINE_TTL_SECONDS * 2));

        return EventHelper::successResponse('Tiešsaistes statuss ir atjaunināts');
    }

    // Helper functions

    private function onlineCacheKey(int $userId): string
    {
        return "user-online:{$userId}";
    }
}
