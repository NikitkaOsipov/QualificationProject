<?php
/**
 * Šis kontrolieris nodrošina autentificētas sesijas pārvaldību.
 * Tas satur divas galvenās funkcijas:
 * - store(): Pieslēdz lietotāju un atgriež sesiju vai API tokenu.
 * - destroy(): Atslēdz lietotāju un izbeidz sesiju vai tokenu.
 */

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
        $request->authenticate();

        $user = Auth::user();
        $isNativeClient = $request->header('X-Client-Platform') === 'native';

        // Web SPA: session cookie auth only.
        if (!$isNativeClient) {
            return response()->json($user);
        }

        // Native app: return API token.
        $token = $user->createToken(config('app.name'))->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
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
