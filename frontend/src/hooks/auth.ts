import useSWR from 'swr';
import axios from '@/lib/axios';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isNative } from '@/Config/api';
import { Preferences } from '@capacitor/preferences'

export const useAuth = ({
                            middleware,
                            redirectIfAuthenticated
} : {
    middleware?: string,
    redirectIfAuthenticated?: string
} = {}) => {
    const router = useRouter()
    const params = useParams()

    const { data: user, error, mutate } = useSWR('/api/user', () =>
        axios
            .get('/api/user')
            .then(res => res.data)
            .catch(error => {
                if (error.response.status !== 409) throw error

                router.push('/verify-email')
            }),
    )

    const csrf = () => !isNative ? axios.get('/sanctum/csrf-cookie') : null;

    const register = async ({ setErrors, ...props }) => {
        await csrf()

        setErrors([])

        axios
            .post((isNative ? '/api' : '') + `/register`, props)
            .then(() => mutate())
            .catch(error => {
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const login = async ({ setErrors, setStatus, ...props }) => {
        await csrf();

        setErrors([]);
        setStatus(null);

        const response = await axios
            .post((isNative ? '/api' : '') + '/login', props)
            .catch(error => {
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            });

        if (isNative && response) {

            console.log(response);

            const token = response.data.token;

            await Preferences.set({
                key: 'auth_token',
                value: token,
            });
        }

        await mutate();
    }

    const forgotPassword = async ({ setErrors, setStatus, email }) => {
        await csrf()

        setErrors([])
        setStatus(null)

        axios
            .post((isNative ? '/api' : '') + '/forgot-password', { email })
            .then(response => setStatus(response.data.status))
            .catch(error => {
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const resetPassword = async ({ setErrors, setStatus, ...props }) => {
        await csrf()

        setErrors([])
        setStatus(null)

        axios
            .post((isNative ? '/api' : '') + '/reset-password', { token: params.token, ...props })
            .then(response =>
                router.push('/login?reset=' + btoa(response.data.status)),
            )
            .catch(error => {
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const resendEmailVerification = ({ setStatus }) => {
        axios
            .post((isNative ? '/api' : '') + '/email/verification-notification')
            .then(response => setStatus(response.data.status))
    }

    const exceptEmailVerification = () => {
        axios.post('https://10.0.2.2:8000/verify-email/2/95fc8a773d2a77f617254c61393c09562f822809?expires=1760266069&amp;signature=0fa8b5550c8ad8c4992fe9d614a5729bfc5f80b61df401f4353d46c206ff4106')
            .then(response => console.log(response))
    }

    const logout = async () => {
        if (!error) {
            await axios.post((isNative ? '/api' : '') + '/logout').then(() => mutate())
        }
        console.log("LOGGED OUT");
        window.location.pathname = '/login'
    }

    useEffect(() => {
        if (middleware === 'guest' && redirectIfAuthenticated && user){
            console.log("Redirect if authenticated")
            router.push(redirectIfAuthenticated)
        }

        if (middleware === 'auth' && (user && !user.email_verified_at)) {
            console.log("Auth and email verify");
            router.push('/verify-email')
        }

        if (
            window.location.pathname === '/verify-email' &&
            user?.email_verified_at
        ) {
            console.log("Redirect if authenticated and email")
            router.push(redirectIfAuthenticated)
        }
        if (middleware === 'auth' && error) logout()
    }, [user, error])

    return {
        user,
        register,
        login,
        forgotPassword,
        resetPassword,
        resendEmailVerification,
        logout,
        exceptEmailVerification
    }
}
