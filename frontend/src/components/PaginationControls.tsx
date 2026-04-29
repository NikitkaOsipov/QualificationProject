import type { ReactNode } from 'react';

interface PaginationControlsProps {
    page: number;
    lastPage: number;
    onPageChange: (nextPage: number) => void;
    disabled?: boolean;
    className?: string;
    previousLabel?: string;
    nextLabel?: string;
    pageLabel?: (page: number, lastPage: number) => ReactNode;
};

export default function PaginationControls({
    page,
    lastPage,
    onPageChange,
    disabled = false,
    className = '',
    previousLabel = 'Iepriekšējā',
    nextLabel = 'Nākamā',
    pageLabel,
}: PaginationControlsProps) {
    return (
        <div className={`flex items-center justify-between ${className}`}>
            <button
                type="button"
                disabled={disabled || page <= 1}
                onClick={() => onPageChange(Math.max(1, page - 1))}
                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            >
                {previousLabel}
            </button>
            <span className="text-sm text-gray-500">
                {pageLabel ? pageLabel(page, lastPage) : `Lapa ${page} no ${lastPage}`}
            </span>
            <button
                type="button"
                disabled={disabled || page >= lastPage}
                onClick={() => onPageChange(Math.min(lastPage, page + 1))}
                className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            >
                {nextLabel}
            </button>
        </div>
    );
}


