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

    const readCachedUser = () => {
        if (typeof window === 'undefined') return undefined;
        try {
            const raw = localStorage.getItem('auth_user');
            return raw ? JSON.parse(raw) : undefined;
        } catch {
            return undefined;
        }
    }

    const { data: user, error, mutate } = useSWR('/api/user', () =>
        axios
            .get('/api/user')
            .then(res => {
                try {
                    localStorage.setItem('auth_user', JSON.stringify(res.data));
                } catch (e) {
                    console.error(e);
                }
                return res.data;
            })
            .catch(error => {
                if (error.response.status !== 409) throw error

                router.push('/verify-email')
            }),
    )

    // After mount get cashed user while waiting for user request after reload.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (user !== undefined) return;

        const cachedUser = readCachedUser();
        if (cachedUser) {
            mutate(cachedUser, false);
        }
    }, [mutate, user]);

    const csrf = () => !isNative ? axios.get('/sanctum/csrf-cookie', {withCredentials: true}) : null;

    const mutateUser = async (nextUser?: any) => {
        if (nextUser !== undefined) {
            try {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('auth_user', JSON.stringify(nextUser));
                }
            } catch (e) {
                console.error(e);
            }

            await mutate(nextUser, false);
            return;
        }

        await mutate();
    }

    const register = async ({ setErrors, ...props }) => {
        await csrf()

        setErrors([])

        axios
            .post(`/api/register`, props)
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
            .post('/api/login', props, { withCredentials: true })
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
            .post('/api/forgot-password', { email })
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
            .post('/api/reset-password', { token: params.token, ...props })
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
            .post('/api/email/verification-notification')
            .then(response => setStatus(response.data.status))
    }

    const logout = async () => {
        if (!error) {
            await axios.post('/api/logout').then(() => mutate())
        }
        try {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth_user');
            }
        } catch (e){
            console.log(e);
        }
        window.location.pathname = '/login';
    }

    useEffect(() => {
        // Still loading — don't redirect yet
        if (user === undefined && !error) return;

        if (middleware === 'guest' && redirectIfAuthenticated && user){
            console.log("Redirect if authenticated");
            router.push(redirectIfAuthenticated);
        }

        if (middleware === 'auth' && (user && !user.email_verified_at)) {
            console.log("Auth and email verify");
            router.push('/verify-email');
        }

        if (
            window.location.pathname === '/verify-email' &&
            user?.email_verified_at
        ) {
            router.push(redirectIfAuthenticated)
        }
        if (middleware === 'auth' && error) logout();
        if (middleware === 'auth' && !user)
            router.push('/');
    }, [user, error])

    return {
        user,
        mutateUser,
        register,
        login,
        forgotPassword,
        resetPassword,
        resendEmailVerification,
        logout
    }
}
