<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\EventHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:255',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $search = trim($validated['search'] ?? '');
        $perPage = (int) ($validated['per_page'] ?? 15);

        $query = User::query()
            ->select(['id', 'name', 'email', 'role', 'avatar_path', 'email_verified_at', 'created_at'])
            ->withCount('events');

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

    public function update(Request $request, User $targetUser)
    {
        $authUser = Auth::user();

        $fields = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . $targetUser->id,
            'role' => 'required|string|in:' . User::ROLE_USER . ',' . User::ROLE_ADMIN,
        ]);

        if ($authUser->id === $targetUser->id && $fields['role'] !== User::ROLE_ADMIN) {
            return EventHelper::errorResponse('Administrators nevar noņemt sev administratora lomu.', 422);
        }

        $targetUser->update($fields);

        return EventHelper::successResponse('Lietotājs veiksmīgi atjaunināts.');
    }

    public function destroy(User $targetUser)
    {
        $authUser = Auth::user();

        if ($authUser->id === $targetUser->id) {
            return EventHelper::errorResponse('Administrators nevar dzēst savu kontu.', 422);
        }

        $targetUser->delete();

        return EventHelper::successResponse('Lietotājs veiksmīgi dzēsts.');
    }
}
