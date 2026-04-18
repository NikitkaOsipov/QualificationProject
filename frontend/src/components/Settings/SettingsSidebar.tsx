import React from 'react';

export type SettingsSectionId =
    | 'account'
    | 'notifications';

interface SettingsSection {
    id: SettingsSectionId;
    label: string;
}

interface Props {
    sections: SettingsSection[];
    activeSection: SettingsSectionId;
    onSelect: (section: SettingsSectionId) => void;
}

const SettingsSidebar = ({ sections, activeSection, onSelect }: Props) => {
    return (
        <aside className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
            <nav className="space-y-1">
                {sections.map((section) => {
                    const isActive = section.id === activeSection;

                    return (
                        <button
                            key={section.id}
                            type="button"
                            onClick={() => onSelect(section.id)}
                            className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                                isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            {section.label}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
};

export default SettingsSidebar;

