'use client';

import Button from '@/components/Button';
import Input from '@/components/Input';
import InputError from '@/components/InputError';
import Label from '@/components/Label';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth';
import { useEffect, useState, useContext } from 'react';
import AuthSessionStatus from '@/app/(auth)/AuthSessionStatus';
import { SnackbarContext } from '@/context/SnackbarContext'

interface LoginErrors {
    email: string[];
    password: string[];
}

const Login = () => {
    const addSnackbarMessage = useContext(SnackbarContext);

    const { login } = useAuth({
        middleware: 'guest',
        redirectIfAuthenticated: '/',
    });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [shouldRemember, setShouldRemember] = useState(false);
    const [errors, setErrors] = useState<LoginErrors>(null);
    const [status, setStatus] = useState<string>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const reset = params.get('reset');

        if (reset && !errors) {
            setStatus(decodeURIComponent(reset));
        } else {
            setStatus(null);
        }
    }, []);

    const submitForm = async event => {
        event.preventDefault();

        login({
            email,
            password,
            remember: shouldRemember,
            setErrors,
            setStatus,
        });
    }

    useEffect(() => {
        if (!errors) return;

        Object.values(errors).forEach(messages => {
            messages?.forEach(message => addSnackbarMessage(message, 'error'));
        });
    }, [errors]);

    return (
        <>
            <AuthSessionStatus className="mb-4" status={status} />
            <form onSubmit={submitForm} className="space-y-4 sm:space-y-5">
                {/* Email Address */}
                <div>
                    <Label htmlFor="email">E-pasts</Label>

                    <Input
                        id="email"
                        type="email"
                        value={email}
                        className="block mt-1 w-full"
                        onChange={event => setEmail(event.target.value)}
                        required
                        autoFocus
                    />

                    <InputError messages={errors?.email} className="mt-2" />
                </div>

                {/* Password */}
                <div>
                    <Label htmlFor="password">Parole</Label>

                    <Input
                        id="password"
                        type="password"
                        value={password}
                        className="block mt-1 w-full"
                        onChange={event => setPassword(event.target.value)}
                        required
                        autoComplete="current-password"
                    />

                    <InputError
                        messages={errors?.password}
                        className="mt-2"
                    />
                </div>

                {/* Remember Me */}
                <div className="block">
                    <label
                        htmlFor="remember_me"
                        className="inline-flex items-center">
                        <input
                            id="remember_me"
                            type="checkbox"
                            name="remember"
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            onChange={event =>
                                setShouldRemember(event.target.checked)
                            }
                        />

                        <span className="ml-2 text-sm text-gray-600">
                            Atcerēties mani
                        </span>
                    </label>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-1">
                    <Link
                        href="/forgot-password"
                        className="underline text-sm text-gray-600 hover:text-gray-900 text-center sm:text-left">
                        Aizmirsāt paroli?
                    </Link>

                    <Button className="w-full sm:w-auto">Pieslēgties</Button>
                </div>
            </form>
        </>
    )
}

export default Login
