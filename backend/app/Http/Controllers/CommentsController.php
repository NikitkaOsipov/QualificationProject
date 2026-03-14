<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Comment;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CommentsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $fields = $request->validate([
            'text' => 'required|string|max:255|min:3',
            'event_id' => 'required|integer|exists:events,id',
        ]);

        Log::info(Auth::id());
        $fields['user_id'] = Auth::id();

        try {
            $comment = Comment::create($fields);
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
        Log::info("---------------------------------Comments");
        Log::info(response()->json($event->comments()));
        Log::info("---------------------------------Comments");
        return $event->comments()->toResource();
    }
    /**
     * Display the specified resource.
     */
    public function userComments(User $user)
    {
        return response()->json($user->comments());
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Comment $comment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Comment $comment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Comment $comment)
    {
        //
    }
}
