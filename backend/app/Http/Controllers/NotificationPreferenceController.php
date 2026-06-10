<?php
/**
 * Šis kontrolieris nodrošina paziņojumu preferenču pārvaldību.
 * Tas satur divas galvenās funkcijas:
 * - index(): Parāda lietotāja paziņojumu iestatījumus.
 * - update(): Atjaunina izvēlētā paziņojuma tipa iestatījumus.
 */

namespace App\Http\Controllers;

use App\Enums\NotificationType;
use App\Models\NotificationPreference;
use App\Support\EventHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use phpDocumentor\Reflection\Types\Resource_;

class NotificationPreferenceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $preferencesByType = $user->notificationPreferences()
            ->get()
            ->keyBy('type');

        $preferences = collect(NotificationType::values())
            ->map(fn (string $type): array => [
                'type' => $type,
                'in_app_enabled' => (bool) ($preferencesByType[$type]?->in_app_enabled ?? true),
                'email_enabled' => (bool) ($preferencesByType[$type]?->email_enabled ?? false),
            ])
            ->values()
            ->all();

        return response()->json($preferences);
    }

    public function update(Request $request, string $type)
    {
        $request->validate([
            'in_app_enabled' => ['sometimes', 'boolean'],
            'email_enabled' => ['sometimes', 'boolean'],
        ]);

        if (! $request->hasAny(['in_app_enabled', 'email_enabled'])) {
            return EventHelper::errorResponse('Obligāti jāaizpilda vismaz viens preferenču lauks.', 422);
        }

        if (! in_array($type, NotificationType::values(), true)) {
            return EventHelper::errorResponse('Nezināms paziņojuma veids', 422);
        }

        $existingPreference = $request->user()->notificationPreferences()
            ->where('type', $type)
            ->first();
        // Take new preference or existing one if it exists
        $inAppEnabled = $request->has('in_app_enabled')
            ? $request->boolean('in_app_enabled')
            : ($existingPreference?->in_app_enabled ?? true);

        $emailEnabled = $request->has('email_enabled')
            ? $request->boolean('email_enabled')
            : ($existingPreference?->email_enabled ?? false);

        $request->user()->notificationPreferences()->updateOrCreate(
            ['type' => $type],
            [
                'in_app_enabled' => $inAppEnabled,
                'email_enabled' => $emailEnabled,
            ],
        );

        return EventHelper::successResponse();
    }
}
