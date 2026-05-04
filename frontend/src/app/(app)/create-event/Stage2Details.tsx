'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface DetailsStageProps {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    price: string;
    onTitleChange: (title: string) => void;
    onDescriptionChange: (description: string) => void;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
    onPriceChange: (price: string) => void;
    errors?: Record<string, string>;
}

const DetailsStage = ({
    title,
    description,
    startDate,
    endDate,
    price,
    onTitleChange,
    onDescriptionChange,
    onStartDateChange,
    onEndDateChange,
    onPriceChange,
    errors = {},
}: DetailsStageProps) => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Pasākuma detaļas</h2>
                <p className="text-gray-600">Pievienojiet būtiskāko informāciju par savu pasākumu</p>
            </div>

            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nosaukums *
                </label>
                <input
                    type="text"
                    maxLength={255}
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Pasākuma nosaukums..."
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.title && <div className="text-sm text-red-600 mt-1">{errors.title}</div>}
                <div className="text-xs text-gray-500 mt-1">{title.length}/255 rakstzīmes</div>
            </div>

            {/* Description - Markdown Editor */}
            <div data-color-mode="light">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apraksts
                </label>
                <MDEditor
                    value={description}
                    onChange={(value) => onDescriptionChange(value ?? '')}
                    preview="edit"
                    height={320}
                    textareaProps={{ placeholder: 'Aprakstiet pasākumu detalizēti...' }}
                    commandsFilter={(cmd) => {
                        const excluded = new Set(['fullscreen', 'help']);
                        return excluded.has(cmd.name) ? false : cmd;
                    }}
                />
                <p className="mt-2 text-xs text-gray-500">
                    Izmantojiet rīku joslu virsrakstiem, treknrakstam, slīprakstam, sarakstiem, saitēm un citam.
                </p>
                {errors.description && <div className="text-sm text-red-600 mt-1">{errors.description}</div>}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sākuma datums un laiks *
                    </label>
                    <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.startDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.startDate && <div className="text-sm text-red-600 mt-1">{errors.startDate}</div>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Beigu datums un laiks
                    </label>
                    <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        min={startDate}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.endDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.endDate && <div className="text-sm text-red-600 mt-1">{errors.endDate}</div>}
                </div>
            </div>

            {/* Price */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cena (neobligāti) - atstājiet tukšu bezmaksas pasākumam
                </label>
                <div className="flex items-center">
                    <span className="text-gray-700 font-medium mr-2">€</span>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => onPriceChange(e.target.value)}
                        placeholder="0.00"
                        className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                </div>
                {errors.price && <div className="text-sm text-red-600 mt-1">{errors.price}</div>}
            </div>
        </div>
    );
};

export default DetailsStage;

