'use client';

import { google, ics, office365, outlook, yahoo } from 'calendar-link';
import { useMemo, useState } from 'react';
import type { EventType } from '@/utils/Types';

interface EventAddToCalendarButtonProps {
    event: EventType;
}

const parseEventDate = (value?: string): Date | null => {
    if (!value) {
        return null;
    }

    const normalizedValue = value.includes('T') ? value : value.replace(' ', 'T');
    const parsed = new Date(normalizedValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const EventAddToCalendarButton = ({ event }: EventAddToCalendarButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const calendarLinks = useMemo(() => {
        const startDate = parseEventDate(event.start_date);
        if (!startDate) {
            return null;
        }

        const endDate = parseEventDate(event.end_date);
        const safeEndDate = endDate && endDate > startDate
            ? endDate
            : new Date(startDate.getTime() + 60 * 60 * 1000);
        const eventUrl = typeof window !== 'undefined' ? window.location.href : '';

        const calendarEvent = {
            title: event.title,
            start: startDate,
            end: safeEndDate,
            description: event.description ?? 'Skatiet vairāk informācijas pasākuma lapā.',
            location: event.address?.name ?? '',
            url: eventUrl,
        }

        return {
            google: google(calendarEvent),
            outlook: outlook(calendarEvent),
            office365: office365(calendarEvent),
            yahoo: yahoo(calendarEvent),
            ics: ics(calendarEvent),
        }
    }, [event]);

    if (!calendarLinks) {
        return null;
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((currentValue) => !currentValue)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
                Pievienot kalendāram
            </button>

            {isOpen && (
                <div className="absolute left-0 top-full z-[2100] mt-3 w-56 rounded-lg border bg-white shadow-xl ring-1 ring-black/5">
                    <a href={calendarLinks.google} target="_blank" rel="noreferrer" className="block px-4 py-2 text-sm hover:bg-gray-50">
                        Google Calendar
                    </a>
                    <a href={calendarLinks.outlook} target="_blank" rel="noreferrer" className="block px-4 py-2 text-sm hover:bg-gray-50">
                        Outlook
                    </a>
                    <a href={calendarLinks.office365} target="_blank" rel="noreferrer" className="block px-4 py-2 text-sm hover:bg-gray-50">
                        Office 365
                    </a>
                    <a href={calendarLinks.yahoo} target="_blank" rel="noreferrer" className="block px-4 py-2 text-sm hover:bg-gray-50">
                        Yahoo Calendar
                    </a>
                    <a href={calendarLinks.ics} download={`${event.title}.ics`} className="block px-4 py-2 text-sm hover:bg-gray-50">
                        Lejupielādēt .ics
                    </a>
                </div>
            )}
        </div>
    );
};

export default EventAddToCalendarButton;