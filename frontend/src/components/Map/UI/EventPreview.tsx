'use client'

import type { MarkerType } from '@/utils/Types'
import Map from '@/components/Map/DynamicMarkerMap'
import SideModal from '@/components/SideModal'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { getPosts } from '@/utils/post_service'
import Loading from '@/components/Loading'


type EventPreviewProps = {
    isOpen: boolean;
    toggleModal: (value: boolean) => void;
    event: MarkerType | null
};

function formatEventDate(start?: Date, end?: Date) {
    if (!start) return "";

    const startDate = new Date(start);
    const endDate = end ? new Date(end) : null;

    const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    };

    const formattedStart = startDate.toLocaleString(undefined, options);

    if (!endDate) return formattedStart;

    const formattedEnd = endDate.toLocaleString(undefined, options);
    return `${formattedStart} — ${formattedEnd}`;
}

const EventPreview = ({isOpen, toggleModal, event}: EventPreviewProps) => {
    const router = useRouter();

    const handleGoToEvent = () => {
        if (event?.id) {
            router.push(`/event?id=${event.id}`);
            toggleModal(false);
        }
    };

    if (!event) return;

    return (
        <>
            <SideModal isOpen={isOpen} toggleModal={toggleModal}>
                <div className="flex flex-col gap-4 p-6">

                    {/* Header with Title and Price */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {event.title}
                        </h2>

                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-blue-600">
                                {event.price ? `€${event.price}` : "Free"}
                            </span>
                            <span className="text-xs uppercase text-gray-500 tracking-wide">
                                Price
                            </span>
                        </div>
                    </div>

                    {/* Date and Location Info Grid */}
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                        <div>
                            <p className="text-xs uppercase text-gray-500 tracking-wide mb-1 font-semibold">
                                📅 Date
                            </p>
                            <p className="text-sm text-gray-800 font-medium">
                                {formatEventDate(event.start_date, event.end_date)}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs uppercase text-gray-500 tracking-wide mb-1 font-semibold">
                                📍 Location
                            </p>
                            <p className="text-sm text-gray-800 font-medium">
                                {event.address.name}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    {event.description && (
                        <div>
                            <p className="text-xs uppercase text-gray-500 tracking-wide mb-2 font-semibold">
                                About
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                                {event.description}
                            </p>
                        </div>
                    )}

                    {/* Coordinates */}
                    <div className="border-t pt-3">
                        <p className="text-xs text-gray-500">
                            📌 {event.address.lat.toFixed(4)}, {event.address.lng.toFixed(4)}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 border-t pt-4">
                        <button
                            onClick={handleGoToEvent}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                        >
                            View Full Event
                        </button>

                        {/*<button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium text-sm">*/}
                        {/*    Add to Calendar*/}
                        {/*</button>*/}
                    </div>

                </div>
            </SideModal>
        </>
    )
}


export default EventPreview;