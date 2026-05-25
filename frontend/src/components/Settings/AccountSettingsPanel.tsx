import React, { useContext, useEffect, useState } from 'react'
import { User } from '@/utils/Types';
import { updateCurrentUser } from '@/utils/user_service';
import { SnackbarContext } from '@/context/SnackbarContext'
import { extractErrorMessage, extractValidationErrors, isValidationError } from '@/utils/response_helper'
import Input from '@/components/Input';
import Button from '@/components/Button'

interface Props {
    user: User;
    onUserUpdatedAction?: (nextUser: User) => void | Promise<void>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AccountSettingsPanel = ({ user, onUserUpdatedAction }: Props) => {
    const [name, setName] = useState(user.name ?? '');
    const [email, setEmail] = useState(user.email ?? '');
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; email?: string; form?: string }>({});
    const addSnackbarMessage = useContext(SnackbarContext);

    useEffect(() => {
        setName(user.name ?? '');
        setEmail(user.email ?? '');
    }, [user.name, user.email]);

    const hasChanges = () => 
        name.trim() !== (user.name ?? '').trim() || email.trim() !== (user.email ?? '').trim();

    const submitForm = async (event) => {
        event.preventDefault();
        const nextErrors: { name?: string; email?: string; form?: string } = {};
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName) {
            nextErrors.name = 'Lūdzu ievadiet vārdu.';
        }

        if (!trimmedEmail) {
            nextErrors.email = 'Lūdzu ievadiet e-pastu.';
        } else if (!EMAIL_REGEX.test(trimmedEmail)) {
            nextErrors.email = 'Lūdzu ievadiet derīgu e-pasta adresi.';
        }

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        if (!hasChanges()) {
            setErrors({});
            addSnackbarMessage('Nav izmaiņu, ko saglabāt.', 'info');
            return;
        }

        setIsSaving(true);
        setErrors({});

        try {
            const updatedUser = await updateCurrentUser({
                name: trimmedName,
                email: trimmedEmail,
            });

            await onUserUpdatedAction?.(updatedUser);
            addSnackbarMessage('Konta informācija veiksmīgi atjaunināta.', 'success');
        } catch (error) {
            if (isValidationError(error)) {
                const errors = extractValidationErrors(error);
                Object.values(errors).forEach(messages => {
                    messages?.forEach(message => addSnackbarMessage(message, 'error'));
                });
            } else {
                const errorMessage = extractErrorMessage(error);
                addSnackbarMessage(errorMessage, 'error');
            }
            const updateErrors = error?.response?.data?.errors;

            if (updateErrors) {
                setErrors({
                    name: updateErrors.name?.[0],
                    email: updateErrors.email?.[0],
                });
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Konts</h2>
            <p className="mt-1 text-sm text-gray-600">Pārvaldiet sava konta informāciju.</p>

            <form onSubmit={submitForm}>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="settings-name" className="mb-1 block text-xs uppercase tracking-wide text-gray-500">Vārds</label>
                        <Input
                            required
                            id="settings-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="w-full bg-white px-3 py-2 text-sm text-gray-900"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="settings-email" className="mb-1 block text-xs uppercase tracking-wide text-gray-500">E-pasts</label>
                        <Input
                            required
                            id="settings-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full bg-white px-3 py-2 text-sm text-gray-900"
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                </div>

                {errors.form && <p className="mt-3 text-sm text-red-600">{errors.form}</p>}

                <div className="mt-4 flex justify-end">
                    <Button
                        disabled={isSaving}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {isSaving ? 'Saglabāju...' : 'Saglabāt izmaiņas'}
                    </Button>
                </div>
            </form>
        </section>
    );
};

export default AccountSettingsPanel;