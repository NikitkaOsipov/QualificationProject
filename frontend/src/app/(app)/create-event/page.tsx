'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPost } from '@/utils/post_service';
import { getCategories } from '@/utils/category_service';
import Timeline from './Timeline';
import LocationStage from './Stage1Location';
import DetailsStage from './Stage2Details';
import VisualsStage from './Stage3Visuals';
import VisibilityStage from './Stage4Visibility';
import ConfirmationStage from './Stage5Confirmation';
import { EventFormData, Category } from './types';

export default function CreateEventPage() {
    const router = useRouter();
    const [currentStage, setCurrentStage] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Fetch categories once on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const fetchedCategories = await getCategories();
                setCategories(fetchedCategories);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    const [formData, setFormData] = useState<EventFormData>({
        // Stage 1
        address: '',
        latitude: null,
        longitude: null,
        // Stage 2
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        price: '',
        // Stage 3
        backgroundImage: null,
        categories: [],
        // Stage 4
        visibility: 'public',
        // Meta
        errors: {},
    });

    // Validation functions
    const validateStage1 = useCallback((): boolean => {
        const errors: Record<string, string> = {};

        // if (!formData.address.trim()) {
        //     errors.address = 'Address is required';
        // }
        if (formData.latitude === null || formData.longitude === null) {
            errors.location = 'Location coordinates are required. Click on the map or search for an address.';
        }

        setFormData((prev) => ({ ...prev, errors }));
        return Object.keys(errors).length === 0;
    }, [formData.address, formData.latitude, formData.longitude]);

    const validateStage2 = useCallback((): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.title.trim()) {
            errors.title = 'Title is required';
        }
        if (formData.title.length > 255) {
            errors.title = 'Title must be 255 characters or less';
        }
        if (!formData.startDate) {
            errors.startDate = 'Start date is required';
        }
        if (formData.price && isNaN(Number(formData.price))) {
            errors.price = 'Price must be a valid number';
        }
        if (formData.endDate && formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
            errors.endDate = 'End date cannot be earlier than start date';
        }

        setFormData((prev) => ({ ...prev, errors }));
        return Object.keys(errors).length === 0;
    }, [formData.title, formData.startDate, formData.endDate, formData.price]);

    const validateStage3 = useCallback((): boolean => {
        const errors: Record<string, string> = {};

        if (formData.backgroundImage) {
            const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml', 'image/webp'];
            if (!allowed.includes(formData.backgroundImage.type)) {
                errors.backgroundImage = 'Invalid image type. Please use PNG, JPG, JPEG, SVG, or WebP';
            }
            if (formData.backgroundImage.size > 2 * 1024 * 1024) {
                errors.backgroundImage = 'Image is too large. Maximum size is 2MB';
            }
        }

        setFormData((prev) => ({ ...prev, errors }));
        return Object.keys(errors).length === 0;
    }, [formData.backgroundImage]);

    const validateStage4 = useCallback((): boolean => {
        return true; // No validation needed
    }, []);

    const handleNextStage = useCallback(async () => {
        let isValid = false;

        if (currentStage === 1) {
            isValid = validateStage1();
        } else if (currentStage === 2) {
            isValid = validateStage2();
        } else if (currentStage === 3) {
            isValid = validateStage3();
        } else if (currentStage === 4) {
            isValid = validateStage4();
        }

        if (isValid) {
            setCurrentStage((prev) => Math.min(prev + 1, 5));
            window.scrollTo(0, 0);
        }
    }, [currentStage, validateStage1, validateStage2, validateStage3, validateStage4]);

    const handlePreviousStage = useCallback(() => {
        setCurrentStage((prev) => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    }, []);

    const handleSubmit = useCallback(async () => {
        setIsSubmitting(true);
        setServerError(null);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('start_date', new Date(formData.startDate).toISOString());
            if (formData.endDate) {
                data.append('end_date', new Date(formData.endDate).toISOString());
            }
            if (formData.price) {
                data.append('price', formData.price);
            }
            data.append('lat', formData.latitude!.toString());
            data.append('lng', formData.longitude!.toString());
            if (formData.backgroundImage) {
                data.append('background_image', formData.backgroundImage);
            }
            // Add categories if selected
            if (formData.categories.length > 0) {
                formData.categories.forEach((categoryId) => {
                    data.append('categories[]', categoryId.toString());
                });
            }
            // Add visibility
            data.append('visibility', formData.visibility);

            // TODO:
            // Add viability and error checks on backend
            // Make addresses work

            const response = await createPost(data);

            if (response.status == "ok") {
                // Success
                router.push(`/`);
            } else {
                setServerError('Failed to create event. Please try again.');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
            setServerError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, router]);

    return (
        <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Timeline */}
                <Timeline currentStage={currentStage} totalStages={5} />

                {/* Stage Content */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    {serverError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800">{serverError}</p>
                        </div>
                    )}

                    {currentStage === 1 && (
                        <LocationStage
                            address={formData.address}
                            latitude={formData.latitude}
                            longitude={formData.longitude}
                            onAddressChange={(address) =>
                                setFormData((prev) => ({ ...prev, address }))
                            }
                            onCoordinatesChange={(lat, lng) =>
                                setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }))
                            }
                            error={formData.errors.location || formData.errors.address}
                        />
                    )}

                    {currentStage === 2 && (
                        <DetailsStage
                            title={formData.title}
                            description={formData.description}
                            startDate={formData.startDate}
                            endDate={formData.endDate}
                            price={formData.price}
                            onTitleChange={(title) =>
                                setFormData((prev) => ({ ...prev, title }))
                            }
                            onDescriptionChange={(description) =>
                                setFormData((prev) => ({ ...prev, description }))
                            }
                            onStartDateChange={(startDate) =>
                                setFormData((prev) => ({ ...prev, startDate }))
                            }
                            onEndDateChange={(endDate) =>
                                setFormData((prev) => ({ ...prev, endDate }))
                            }
                            onPriceChange={(price) =>
                                setFormData((prev) => ({ ...prev, price }))
                            }
                            errors={formData.errors}
                        />
                    )}

                    {currentStage === 3 && (
                        <VisualsStage
                            backgroundImage={formData.backgroundImage}
                            categories={formData.categories}
                            categoryList={categories}
                            loadingCategories={loadingCategories}
                            onBackgroundImageChange={(backgroundImage) => {
                                setFormData((prev) => ({ ...prev, backgroundImage }));
                                if (backgroundImage) {
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                        setImagePreview(e.target?.result as string);
                                    };
                                    reader.readAsDataURL(backgroundImage);
                                } else {
                                    setImagePreview(null);
                                }
                            }}
                            onCategoriesChange={(categories) =>
                                setFormData((prev) => ({ ...prev, categories }))
                            }
                            errors={formData.errors}
                        />
                    )}

                    {currentStage === 4 && (
                        <VisibilityStage
                            visibility={formData.visibility}
                            onVisibilityChange={(visibility) =>
                                setFormData((prev) => ({ ...prev, visibility }))
                            }
                        />
                    )}

                    {currentStage === 5 && (
                        <ConfirmationStage
                            formData={formData}
                            imagePreview={imagePreview}
                            categoryList={categories}
                        />
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between gap-4">
                    <button
                        onClick={handlePreviousStage}
                        disabled={currentStage === 1}
                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        ← Previous
                    </button>

                    {currentStage < 5 ? (
                        <button
                            onClick={handleNextStage}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {isSubmitting ? 'Publishing...' : 'Publish Event'}
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
}