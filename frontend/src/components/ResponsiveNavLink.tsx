import Link from 'next/link'
import type { ButtonHTMLAttributes, ComponentPropsWithoutRef } from 'react'

type ResponsiveNavLinkProps = ComponentPropsWithoutRef<typeof Link> & {
    active?: boolean
}

type ResponsiveNavButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

const ResponsiveNavLink = ({ active = false, children, className = '', ...props }: ResponsiveNavLinkProps) => {
    return (
        <Link
            {...props}
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium leading-5 focus:outline-none transition duration-150 ease-in-out ${
                active
                    ? 'nav-active-gradient-left text-gray-900 bg-indigo-50 focus:text-gray-900 focus:bg-indigo-100'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300'
            } ${className}`.trim()}>
            {children}
        </Link>
    );
}

export const ResponsiveNavButton = (props: ResponsiveNavButtonProps) => (
    <button
        className="block w-full pl-3 pr-4 py-2 border-l-4 text-left text-base font-medium leading-5 focus:outline-none transition duration-150 ease-in-out border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-300 focus:text-gray-800 focus:bg-gray-50 focus:border-gray-300"
        {...props}
    />
);

export default ResponsiveNavLink;
