<?php
/**
 * Šī palīgklase nodrošina vienotus API atbilžu formātus un pasākumu redzamības pārbaudes.
 * Tas satur piecas galvenās funkcijas:
 * - errorResponse(): Atgriež standartizētu kļūdas JSON atbildi ar statusa kodu.
 * - successResponse(): Atgriež standartizētu veiksmīgas darbības JSON atbildi.
 * - canUserAccessEvent(): Pārbauda, vai lietotājs drīkst atvērt konkrēta pasākuma detaļas.
 * - canUserSeeEventInProfile(): Pārbauda, vai pasākums ir redzams profila pasākumu skatā.
 * - canUserSeeEventInAllEvents(): Pārbauda, vai pasākums ir redzams kopējā visu pasākumu plūsmā.
 */

namespace App\Support;

use App\Models\Event;
use App\Models\Friend;
use App\Models\User;
use Illuminate\Http\JsonResponse;

/**
 * Response statuses:
 * - 200: OK - request succeeded.
 * - 400: Bad Request - invalid input or request format.
 * - 403: Forbidden - user has no permission.
 * - 404: Not Found - requested resource does not exist.
 * - 500: Internal Server Error - unexpected server-side failure.
 */
class EventHelper
{
    /**
     * Return a standardised JSON error response with given message and HTTP status code.
     */
    public static function errorResponse(string $message, int $status = 400, ?array $errors = null): JsonResponse
    {
        $response = [
            'status' => 'error',
            'message'  => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $status);
    }

    /**
     * Return a standardised JSON success response
     */
    public static function successResponse(?string $message = null, ?array $data = [], int $status = 200, ?array $meta = null): JsonResponse
    {
        $response = [
            'status'  => 'ok',
        ];

        if ($message !== null) {
            $response['message'] = $message;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        if ($meta !== null) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $status);
    }

    /**
     * Direct event access (details/actions).
     * "private" means link-only: if user has link, allow opening details.
     */
    public static function canUserAccessEvent(?User $viewer, Event $event): bool
    {
        $visibilityName = $event->visibility?->name ?? 'public';

        if ($visibilityName === 'public') {
            return true;
        }

        if ($visibilityName === 'private') {
            // Link-only mode: anyone with direct link can open event details.
            return true;
        }

        if (! $viewer) {
            return false;
        }

        if ((int) $viewer->id === (int) $event->user_id) {
            return true;
        }

        if ($visibilityName === 'friends_only') {
            return Friend::areFriends($viewer->id, $event->user_id);
        }

        return false;
    }

    /**
     * Visibility for fetching events in profile.
     * Link-only (private) events are visible only to the owner on profile page.
     */
    public static function canUserSeeEventInProfile(?User $viewer, Event $event): bool
    {
        $visibilityName = $event->visibility?->name ?? 'public';

        if ($visibilityName === 'public') {
            return true;
        }

        if (! $viewer) {
            return false;
        }

        if ((int) $viewer->id === (int) $event->user_id) {
            return true;
        }

        if ($visibilityName === 'friends_only') {
            return Friend::areFriends($viewer->id, $event->user_id);
        }

        return false;
    }

    /**
     * Visibility for global all-events feed.
     * Link-only (private) events should never be shown there.
     */
    public static function canUserSeeEventInAllEvents(?User $viewer, Event $event): bool
    {
        $visibilityName = $event->visibility?->name ?? 'public';

        if ($visibilityName === 'public') {
            return true;
        }

        if ($visibilityName === 'private') {
            return false;
        }

        if (! $viewer) {
            return false;
        }

        if ((int) $viewer->id === (int) $event->user_id) {
            return true;
        }

        if ($visibilityName === 'friends_only') {
            return Friend::areFriends($viewer->id, $event->user_id);
        }

        return false;
    }
}

