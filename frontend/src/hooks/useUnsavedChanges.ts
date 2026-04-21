'use client';

import { useEffect } from 'react';

export function useUnsavedChanges(
    isDirty: boolean,
    message = 'Jūsu izmaiņas netiks saglabātas. Vai tiešām vēlaties pamest lapu?',
) {
    useEffect(() => {
        if (!isDirty) return;

        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = message;
        };

        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty, message]);
}

