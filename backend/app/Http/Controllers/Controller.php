<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

abstract class Controller
{
    public function register(Request $request) {
        // Validate
        $fields = $request->validate([
            'avatar' => ['nullable', 'file', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:3', 'confirmed'], // confirmed is for the password confirmation field
        ]);

        $avatarPath = null;

        if ($request->hasFile('avatar')) {
            $avatarPath = Storage::disk('public')->putFile('avatars', $request->file('avatar'));

            if ($avatarPath === false) {
                return redirect()->back()->with([
                    'error' => 'Failed to upload avatar. Please try again later.',
                ]);
            }

            $fields['avatar_path'] = $avatarPath;
        }

        try {
            // Register
            $user = User::create($fields);

            // Login
            Auth::login($user);
        } catch (\Exception $exception) {
            // Delete the uploaded avatar if user creation failed
            if ($avatarPath && Storage::disk('public')->exists($avatarPath)) {
                Storage::disk('public')->delete($avatarPath);
            }

            return redirect()->back()->with([
                'error' => 'Failed to register user. Please try again later.',
            ]);
        }
    }
}
