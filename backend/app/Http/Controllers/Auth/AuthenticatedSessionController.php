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
    public function store(LoginRequest $request)
    {
        Log::info("LOGGG INN START _-------------------------------------------------------");

//        Log::info('First Session ID:', [$request->session()->getId()]);
        Log::info('Is Authenticated before:', [Auth::check()]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = $request->user();

        Log::info("API USER", [Auth::guard('api')->check()]);
        Log::info("WEB USER", [Auth::guard('web')->check()]);

        Log::info('Headers:', $request->headers->all());
        Log::info('Session ID:', [$request->session()->getId()]);
        Log::info('Request:', $request->all());
        Log::info('Is Authenticated:', [Auth::check()]);

        Log::info("LOGGG INN END _-------------------------------------------------------");

        // 🟢 SPA → session cookie already created, just return user
        if ($request->expectsJson() === false) {
            return response()->json($user);
        }

        // 🟢 Mobile → create token
        $token = $user->createToken(config('app.name'))->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);



//        Log::info("LOGGG INN START _-------------------------------------------------------");
//
//        Log::info('First Session ID:', [$request->session()->getId()]);
//        Log::info('Is Authenticated before:', [Auth::check()]);
//        $request->authenticate();
////        Log::info("User logged in");
//
//        Log::info("API USER", [Auth::guard('api')->check()]);
//        Log::info("WEB USER", [Auth::guard('web')->check()]);
//
//        Log::info('Headers:', $request->headers->all());
//        Log::info('Session ID:', [$request->session()->getId()]);
//        Log::info('Request:', $request->toArray());
//        Log::info('Is Authenticated:', [Auth::check()]);
//
//        Log::info("LOGGG INN END _-------------------------------------------------------");
//
//        return response()->noContent();
    }

    public function storeMobile(LoginRequest $request): JsonResponse
    {

        Log::info("LOGGG INN START _-------------------------------------------------------");

//        Log::info('First Session ID:', [$request->session()->getId()]);
        Log::info('Is Authenticated before:', [Auth::check()]);

        if (!Auth::guard('web')->attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();

        Log::info('User id:', [$user->getAuthIdentifier()]);
        Log::info('Has session:', [$request->hasSession()]);

        Log::info("API USER", [Auth::guard('api')->check()]);
        Log::info("WEB USER", [Auth::guard('web')->check()]);

        Log::info('Headers:', $request->headers->all());
        Log::info('Request:', $request->attributes());
        Log::info('Is Authenticated:', [Auth::check()]);

        Log::info("LOGGG INN END _-------------------------------------------------------");

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
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
