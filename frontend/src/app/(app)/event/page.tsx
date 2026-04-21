"use client"

import { deletePost, getPost, requestEventParticipation, setGoingPost, setInterestedPost } from '@/utils/post_service'
import { useEffect, useRef, useState } from 'react';
import { EventResponse, EventType, MarkerType, User } from '@/utils/Types'
import { API_BASE_URL} from '@/Config/api';
import Map from '@/components/Map/DynamicMarkerMap';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import { useAuth } from '@/hooks/auth';
import CommentsSection from '@/components/Event/CommentsSection';
import GoingButton from '@/components/Event/GoingButton';
import FriendSelector from '@/components/User/FriendSelector';
import UserCard from '@/components/User/UserCard';
import InterestedUsersDisplay from '@/components/Event/InterestedUsersDisplay';
import GoingUsersPanel from '@/components/Event/GoingUsersPanel';
import EventDescriptionMarkdown from '@/components/Event/EventDescriptionMarkdown';

export default function EventPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [eventId, setEventId] = useState<string>();
    const [interested, setInterested] = useState<boolean>(false);
    const [going, setGoing] = useState<boolean>(false);

    const [event, setEvent] = useState<EventType>();
    const [error, setError] = useState<string | null>(null);
    const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);
    const [sendingRequests, setSendingRequests] = useState(false);
    const [host, setHost] = useState<User | null>(null);
    const [goingUsers, setGoingUsers] = useState<User[]>([]);
    const [interestedUsers, setInterestedUsers] = useState<User[]>([]);
    const [goingCount, setGoingCount] = useState(0);
    const [interestedCount, setInterestedCount] = useState(0);
    const [isGoingModalOpen, setIsGoingModalOpen] = useState(false);
    const [isInterestedModalOpen, setIsInterestedModalOpen] = useState(false);
    const [isDeletingEvent, setIsDeletingEvent] = useState(false);
    const [isOwnerMenuOpen, setIsOwnerMenuOpen] = useState(false);
    const ownerMenuRef = useRef<HTMLDivElement>(null);
    const isEventAuthor = Boolean(user && host && user.id === host.id);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ownerMenuRef.current && !ownerMenuRef.current.contains(e.target as Node)) {
                setIsOwnerMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const setEventDetails = (eventResponse: EventResponse) => {
        setEvent(eventResponse.event);
        setGoing(eventResponse.meta.isGoing);
        setInterested(eventResponse.meta.isInterested);
        setHost(eventResponse.meta.host ?? null);
        setGoingUsers(eventResponse.meta.goingUsers ?? []);
        setInterestedUsers(eventResponse.meta.interestedUsers ?? []);
        setGoingCount(eventResponse.meta.goingCount ?? (eventResponse.meta.goingUsers?.length ?? 0));
        setInterestedCount(eventResponse.meta.interestedCount ?? (eventResponse.meta.interestedUsers?.length ?? 0));
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
                    : (backendMessage ?? 'You do not have access to this event.');
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

    async function handleSendParticipationRequests() {
        if (!eventId || selectedFriendIds.length === 0 || sendingRequests) {
            return;
        }

        setSendingRequests(true);
        try {
            const response = await requestEventParticipation(eventId, selectedFriendIds);
            if (response.status === 'ok') {
                setSelectedFriendIds([]);
            }
        } finally {
            setSendingRequests(false);
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
                <div className="max-w-6xl mx-auto pb-16">

                    <div className="relative w-full h-72 md:h-96 rounded-xl overflow-hidden mb-8">
                        <Image
                            src={event.backgroundImage ?? `${API_BASE_URL}/storage/BackgroundImages/default.jpg`}
                            alt={event.title}
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        <div className="lg:col-span-2 flex flex-col gap-8">

                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {event.title}
                                </h1>
                                {event.categories && event.categories.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {event.categories.map((category) => (
                                            <span
                                                key={category.id}
                                                className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
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
                                            onModalOpenChangeAction={setIsInterestedModalOpen}
                                        />

                                        <GoingButton isGoing={going} onClick={handleGoing} />
                                    </>
                                ) : null}


                                <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                                    Dalīties
                                </button>

                                {isEventAuthor && (
                                    <div className="relative" ref={ownerMenuRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsOwnerMenuOpen(prev => !prev)}
                                            className="p-2 rounded-lg border hover:bg-gray-100 flex items-center justify-center"
                                            aria-label="Rīkotāja izvēlne"
                                        >
                                            <span className="text-xl leading-none tracking-widest select-none">⋯</span>
                                        </button>

                                        {isOwnerMenuOpen && (
                                            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-200 bg-white shadow-lg z-50 overflow-hidden">
                                                <button
                                                    type="button"
                                                    onClick={() => { setIsOwnerMenuOpen(false); router.push(`/event/edit?id=${eventId}`); }}
                                                    className="w-full text-left px-4 py-3 text-sm text-indigo-700 hover:bg-indigo-50 flex items-center gap-2"
                                                >
                                                    ✏️ Rediģēt pasākumu
                                                </button>
                                                <hr className="border-gray-100"/>
                                                <button
                                                    type="button"
                                                    onClick={() => { setIsOwnerMenuOpen(false); handleDeleteEvent(); }}
                                                    disabled={isDeletingEvent}
                                                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-60"
                                                >
                                                    🗑️ {isDeletingEvent ? 'Dzēšu...' : 'Dzēst pasākumu'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                            </div>


                            <div>
                                <h2 className="text-xl font-semibold mb-3">
                                    Datums un vieta
                                </h2>

                                <div className="text-gray-700 mb-4">
                                    📅 {event.start_date?.toString()}
                                </div>

                                <div className="text-gray-700 mb-4">
                                    📍 {event.address.name}
                                </div>

                                {!(isGoingModalOpen || isInterestedModalOpen) && (
                                    <div className="h-64 rounded-xl overflow-hidden border">
                                        <Map
                                            center={[event.address.lat, event.address.lng]}
                                            zoom={14}
                                            markers={[event as unknown as MarkerType]}
                                            onMarkerClick={() => {}}
                                            className="w-full h-full"
                                        />
                                    </div>
                                )}

                                {(isGoingModalOpen || isInterestedModalOpen) && (
                                    <div className="h-64 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-sm text-gray-500">
                                        Karte ir paslēpta, kamēr atvērts lietotāju saraksts.
                                    </div>
                                )}

                            </div>


                            <div>
                                <h2 className="text-xl font-semibold mb-3">
                                    Par pasākumu
                                </h2>

                                <EventDescriptionMarkdown
                                    content={event.description ?? "Nav aprakstu"}
                                    className="prose prose-sm max-w-none text-gray-700"
                                />
                            </div>


                            <CommentsSection eventId={eventId}/>

                        </div>

                        <div className="flex flex-col gap-6">

                            <div className="border rounded-xl p-5 shadow-sm">
                                <p className="text-sm text-gray-500 mb-1">
                                    Cena
                                </p>

                                <p className="text-2xl font-bold">
                                    {event.price ? `€${event.price}` : "Bezmaksas"}
                                </p>
                            </div>

                            {isEventAuthor && (
                                <div className="border rounded-xl p-5 shadow-sm space-y-3">
                                    <FriendSelector
                                        selectedIds={selectedFriendIds}
                                        onChange={setSelectedFriendIds}
                                        title="Uzaicini draugus"
                                        description="Nosūti dalības uzaicinājumus draugiem."
                                        maxHeightClassName="max-h-60"
                                    />

                                    <button
                                        type="button"
                                        disabled={selectedFriendIds.length === 0 || sendingRequests}
                                        onClick={handleSendParticipationRequests}
                                        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {sendingRequests ? 'Sūta...' : 'Sūtīt dalības pieprasījumu'}
                                    </button>
                                </div>
                            )}

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
                                onModalOpenChangeAction={setIsGoingModalOpen}
                            />
                        </div>
                    </div>
                </div>

            </>
        ) : <Loading/>
    )
}
