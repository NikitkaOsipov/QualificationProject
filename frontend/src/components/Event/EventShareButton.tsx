'use client';

import { useEffect, useRef, useState } from 'react';

interface EventShareButtonProps {
    eventTitle: string;
}

const EventShareButton = ({ eventTitle }: EventShareButtonProps) => {
    const [shareFeedback, setShareFeedback] = useState<string | null>(null);
    const clearTimerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (clearTimerRef.current) {
                window.clearTimeout(clearTimerRef.current);
            }
        };
    }, []);

    const clearFeedbackLater = () => {
        if (clearTimerRef.current) {
            window.clearTimeout(clearTimerRef.current);
        }

        clearTimerRef.current = window.setTimeout(() => {
            setShareFeedback(null);
        }, 2500);
    };

    const handleShare = async () => {
        const eventUrl = typeof window !== 'undefined' ? window.location.href : '';

        try {
            if (typeof navigator !== 'undefined' && navigator.share) {
                await navigator.share({
                    title: eventTitle,
                    text: `Pievienojies pasākumam: ${eventTitle}`,
                    url: eventUrl,
                });

                return;
            }

            if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(eventUrl);
                setShareFeedback('Saite nokopēta starpliktuvē.');
                clearFeedbackLater();
                return;
            }

            window.prompt('Nokopē pasākuma saiti:', eventUrl);
        } catch (error: any) {
            if (error?.name !== 'AbortError') {
                window.prompt('Nokopē pasākuma saiti:', eventUrl);
            }
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={handleShare}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
                Dalīties
            </button>

            {shareFeedback && (
                <span className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    {shareFeedback}
                </span>
            )}
        </>
    );
};

export default EventShareButton;
