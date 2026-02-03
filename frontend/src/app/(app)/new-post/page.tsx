'use client';
import React, { useState } from 'react';
import axios from '@/lib/axios';

type Errors = { [key: string]: string }

export default function NewEventPage() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [price, setPrice] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const [errors, setErrors] = useState<Errors>({})
    const [status, setStatus] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    function validate() {
        const e: Errors = {}
        if (!title.trim()) e.title = 'Title is required'
        if (title.length > 255) e.title = 'Title must be 255 characters or less'
        if (!startDate) e.start_date = 'Start date is required'
        if (!endDate) e.end_date = 'End date is required'
        if (price && isNaN(Number(price))) e.price = 'Price must be numeric'
        if (file) {
            const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml']
            if (!allowed.includes(file.type)) e.background_image = 'Invalid image type'
            if (file.size > 2 * 1024 * 1024) e.background_image = 'Image too large (max 2MB)'
        }

        if (latitude) {
            const lat = Number(latitude)
            if (isNaN(lat)) e.latitude = 'Latitude must be a number'
            else if (lat < -90 || lat > 90) e.latitude = 'Latitude must be between -90 and 90'
        }

        if (longitude) {
            const lon = Number(longitude)
            if (isNaN(lon)) e.longitude = 'Longitude must be a number'
            else if (lon < -180 || lon > 180) e.longitude = 'Longitude must be between -180 and 180'
        }

        return e
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setStatus(null)
        const clientErrors = validate()
        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors)
            return
        }
        setErrors({})
        setSubmitting(true)

        const data = new FormData()
        data.append('title', title)
        data.append('description', description)
        // convert datetime-local value to ISO string (backend expects datetime)
        data.append('start_date', new Date(startDate).toISOString())
        data.append('end_date', new Date(endDate).toISOString())
        if (price) data.append('price', price)
        if (file) data.append('background_image', file)
        if (latitude) data.append('lat', latitude)
        if (longitude) data.append('lng', longitude)


        function logFormData(fd: FormData) {
            // quick dump of all entries
            console.log(Array.from(fd.entries()));

            // nicer per-entry logging (shows file metadata for files)
            for (const [key, value] of fd.entries()) {
                if (value instanceof File) {
                    console.log(key, { name: value.name, type: value.type, size: value.size });
                } else {
                    console.log(key, value);
                }
            }
        }

        try {
            logFormData(data);
            const res = await axios
                .post('/api/event/', data);
            console.log(res);
            const json = res.data;
            console.log(json);
            if (!res.status) {
                // assume server returns validation errors in { errors: { field: message } } or message
                setErrors(json.errors || (json.message ? { form: json.message } : { form: 'Unknown error' }))
                setStatus(null)
            } else {
                setStatus('Event created successfully')
                // reset form
                // setTitle('')
                // setDescription('')
                // setStartDate('')
                // setEndDate('')
                // setPrice('')
                // setFile(null)
                // setLatitude('')
                // setLongitude('')
            }
        } catch (err) {
            setErrors({ form: 'Network error' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main className="max-w-3xl mx-auto p-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-semibold mb-4">Create event</h1>

                {status && <div className="text-green-700 bg-green-50 p-2 rounded mb-4">{status}</div>}
                {errors.form && <div className="text-red-700 bg-red-50 p-2 rounded mb-4">{errors.form}</div>}

                <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Title *</label>
                        <input
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            maxLength={255}
                            required
                        />
                        {errors.title && <div className="text-sm text-red-600 mt-1">{errors.title}</div>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                        {errors.description && <div className="text-sm text-red-600 mt-1">{errors.description}</div>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date *</label>
                            <input
                                type="datetime-local"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                required
                            />
                            {errors.start_date && <div className="text-sm text-red-600 mt-1">{errors.start_date}</div>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Date *</label>
                            <input
                                type="datetime-local"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                required
                            />
                            {errors.end_date && <div className="text-sm text-red-600 mt-1">{errors.end_date}</div>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price</label>
                            <input
                                type="number"
                                step="0.01"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                placeholder="0.00"
                            />
                            {errors.price && <div className="text-sm text-red-600 mt-1">{errors.price}</div>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Background Image</label>
                            <input
                                type="file"
                                accept=".png,.jpg,.jpeg,.svg"
                                className="mt-1 block w-full text-sm text-gray-700"
                                onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                            />
                            {errors.background_image && <div className="text-sm text-red-600 mt-1">{errors.background_image}</div>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Latitude</label>
                            <input
                                type="text"
                                inputMode="decimal"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={latitude}
                                onChange={e => setLatitude(e.target.value)}
                                placeholder="e.g. 37.7749"
                            />
                            {errors.latitude && <div className="text-sm text-red-600 mt-1">{errors.latitude}</div>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Longitude</label>
                            <input
                                type="text"
                                inputMode="decimal"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                value={longitude}
                                onChange={e => setLongitude(e.target.value)}
                                placeholder="e.g. -122.4194"
                            />
                            {errors.longitude && <div className="text-sm text-red-600 mt-1">{errors.longitude}</div>}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
}