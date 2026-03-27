<?php

namespace App\Http\Controllers;

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

        $eventsCount = $user->events()->count();
        $followersCount = $user->followers()->count();
        $friendsCount = $user->followers()
            ->whereIn('follower_id', $user->following()->pluck('users.id'))
            ->count();

        $isFollowing = false;
        $isOwner = false;

        if ($authUser) {
            $isFollowing = $authUser->following()
                ->where('following_id', $user->id)
                ->exists();

            $isOwner = $authUser->id === $user->id;
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'avatar' => $user->avatar ?? null,
                'stats' => [
                    'events' => $eventsCount,
                    'followers' => 0,
                    'friends' => 0,
                ]
            ],
            'meta' => [
                'isFollowing' => $isFollowing,
                'isOwner' => $isOwner,
            ]
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
    public function destroy(User $user)
    {
        //
    }
}
