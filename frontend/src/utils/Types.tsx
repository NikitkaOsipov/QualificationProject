export interface User {
    name: string;
    id: string;
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

// Metadata for the event request (Details page for event)
export interface EventMeta {
    isInterested: boolean
    isGoing: boolean
}

// Result of the event request (Details page for event)
export interface EventResponse {
    event: EventType
    meta: EventMeta
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
}