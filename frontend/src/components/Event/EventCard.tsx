'use client'

import { MarkerType } from '@/utils/Types';
import { API_BASE_URL} from '@/Config/api';
import { useRouter } from 'next/navigation';
import Image from "next/image";

interface props {
    event: MarkerType
}

function formatDate(date?: Date) {
    if (!date) return "";

    const d = new Date(date)

    return d.toLocaleString(undefined, {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    })
}

function EventCard({ event }: { event: MarkerType }) {
    let router = useRouter();

    return (
        <div
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
            onClick={() => router.push(`event?id=${event.id}`)}
        >

            {/* Image */}
            <div className="relative w-full h-48">
                <Image
                    src={event.backgroundImage ?? `${API_BASE_URL}/storage/BackgroundImages/default.jpg`}
                    alt={event.title}
                    fill
                    className="object-cover"
                />
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-1">

                {/* Date */}
                <p className="text-xs text-gray-500">
                    {formatDate(event.start_date)}
                </p>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {event.title}
                </h3>

                {/* Location */}
                <p className="text-sm text-gray-600">
                    📍 {event.address.name}
                </p>

            </div>

        </div>
    )
}

export default EventCard;