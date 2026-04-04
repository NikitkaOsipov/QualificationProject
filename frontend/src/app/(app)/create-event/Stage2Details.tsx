'use client';

import React, { useState } from 'react';

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
    const [showDescriptionPreview, setShowDescriptionPreview] = useState(false);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Event Details</h2>
                <p className="text-gray-600">Add the essential information about your event</p>
            </div>

            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                </label>
                <input
                    type="text"
                    maxLength={255}
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Event title (e.g., Summer Tech Conference 2024)"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.title && <div className="text-sm text-red-600 mt-1">{errors.title}</div>}
                <div className="text-xs text-gray-500 mt-1">{title.length}/255 characters</div>
            </div>

            {/* Description - Simple Rich Text */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-300 flex-wrap">
                        <button
                            type="button"
                            onClick={() => {
                                const textarea = document.querySelector('textarea[data-type="description"]') as HTMLTextAreaElement;
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const selected = description.substring(start, end);
                                if (selected) {
                                    const newText =
                                        description.substring(0, start) +
                                        `**${selected}**` +
                                        description.substring(end);
                                    onDescriptionChange(newText);
                                }
                            }}
                            title="Bold"
                            className="px-3 py-1 rounded hover:bg-gray-200 text-sm font-bold"
                        >
                            B
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const textarea = document.querySelector('textarea[data-type="description"]') as HTMLTextAreaElement;
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const selected = description.substring(start, end);
                                if (selected) {
                                    const newText =
                                        description.substring(0, start) +
                                        `*${selected}*` +
                                        description.substring(end);
                                    onDescriptionChange(newText);
                                }
                            }}
                            title="Italic"
                            className="px-3 py-1 rounded hover:bg-gray-200 text-sm italic"
                        >
                            I
                        </button>
                        <div className="w-px h-6 bg-gray-300 mx-1" />
                        <button
                            type="button"
                            onClick={() => {
                                const textarea = document.querySelector('textarea[data-type="description"]') as HTMLTextAreaElement;
                                const start = textarea.selectionStart;
                                onDescriptionChange(
                                    description.substring(0, start) + '• ' + description.substring(start)
                                );
                            }}
                            title="Bullet list"
                            className="px-3 py-1 rounded hover:bg-gray-200 text-sm"
                        >
                            ◦
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const textarea = document.querySelector('textarea[data-type="description"]') as HTMLTextAreaElement;
                                const start = textarea.selectionStart;
                                onDescriptionChange(
                                    description.substring(0, start) + '1. ' + description.substring(start)
                                );
                            }}
                            title="Numbered list"
                            className="px-3 py-1 rounded hover:bg-gray-200 text-sm"
                        >
                            1.
                        </button>
                        <div className="w-px h-6 bg-gray-300 mx-1" />
                        <button
                            type="button"
                            onClick={() => setShowDescriptionPreview(!showDescriptionPreview)}
                            className="px-3 py-1 rounded hover:bg-gray-200 text-sm"
                        >
                            {showDescriptionPreview ? '✎ Edit' : '👁 Preview'}
                        </button>
                    </div>

                    {/* Text Area / Preview */}
                    {!showDescriptionPreview ? (
                        <textarea
                            data-type="description"
                            value={description}
                            onChange={(e) => onDescriptionChange(e.target.value)}
                            placeholder="Describe your event in detail..."
                            rows={6}
                            className="w-full px-4 py-3 focus:outline-none resize-none"
                        />
                    ) : (
                        <div className="p-4 min-h-24 bg-white prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap text-gray-700">
                                {description.split('\n').map((line, i) => {
                                    // Simple markdown preview
                                    let content = line;
                                    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');

                                    if (line.startsWith('• ')) {
                                        return <li key={i}>{content.substring(2)}</li>;
                                    }
                                    if (line.match(/^\d+\. /)) {
                                        return <li key={i}>{content.replace(/^\d+\. /, '')}</li>;
                                    }
                                    return <p key={i} dangerouslySetInnerHTML={{ __html: content }} />;
                                })}
                            </div>
                        </div>
                    )}
                </div>
                {errors.description && <div className="text-sm text-red-600 mt-1">{errors.description}</div>}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date & Time *
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
                        End Date & Time
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
                    Price (Optional) - Leave empty for free event
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

