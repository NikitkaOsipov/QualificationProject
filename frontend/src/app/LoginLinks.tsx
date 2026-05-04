'use client'

import Link from 'next/link'

const LoginLinks = () => {
    return (
        <div className="px-6 py-4 sm:block">
            <Link
                href="/login"
                className="text-sm text-gray-700 underline"
            >
                Pieslēgties
            </Link>

            <Link
                href="/register"
                className="ml-4 text-sm text-gray-700 underline"
            >
                Reģistrēties
            </Link>
        </div>
    )
}

export default LoginLinks
