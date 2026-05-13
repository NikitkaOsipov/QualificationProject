import React, { createContext, useState, useCallback } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface SnackbarMessage {
    id: number
    message: string
    type: AlertColor
}

type SnackbarContextType = (message: string, type: AlertColor) => void;

const HIDE_DURATION = 5000;

// Context which I can access in child components
export const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

// A tag wrapper around layout (parent component) so that children components could access addSnackbarMessage function
export function SnackbarProvider({ children }) {
    // array of messages
    const [messages, setMessages] = useState<SnackbarMessage[]>([]);

    const addSnackbarMessage = useCallback((message: string, type: AlertColor) => {
        const id = Date.now(); // Sets a unique id by calling now
        setMessages(prev => [...prev, { id, message, type }]);

        // Auto remove message after 5 seconds
        setTimeout(() => {
            setMessages(prev => prev.filter(msg => msg.id !== id));
        }, HIDE_DURATION);
    }, []);

    const removeMessage = (id: number) => setMessages(prev => prev.filter(m => m.id !== id));

    return (
        <SnackbarContext.Provider value={addSnackbarMessage}>
            {children}

            {/* Render all snackbars */}
            {messages.map((msg, index) => (
                <Snackbar
                    key={msg.id}
                    open={true}
                    autoHideDuration={HIDE_DURATION}
                    onClose={() => removeMessage(msg.id)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    style={{ top: `${index * 64 + 10}px` }}
                >
                    <Alert
                        onClose={() => removeMessage(msg.id)}
                        severity={msg.type}
                        sx={{ width: '100%' }}
                    >
                        {msg.message}
                    </Alert>
                </Snackbar>
            ))}
        </SnackbarContext.Provider>
    )
}