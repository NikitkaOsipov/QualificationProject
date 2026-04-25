'use client';

import { useEffect, useRef, useState } from 'react';

interface EventOwnerMenuProps {
    eventId?: string;
    isDeletingEvent: boolean;
    onEditAction: () => void;
    onDeleteAction: () => void;
}

const EventOwnerMenu = ({ eventId, isDeletingEvent, onEditAction, onDeleteAction }: EventOwnerMenuProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="p-2 rounded-lg border hover:bg-gray-100 flex items-center justify-center"
                aria-label="Rīkotāja izvēlne"
            >
                <span className="text-xl leading-none tracking-widest select-none">...</span>
            </button>

            {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-200 bg-white shadow-lg z-50 overflow-hidden">
                    <button
                        type="button"
                        onClick={() => {
                            setIsMenuOpen(false);
                            onEditAction();
                        }}
                        disabled={!eventId}
                        className="w-full text-left px-4 py-3 text-sm text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 disabled:opacity-60"
                    >
                        Rediģēt pasākumu
                    </button>
                    <hr className="border-gray-100" />
                    <button
                        type="button"
                        onClick={() => {
                            setIsMenuOpen(false);
                            onDeleteAction();
                        }}
                        disabled={isDeletingEvent}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-60"
                    >
                        {isDeletingEvent ? 'Dzēšu...' : 'Dzēst pasākumu'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default EventOwnerMenu;

