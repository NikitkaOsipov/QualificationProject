"use client";
import { useEffect } from "react";

type LeftModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

export default function SideModal({ isOpen, onClose, children }: LeftModalProps) {
    // Close on ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <div className="wrapper-modal">
            {/* Drawer */}
            <div className={`drawer ${isOpen ? "open" : ""}`}>
                {children}
            </div>


            <style jsx>{`
                .drawer {
                  position: absolute;
                  top: 0;
                  left: 0;
                  height: 100%; /* Full height of parent */
                  width: 300px;
                  background: white;
                  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
                  transform: translateX(-100%);
                  transition: transform 0.3s ease;
                  z-index: 1000000000;
                  padding: 20px;
                }
        
                .drawer.open {
                  transform: translateX(0);
                }
          `}</style>
        </div>
    );
}