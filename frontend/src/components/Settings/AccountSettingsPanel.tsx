import React from 'react';
import { User } from '@/utils/Types';

interface Props {
    user: User;
}

const AccountSettingsPanel = ({ user }: Props) => {
    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Account</h2>
            <p className="mt-1 text-sm text-gray-600">Manage your account information.</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Name</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{user.name}</p>
                </div>
                <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{user.email}</p>
                </div>
            </div>
        </section>
    );
};

export default AccountSettingsPanel;

