"use client";

import { Nunito } from 'next/font/google';
import '@/app/global.css';
import { useAuth } from '@/hooks/auth';
import Navigation from '@/components/Navigation';

const nunitoFont = Nunito({
    subsets: ['latin'],
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
            <body className="min-h-screen bg-gray-100">
                <div className="flex flex-col h-screen">
                    <Navigation user={user} />

                    <main
                        className="flex-1"
                    >{children}</main>
                </div>
            </body>

        </html>
    );
}

export default RootLayout
