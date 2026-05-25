"use client";

import { deletePost, getPost, setGoingPost, setInterestedPost, type EventResponse } from '@/utils/post_service'
import { useEffect, useState } from 'react';
import type { EventType, User } from '@/utils/Types'
import { API_BASE_URL} from '@/Config/api';
import Map from '@/components/Map/DynamicMarkerMap';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import { useAuth } from '@/hooks/auth';
import CommentsSection from '@/components/Event/CommentsSection';
import GoingButton from '@/components/Event/GoingButton';
import UserCard from '@/components/User/UserCard';
import InterestedUsersDisplay from '@/components/Event/InterestedUsersDisplay';
import GoingUsersPanel from '@/components/Event/GoingUsersPanel';
import EventDescriptionMarkdown from '@/components/Event/EventDescriptionMarkdown';
import EventParticipationRequestButton from '@/components/Event/EventParticipationRequestButton';
import EventShareButton from '@/components/Event/EventShareButton';
import EventOwnerMenu from '@/components/Event/EventOwnerMenu';
import EventAddToCalendarButton from '@/components/Event/EventAddToCalendarButton';
import { FaCalendarAlt, FaMapMarkerAlt, FaEuroSign } from 'react-icons/fa';

export default function EventPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [eventId, setEventId] = useState<string>();
    const [interested, setInterested] = useState<boolean>(false);
    const [going, setGoing] = useState<boolean>(false);

    const [event, setEvent] = useState<EventType>();
    const [error, setError] = useState<string | null>(null);
    const [host, setHost] = useState<User | null>(null);
    const [goingUsers, setGoingUsers] = useState<User[]>([]);
    const [interestedUsers, setInterestedUsers] = useState<User[]>([]);
    const [goingCount, setGoingCount] = useState(0);
    const [interestedCount, setInterestedCount] = useState(0);
    const [isDeletingEvent, setIsDeletingEvent] = useState(false);
    const canManageEvent = Boolean(user && (user.role === 'admin' || (host && user.id === host.id)));
    const visibilityLabel = event?.visibility === 'private'
        ? 'Privāts pasākums'
        : event?.visibility === 'friends_only'
            ? 'Tikai draugiem'
            : 'Publisks pasākums';
    const eventImageSrc = event?.background_image_path ? `${API_BASE_URL}/storage/${event.background_image_path}`
        : `${API_BASE_URL}/storage/BackgroundImages/default.jpg`;

    const setEventDetails = (eventResponse: EventResponse) => {
        setEvent(eventResponse.data);
        setGoing(eventResponse.meta.is_going);
        setInterested(eventResponse.meta.is_interested);
        setHost(eventResponse.meta.host ?? null);
        setGoingUsers(eventResponse.meta.going_users ?? []);
        setInterestedUsers(eventResponse.meta.interested_users ?? []);
        setGoingCount(eventResponse.meta.going_count ?? (eventResponse.meta.going_users?.length ?? 0));
        setInterestedCount(eventResponse.meta.interested_count ?? (eventResponse.meta.interested_users?.length ?? 0));
    };
    // const searchParams = useSearchParams();
    useEffect(()  => {
        const id = typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("id")
            : null; // UseSearchParams() gave error on build: useSearchParams() should be wrapped in a suspense boundary at page "/event"
        setEventId(id);

        async function fetchPost() {
            try {
                const event = await getPost(id);
                console.log(event);
                setEventDetails(event);
                setError(null);
            } catch (error: any) {
                const status = error?.response?.status;
                const backendMessage = error?.response?.data?.message;
                const message = status === 404 || /not found/i.test(backendMessage ?? '')
                    ? 'Pasākums nav atrasts.'
                    : (backendMessage ?? 'Jums nav piekļuves šim pasākumam.');
                setError(message);
            }
        }

        fetchPost();
    }, []);
    
    async function handleInterested(value: boolean) {
        const response = await setInterestedPost(eventId, value);

        if (response.status == "ok") {
            setInterested(value);
            if (eventId) {
                const eventResponse = await getPost(eventId);
                setEventDetails(eventResponse);
            }
        } else {
            console.log(response.message);
        }
    }

    async function handleGoing(value: boolean) {
        const response = await setGoingPost(eventId, value);
        if (response.status === 'ok') {
            setGoing(value);
            if (eventId) {
                const eventResponse = await getPost(eventId);
                setEventDetails(eventResponse);
            }
        }
    }

    async function handleDeleteEvent() {
        if (!eventId || isDeletingEvent) {
            return;
        }

        const confirmed = window.confirm('Vai tiešām vēlaties dzēst šo pasākumu?');
        if (!confirmed) {
            return;
        }

        setIsDeletingEvent(true);
        try {
            const response = await deletePost(eventId);
            if (response.status === 'ok') {
                router.push('/events');
                return;
            }
            console.error(response.message ?? 'Neizdevās izdzēst pasākumu.');
        } catch (error: any) {
            const message = error?.response?.data?.message ?? 'Neizdevās izdzēst pasākumu.';
            console.error(message);
        } finally {
            setIsDeletingEvent(false);
        }
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                    {error}
                </div>
            </div>
        );
    }

    return (
        event ? (
            <>
                <div className="max-w-6xl mx-auto pb-16 px-2 sm:px-4">
                    <div className="relative w-full h-56 sm:h-72 md:h-96 rounded-xl overflow-hidden mb-6 sm:mb-8">
                        <Image
                            src={eventImageSrc}
                            alt={event.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Main content */}
                        <div className="lg:col-span-2 flex flex-col gap-6 sm:gap-8">
                            <div>
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                        {event.title}
                                    </h1>
                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 border border-slate-200">
                                        {visibilityLabel}
                                    </span>
                                </div>
                                {event.categories && event.categories.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mt-3">
                                        {event.categories.map((category) => (
                                            <span
                                                key={category.id}
                                                className="rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-1.5 text-sm font-semibold text-indigo-700 border border-indigo-200 shadow-sm"
                                            >
                                                {category.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                {user ? (
                                    <>
                                        <InterestedUsersDisplay
                                            isInterested={interested}
                                            onInterestedChangeAction={handleInterested}
                                            interestedCount={interestedCount}
                                            interestedUsers={interestedUsers}
                                        />
                                        <GoingButton isGoing={going} onClick={handleGoing} />
                                    </>
                                ) : null}
                                <EventShareButton eventTitle={event.title} />
                                <EventAddToCalendarButton event={event} />
                                {canManageEvent && (
                                    <EventOwnerMenu
                                        eventId={eventId}
                                        isDeletingEvent={isDeletingEvent}
                                        onEditAction={() => router.push(`/event/edit?id=${eventId}`)}
                                        onDeleteAction={handleDeleteEvent}
                                    />
                                )}
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold mb-3">Datums un vieta</h2>
                                <div className="flex flex-col gap-2 mb-4">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <FaCalendarAlt color="black" />
                                        <span>{event.start_date?.toString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <FaMapMarkerAlt color="black" />
                                        <span>{event.address.name}</span>
                                    </div>
                                </div>
                                <div className="h-48 sm:h-64 rounded-xl overflow-hidden border">
                                    <Map
                                        center={[Number(event.address.lat), Number(event.address.lng)]}
                                        zoom={14}
                                        markers={[event]}
                                        onMarkerClick={() => {}}
                                        className="w-full h-full"
                                    />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold mb-3">Par pasākumu</h2>
                                <EventDescriptionMarkdown
                                    content={event.description ?? "Nav aprakstu"}
                                    className="prose prose-sm max-w-none text-gray-700"
                                />
                            </div>
                            {/* On mobile show right section below description */}
                            <div className="flex flex-col gap-6 sm:gap-8 lg:hidden">
                                <div className="border rounded-xl p-5 shadow-sm">
                                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                                        <FaEuroSign color="black" />
                                        Cena
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {event.price ? `€${event.price}` : "Bezmaksas"}
                                    </p>
                                </div>
                                <div className="border rounded-xl p-5 shadow-sm">
                                    <h3 className="font-semibold mb-3">Rīkotājs</h3>
                                    {host ? (
                                        <UserCard user={host} showFriendBadge />
                                    ) : (
                                        <p className="text-sm text-gray-500">Rīkotāja informācija nav pieejama.</p>
                                    )}
                                </div>
                                <GoingUsersPanel
                                    goingCount={goingCount}
                                    goingUsers={goingUsers}
                                />
                                {host && user && user.id === host.id && (
                                    <EventParticipationRequestButton eventId={eventId} />
                                )}
                            </div>
                            {/* Comments always at the bottom of main content */}
                            <div>
                                <CommentsSection eventId={eventId}/>
                            </div>
                        </div>
                        {/* Right section for desktop */}
                        <div className="flex-col gap-6 sm:gap-8 hidden lg:flex">
                            <div className="border rounded-xl p-5 shadow-sm">
                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                                    <FaEuroSign color="black" />
                                    Cena
                                </p>
                                <p className="text-2xl font-bold">
                                    {event.price ? `€${event.price}` : "Bezmaksas"}
                                </p>
                            </div>
                            <div className="border rounded-xl p-5 shadow-sm">
                                <h3 className="font-semibold mb-3">Rīkotājs</h3>
                                {host ? (
                                    <UserCard user={host} showFriendBadge />
                                ) : (
                                    <p className="text-sm text-gray-500">Rīkotāja informācija nav pieejama.</p>
                                )}
                            </div>
                            <GoingUsersPanel
                                goingCount={goingCount}
                                goingUsers={goingUsers}
                            />
                            {host && user && user.id === host.id && (
                                <EventParticipationRequestButton eventId={eventId} />
                            )}
                        </div>
                    </div>
                </div>
            </>
        ) : <Loading/>
    )
}
