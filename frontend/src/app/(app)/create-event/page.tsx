'use client';

import React, { useState, useCallback, useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation';
import { createPost } from '@/utils/post_service';
import { getCategories } from '@/utils/category_service';
import Timeline from './Timeline';
import LocationStage from './Stage1Location';
import DetailsStage from './Stage2Details';
import VisualsStage from './Stage3Visuals';
import VisibilityStage from './Stage4Visibility';
import ConfirmationStage from './Stage5Confirmation';
import { EventFormData, Category } from '@/utils/Types';
import { useAuth } from '@/hooks/auth';
import Loading from '@/components/Loading';
import FriendSelector from '@/components/User/FriendSelector';
import { validateEventData, type EventValidationSection } from '@/utils/eventValidation';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { SnackbarContext } from '@/context/SnackbarContext'
import { extractErrorMessage, extractValidationErrors, isValidationError } from '@/utils/response_helper'

export default function CreateEventPage() {
    const router = useRouter();
    const [currentStage, setCurrentStage] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [isDirty, setIsDirty] = useState(false);
    const addSnackbarMessage = useContext(SnackbarContext);

    const { user } = useAuth({middleware: 'auth'});
    useUnsavedChanges(isDirty);

    // Fetch categories once on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const fetchedCategories = await getCategories();
                setCategories(fetchedCategories);
            } catch (error) {
                const errorMessage = extractErrorMessage(error);
                addSnackbarMessage(errorMessage, 'error');
            } finally {
                setLoadingCategories(false);
            }
        }

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
        inviteeIds: [],
        // Meta
        errors: {},
    });

    const updateForm = useCallback((partial: Partial<EventFormData>) => {
        setIsDirty(true);
        setFormData((prev) => ({ ...prev, ...partial }));
    }, []);

    const validateStage = useCallback((section: EventValidationSection): boolean => {
        const errors = validateEventData(formData, section);
        setFormData((prev) => ({ ...prev, errors }));
        return Object.keys(errors).length === 0;
    }, [formData]);

    const handleNextStage = useCallback(async () => {
        let isValid = false;

        if (currentStage === 1) {
            isValid = validateStage('location');
        } else if (currentStage === 2) {
            isValid = validateStage('details');
        } else if (currentStage === 3) {
            isValid = validateStage('visuals');
        } else if (currentStage === 4) {
            isValid = true;
        }

        if (isValid) {
            setCurrentStage((prev) => Math.min(prev + 1, 5));
        }
    }, [currentStage, validateStage]);

    const handlePreviousStage = useCallback(() => {
        setCurrentStage((prev) => Math.max(prev - 1, 1));
    }, []);

    const handleSubmit = useCallback(async () => {
        setIsSubmitting(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('address_name', formData.address.trim());
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
            if (formData.inviteeIds.length > 0) {
                formData.inviteeIds.forEach((friendId) => {
                    data.append('invitee_ids[]', friendId.toString());
                });
            }

            const response = await createPost(data);

            if (response.status == "ok") {
                // Success
                setIsDirty(false);
                addSnackbarMessage('Pasākums veiksmīgi izveidots', 'success');
                router.push(`/`);
            } else {
                addSnackbarMessage('Neizdevās izveidot pasākumu. Lūdzu, mēģiniet vēlreiz.', 'error');
            }
        } catch (error) {
            if (isValidationError(error)) {
                const errors = extractValidationErrors(error);
                Object.values(errors).forEach(messages => {
                    messages?.forEach(message => addSnackbarMessage(message, 'error'));
                });
            } else {
                const errorMessage = extractErrorMessage(error);
                addSnackbarMessage(errorMessage, 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, router]);

    if (!user) return <Loading />;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Timeline */}
                <Timeline currentStage={currentStage} totalStages={5} />

                {/* Stage Content */}
                <div className="bg-white rounded-lg shadow-md p-8 mb-8">

                   {currentStage === 1 && (
                        <LocationStage
                            address={formData.address}
                            latitude={formData.latitude}
                            longitude={formData.longitude}
                            onAddressChange={(address) => updateForm({ address })}
                            onCoordinatesChange={(lat, lng) => updateForm({ latitude: lat, longitude: lng })}
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
                            onTitleChange={(title) => updateForm({ title })}
                            onDescriptionChange={(description) => updateForm({ description })}
                            onStartDateChange={(startDate) => updateForm({ startDate })}
                            onEndDateChange={(endDate) => updateForm({ endDate })}
                            onPriceChange={(price) => updateForm({ price })}
                            errors={formData.errors}
                        />
                    )}

                    {currentStage === 3 && (
                        <VisualsStage
                            categories={formData.categories}
                            categoryList={categories}
                            loadingCategories={loadingCategories}
                            onBackgroundImageChange={(backgroundImage) => {
                                updateForm({ backgroundImage });
                                if (backgroundImage) {
                                    const reader = new FileReader();
                                    reader.onload = (e) => setImagePreview(e.target?.result as string);
                                    reader.readAsDataURL(backgroundImage);
                                } else {
                                    setImagePreview(null);
                                }
                            }}
                            onCategoriesChange={(categories) => updateForm({ categories })}
                            errors={formData.errors}
                        />
                    )}

                    {currentStage === 4 && (
                        <VisibilityStage
                            visibility={formData.visibility}
                            onVisibilityChange={(visibility) => updateForm({ visibility })}
                        />
                    )}

                    {currentStage === 5 && (
                        <ConfirmationStage
                            formData={formData}
                            imagePreview={imagePreview}
                            categoryList={categories}
                        />
                    )}

                    {currentStage === 5 && (
                        <div className="mt-6">
                            <FriendSelector
                                selectedIds={formData.inviteeIds}
                                onChange={(inviteeIds) => updateForm({ inviteeIds })}
                                title="Uzaicini draugus"
                                description="Izvēlies draugus, kuri saņems paziņojumu uzreiz pēc publicēšanas."
                            />
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between gap-4">
                    <button
                        onClick={handlePreviousStage}
                        disabled={currentStage === 1}
                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        ← Iepriekšējais
                    </button>

                    {currentStage < 5 ? (
                        <button
                            onClick={handleNextStage}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            Nākamais →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {isSubmitting ? 'Publicē...' : 'Publicēt pasākumu'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}