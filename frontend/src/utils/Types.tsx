export type Visibility = 'public' | 'friends_only' | 'private';

export interface EventFormData {
    // Stage 1: Location
    address: string;
    latitude: number | null;
    longitude: number | null;

    // Stage 2: Details
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    price: string;

    // Stage 3: Visuals & Categories
    backgroundImage: File | null;
    categories: number[];

    // Stage 4: Visibility
    visibility: Visibility;

    // Optional invites during event creation
    inviteeIds: number[];

    // Meta
    errors: Record<string, string>;
}

export interface Category {
    id: number;
    name: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar_path?: string | null;
    is_online?: boolean;
    is_friend?: boolean;
    email_verified_at?: string;
    created_at?: string;
    updated_at?: string;
    role?: 'user' | 'admin';
    events_count?: number;
    avatar?: string;
    stats?: {
        events: number;
        followers: number;
        friends: number;
    };
}

export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends';

export interface Address {
    name: string;
    lat: number | string;
    lng: number | string;
}

export interface EventType {
    id: number;
    title: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    price?: number;
    address: Address;
    background_image_path?: string | null;
    visibility?: Visibility;
    categories?: Category[];
    user?: User;
    going_count?: number;
    interested_count?: number;
}

export type EventSortBy = 'default' | 'soonest' | 'interested' | 'going' | 'cost';
export type SortDirection = 'asc' | 'desc';

export interface EventFilters {
    search?: string;
    categories?: number[];
    friends_only?: boolean;
    following_only?: boolean;
    date_from?: string;
    date_to?: string;
    sort_by?: EventSortBy;
    sort_direction?: SortDirection;
    page?: number;
    per_page?: number;
}

export interface Comment {
    id: number;
    text: string;
    user: User;
    created_at: string;
    updated_at?: string;
}


// Profile
export const TABS = ['events', 'comments', 'likes', 'following', 'friends'] as const;
export type TabState = typeof TABS[number];

export type NotificationType =
    | 'friend_request_received'
    | 'friend_request_accepted'
    | 'comment_received'
    | 'event_participation_request'
    | 'followed_user_event_created';

export interface AppNotification {
    id: string;
    read_at: string | null;
    created_at: string;
    data: {
        notification_type: NotificationType;
        title: string;
        body: string;
        actor?: {
            id: number;
            name: string;
            avatar?: string | null;
        };
        resource?: {
            type: 'user' | 'event';
            id: number;
        };
    };
}

export interface NotificationPreference {
    type: NotificationType;
    in_app_enabled: boolean;
    email_enabled: boolean;
}
