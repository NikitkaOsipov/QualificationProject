<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Mail\WelcomeMail;
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
        Log::info("logging in");
//        Mail::to($request->email)->send(new WelcomeMail($request->all()));
        $request->authenticate();
        Log::info("User logged in");

        $request->session()->regenerate();

        return response()->noContent();
    }

    public function storeMobile(LoginRequest $request): JsonResponse
    {
//        Mail::to($request->email)->send(new WelcomeMail($request->all()));
        $request->authenticate();

        $token = $request->user()->createToken(config('app.name'))->plainTextToken;

        return response()->json([
            'token' => $token,
        ]);
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
