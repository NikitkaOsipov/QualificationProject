"use client";
import { useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

type LeftModalProps = {
    isOpen: boolean;
    toggleModal: (value: boolean) => void;
    children: React.ReactNode;
};

export default function SideModal({ isOpen, toggleModal, children }: LeftModalProps) {
    // Close on ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") toggleModal(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [toggleModal]);

    return (
        <div
            className={`
                fixed inset-x-0 bottom-0 z-[1200]
                flex h-[85vh] flex-col bg-white
                shadow-[0_-4px_24px_rgba(0,0,0,0.15)]
                transition-transform duration-300 ease-in-out
                sm:absolute sm:inset-x-auto sm:left-0 sm:top-0 sm:bottom-auto sm:h-full sm:w-[420px] sm:rounded-none sm:shadow-none
                ${isOpen ? "translate-y-0 " +
                "sm:translate-x-0 sm:translate-y-0" 
                : "translate-y-full " +
                "sm:-translate-x-full sm:translate-y-0"}
            `}
        >
            {children}

            <button
                onClick={() => toggleModal(!isOpen)}
                className="absolute
                left-full top-1/2 hidden h-20 w-8
                -translate-y-1/2 items-center
                justify-center rounded-r-md
                bg-white shadow-[inset_4px_0_6px_-4px_rgba(0,0,0,0.3)]
                hover:bg-gray-100 sm:flex"
            >
                {isOpen ? "◀" : "▶"}
            </button>

            <button
                onClick={() => toggleModal(!isOpen)}
                className="absolute -top-9 left-0 z-10 flex
                h-9 w-full items-center justify-center
                rounded-t-xl border border-gray-200 
                border-b-0 bg-white text-gray-600 
                shadow-[0_-2px_10px_rgba(0,0,0,0.12)] 
                hover:bg-gray-100 sm:hidden"
            >
                {isOpen ? <FaChevronDown size={14} /> : <FaChevronUp size={14} />}
            </button>
        </div>
    );
}