"use client";

import { useContext, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/auth';
import Loading from '@/components/Loading';
import PaginationControls from '@/components/PaginationControls';
import SelectableUserCard from '@/components/User/SelectableUserCard';
import type { User } from '@/utils/Types';
import { deleteAdminUser, getAdminUsers, updateAdminUser } from '@/utils/admin_service';
import { SnackbarContext } from '@/context/SnackbarContext'
import { extractErrorMessage, extractValidationErrors, isValidationError } from '@/utils/response_helper'

const PAGE_SIZE = 6;

export default function AdminUsersPage() {
    const { user } = useAuth({ middleware: 'auth' });

    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const addSnackbarMessage = useContext(SnackbarContext);

    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editRole, setEditRole] = useState<'user' | 'admin'>('user');
    const isEditingOwnAccount = Boolean(selectedUser && user && selectedUser.id === user.id);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            setIsLoading(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setIsLoading(true);
                const response = await getAdminUsers({
                    search,
                    page,
                    per_page: PAGE_SIZE,
                });

                setUsers(response.data);
                setLastPage(response.meta.last_page || 1);

                if (!selectedUser || !response.data.some((target) => target.id === selectedUser.id)) {
                    const firstUser = response.data[0] ?? null;
                    setSelectedUser(firstUser);
                    setEditName(firstUser?.name ?? '');
                    setEditEmail(firstUser?.email ?? '');
                    setEditRole(firstUser?.role === 'admin' ? 'admin' : 'user');
                }
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
            } finally {
                setIsLoading(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [search, page, user]);

    const selectUser = (target: User) => {
        setSelectedUser(target);
        setEditName(target.name ?? '');
        setEditEmail(target.email ?? '');
        setEditRole(target.role === 'admin' ? 'admin' : 'user');
    };

    const onSave = async () => {
        if (!selectedUser || isSaving) {
            return;
        }

        setIsSaving(true);
        try {
            const response = await updateAdminUser(selectedUser.id, {
                name: editName.trim(),
                email: editEmail.trim(),
                role: editRole,
            });

            if (response.status !== 'ok') {
                addSnackbarMessage('Neizdevās saglabāt lietotāja izmaiņas.', 'error');
                return;
            }

            setUsers((currentUsers) => currentUsers.map((target) =>
                target.id === selectedUser.id ? { ...target, name: editName.trim(), email: editEmail.trim(), role: editRole} : target,
            ));
            setSelectedUser((currentUser) => currentUser ? { ...currentUser, name: editName.trim(), email: editEmail.trim(), role: editRole } : currentUser);
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
        } finally {
            setIsSaving(false);
        }
    };

    const onDelete = async () => {
        if (!selectedUser || !user || isDeleting) {
            return;
        }

        if (selectedUser.id === user.id) {
            addSnackbarMessage('Jūs nevarat izdzēst savu kontu.', 'error');
            return;
        }

        const confirmed = window.confirm(`Vai tiešām vēlaties dzēst lietotāju ${selectedUser.name}?`);
        if (!confirmed) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await deleteAdminUser(selectedUser.id);

            if (response.status !== 'ok') {
                addSnackbarMessage('Neizdevās izdzēst lietotāju.', 'error');
                return;
            }

            const nextUsers = users.filter((target) => target.id !== selectedUser.id);
            setUsers(nextUsers);

            const nextSelectedUser = nextUsers[0] ?? null;
            setSelectedUser(nextSelectedUser);
            setEditName(nextSelectedUser?.name ?? '');
            setEditEmail(nextSelectedUser?.email ?? '');
            setEditRole(nextSelectedUser?.role === 'admin' ? 'admin' : 'user');
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
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading && !user) {
        return <Loading />;
    }

    if (!user || user.role !== 'admin') {
        return (
            <div className="max-w-3xl mx-auto px-4 py-10">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                    Šī sadaļa ir pieejama tikai administratoriem.
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Lietotāju pārvaldīšana</h1>
            </div>

            <div className="mb-6 flex gap-3">
                <input
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                    }}
                    placeholder="Meklēt pēc vārda vai e-pasta"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                    {isLoading ? (
                        <Loading />
                    ) : users.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-6 text-sm text-gray-500">
                            Lietotāji netika atrasti.
                        </div>
                    ) : (
                        users.map((target) => (
                            <SelectableUserCard
                                key={target.id}
                                user={target}
                                selected={selectedUser?.id === target.id}
                                selectAction={selectUser}
                            />
                        ))
                    )}

                    <PaginationControls
                        page={page}
                        lastPage={lastPage}
                        onPageChange={setPage}
                        className="pt-2"
                    />
                </div>

                <div className="rounded-xl border p-5 shadow-sm h-fit">
                    <h2 className="text-lg font-semibold mb-4">Lietotāja dati</h2>

                    {!selectedUser ? (
                        <p className="text-sm text-gray-500">Izvēlieties lietotāju no saraksta.</p>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm text-gray-600">Vārds</label>
                                <input
                                    value={editName}
                                    onChange={(event) => setEditName(event.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-gray-600">E-pasts</label>
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(event) => setEditEmail(event.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm text-gray-600">Loma</label>
                                <select
                                    value={editRole}
                                    onChange={(event) => setEditRole(event.target.value as 'user' | 'admin')}
                                    disabled={isEditingOwnAccount}
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                >
                                    <option value="user">Lietotājs</option>
                                    <option value="admin">Administrators</option>
                                </select>
                                {isEditingOwnAccount && (
                                    <p className="mt-1 text-xs text-gray-500">Jūs nevarat mainīt savu lomu.</p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={onSave}
                                disabled={isSaving}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                            >
                                {isSaving ? 'Saglabāju...' : 'Saglabāt'}
                            </button>

                            <button
                                type="button"
                                onClick={onDelete}
                                disabled={isDeleting || selectedUser.id === user.id}
                                className="rounded-lg border border-red-300 bg-red-50 ml-4 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isDeleting ? 'Dzēšu...' : 'Dzēst lietotāju'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}



