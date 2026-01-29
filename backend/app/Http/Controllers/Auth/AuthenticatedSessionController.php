<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Mail\WelcomeMail;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */

    public function store(LoginRequest $request): JsonResponse
    {
        if (!Auth::guard('web')->attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();

        // 🟢 SPA → session cookie already created, just return user
        if ($request->expectsJson() === false) {

            try {
                Log::info('Session ID:', [$request->session()->getId()]);
            } catch (Exception $e) {
                Log::error("No session stored in headers");
            }

            return response()->json($user);
        }

        // 🟢 Mobile → create token
        $token = $user->createToken(config('app.name'))->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);



////        Mail::to($request->email)->send(new WelcomeMail($request->all()));
//        $request->authenticate();
//
//        $token = $request->user()->createToken(config('app.name'))->plainTextToken;
//
//        return response()->json([
//            'token' => $token,
//        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): Response
    {
        $user = $request->user();

        if ($request->hasSession()) {
            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        if ($user && $request->bearerToken()) {
            $user->currentAccessToken()?->delete();
        }

        return response()->noContent();
    }
}
