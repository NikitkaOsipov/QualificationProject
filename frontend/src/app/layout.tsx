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
    console.log("Layout");
    const { user } = useAuth({ });
    // console.log(user === undefined)
    console.log("User:" + user)

    return (
        <html lang="en" className={nunitoFont.className}>
            <body className="min-h-screen bg-gray-100">
                <h1>Something</h1>
                {/*User is {user}*/}
                <Navigation user={user} />

                <main>{children}</main>
            </body>

        </html>
    );
}

// export const metadata = {
//     title: 'Laravel',
// }

export default RootLayout
