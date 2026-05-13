"use client";

import '@/lib/echo-init'; // Initializes echo before everything else
import { Nunito } from 'next/font/google';
import '@/app/global.css';
import { useAuth } from '@/hooks/auth';
import Navigation from '@/components/Navigation';
import { SnackbarProvider } from '@/context/SnackbarContext';

const nunitoFont = Nunito({
    subsets: ['latin-ext'],
    display: 'swap',
});

const RootLayout = ({
                        children
                    } : {
    children: React.ReactNode
}) => {
    const { user } = useAuth({ });

    return (
        <html lang="en" className={nunitoFont.className}>
            <body className="min-h-screen bg-white">
                <SnackbarProvider>
                    <div className="flex flex-col h-screen">
                        <Navigation user={user} />

                        <main
                            className="flex-1"
                        >
                            {children}
                        </main>
                    </div>
                </SnackbarProvider>
            </body>

        </html>
    );
}

export default RootLayout
