import React, { ChangeEvent, FormEvent, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { User } from '@/utils/Types';
import { updateCurrentUser } from '@/utils/user_service';
import { SnackbarContext } from '@/context/SnackbarContext'
import { extractErrorMessage, extractValidationErrors, isValidationError } from '@/utils/response_helper'
import Input from '@/components/Input';
import Button from '@/components/Button'
import { API_BASE_URL } from '@/Config/api';

interface Props {
    user: User;
    onUserUpdatedAction?: (nextUser: User) => void | Promise<void>;
}

interface Errors {
    name?: string;
    email?: string;
    avatar?: string;
    password?: string;
    password_confirmation?: string;
    form?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const resolveAvatarUrl = (user: User) => {
    if (user.avatar_path?.startsWith('http')) return user.avatar_path;
    if (user.avatar_path) return `${API_BASE_URL}/storage/${user.avatar_path}`;
    return `${API_BASE_URL}/storage/AvatarImages/default.jpg`;
};

const AccountSettingsPanel = ({ user, onUserUpdatedAction }: Props) => {
    const [name, setName] = useState(user.name ?? '');
    const [email, setEmail] = useState(user.email ?? '');
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');

    const addSnackbarMessage = useContext(SnackbarContext);
    const avatarInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setName(user.name ?? '');
        setEmail(user.email ?? '');
    }, [user.name, user.email]);

    useEffect(() => {
        return () => {
            if (avatarPreviewUrl) {
                URL.revokeObjectURL(avatarPreviewUrl);
            }
        };
    }, [avatarPreviewUrl]);

    const avatarSrc = useMemo(() => avatarPreviewUrl ?? resolveAvatarUrl(user), [avatarPreviewUrl, user]);

    const hasPasswordInput = () => Boolean(newPassword || newPasswordConfirmation);

    const hasChanges = () => {
        const profileChanged =
            name.trim() !== (user.name ?? '').trim() ||
            email.trim() !== (user.email ?? '').trim();

        return profileChanged || Boolean(pendingAvatar) || hasPasswordInput();
    };

    const onAvatarPick = (event: ChangeEvent<HTMLInputElement>) => {
        const pickedFile = event.target.files?.[0];
        if (!pickedFile) return;

        if (!pickedFile.type.startsWith('image/')) {
            setErrors(prev => ({ ...prev, avatar: 'Lūdzu izvēlieties attēla failu.' }));
            event.target.value = '';
            return;
        }

        if (avatarPreviewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreviewUrl);
        }

        setErrors(prev => ({ ...prev, avatar: undefined }));
        setPendingAvatar(pickedFile);
        setAvatarPreviewUrl(URL.createObjectURL(pickedFile));
        event.target.value = '';
    };

    const submitForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        const nextErrors: Errors = {};

        if (!trimmedName) {
            nextErrors.name = 'Lūdzu ievadiet vārdu.';
        }

        if (!trimmedEmail) {
            nextErrors.email = 'Lūdzu ievadiet e-pastu.';
        } else if (!EMAIL_REGEX.test(trimmedEmail)) {
            nextErrors.email = 'Lūdzu ievadiet derīgu e-pasta adresi.';
        }

        if (hasPasswordInput()) {
            if (!newPassword) {
                nextErrors.password = 'Lūdzu ievadiet jauno paroli.';
            } else if (newPassword.length < 8) {
                nextErrors.password = 'Jaunajai parolei jābūt vismaz 8 simbolus garai.';
            }

            if (!newPasswordConfirmation) {
                nextErrors.password_confirmation = 'Lūdzu apstipriniet jauno paroli.';
            } else if (newPassword !== newPasswordConfirmation) {
                nextErrors.password_confirmation = 'Paroles nesakrīt.';
            }
        }

        setErrors(prev => ({ avatar: prev.avatar, ...nextErrors }));

        if (Object.keys(nextErrors).length > 0 || errors.avatar) {
            return;
        }

        if (!hasChanges()) {
            addSnackbarMessage('Nav izmaiņu, ko saglabāt.', 'info');
            return;
        }

        setIsSaving(true);

        try {
            const userForm: {
                name: string;
                email: string;
                avatar?: File;
                password?: string;
                password_confirmation?: string;
            } = { name: trimmedName, email: trimmedEmail };

            if (pendingAvatar) userForm.avatar = pendingAvatar;

            if (hasPasswordInput()) {
                userForm.password = newPassword;
                userForm.password_confirmation = newPasswordConfirmation;
            }

            const updatedUser = await updateCurrentUser(userForm);
            await onUserUpdatedAction?.(updatedUser);

            setPendingAvatar(null);
            setAvatarPreviewUrl(null);
            setNewPassword('');
            setNewPasswordConfirmation('');
            setErrors({});
            addSnackbarMessage('Izmaiņas veiksmīgi saglabātas.', 'success');
        } catch (error: any) {
            if (isValidationError(error)) {
                const validationErrors = extractValidationErrors(error);
                Object.values(validationErrors).forEach(messages => {
                    messages?.forEach(message => addSnackbarMessage(message, 'error'));
                });
            } else {
                addSnackbarMessage(extractErrorMessage(error), 'error');
            }

            const updateErrors = error?.response?.data?.errors;
            if (updateErrors) {
                setErrors({
                    name: updateErrors.name?.[0],
                    email: updateErrors.email?.[0],
                    avatar: updateErrors.avatar?.[0],
                    password: updateErrors.password?.[0],
                    password_confirmation: updateErrors.password_confirmation?.[0],
                    form: error?.response?.data?.message,
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

            <form onSubmit={submitForm} className="mt-5">
                <div className="flex flex-col items-center">
                    <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="relative h-28 w-28 overflow-hidden rounded-full border border-gray-200 shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        aria-label="Mainīt profila attēlu"
                        disabled={isSaving}
                    >
                        <img src={avatarSrc} alt={user.name} className="h-full w-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 bg-black/55 py-1 text-center text-xs font-medium text-white">
                            Mainīt
                        </span>
                    </button>
                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onAvatarPick}
                    />
                    <p className="mt-2 text-xs text-gray-500">Noklikšķiniet uz attēla, lai to nomainītu.</p>
                    {errors.avatar && <p className="mt-1 text-sm text-red-600">{errors.avatar}</p>}
                </div>

                <div className="mt-6 border-t border-gray-100 pt-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Pamatinformācija</h3>
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
                </div>

                <div className="mt-6 border-t border-gray-100 pt-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Paroles maiņa</h3>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="settings-new-password" className="mb-1 block text-xs uppercase tracking-wide text-gray-500">Jaunā parole</label>
                            <Input
                                id="settings-new-password"
                                type="password"
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                className="w-full bg-white px-3 py-2 text-sm text-gray-900"
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        <div>
                            <label htmlFor="settings-new-password-confirmation" className="mb-1 block text-xs uppercase tracking-wide text-gray-500">Apstipriniet jauno paroli</label>
                            <Input
                                id="settings-new-password-confirmation"
                                type="password"
                                value={newPasswordConfirmation}
                                onChange={(event) => setNewPasswordConfirmation(event.target.value)}
                                className="w-full bg-white px-3 py-2 text-sm text-gray-900"
                            />
                            {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="text-sm font-medium"
                    >
                        {isSaving ? 'Saglabāju...' : 'Saglabāt izmaiņas'}
                    </Button>
                </div>
            </form>
        </section>
    );
};

export default AccountSettingsPanel;
