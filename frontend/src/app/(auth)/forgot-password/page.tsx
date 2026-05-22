'use client';

import Button from '@/components/Button';
import Input from '@/components/Input';
import InputError from '@/components/InputError';
import Label from '@/components/Label';
import { useAuth } from '@/hooks/auth';
import { useContext, useEffect, useState } from 'react';
import AuthSessionStatus from '@/app/(auth)/AuthSessionStatus';
import { SnackbarContext } from '@/context/SnackbarContext';


interface ForgotPasswordErrors {
    email: string[];
}

const Page = () => {
    const addSnackbarMessage = useContext(SnackbarContext);

    const { forgotPassword } = useAuth({
        middleware: 'guest',
        redirectIfAuthenticated: '/',
    });

    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<ForgotPasswordErrors>(null);
    const [status, setStatus] = useState(null);

    const submitForm = event => {
        event.preventDefault();

        forgotPassword({ email, setErrors, setStatus });
    }

    // Show all errors in snackbar
    useEffect(() => {
        if (!errors) return;

        Object.values(errors).forEach(messages => {
            messages?.forEach(message => addSnackbarMessage(message, 'error'));
        });
    }, [errors]);

    return (
        <>
            <div className="mb-4 text-sm text-gray-600">
                Aizmirsāt paroli? Nekādu problēmu. Ievadiet savu e-pasta
                adresi, un mēs nosūtīsim paroles atjaunošanas saiti,
                kas ļaus izvēlēties jaunu paroli.
            </div>

            {/* Session Status */}
            <AuthSessionStatus className="mb-4" status={status} />

            <form onSubmit={submitForm}>
                {/* Email Address */}
                <div>
                    <Label className="email" htmlFor="email">E-pasts</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={email}
                        className="block mt-1 w-full"
                        onChange={event => setEmail(event.target.value)}
                        required
                        autoFocus
                    />

                    <InputError messages={errors?.email} className="mt-2" />
                </div>

                <div className="flex items-center justify-end mt-4 w-full">
                    <Button className="w-full sm:w-auto">Nosūtīt paroles atjaunošanas saiti</Button>
                </div>
            </form>
        </>
    )
}

export default Page
