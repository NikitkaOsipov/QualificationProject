'use client';

import React from 'react';

const VISIBILITY_OPTIONS = [
    { value: 'public', label: 'Publisks - Ikviens var redzēt šo pasākumu' },
    { value: 'friends_only', label: 'Tikai draugiem - Redz tikai jūsu draugi' },
    { value: 'private', label: 'Privāts - Pieejams tikai ar saiti' },
];

interface VisibilityStageProps {
    visibility: 'public' | 'friends_only' | 'private';
    onVisibilityChange: (visibility: 'public' | 'friends_only' | 'private') => void;
}

const VisibilityStage = ({
    visibility,
    onVisibilityChange,
}: VisibilityStageProps) => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Pasākuma redzamība</h2>
                <p className="text-gray-600">Kontrolējiet, kas var redzēt un atrast jūsu pasākumu</p>
            </div>

            {/* Visibility Options */}
            <div className="space-y-3">
                {VISIBILITY_OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onVisibilityChange(option.value as 'public' | 'friends_only' | 'private')}
                        className={`w-full p-4 rounded-lg border-2 transition text-left ${
                            visibility === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 bg-white hover:border-blue-300'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                                    visibility === option.value
                                        ? 'border-blue-500 bg-blue-500'
                                        : 'border-gray-400'
                                }`}
                            >
                                {visibility === option.value && (
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    {option.label.split(' - ')[0]}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {option.label.split(' - ')[1]}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Visibility Details */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Kā tas darbojas:</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                    {visibility === 'public' && (
                        <>
                            <li>✓ Ikviens var atrast pasākumu meklēšanā</li>
                            <li>✓ Pasākums parādīsies publiskajā kartē</li>
                        </>
                    )}
                    {visibility === 'friends_only' && (
                        <>
                            <li>✓ Šo pasākumu redz tikai jūsu draugi</li>
                            <li>✓ Pasākums neparādīsies publiskajā meklēšanā</li>
                        </>
                    )}
                    {visibility === 'private' && (
                        <>
                            <li>✓ To var redzēt tikai cilvēki ar saiti</li>
                        </>
                    )}
                </ul>
            </div>

            {/* Security Note */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                    <strong>Piezīme:</strong> Redzamības iestatījumus varat mainīt jebkurā laikā pēc pasākuma izveides.
                </p>
            </div>
        </div>
    );
};

export default VisibilityStage;

