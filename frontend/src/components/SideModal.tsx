"use client";
import { useEffect } from "react";
import "@/css/SideModal.css";

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
        <div className={`drawer ${isOpen ? "open" : ""}`}>
            {children}
            <button
                onClick={() => toggleModal(!isOpen)}
                className="drawer-toggle"
            >
                {isOpen ? "◀" : "▶"}
            </button>
        </div>
    );
}