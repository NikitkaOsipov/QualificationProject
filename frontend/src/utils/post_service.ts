import axios from '@/lib/axios';
import {
    EventFilters,
    EventSortBy,
    EventType,
    User,
    SortDirection,
} from './Types'
import type { LaravelStatusResponse } from './response_helper'

// Result of the event request (Details page for event)
export type EventResponse = {
    data: EventType;
    meta: {
        is_interested: boolean;
        is_going: boolean;
        host?: User | null;
        going_count?: number;
        interested_count?: number;
        going_users?: User[];
        interested_users?: User[];
    };
}

export type UpdatePostData = {
    title: string;
    description?: string;
    address_name: string;
    start_date: string;
    end_date?: string;
    price?: string | number;
    lat: number;
    lng: number;
    visibility?: 'public' | 'friends_only' | 'private';
};

// As get can use only query params, I have to map bool to numbers 1 or 0
type EventQueryParams = Omit<EventFilters, 'friends_only' | 'following_only'> & {
    friends_only?: 0 | 1;
    following_only?: 0 | 1;
};

export interface PaginatedEventsMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more: boolean;
    applied_sort_by: EventSortBy;
    applied_sort_direction: SortDirection;
}

export interface PaginatedEventsResponse {
    data: EventType[];
    meta: PaginatedEventsMeta;
}

export const getPosts = async (filters?: EventQueryParams) => {
    return axios.get('/api/all-events', { params: filters }).then(r => r.data as PaginatedEventsResponse);
}

export const getPost = async (id: string | number) =>
    axios.get(`/api/event/${id}`).then(r => r.data as EventResponse);

export const createPost = async (data: FormData) =>
    axios.post('/api/event', data).then(r => r.data as LaravelStatusResponse);

export const updatePost = async (eventId: string | number, data: UpdatePostData) =>
    axios.patch(`/api/event/${eventId}`, data).then(r => r.data as LaravelStatusResponse);

export const deletePost = async (eventId: string | number) =>
    axios.delete(`/api/event/${eventId}`).then(r => r.data as LaravelStatusResponse);

export const setInterestedPost = async (eventId: string | number, interestedValue: boolean) =>
    axios.post(`/api/event/${eventId}/interested`, { interested: interestedValue }).then(r => r.data as LaravelStatusResponse);

export const setGoingPost = async (eventId: string | number, goingValue: boolean) =>
    axios.post(`/api/event/${eventId}/going`, { going: goingValue }).then(r => r.data as LaravelStatusResponse);

export const requestEventParticipation = async (eventId: string | number, friendIds: number[]) =>
    axios.post(`/api/event/${eventId}/request-participation`, { friend_ids: friendIds }).then(r => r.data as LaravelStatusResponse);
