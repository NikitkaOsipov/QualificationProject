'use client'

import type { MarkerType } from '@/utils/Types'
import Map from '@/components/Map/DynamicMarkerMap'
import SideModal from '@/components/SideModal'
import { useEffect, useState } from 'react'

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
    if (!event) return;

    return (
        <>
            <SideModal isOpen={isOpen} toggleModal={toggleModal}>
                <div className="flex flex-col gap-6 p-6">

                    {/* Title */}
                    <div>
                        <p className="text-xs uppercase text-gray-500 tracking-wide">
                            Event
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900">
                            {event.title}
                        </h2>
                    </div>


                    {/* Description */}
                    {event.description && (
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {event.description}
                        </p>
                    )}


                    {/* Date */}
                    <div className="border-t pt-4">
                        <p className="text-xs uppercase text-gray-500 tracking-wide mb-2">
                            Date
                        </p>

                        <p className="text-sm text-gray-800">
                            📅 {formatEventDate(event.start_date, event.end_date)}
                        </p>

                        <button className="mt-3 text-sm text-blue-600 hover:text-blue-700">
                            Add to Calendar
                        </button>
                    </div>


                    {/* Location */}
                    <div className="border-t pt-4">
                        <p className="text-xs uppercase text-gray-500 tracking-wide mb-2">
                            Location
                        </p>

                        <p className="text-sm font-medium text-gray-800">
                            {event.address.name}
                        </p>

                        <p className="text-xs text-gray-500">
                            {event.address.lat.toFixed(4)}, {event.address.lng.toFixed(4)}
                        </p>
                    </div>

                </div>
            </SideModal>
        </>
    )
}


export default EventPreview;