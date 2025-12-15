"use client";

import { Nunito } from 'next/font/google';
import '@/app/global.css';
import { useAuth } from '@/hooks/auth';
import Loading from '@/app/Loading';
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
    const { user } = useAuth();

    return (
        <html lang="en" className={nunitoFont.className}>
            <body className="min-h-screen bg-gray-100">
            {(user === undefined ? (
                    <Loading/>
                ) : (
                    <>
                        <Navigation user={user} />

                        <main>{children}</main>
                    </>
                )
            )}
            </body>

        </html>
    );
}

// export const metadata = {
//     title: 'Laravel',
// }

export default RootLayout
