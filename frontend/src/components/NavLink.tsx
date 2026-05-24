import Link from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';

type NavLinkProps = ComponentPropsWithoutRef<typeof Link> & {
    active?: boolean;
};

const NavLink = ({ active = false, children, className = '', ...props }: NavLinkProps) => {
    return (
        <Link
            {...props}
            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 focus:outline-none transition duration-150 ease-in-out ${
                active
                    ? 'nav-active-gradient-underline text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:text-gray-700 focus:border-gray-300'
            } ${className}`.trim()}>
            {children}
        </Link>
    );
};

export default NavLink;
