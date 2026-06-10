<?php
/**
 * Šī starpprogrammatūra (middleware) nodrošina, ka administratora maršruti ir pieejami tikai administratoriem.
 * Tas satur galveno funkciju:
 * - handle(): Pārbauda lietotāja tiesības un neatļautas piekļuves gadījumā atgriež 403 kļūdu.
 */

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminOnly
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Admin access required.',
            ], 403);
        }

        return $next($request);
    }
}

