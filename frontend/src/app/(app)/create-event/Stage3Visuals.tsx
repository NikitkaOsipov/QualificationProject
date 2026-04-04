'use client';

import React, { useState } from 'react';
import { CATEGORIES } from './types';

interface VisualsStageProps {
    categories: number[];
    onBackgroundImageChange: (file: File | null) => void;
    onCategoriesChange: (categories: number[]) => void;
    errors?: Record<string, string>;
}

const VisualsStage = ({
    backgroundImage,
    categories,
    onBackgroundImageChange,
    onCategoriesChange,
    errors = {},
}: VisualsStageProps) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [categorySearch, setCategorySearch] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onBackgroundImageChange(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCategoryToggle = (categoryId: number) => {
        const newCategories = categories.includes(categoryId)
            ? categories.filter((id) => id !== categoryId)
            : [...categories, categoryId];
        onCategoriesChange(newCategories);
    };

    const filteredCategories = CATEGORIES.filter((cat) =>
        cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Visuals & Categories</h2>
                <p className="text-gray-600">Add a hero image and select categories for your event</p>
            </div>

            {/* Background Image Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hero Image (Optional)
                </label>
                <div className="space-y-4">
                    {/* Image Preview */}
                    {imagePreview && (
                        <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-300">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    onBackgroundImageChange(null);
                                    setImagePreview(null);
                                }}
                                className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    )}

                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                        <input
                            type="file"
                            accept=".png,.jpg,.jpeg,.svg,.webp"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer block">
                            <div className="text-4xl mb-2">📸</div>
                            <p className="font-medium text-gray-900">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG, SVG, or WebP (Max 2MB)</p>
                        </label>
                    </div>
                </div>
                {errors.backgroundImage && (
                    <div className="text-sm text-red-600 mt-2">{errors.backgroundImage}</div>
                )}
            </div>

            {/* Categories */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Categories (Optional) - Select up to 5
                </label>

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {/* Category Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredCategories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => handleCategoryToggle(category.id)}
                            className={`p-3 rounded-lg border-2 transition text-sm font-medium ${
                                categories.includes(category.id)
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                            } ${categories.length >= 5 && !categories.includes(category.id) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            disabled={categories.length >= 5 && !categories.includes(category.id)}
                        >
                            <div className="flex items-center justify-between">
                                <span>{category.name}</span>
                                {categories.includes(category.id) && <span className="ml-1">✓</span>}
                            </div>
                        </button>
                    ))}
                </div>

                {categories.length >= 5 && (
                    <p className="text-xs text-blue-600 mt-2">Maximum 5 categories selected</p>
                )}

                {/* Selected Categories Summary */}
                {categories.length > 0 && (
                    <div className="mt-4">
                        <p className="text-xs text-gray-600 mb-2">Selected categories:</p>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((catId) => {
                                const cat = CATEGORIES.find((c) => c.id === catId);
                                return (
                                    <span key={catId} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                                        {cat?.name}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisualsStage;



