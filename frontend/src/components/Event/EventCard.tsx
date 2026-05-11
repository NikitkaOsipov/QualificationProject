'use client';

import type { EventType } from '@/utils/Types';
import { API_BASE_URL} from '@/Config/api';
import { useRouter } from 'next/navigation';
import Image from "next/image";

function formatDate(date?: string | Date) {
    if (!date) return "";

    const d = new Date(date)

    return d.toLocaleString('lv-LV', {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    })
}

function formatPrice(price?: number | string) {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (price === undefined || price === null || isNaN(numPrice)) return "";
    if (numPrice === 0) return "Bezmaksas";
    return `€${numPrice.toFixed(2)}`;
}

function EventCard({ event }: { event: EventType }) {
    let router = useRouter();
    const imageSrc = event?.background_image_path ? `${API_BASE_URL}/storage/${event.background_image_path}`
        : `${API_BASE_URL}/storage/BackgroundImages/default.jpg`;

    const going = event.going_count ?? 0;
    const interested = event.interested_count ?? 0;

    return (
        <div
            className="bg-white rounded shadow-md hover:shadow-lg transition overflow-hidden cursor-pointer"
            onClick={() => router.push(`event?id=${event.id}`)}
        >

            {/* Background */}
            <div className="relative w-full h-48">
                <Image
                    src={imageSrc}
                    alt={event.title}
                    fill
                    className="object-cover"
                />
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-2">

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
                    {event.address.name}
                </p>

                {/* Footer with stats and price */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    {/* Going and Interested counts */}
                    <div className="flex gap-3 text-xs text-gray-600">
                        {interested > 0 && (
                            <span className="flex items-center gap-1">
                                {interested} ieinteresēti
                            </span>
                        )}
                        {going > 0 && (
                            <span className="flex items-center gap-1">
                                {going} piedalās
                            </span>
                        )}
                    </div>

                    {/* Price */}
                    <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(event.price)}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default EventCard;