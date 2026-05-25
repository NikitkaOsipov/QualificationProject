'use client'

import EventSearchAndFilters from '@/components/Event/EventSearchAndFilters'
import type { EventFilters, EventType } from '@/utils/Types'
import Map from '@/components/Map/DynamicMarkerMap'
import { useContext, useEffect, useState } from 'react'

import { getPosts } from '@/utils/post_service'
import Loading from '@/components/Loading'
import EventPreview from '@/components/Map/UI/EventPreview'
import { useAuth } from '@/hooks/auth'
import { extractErrorMessage, extractValidationErrors, isValidationError } from '@/utils/response_helper'
import { SnackbarContext } from '@/context/SnackbarContext'

const DEFAULT_FILTERS: EventFilters = {
    search: '',
    categories: [],
    friends_only: false,
    following_only: false,
    sort_by: 'default',
    sort_direction: 'desc',
};

const MapPage = () => {
    const { user } = useAuth();

    const [posts, setPosts] = useState<EventType[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
    const [draftFilters, setDraftFilters] = useState<EventFilters>({ ...DEFAULT_FILTERS });
    const [currentFilters, setCurrentFilters] = useState<EventFilters>({ ...DEFAULT_FILTERS });
    const [isLoading, setIsLoading] = useState(true);
    const addSnackbarMessage = useContext(SnackbarContext);

    useEffect(() => {
        const fetchEvents = async (filters: EventFilters) => {
            setIsLoading(true);

            try {
                const result = await getPosts({
                    ...currentFilters,
                    friends_only: filters.friends_only ? 1 : 0,
                    following_only: filters.following_only ? 1 : 0,
                    per_page: 100,
                });

                setPosts(result.data);
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
            }
        }

        fetchEvents(currentFilters);
    }, [currentFilters])

    const toggleModal = (value: boolean) => setOpen(value);
    const selectEvent = (event: EventType) => {
        setOpen(true);
        setSelectedEvent(event);
    }

    const handleResetFilters = () => {
        setDraftFilters({ ...DEFAULT_FILTERS });
        setCurrentFilters({ ...DEFAULT_FILTERS });
    }
    
    const handleApplyFilters = () => {
        setCurrentFilters({ ...draftFilters });
    }

    return (
        <>
            {isLoading ? (
                <Loading/>
            ) : (
                    <div
                        className="relative w-full h-full"
                    >

                        <div className="pointer-events-auto absolute left-4 right-4 top-4 z-[1000] mx-auto max-w-5xl [&>form]:border-0 [&>form]:bg-transparent [&>form]:p-0 [&>form]:shadow-none">
                            <EventSearchAndFilters
                                filters={draftFilters}
                                onChangeAction={(nextValue) => setDraftFilters(nextValue)}
                                onSubmitAction={handleApplyFilters}
                                onResetAction={handleResetFilters}
                                disableSocialFilters={!user}
                            />
                        </div>

                        <Map
                            center={[56.88, 24.28]}
                            zoom={8}
                            markers={posts}
                            className={"w-full h-full"}
                            onMarkerClick={selectEvent}
                        >
                        </Map>

                        {/* MAP UI */}
                        <div
                            className="pointer-events-auto absolute left-0 top-0 h-full"
                        >
                            <EventPreview
                                isOpen={open}
                                toggleModal={toggleModal}
                                event={selectedEvent}/>
                        </div>

                        {posts.length === 0 && (
                            <div className="pointer-events-none absolute inset-x-0 bottom-6 z-[1000] flex justify-center px-4">
                                <div className="rounded-full bg-white/95 px-4 py-2 text-sm text-gray-700 shadow">
                                    Neviens pasākums neatbilda šiem filtriem.
                                </div>
                            </div>
                        )}
                    </div>
            )}
        </>
    )
}


export default MapPage;