import React, { useEffect, useMemo, useState } from 'react';
import { User } from '@/utils/Types';
import { updateCurrentUser } from '@/utils/user_service';

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
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        setName(user.name ?? '');
        setEmail(user.email ?? '');
    }, [user.name, user.email]);

    const hasChanges = () => 
        name.trim() !== (user.name ?? '').trim() || email.trim() !== (user.email ?? '').trim();

    const handleSave = async () => {
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
            setSuccessMessage(null);
            return;
        }

        if (!hasChanges()) {
            setErrors({});
            setSuccessMessage('Nav izmaiņu, ko saglabāt.');
            return;
        }

        setIsSaving(true);
        setErrors({});
        setSuccessMessage(null);

        try {
            const updatedUser = await updateCurrentUser({
                name: trimmedName,
                email: trimmedEmail,
            });

            await onUserUpdatedAction?.(updatedUser);
            setSuccessMessage('Konta informācija veiksmīgi atjaunināta.');
        } catch (e: any) {
            const updateErrors = e?.response?.data?.errors;

            if (updateErrors) {
                setErrors({
                    name: updateErrors.name?.[0],
                    email: updateErrors.email?.[0],
                });
            } else {
                setErrors({ form: e?.response?.data?.message ?? 'Neizdevās atjaunināt konta informāciju.' });
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Konts</h2>
            <p className="mt-1 text-sm text-gray-600">Pārvaldiet sava konta informāciju.</p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="settings-name" className="mb-1 block text-xs uppercase tracking-wide text-gray-500">Vārds</label>
                    <input
                        id="settings-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                    <label htmlFor="settings-email" className="mb-1 block text-xs uppercase tracking-wide text-gray-500">E-pasts</label>
                    <input
                        id="settings-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
            </div>

            {errors.form && <p className="mt-3 text-sm text-red-600">{errors.form}</p>}
            {successMessage && <p className="mt-3 text-sm text-green-700">{successMessage}</p>}

            <div className="mt-4 flex justify-end">
                <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={isSaving}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                    {isSaving ? 'Saglabāju...' : 'Saglabāt izmaiņas'}
                </button>
            </div>
        </section>
    );
};

export default AccountSettingsPanel;