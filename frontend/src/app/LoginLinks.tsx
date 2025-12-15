'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/auth'

const LoginLinks = () => {
    return (
        <div className="px-6 py-4 sm:block">
            <Link
                href="/login"
                className="text-sm text-gray-700 underline"
            >
                Login
            </Link>

            <Link
                href="/register"
                className="ml-4 text-sm text-gray-700 underline"
            >
                Register
            </Link>
        </div>
    )
}

export default LoginLinks
