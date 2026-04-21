'use client';

import React from 'react';
import { EventFormData, Category } from '@/utils/Types';
import EventDescriptionMarkdown from '@/components/Event/EventDescriptionMarkdown';
interface ConfirmationStageProps {
    formData: EventFormData;
    imagePreview: string | null;
    categoryList: Category[];
}

const ConfirmationStage = ({ formData, imagePreview, categoryList }: ConfirmationStageProps) => {
    const categoryNames = formData.categories
        .map((id) => categoryList.find((c) => c.id === id)?.name)
        .filter(Boolean);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-LV', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Review Your Event</h2>
                <p className="text-gray-600">Make sure everything looks good before publishing</p>
            </div>

            {/* Event Preview Card */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
                {/* Hero Image */}
                {imagePreview && (
                    <div className="relative w-full h-64 bg-gray-200">
                        <img
                            src={imagePreview}
                            alt="Event preview"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Event Details */}
                <div className="p-6 space-y-6">
                    {/* Title and Location */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {formData.title || 'Untitled Event'}
                        </h1>
                        <p className="text-gray-600">
                            📍 {formData.address || 'Location not set'}
                        </p>
                    </div>

                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {/* Start Date */}
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 font-semibold uppercase">Start Date</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                                {formatDate(formData.startDate)}
                            </p>
                        </div>

                        {/* End Date */}
                        {formData.endDate && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-600 font-semibold uppercase">End Date</p>
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                    {formatDate(formData.endDate)}
                                </p>
                            </div>
                        )}

                        {/* Price */}
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 font-semibold uppercase">Price</p>
                            <p className="text-sm font-medium text-gray-900 mt-1">
                                {formData.price ? `€${formData.price}` : 'Free'}
                            </p>
                        </div>

                        {/* Visibility */}
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 font-semibold uppercase">Visibility</p>
                            <p className="text-sm font-medium text-gray-900 mt-1 capitalize">
                                {formData.visibility}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    {formData.description && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">About the Event</h3>
                            <EventDescriptionMarkdown
                                content={formData.description}
                                className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5"
                            />
                        </div>
                    )}

                    {/* Categories */}
                    {categoryNames.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
                            <div className="flex flex-wrap gap-2">
                                {categoryNames.map((name, i) => (
                                    <span key={i} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                                        {name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Coordinates */}
                    {formData.latitude && formData.longitude && (
                        <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                            <p>📍 Coordinates: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Once published, you can still edit most of the event details. The visibility setting can also be changed at any time.
                </p>
            </div>
        </div>
    );
};

export default ConfirmationStage;