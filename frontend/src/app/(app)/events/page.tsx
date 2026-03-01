"use client";
import { useEffect, useState } from 'react'
import "@/css/SideModal.css";
import { MarkerType } from '@/utils/Types'
import { getPosts } from '@/utils/post_service'
import Loading from '@/components/Loading'
import EventCard from '@/components/Event/EventCard'

export default function EventsPage() {
    const [events, setEvents] = useState<MarkerType[] | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            const result = await getPosts();
            setEvents(result);
        }

        fetchEvents();
    }, [])

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">

            <h1 className="text-2xl font-semibold mb-6">
                Upcoming Events
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events?.map((event, index) => (
                    <EventCard key={index} event={event} />
                ))}
            </div>

        </div>
    );
}