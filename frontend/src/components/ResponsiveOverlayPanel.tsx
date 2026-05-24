'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface ResponsiveOverlayPanelProps {
    isOpen: boolean;
    onClose: () => void;
    trigger: ReactNode;
    title: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
    desktopWidthClass?: string;
    closeOnOutsideClick?: boolean;
}

const ResponsiveOverlayPanel = ({
    isOpen,
    onClose,
    trigger,
    title,
    actions,
    children,
    desktopWidthClass = 'w-96',
    closeOnOutsideClick = false,
}: ResponsiveOverlayPanelProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Closes on click outside of panel
    useEffect(() => {
        if (!isOpen || !closeOnOutsideClick) {
            return;
        }

        const handleDocumentPointerDown = (event: PointerEvent) => {
            const target = event.target as Node | null;

            if (!target || containerRef.current?.contains(target)) {
                return;
            }

            onClose();
        };

        document.addEventListener('pointerdown', handleDocumentPointerDown);

        return () => {
            document.removeEventListener('pointerdown', handleDocumentPointerDown);
        };
    }, [closeOnOutsideClick, isOpen, onClose]);

    return (
        <div ref={containerRef} className="relative">
            {trigger}

            {isOpen && (
                <>
                    <div className={`absolute right-0 z-[1200] mt-2 hidden rounded-lg border border-gray-200 bg-white shadow-lg sm:block ${desktopWidthClass}`}>
                        <div className="relative z-[1201] flex items-center justify-between border-b border-gray-100 px-4 py-2">
                            <span className="text-sm font-semibold text-gray-900">{title}</span>
                            {actions ? <div className="flex gap-2">{actions}</div> : null}
                        </div>

                        <div className="max-h-80 overflow-y-auto py-1">{children}</div>
                    </div>

                    <div className="fixed inset-0 z-[1300] bg-white sm:hidden">
                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                            <span className="text-base font-semibold text-gray-900">{title}</span>

                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                aria-label="Aizvert paneli">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {actions ? <div className="flex gap-2 px-4 py-2">{actions}</div> : null}

                        <div className="overflow-y-auto py-1">{children}</div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ResponsiveOverlayPanel;