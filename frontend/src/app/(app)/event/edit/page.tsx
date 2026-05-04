"use client";

import { getPost, updatePost } from '@/utils/post_service';
import type { UpdatePostData } from '@/utils/post_service';
import { getCategories } from '@/utils/category_service';
import { useEffect, useState, useCallback } from 'react';
import { EventResponse, Category, EventFormData } from '@/utils/Types';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import { useAuth } from '@/hooks/auth';
import LocationStage from '@/app/(app)/create-event/Stage1Location';
import DetailsStage from '@/app/(app)/create-event/Stage2Details';
import VisualsStage from '@/app/(app)/create-event/Stage3Visuals';
import VisibilityStage from '@/app/(app)/create-event/Stage4Visibility';
import { validateEventData } from '@/utils/eventValidation';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

export default function EditEventPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [eventId, setEventId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    useUnsavedChanges(isDirty);
    const [pageError, setPageError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [formData, setFormData] = useState<EventFormData>({
        title: '',
        description: '',
        address: '',
        latitude: null,
        longitude: null,
        startDate: '',
        endDate: '',
        price: '',
        visibility: 'public',
        categories: [],
        backgroundImage: null,
        inviteeIds: [],
        errors: {},
    });

    const toDateTimeLocalValue = (value?: string) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const pad = (num: number) => String(num).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    // fetch categories
    useEffect(() => {
        getCategories()
            .then(setCategories)
            .catch(console.error)
            .finally(() => setLoadingCategories(false));
    }, []);

    // fetch event data
    useEffect(() => {
        const id = typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('id')
            : null;
        setEventId(id);

        if (!id) {
            setPageError('Pasākuma ID nav nodots.');
            setLoading(false);
            return;
        }

        // Wait for auth state to resolve before checking ownership.
        if (typeof user === 'undefined') {
            return;
        }

        setLoading(true);
        setPageError(null);

        async function fetchEvent() {
            try {
                const response: EventResponse = await getPost(id!);
                const event = response.event;
                const host = response.meta.host;

                const canManageEvent = Boolean(user && (user.role === 'admin' || (host && user.id === host.id)));

                if (!canManageEvent) {
                    setPageError('Jums nav tiesību rediģēt šo pasākumu.');
                    setLoading(false);
                    return;
                }

                setFormData({
                    title: event.title ?? '',
                    description: event.description ?? '',
                    address: event.address?.name ?? '',
                    latitude: event.address?.lat ?? null,
                    longitude: event.address?.lng ?? null,
                    startDate: toDateTimeLocalValue(event.start_date),
                    endDate: toDateTimeLocalValue(event.end_date),
                    price: event.price ? String(event.price) : '',
                    visibility: event.visibility ?? 'public',
                    categories: event.categories?.map((category) => category.id) ?? [],
                    backgroundImage: null,
                    inviteeIds: [],
                    errors: {},
                });
                setPageError(null);
            } catch (e: any) {
                setPageError(e?.response?.data?.message ?? 'Neizdevās ielādēt pasākumu.');
            } finally {
                setLoading(false);
            }
        }

        fetchEvent();
    }, [user]);

    const validate = useCallback((): boolean => {
        const newErrors = validateEventData(formData, 'all');
        setFormData((prev) => ({ ...prev, errors: newErrors }));
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const updateForm = useCallback((partial: Partial<EventFormData>) => {
        setIsDirty(true);
        setFormData((prev) => ({ ...prev, ...partial }));
    }, []);

    async function handleSave() {
        if (!eventId || isSaving) return;
        if (!validate()) {
            setSaveError('Lūdzu izlabojiet kļūdas pirms saglabāšanas.');
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        try {
            const payload: UpdatePostData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                address_name: formData.address.trim(),
                start_date: new Date(formData.startDate).toISOString(),
                lat: Number(formData.latitude),
                lng: Number(formData.longitude),
                visibility: formData.visibility,
            };
            if (formData.endDate) payload.end_date = new Date(formData.endDate).toISOString();
            if (formData.price) payload.price = formData.price;

            const response = await updatePost(eventId, payload);

            if (response.status !== 'ok') {
                setSaveError(response.message ?? 'Neizdevās saglabāt izmaiņas.');
                return;
            }

            setIsDirty(false);
            router.push(`/event?id=${eventId}`);
        } catch (e: any) {
            setSaveError(e?.response?.data?.message ?? 'Neizdevās saglabāt izmaiņas.');
        } finally {
            setIsSaving(false);
        }
    }

    if (loading) return <Loading />;

    if (pageError) {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{pageError}</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => router.push(`/event?id=${eventId}`)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    ← Atpakaļ uz pasākumu
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Rediģēt pasākumu</h1>
            </div>

            {saveError && (
                <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {saveError}
                </div>
            )}

            <div className="space-y-8">
                {/* Location */}
                <section className="bg-white rounded-xl border shadow-sm p-6">
                    <LocationStage
                        address={formData.address}
                        latitude={formData.latitude}
                        longitude={formData.longitude}
                        onAddressChange={(address) => updateForm({ address })}
                        onCoordinatesChange={(lat, lng) => updateForm({ latitude: lat, longitude: lng })}
                        error={formData.errors.location ?? formData.errors.address}
                    />
                </section>

                {/* Details */}
                <section className="bg-white rounded-xl border shadow-sm p-6">
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
                </section>

                {/* Visuals & Categories */}
                <section className="bg-white rounded-xl border shadow-sm p-6">
                    <VisualsStage
                        categories={formData.categories}
                        categoryList={categories}
                        loadingCategories={loadingCategories}
                        onBackgroundImageChange={(backgroundImage) => updateForm({ backgroundImage })}
                        onCategoriesChange={(cats) => updateForm({ categories: cats })}
                        errors={formData.errors}
                    />
                </section>

                {/* Visibility */}
                <section className="bg-white rounded-xl border shadow-sm p-6">
                    <VisibilityStage
                        visibility={formData.visibility}
                        onVisibilityChange={(visibility) => updateForm({ visibility })}
                    />
                </section>
            </div>

            {/* Footer actions */}
            <div className="mt-8 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => router.push(`/event?id=${eventId}`)}
                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm hover:bg-gray-50"
                >
                    Atcelt
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                    {isSaving ? 'Saglabāju...' : 'Saglabāt izmaiņas'}
                </button>
            </div>
        </div>
    );
}
