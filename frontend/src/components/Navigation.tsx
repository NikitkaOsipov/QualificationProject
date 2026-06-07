import ApplicationLogo from '@/components/ApplicationLogo';
import Dropdown from '@/components/Dropdown';
import Link from 'next/link';
import NavLink from '@/components/NavLink';
import ResponsiveNavLink, {
    ResponsiveNavButton,
} from '@/components/ResponsiveNavLink';
import { DropdownButton } from '@/components/DropdownLink';
import { useAuth } from '@/hooks/auth';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Notifications from '@/components/Notifications';
import OnlineFriendsWindow from '@/components/OnlineFriendsWindow';
import Button from '@/components/Button';
import UserAvatar from '@/components/User/UserAvatar';

const Navigation = ({ user }) => {
    const { logout } = useAuth();
    const pathname = usePathname();

    const [open, setOpen] = useState(false);
    
    // Closes navigation menu on small screens
    const closeNativeNavigationMenu = () => setOpen(false);

    return (
        <nav className="bg-white border-b border-gray-100">
            {/* Primary Navigation Menu */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/">
                                <ApplicationLogo className="block h-12 w-14 fill-current text-gray-600" />
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                            <NavLink
                                href="/events"
                                active={pathname === '/events'}>
                                Pasākumi
                            </NavLink>
                        </div>

                        <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                            <NavLink
                                href="/map"
                                active={pathname === '/map'}>
                                Kartes skats
                            </NavLink>
                        </div>

                        <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                            <NavLink
                                href="/people"
                                active={pathname === '/people'}>
                                Cilvēki
                            </NavLink>
                        </div>

                        {user?.role === 'admin' && (
                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <NavLink
                                    href="/admin/users"
                                    active={pathname === '/admin/users'}>
                                    Admin Lietotāji
                                </NavLink>
                            </div>
                        )}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center ml-auto">
                        {user && (
                            <div className="flex sm:hidden items-center gap-2 mr-2">
                                <OnlineFriendsWindow user={user} />
                                <Notifications user={user} />
                                <Link
                                    href={`/profile?id=${user?.id}`}
                                    className="inline-flex items-center justify-center rounded-full transition duration-150 ease-in-out hover:opacity-90"
                                    aria-label="Profils">
                                    <UserAvatar
                                        avatarPath={user?.avatar_path}
                                        name={user?.name ?? 'Profils'}
                                        className="w-9 h-9"
                                    />
                                </Link>
                            </div>
                        )}

                         {/* Create Event Button */}
                         {user && (
                             <div className="hidden sm:flex sm:items-center mr-4">
                                 <Link href="/create-event">
                                     <Button className="text-sm py-1 px-3">
                                         Izveidot pasākumu
                                     </Button>
                                 </Link>
                             </div>
                         )}
                         {user && (
                             <div className="hidden sm:flex sm:items-center gap-3">
                                 <OnlineFriendsWindow user={user} />
                                 <Notifications user={user} />

                                 {/* Settings Dropdown */}
                                 <Dropdown
                                     align="right"
                                     width={48}
                                     trigger={
                                         <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out">
                                             <div>{user?.name}</div>

                                             <div className="ml-1">
                                                 <svg
                                                     className="fill-current h-4 w-4"
                                                     xmlns="http://www.w3.org/2000/svg"
                                                     viewBox="0 0 20 20">
                                                     <path
                                                         fillRule="evenodd"
                                                         d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                         clipRule="evenodd"
                                                     />
                                                 </svg>
                                             </div>
                                         </button>
                                     }>
                                     {/* Profile Link */}
                                     <Link href={`/profile?id=${user?.id}`}>
                                         <DropdownButton>
                                             Profils
                                         </DropdownButton>
                                     </Link>

                                     <Link href="/settings">
                                         <DropdownButton>
                                             Iestatījumi
                                         </DropdownButton>
                                     </Link>

                                     {/* Authentication */}
                                     <DropdownButton onClick={logout}>
                                         Iziet
                                     </DropdownButton>
                                 </Dropdown>
                             </div>
                         )}

                        {!user && (
                            <div className="hidden sm:flex sm:items-center gap-5">
                                <Link href="/login" className="text-sm font-medium hover:opacity-80 transition duration-150 ease-in-out">
                                    <span className="text-logo-gradient">
                                        Pieslēgties
                                    </span>
                                </Link>

                                <Link href="/register" className="text-sm font-medium hover:opacity-80 transition duration-150 ease-in-out">
                                    <span className="text-logo-gradient">
                                        Reģistrēties
                                    </span>
                                </Link>
                            </div>
                        )}

                        {/* Hamburger menu for mobile */}
                        <button
                            onClick={() => setOpen(open => !open)}
                            className="-mr-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out sm:hidden">
                            {/* Hamburger svg */}
                            <svg
                                className="h-6 w-6"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 24 24">
                                {open ? (
                                    <path
                                        className="inline-flex"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        className="inline-flex"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Responsive Navigation Menu */}
            {open && (
                <div className="fixed inset-0 z-[1200] bg-white sm:hidden overflow-y-auto">
                    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
                        <Link href="/" onClick={closeNativeNavigationMenu}>
                            <ApplicationLogo className="block h-12 w-14 fill-current text-gray-600" />
                        </Link>

                        <button
                            onClick={closeNativeNavigationMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out"
                            aria-label="Aizvērt izvēlni">
                            {/* Cross svg */}
                            <svg
                                className="h-6 w-6"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink
                            href="/events"
                            onClick={closeNativeNavigationMenu}
                            active={pathname === '/events'}>
                            Pasākumi
                        </ResponsiveNavLink>

                        <ResponsiveNavLink
                            href="/people"
                            onClick={closeNativeNavigationMenu}
                            active={pathname === '/people'}>
                            Cilvēki
                        </ResponsiveNavLink>

                        <ResponsiveNavLink
                            href="/map"
                            onClick={closeNativeNavigationMenu}
                            active={pathname === '/map'}>
                            Kartes skats
                        </ResponsiveNavLink>

                        {user?.role === 'admin' && (
                            <ResponsiveNavLink
                                href="/admin/users"
                                onClick={closeNativeNavigationMenu}
                                active={pathname === '/admin/users'}>
                                Admin lietotāji
                            </ResponsiveNavLink>
                        )}

                        {/* Create Event Button */}
                        {user && (
                            <div className="px-3 py-2">
                                <Link href="/create-event" onClick={closeNativeNavigationMenu}>
                                    <Button className="w-full text-center text-sm py-2 px-4">
                                        Izveidot pasākumu
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {user ? (
                        <div className="pt-4 pb-1 border-t border-gray-200">
                            <div className="mt-3 space-y-1">
                                {/* Profile Link */}
                                <ResponsiveNavLink
                                    href={`/profile?id=${user?.id}`}
                                    onClick={closeNativeNavigationMenu}
                                    active={pathname === '/profile'}>
                                    Profils
                                </ResponsiveNavLink>

                                <ResponsiveNavLink
                                    href="/settings"
                                    onClick={closeNativeNavigationMenu}
                                    active={pathname === '/settings'}>
                                    Iestatījumi
                                </ResponsiveNavLink>

                                {/* Authentication */}
                                <ResponsiveNavButton
                                    onClick={() => {
                                        closeNativeNavigationMenu()
                                        logout()
                                    }}>
                                    Iziet
                                </ResponsiveNavButton>
                            </div>
                        </div>
                    ) : (
                        <div className="pt-4 pb-3 border-t border-gray-200 space-y-2">
                            <Link
                                href="/login"
                                onClick={closeNativeNavigationMenu}
                                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium leading-5 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out">
                                <span className="text-logo-gradient">
                                    Pieslēgties
                                </span>
                            </Link>

                            <Link
                                href="/register"
                                onClick={closeNativeNavigationMenu}
                                className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium leading-5 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out">
                                <span className="text-logo-gradient">
                                    Reģistrēties
                                </span>
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    )
}

export default Navigation