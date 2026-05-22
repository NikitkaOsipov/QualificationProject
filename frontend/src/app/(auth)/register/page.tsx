'use client';

import Button from '@/components/Button';
import Input from '@/components/Input';
import InputError from '@/components/InputError';
import Label from '@/components/Label';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth';
import { useContext, useState, useEffect } from 'react'
import { SnackbarContext } from '@/context/SnackbarContext'

interface RegisterErrors {
    name: string[];
    email: string[];
    password: string[];
    password_confirmation: string[];
}

const Page = () => {
    const addSnackbarMessage = useContext(SnackbarContext);

    const { register } = useAuth({
        middleware: 'guest',
        redirectIfAuthenticated: '/',
    });

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState<RegisterErrors>(null);

    const submitForm = event => {
        event.preventDefault();

        register({
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
            setErrors,
        });
    }

    useEffect(() => {
        if (!errors) return;

        Object.values(errors).forEach(messages => {
            messages?.forEach(message => addSnackbarMessage(message, 'error'));
        });
    }, [errors]);

    return (
        <form onSubmit={submitForm}>
            {/* Name */}
            <div>
                <Label htmlFor="name">Vārds</Label>

                <Input
                    id="name"
                    type="text"
                    value={name}
                    className="block mt-1 w-full"
                    onChange={event => setName(event.target.value)}
                    required
                    autoFocus
                />

                <InputError messages={errors?.name} className="mt-2" />
            </div>

            {/* Email Address */}
            <div className="mt-4">
                <Label htmlFor="email">E-pasts</Label>

                <Input
                    id="email"
                    type="email"
                    value={email}
                    className="block mt-1 w-full"
                    onChange={event => setEmail(event.target.value)}
                    required
                />

                <InputError messages={errors?.email} className="mt-2" />
            </div>

            {/* Password */}
            <div className="mt-4">
                <Label htmlFor="password">Parole</Label>

                <Input
                    id="password"
                    type="password"
                    value={password}
                    className="block mt-1 w-full"
                    onChange={event => setPassword(event.target.value)}
                    required
                    autoComplete="new-password"
                />

                <InputError messages={errors?.password} className="mt-2" />
            </div>

            {/* Confirm Password */}
            <div className="mt-4">
                <Label htmlFor="passwordConfirmation">
                    Atkārtot paroli
                </Label>

                <Input
                    id="passwordConfirmation"
                    type="password"
                    value={passwordConfirmation}
                    className="block mt-1 w-full"
                    onChange={event =>
                        setPasswordConfirmation(event.target.value)
                    }
                    required
                />

                <InputError
                    messages={errors?.password_confirmation}
                    className="mt-2"
                />
            </div>

            <div className="mt-4 flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-end">
                <Link
                    href="/login"
                    className="text-center text-sm text-gray-600 underline hover:text-gray-900 sm:text-left">
                    Jau esat reģistrējies?
                </Link>

                <Button className="w-full sm:w-auto">Reģistrēties</Button>
            </div>
        </form>
    )
}

export default Page;