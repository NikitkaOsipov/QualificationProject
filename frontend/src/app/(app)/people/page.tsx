"use client";

import { useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import PaginationControls from '@/components/PaginationControls';
import UserCard from '@/components/User/UserCard';
import { useAuth } from '@/hooks/auth';
import { searchUsers } from '@/utils/user_service';
import type { User } from '@/utils/Types';

const PAGE_SIZE = 12;

export default function PeoplePage() {
    const { user } = useAuth();

    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                setIsLoading(true);
                const response = await searchUsers({
                    search,
                    page,
                    per_page: PAGE_SIZE,
                });

                setUsers(response.data);
                setLastPage(response.meta.last_page || 1);
                setError(null);
            } catch (e: any) {
                setError(e?.response?.data?.message ?? 'Neizdevās ielādēt lietotājus.');
            } finally {
                setIsLoading(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [search, page]);

    if (!user && isLoading) {
        return <Loading />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Lietotāju meklēšana</h1>
                <p className="text-sm text-gray-500 mt-1">Atrodi pasākumu organizatorus vai savus draugus.</p>
            </div>

            <div className="mb-6">
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

            {error && (
                <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {error}
                </div>
            )}

            {isLoading ? (
                <Loading />
            ) : users.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-sm text-gray-500">
                    Lietotāji netika atrasti.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {users.map((targetUser) => (
                        <UserCard key={targetUser.id} user={targetUser} />
                    ))}
                </div>
            )}

            <PaginationControls
                page={page}
                lastPage={lastPage}
                onPageChange={setPage}
                className="mt-6"
            />
        </div>
    );
}


