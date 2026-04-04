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
    visibility: 'public' | 'friends' | 'private';

    // Meta
    errors: Record<string, string>;
}

export interface Category {
    id: number;
    name: string;
}

export const CATEGORIES = [
    { id: 1, name: 'Technology' },
    { id: 2, name: 'Business' },
    { id: 3, name: 'Music' },
    { id: 4, name: 'Art' },
    { id: 5, name: 'Sports' },
    { id: 6, name: 'Food & Drink' },
    { id: 7, name: 'Travel' },
    { id: 8, name: 'Education' },
    { id: 9, name: 'Networking' },
    { id: 10, name: 'Entertainment' },
    { id: 11, name: 'Health & Wellness' },
    { id: 12, name: 'Gaming' },
    { id: 13, name: 'Fashion' },
    { id: 14, name: 'Photography' },
    { id: 15, name: 'Real Estate' },
    { id: 16, name: 'Automotive' },
    { id: 17, name: 'Books' },
    { id: 18, name: 'Charity' },
    { id: 19, name: 'Community' },
    { id: 20, name: 'Culture' },
    { id: 21, name: 'Dance' },
    { id: 22, name: 'Design' },
    { id: 23, name: 'Film' },
    { id: 24, name: 'Fitness' },
    { id: 25, name: 'Hobbies' },
    { id: 26, name: 'Holiday' },
    { id: 27, name: 'Home & Garden' },
    { id: 28, name: 'Legal' },
    { id: 29, name: 'Marketing' },
    { id: 30, name: 'Nature' },
];

export const VISIBILITY_OPTIONS = [
    { value: 'public', label: 'Public - Anyone can see this event' },
    { value: 'friends', label: 'Friends Only - Only your friends can see' },
    { value: 'private', label: 'Private - Invite only via link' },
];



