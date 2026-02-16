export interface Post {
    title: string;
    content: string;
}

export interface MarkerType {
    title: string;
    description?: string;
    start_date?: Date;
    end_date?: Date;
    price?: number;
    lat: number;
    lng: number;
}