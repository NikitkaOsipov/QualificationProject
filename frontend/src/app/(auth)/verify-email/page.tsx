'use client'

import Button from '@/components/Button'
import { useAuth } from '@/hooks/auth'
import { useState } from 'react'

const Page = () => {
    const { logout, resendEmailVerification } = useAuth({
        middleware: 'auth',
        redirectIfAuthenticated: '/',
    })

    const [status, setStatus] = useState(null)

    return (
        <>
            <div className="mb-4 text-sm text-gray-600">
                Paldies par reģistrāciju! Pirms turpināt, lūdzu apstipriniet
                savu e-pasta adresi, uzspiežot uz saites, ko tikko nosūtījām.
                Ja e-pastu nesaņemat, mēs ar prieku nosūtīsim vēlreiz.
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 font-medium text-sm text-green-600">
                    Jauna apstiprināšanas saite ir nosūtīta uz e-pasta adresi,
                    kuru norādījāt reģistrācijas laikā.
                </div>
            )}

            {status === 'verification-link-failed' && (
                <div className="mb-4 font-medium text-sm text-red-600">
                    Neizdevās nosūtīt apstiprināšanas e-pastu. Lūdzu mēģiniet vēlreiz vēlāk.
                </div>
            )}

            <div className="mt-4 flex items-center justify-between">
                <Button onClick={() => resendEmailVerification({ setStatus })}>
                    Nosūtīt apstiprināšanas e-pastu vēlreiz
                </Button>

                <button
                    type="button"
                    className="underline text-sm text-gray-600 hover:text-gray-900"
                    onClick={logout}>
                    Iziet
                </button>
            </div>
        </>
    )
}

export default Page
