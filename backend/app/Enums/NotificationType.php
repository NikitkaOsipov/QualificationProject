<?php

namespace App\Enums;

enum NotificationType: string
{
    case FriendRequestReceived = 'friend_request_received';
    case FriendRequestAccepted = 'friend_request_accepted';
    case CommentReceived = 'comment_received';
    case EventParticipationRequest = 'event_participation_request';
    case FollowedUserEventCreated = 'followed_user_event_created';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $type): string => $type->value,
            self::cases(),
        );
    }
}

