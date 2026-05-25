"use client";

import { useContext, useEffect, useState } from 'react'
import "@/css/SideModal.css";
import EventSearchAndFilters from '@/components/Event/EventSearchAndFilters';
import { useAuth } from '@/hooks/auth';
import type { EventFilters, EventType } from '@/utils/Types';
import { getPosts, type PaginatedEventsMeta } from '@/utils/post_service';
import Loading from '@/components/Loading';
import EventCard from '@/components/Event/EventCard';
import { SnackbarContext } from '@/context/SnackbarContext'
import { extractErrorMessage, extractValidationErrors, isValidationError } from '@/utils/response_helper'


const DEFAULT_FILTERS: EventFilters = {
    search: '',
    categories: [],
    friends_only: false,
    following_only: false,
    date_from: '',
    date_to: '',
    sort_by: 'default',
    sort_direction: 'desc',
}

const PER_PAGE = 12;

export default function EventsPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState<EventType[]>([]);
    // Filters that weren't applied yet (user didn't click on search)
    const [draftFilters, setDraftFilters] = useState<EventFilters>({ ...DEFAULT_FILTERS });
    // Filters that were applied.
    const [currentFilters, setCurrentFilters] = useState<EventFilters>({ ...DEFAULT_FILTERS });
    const [meta, setMeta] = useState<PaginatedEventsMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const addSnackbarMessage = useContext(SnackbarContext);

    const fetchEvents = async (filters: EventFilters, page = 1, append = false) => {
        if (append) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
        }

        try {
            const response = await getPosts({
                ...filters,
                friends_only: filters.friends_only ? 1 : 0,
                following_only: filters.following_only ? 1 : 0,
                page: page,
                per_page: PER_PAGE,
            });

            setEvents(current => append ? [...current, ...response.data] : response.data);
            setMeta(response.meta);
        } catch (error) {
            if (isValidationError(error)) {
                const errors = extractValidationErrors(error);
                Object.values(errors).forEach(messages => {
                    messages?.forEach(message => addSnackbarMessage(message, 'error'));
                });
            } else {
                const errorMessage = extractErrorMessage(error);
                addSnackbarMessage(errorMessage, 'error');
            }
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }

    useEffect(() => {
        void fetchEvents(currentFilters);
    }, [currentFilters])

    const handleApplyFilters = () => {
        setCurrentFilters({ ...draftFilters });
    }

    const handleResetFilters = () => {
        setDraftFilters({ ...DEFAULT_FILTERS });
        setCurrentFilters({ ...DEFAULT_FILTERS });
    }

    const handleLoadMore = async () => {
        if (!meta?.has_more || isLoadingMore) {
            return;
        }

        await fetchEvents(currentFilters, meta.current_page + 1, true);
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">

            <div className="mb-8">
                <EventSearchAndFilters
                    filters={draftFilters}
                    onChangeAction={(nextValue) => setDraftFilters(nextValue)}
                    onSubmitAction={handleApplyFilters}
                    onResetAction={handleResetFilters}
                    showSort
                    disableSocialFilters={!user}
                    isLoading={isLoading}
                />
            </div>

            {currentFilters.search === ''
                && currentFilters.categories.length === 0
                && !currentFilters.friends_only
                && !currentFilters.following_only
                && !currentFilters.date_from
                && !currentFilters.date_to && (
                <div className="mb-6 flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold">Aktuālākie gaidāmie pasākumi</h1>
                </div>
            )}

            {meta && (
                <div className="mb-4 text-sm text-gray-500">
                    Rāda {events.length} no {meta.total} pasākumiem
                </div>
            )}

            {isLoading ? (
                <Loading />
            ) : events.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>

                    {meta?.has_more && (
                        <div className="mt-8 flex justify-center">
                            <button
                                type="button"
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isLoadingMore ? 'Ielādē vēl...' : 'Ielādēt vēl'}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-gray-600">
                    Neviens pasākums neatbilda meklēšanai. Mēģiniet citu vietu, kategoriju vai sociālo filtru.
                </div>
            )}
        </div>
    );
}