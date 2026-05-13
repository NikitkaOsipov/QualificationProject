import useSWR from 'swr';
import axios from '@/lib/axios';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isNative } from '@/Config/api';
import { Preferences } from '@capacitor/preferences';
import { getUser } from '@/utils/user_service';
import { User } from '@/utils/Types';

const UI_USER_TTL_MS = 120 * 60 * 1000;

export const useAuth = ({
    middleware,
    redirectIfAuthenticated
} : {
    middleware?: string,
    redirectIfAuthenticated?: string
} = {}) => {
    const router = useRouter();
    const params = useParams();

    const readCachedUser = async () => {
        try {
            const raw = await Preferences.get({ key: 'ui-user' });
            const uiUser = raw.value ? JSON.parse(raw.value) : undefined;

            if (!uiUser) return undefined;

            if (!uiUser.expiresAt || Date.now() > uiUser.expiresAt) {
                void Preferences.remove({key: 'ui-user'});
                return undefined;
            }
            return uiUser.user as User;
        } catch {
            return undefined;
        }
    }

    const { data: user, error, mutate } = useSWR('/api/user', () =>
        getUser().then(res => {
            try {
                void Preferences.set({
                    key: 'ui-user',
                    value: JSON.stringify({
                        user: res,
                        expiresAt: Date.now() + UI_USER_TTL_MS
                    })
                });
            } catch (e) {
                console.error(e);
            }
            return res;
        }).catch(error => {
            if (error.response.status !== 409) throw error;

            router.push('/verify-email');
        })
    );

    // After mount get cashed user while waiting for user request after reload.
    useEffect(() => {
        if (user !== undefined) return;

        // Will become false if in any way component unmountes
        let isActive = true;

        const loadCashedUser = async () => {
            const cashedUser =  await readCachedUser();

            if (isActive && !user && cashedUser) {
                await mutate(cashedUser, false);
            }
        }

        void loadCashedUser();

        return () => {
            isActive = false;
        }
    }, [mutate]);

    const csrf = () => !isNative ? axios.get('/sanctum/csrf-cookie', {withCredentials: true}) : null;

    const mutateUser = async (nextUser?: any) => {
        if (nextUser !== undefined) {
            try {
                void Preferences.set({
                    key: 'ui-user',
                    value: JSON.stringify({
                        user: nextUser,
                        expiresAt: Date.now() + UI_USER_TTL_MS
                    })
                });
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
            });
    }

    const login = async ({ setErrors, setStatus, ...props }) => {
        await csrf();

        setErrors([]);
        setStatus(null);

        const response = await axios
            .post('/api/login', props, { withCredentials: true })
            .catch(error => {
                if (error.response.status !== 422) throw error;

                setErrors(error.response.data.errors);
            });

        if (isNative && response) {
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
            void Preferences.remove({key: 'ui-user'});
        } catch (e){
            console.error(e);
        }
        window.location.pathname = '/login';
    }

    useEffect(() => {
        // Still loading — don't redirect yet
        if (user === undefined && !error) return;

        if (middleware === 'guest' && redirectIfAuthenticated && user){
            router.push(redirectIfAuthenticated);
        }

        if (middleware === 'auth' && (user && !user.email_verified_at)) {
            router.push('/verify-email');
        }

        if (
            window.location.pathname === '/verify-email' &&
            user?.email_verified_at
        ) {
            router.push(redirectIfAuthenticated);
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
