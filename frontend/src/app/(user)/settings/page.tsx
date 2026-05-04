'use client';

import { useState } from 'react';
import Loading from '@/components/Loading';
import { useAuth } from '@/hooks/auth';
import AccountSettingsPanel from '@/components/Settings/AccountSettingsPanel';
import NotificationSettingsPanel from '@/components/Settings/NotificationSettingsPanel';
import SettingsSidebar, { SettingsSectionId } from '@/components/Settings/SettingsSidebar';

const SETTINGS_SECTIONS: { id: SettingsSectionId; label: string }[] = [
    { id: 'account', label: 'Konts' },
    { id: 'notifications', label: 'Paziņojumi' },
];

const SettingsPage = () => {
    const { user, mutateUser } = useAuth({ middleware: 'auth' });
    const [activeSection, setActiveSection] = useState<SettingsSectionId>('account');

    if (!user) {
        return <Loading />;
    }

    const renderActiveSection = () => {
        if (activeSection === 'account') {
            return <AccountSettingsPanel user={user} onUserUpdatedAction={mutateUser} />;
        }

        if (activeSection === 'notifications') {
            return <NotificationSettingsPanel />;
        }
    };

    return (
        <main className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold text-gray-900">Iestatījumi</h1>

            <div className="mt-6 grid gap-4 md:grid-cols-[220px_1fr] md:items-start">
                <SettingsSidebar
                    sections={SETTINGS_SECTIONS}
                    activeSection={activeSection}
                    onSelect={setActiveSection}
                />
                {renderActiveSection()}
            </div>
        </main>
    );
};

export default SettingsPage;

