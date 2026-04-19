<?php

namespace App\Support;

use App\Models\Event;
use App\Models\Friend;
use App\Models\User;

class EventHelper
{
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

