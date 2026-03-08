"use client"

import { useSearchParams } from "next/navigation";
import { getPost } from '@/utils/post_service';
import { useEffect, useState } from 'react';
import { MarkerType } from '@/utils/Types';
import { API_BASE_URL} from '@/Config/api';
import Map from '@/components/Map/DynamicMarkerMap';
import Image from "next/image";
import Loading from '@/components/Loading';
import { useAuth } from '@/hooks/auth';
import CommentsSection from '@/components/Event/CommentsSection';

export default function EventPage() {
    const { user } = useAuth();
    const [eventId, setEventId] = useState<string>();

    const [event, setEvent] = useState<MarkerType>();
    // const searchParams = useSearchParams();
    useEffect(()  => {
        const id = typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("id")
            : null; // UseSearchParams() gave error on build: useSearchParams() should be wrapped in a suspense boundary at page "/event"
        setEventId(id);

        async function fetchPost() {
            const post = await getPost(id);
            console.log(post);
            setEvent(post);
        }

        fetchPost();
    }, []);

    const creator = "John Doe"
    const host = "Tech Community Riga"

    return (
        event ?
                <div className="max-w-6xl mx-auto pb-16">

                    {/* Hero Image */}
                    <div className="relative w-full h-72 md:h-96 rounded-xl overflow-hidden mb-8">
                        <Image
                            src={event.backgroundImage ?? `${API_BASE_URL}/storage/BackgroundImages/default.jpg`}
                            alt={event.title}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Main Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* LEFT COLUMN */}
                        <div className="lg:col-span-2 flex flex-col gap-8">

                            {/* Title & Creator */}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {event.title}
                                </h1>

                                <p className="text-sm text-gray-500">
                                    Created by <span className="font-medium">{creator}</span>
                                </p>
                            </div>


                            {/* Action Buttons */}
                            <div className="flex gap-3 flex-wrap">

                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Add to Calendar
                                </button>

                                <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                                    I'm Interested
                                </button>

                                <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                                    Share
                                </button>

                            </div>


                            {/* Date & Location */}
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

                                {/* Map */}
                                <div className="h-64 rounded-xl overflow-hidden border">
                                    {/*<Map*/}
                                    {/*    center={[event.address.lat, event.address.lng]}*/}
                                    {/*    zoom={14}*/}
                                    {/*    className="w-full h-full"*/}
                                    {/*/>*/}
                                </div>

                            </div>


                            {/* About Event */}
                            <div>
                                <h2 className="text-xl font-semibold mb-3">
                                    About the Event
                                </h2>

                                <p className="text-gray-700 leading-relaxed">
                                    {event.description ?? "This event will bring together developers and technology enthusiasts to discuss AI, startups and the future of technology. Join us for networking, talks and great conversations."}
                                </p>
                            </div>


                            {/* Comments */}
                            <CommentsSection eventId={eventId}/>

                        </div>



                        {/* RIGHT COLUMN */}
                        <div className="flex flex-col gap-6">

                            {/* Price */}
                            <div className="border rounded-xl p-5 shadow-sm">
                                <p className="text-sm text-gray-500 mb-1">
                                    Price
                                </p>

                                <p className="text-2xl font-bold">
                                    {event.price ? `€${event.price}` : "Free"}
                                </p>
                            </div>


                            {/* Host */}
                            <div className="border rounded-xl p-5 shadow-sm">

                                <h3 className="font-semibold mb-2">
                                    Hosted by
                                </h3>

                                <p className="text-gray-700">
                                    {host}
                                </p>

                            </div>


                            {/* Friends attending */}
                            <div className="border rounded-xl p-5 shadow-sm">

                                <h3 className="font-semibold mb-3">
                                    Friends attending
                                </h3>

                                <div className="flex -space-x-2">

                                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                                    <div className="w-8 h-8 rounded-full bg-gray-400"></div>
                                    <div className="w-8 h-8 rounded-full bg-gray-500"></div>
                                    <div className="w-8 h-8 rounded-full bg-gray-600"></div>

                                </div>

                                <p className="text-sm text-gray-500 mt-2">
                                    +12 people going
                                </p>

                            </div>

                        </div>

                    </div>

                </div>
        : <Loading/>

    )
}