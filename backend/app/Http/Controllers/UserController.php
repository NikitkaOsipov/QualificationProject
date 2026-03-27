<?php

namespace App\Http\Controllers;

use App\Models\Follower;
use App\Models\user;
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

    public function follow(User $user)
    {
        try {
            $authUser = Auth::user();

            if (!$authUser) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized'
                ], 401);
            }

            if ($authUser->id === $user->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You cannot follow yourself'
                ], 400);
            }

            $existing = Follower::where([
                'follower_id' => $authUser->id,
                'following_id' => $user->id,
            ])->first();

            if ($existing) {
                $existing->delete();
                $isFollowing = false;
            } else {
                Follower::create([
                    'follower_id' => $authUser->id,
                    'target_id' => $user->id,
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
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(user $user)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(user $user)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, user $user)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(user $user)
    {
        //
    }
}
