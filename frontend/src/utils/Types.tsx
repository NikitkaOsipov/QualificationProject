export interface Post {
    title: string;
    content: string;
}

export interface address {
    name: string;
    lat: number;
    lng: number;
}

export interface MarkerType {
    title: string;
    description?: string;
    start_date?: Date;
    end_date?: Date;
    price?: number;
    address: address;
}