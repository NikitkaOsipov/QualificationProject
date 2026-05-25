'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import FriendSelector from '@/components/User/FriendSelector';
import { requestEventParticipation } from '@/utils/post_service';

interface EventParticipationRequestButtonProps {
    eventId?: string;
}

const EventParticipationRequestButton = ({ eventId }: EventParticipationRequestButtonProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFriendIds, setSelectedFriendIds] = useState<number[]>([]);
    const [sendingRequests, setSendingRequests] = useState(false);

    useEffect(() => {
        if (!isModalOpen) {
            return;
        }

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !sendingRequests) {
                setIsModalOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isModalOpen, sendingRequests]);

    const handleSendParticipationRequests = async () => {
        if (!eventId || selectedFriendIds.length === 0 || sendingRequests) {
            return;
        }

        setSendingRequests(true);
        try {
            const response = await requestEventParticipation(eventId, selectedFriendIds);
            if (response.status === 'ok') {
                setSelectedFriendIds([]);
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Neizdevās nosūtīt ielūgumus draugiem.', error);
        } finally {
            setSendingRequests(false);
        }
    };

    return (
        <>
            <Button
                type="button"
                onClick={() => setIsModalOpen(true)}
                disabled={!eventId}
                variant="secondary"
                className=""
            >
                Uzaicināt draugus
            </Button>

            {isModalOpen && (
                <div
                    className="fixed inset-0 z-[2000] bg-black/40 flex items-center justify-center px-4"
                    onClick={() => !sendingRequests && setIsModalOpen(false)}
                >
                    <div
                        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-gray-200 p-5 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="text-lg font-semibold text-gray-900">Uzaicināt draugus uz pasākumu</h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                disabled={sendingRequests}
                                className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                aria-label="Aizvērt modal logu"
                            >
                                x
                            </button>
                        </div>

                        <FriendSelector
                            selectedIds={selectedFriendIds}
                            onChange={setSelectedFriendIds}
                            title="Uzaicini draugus"
                            description="Izvēlies draugus, kuriem nosūtīt ielūgumu."
                            maxHeightClassName="max-h-64"
                        />

                        <div className="flex justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                disabled={sendingRequests}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                            >
                                Atcelt
                            </button>
                            <Button
                                type="button"
                                disabled={selectedFriendIds.length === 0 || sendingRequests}
                                onClick={handleSendParticipationRequests}
                                className=""
                            >
                                {sendingRequests ? 'Sūta ielūgumus...' : 'Nosūtīt ielūgumus'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EventParticipationRequestButton;

