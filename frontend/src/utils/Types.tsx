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
    email_verified_at?: string;
    created_at?: string;
    updated_at?: string;
    avatar?: string;
    stats?: {
        events: number;
        followers: number;
        friends: number;
    }
}
export type FriendshipStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends';

export interface UserProfile {
    user: User;
    meta: {
        isFollowing: boolean,
        isOwner: boolean,
        friendshipStatus: FriendshipStatus,
    }
}

export interface Post {
    title: string;
    content: string;
}

export interface Address {
    name: string;
    lat: number;
    lng: number;
}

export interface EventType {
    id: number
    title: string
    description?: string
    start_date?: string
    end_date?: string
    price?: number
    address: Address
    backgroundImage?: string
}

// Result of the event request (Details page for event)
export interface EventResponse {
    event: EventType
    meta: {
        isInterested: boolean
        isGoing: boolean
    }
}

export interface MarkerType {
    id: number;
    title: string;
    description?: string;
    start_date?: Date;
    end_date?: Date;
    price?: number;
    address: Address;
    backgroundImage: string;
}

export interface Comment {
    id: number;
    text: string;
    user: User;
    created_at: string;
}

export interface ValidationErrors {
    [field: string]: string[];
}

export interface CreateResponse {
    status: "ok" | "error";
    message?: string;
    errors?: ValidationErrors;
}

export interface Category {
    id: number;
    name: string;
}

// Profile
export const TABS = ["events", "comments", "likes", "following", "friends"] as const;
export type TabState = typeof TABS[number];

export interface ProfileTabResponse {
    data: any[];
    current_page: number;
    last_page: number;
}