'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, Euro, CalendarDays } from 'lucide-react';

import type { EventType } from '@/utils/Types';
import SideModal from '@/components/SideModal';
import Button from '@/components/Button';
import GoingButton from '@/components/Event/GoingButton';
import { API_BASE_URL } from '@/Config/api';
import type { User } from '@/utils/Types';
import InterestedUsersDisplay from '@/components/Event/InterestedUsersDisplay'
import GoingUsersPanel from '@/components/Event/GoingUsersPanel'
import { useAuth } from '@/hooks/auth'


type EventPreviewProps = {
    isOpen: boolean;
    toggleModal: (value: boolean) => void;
    event: EventType | null;
    isInterested: boolean;
    isGoing: boolean;
    interestedUsers: User[];
    goingUsers: User[];
    handleInterested: (value: boolean) => void | Promise<void>;
    handleGoing: (value: boolean) => void | Promise<void>;
};

function formatEventDate(start?: string | Date, end?: string | Date) {
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

    const formattedStart = startDate.toLocaleString('lv-LV', options);
    if (!endDate) return formattedStart;

    // If same day show only end time, otherwise full end datetime
    const sameDay = startDate.toDateString() === endDate.toDateString();
    const formattedEnd = sameDay
        ? endDate.toLocaleString('lv-LV', { hour: '2-digit', minute: '2-digit' })
        : endDate.toLocaleString('lv-LV', options);

    return `${formattedStart} - ${formattedEnd}`;
}

function shortenDescription(text?: string, maxLength: number = 160): string {
    if (!text) return '';
    const trimmedText = text.trim();
    if (trimmedText.length <= maxLength) return trimmedText;
    return `${trimmedText.slice(0, maxLength).trimEnd()}...`;
}

const EventPreview = ({
    isOpen,
    toggleModal,
    event,
    isInterested,
    isGoing,
    handleInterested,
    handleGoing,
    interestedUsers,
    goingUsers,
}: EventPreviewProps) => {
    const router = useRouter();
    const { user } = useAuth();

    const fixCoordinateNumber = (value: unknown): string => {
        const n = typeof value === 'number' ? value : Number(value);
        return n ? n.toFixed(4) : '0.0000';
    };

    const handleGoToEvent = () => {
        if (event?.id) {
            router.push(`/event?id=${event.id}`);
            toggleModal(false);
        }
    };

    if (!event) return null;

    const imageSrc = event.background_image_path
        ? `${API_BASE_URL}/storage/${event.background_image_path}`
        : `${API_BASE_URL}/storage/BackgroundImages/default.jpg`;

    return (
        <SideModal isOpen={isOpen} toggleModal={toggleModal}>
            {/* Scrollable body */}
            <div className="flex flex-col flex-1 overflow-y-auto">

                {/* Hero image */}
                <div className="relative w-full h-52 sm:h-60 shrink-0">
                    <Image
                        src={imageSrc}
                        alt={event.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* subtle dark gradient at bottom for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-5 p-5">

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 leading-snug">
                        {event.title}
                    </h2>

                    {/* Interested row */}
                    {user && (
                        <div className="flex items-center gap-3 border-b pb-4">
                            <InterestedUsersDisplay
                                isInterested={isInterested}
                                onInterestedChangeAction={async () => await handleInterested(!isInterested)}
                                interestedCount={event.interested_count}
                                interestedUsers={interestedUsers}
                            />
                        </div>
                    )}

                    {/* Going row */}
                    {user && (
                        <div className="flex items-center gap-3 border-b pb-4">
                            <GoingButton isGoing={isGoing}
                                onClick={async () => handleGoing(!isGoing)} />
                            <GoingUsersPanel
                                goingCount={event.going_count}
                                goingUsers={goingUsers}
                            />
                        </div>
                    )}

                    {/* Cost */}
                    <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-xs uppercase text-gray-500 font-semibold tracking-wide">
                            <Euro className="w-3.5 h-3.5" /> Cena
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                            {event.price ? `${event.price}` : 'Bezmaksas'}
                        </span>
                    </div>

                    {/* Location */}
                    <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-xs uppercase text-gray-500 font-semibold tracking-wide">
                            <MapPin className="w-3.5 h-3.5" /> Vieta
                        </span>
                        <span className="text-sm font-medium text-gray-800 leading-tight">
                            {event.address.name}
                        </span>
                        <span className="text-xs text-gray-400">
                            {fixCoordinateNumber(event.address.lat)}, {fixCoordinateNumber(event.address.lng)}
                        </span>
                    </div>

                    {/* Date */}
                    {event.start_date && (
                        <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1 text-xs uppercase text-gray-500 font-semibold tracking-wide">
                                <CalendarDays className="w-3.5 h-3.5" /> Datums
                            </span>
                            <span className="text-sm text-gray-800 font-medium capitalize">
                                {formatEventDate(event.start_date, event.end_date)}
                            </span>
                        </div>
                    )}

                    {/* Description */}
                    {event.description && (
                        <div className="flex flex-col gap-1">
                            <p className="text-xs uppercase text-gray-500 font-semibold tracking-wide">
                                Par pasākumu
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                                {shortenDescription(event.description)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Go to event button */}
                <div className="flex justify-center px-5 pb-5">
                    <Button
                        onClick={handleGoToEvent}
                        className="w-full max-w-[320px] py-3 font-medium text-sm justify-center"
                    >
                        Skatīt pilnu pasākumu
                    </Button>
                </div>
            </div>
        </SideModal>
    );
};

export default EventPreview;