"use client"

import { useSearchParams } from "next/navigation";
import { getPost, setGoingPost, setInterestedPost } from '@/utils/post_service'
import { useEffect, useState } from 'react';
import { EventType, MarkerType } from '@/utils/Types'
import { API_BASE_URL} from '@/Config/api';
import Map from '@/components/Map/DynamicMarkerMap';
import Image from "next/image";
import Loading from '@/components/Loading';
import { useAuth } from '@/hooks/auth';
import CommentsSection from '@/components/Event/CommentsSection';
import InterestedButton from '@/components/Event/InterestedButton'
import GoingButton from '@/components/Event/GoingButton'

export default function EventPage() {
    const { user } = useAuth();

    const [eventId, setEventId] = useState<string>();
    const [interested, setInterested] = useState<boolean>(false);
    const [going, setGoing] = useState<boolean>(false);

    const [event, setEvent] = useState<EventType>();
    // const searchParams = useSearchParams();
    useEffect(()  => {
        const id = typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("id")
            : null; // UseSearchParams() gave error on build: useSearchParams() should be wrapped in a suspense boundary at page "/event"
        setEventId(id);

        async function fetchPost() {
            const event = await getPost(id);
            console.log(event);
            setEvent(event.event);
            setGoing(event.meta.isGoing);
            setInterested(event.meta.isInterested);
        }

        fetchPost();
    }, []);

    const creator = "John Doe"
    const host = "Tech Community Riga"

    async function handleInterested(value: boolean) {
        const response = await setInterestedPost(eventId, value);

        if (response.status == "ok") {
            setInterested(value);
        } else {
            console.log(response.message);
        }
    }

    async function handleGoing(value: boolean) {
        await setGoingPost(eventId, value);
        setGoing(value);
    }

    return (
        event ?
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

                                <p className="text-sm text-gray-500">
                                    Created by <span className="font-medium">{creator}</span>
                                </p>
                            </div>


                            <div className="flex gap-3 flex-wrap">

                                {/*<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">*/}
                                {/*    Add to Calendar*/}
                                {/*</button>*/}

                                {
                                    user ? (
                                        <>
                                            <InterestedButton isInterested={interested} onClick={handleInterested}/>

                                            <GoingButton isGoing={going} onClick={handleGoing} />
                                        </>
                                    ) : <></>
                                }


                                {/*<button className="px-4 py-2 border rounded-lg hover:bg-gray-100">*/}
                                {/*    Share*/}
                                {/*</button>*/}

                            </div>


                            <div>
                                <h2 className="text-xl font-semibold mb-3">
                                    Date & Location
                                </h2>

                                <div className="text-gray-700 mb-4">
                                    📅 {event.start_date?.toString()}
                                </div>

                                <div className="text-gray-700 mb-4">
                                    📍 {event.address.name}
                                </div>

                                <div className="h-64 rounded-xl overflow-hidden border">
                                    <Map
                                        center={[event.address.lat, event.address.lng]}
                                        zoom={14}
                                        markers={[event as unknown as MarkerType]}
                                        onMarkerClick={() => {}}
                                        className="w-full h-full"
                                    />
                                </div>

                            </div>


                            <div>
                                <h2 className="text-xl font-semibold mb-3">
                                    About the Event
                                </h2>

                                <p className="text-gray-700 leading-relaxed">
                                    {event.description ?? "This event will bring together developers and technology enthusiasts to discuss AI, startups and the future of technology. Join us for networking, talks and great conversations."}
                                </p>
                            </div>


                            <CommentsSection eventId={eventId}/>

                        </div>

                        <div className="flex flex-col gap-6">

                            <div className="border rounded-xl p-5 shadow-sm">
                                <p className="text-sm text-gray-500 mb-1">
                                    Price
                                </p>

                                <p className="text-2xl font-bold">
                                    {event.price ? `€${event.price}` : "Free"}
                                </p>
                            </div>


                            {/*<div className="border rounded-xl p-5 shadow-sm">*/}

                            {/*    <h3 className="font-semibold mb-2">*/}
                            {/*        Hosted by*/}
                            {/*    </h3>*/}

                            {/*    <p className="text-gray-700">*/}
                            {/*        {host}*/}
                            {/*    </p>*/}

                            {/*</div>*/}


                            {/*<div className="border rounded-xl p-5 shadow-sm">*/}

                            {/*    <h3 className="font-semibold mb-3">*/}
                            {/*        Friends attending*/}
                            {/*    </h3>*/}

                            {/*    <div className="flex -space-x-2">*/}

                            {/*        <div className="w-8 h-8 rounded-full bg-gray-300"></div>*/}
                            {/*        <div className="w-8 h-8 rounded-full bg-gray-400"></div>*/}
                            {/*        <div className="w-8 h-8 rounded-full bg-gray-500"></div>*/}
                            {/*        <div className="w-8 h-8 rounded-full bg-gray-600"></div>*/}

                            {/*    </div>*/}

                            {/*    <p className="text-sm text-gray-500 mt-2">*/}
                            {/*        +12 people going*/}
                            {/*    </p>*/}

                            {/*</div>*/}

                        </div>

                    </div>

                </div>
        : <Loading/>

    )
}