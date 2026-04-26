'use client';

import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { getCategories } from '@/utils/category_service';
import type { Category, EventFilters, EventSortBy, SortDirection } from '@/utils/Types';

interface EventSearchAndFiltersProps {
    value: EventFilters;
    onChangeAction: (EventFilters) => void;
    onSubmitAction: () => void;
    onResetAction: () => void;
    showSort?: boolean;
    disableSocialFilters?: boolean;
    isLoading?: boolean;
}

const SORT_BY_OPTIONS= [
    { value: 'default', label: 'Gaidāmie pasākumi' },
    { value: 'soonest', label: 'Drīzākie' },
    { value: 'interested', label: 'Visvairāk interesējas' },
    { value: 'going', label: 'Visvairāk apmeklē' },
    { value: 'cost', label: 'Cena' },
];

const SORT_DIRECTION_OPTIONS = [
    { value: 'desc', label: 'Dilstoši' },
    { value: 'asc', label: 'Augoši' },
];

export default function EventSearchAndFilters({
    value,
    onChangeAction,
    onSubmitAction,
    onResetAction,
    showSort = false,
    disableSocialFilters = false,
    isLoading = false,
}: EventSearchAndFiltersProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Fetches categories
    useEffect(() => {
        let active = true;

        const fetchCategories = async () => {
            try {
                const result = await getCategories();

                if (active) {
                    setCategories(result);
                }
            } catch (error) {
                console.error('Failed to load categories', error);
            }
        };

        fetchCategories();

        return () => {
            active = false;
        };
    }, []);

    const selectedCategories = useMemo(
        () => categories.filter(category => value.categories.includes(category.id)),
        [categories, value.categories],
    );

    const update = (patch: Partial<EventFilters>) => onChangeAction({ ...value, ...patch });

    const handleCategoryRemove = (categoryId: number) => {
        update({ categories: value.categories.filter(id => id !== categoryId) });
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmitAction();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="p-0"
        >
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_auto]">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Meklēt pasākumus</label>
                        <input
                            type="text"
                            value={value.search}
                            onChange={event => update({ search: event.target.value })}
                            placeholder="Pasākuma nosaukums vai vieta"
                            className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div className="relative">
                        <label className="mb-1 block text-sm font-medium text-gray-700">Kategorijas</label>
                        <Autocomplete
                            multiple
                            filterSelectedOptions
                            options={categories}
                            value={selectedCategories}
                            onChange={(_, selected) => update({ categories: selected.map(category => category.id) })}
                            getOptionLabel={(option) => option.name}
                            isOptionEqualToValue={(option, selected) => option.id === selected.id}
                            sx={{
                                '& .MuiAutocomplete-tag': { display: 'none' },
                                '& .MuiOutlinedInput-root': {
                                    height: '40px',
                                    borderRadius: '0.5rem',
                                    backgroundColor: 'white',
                                    alignItems: 'center',
                                    paddingTop: '0',
                                    paddingBottom: '0',
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Rakstiet, lai atrastu kategorijas"
                                />
                            )}
                        />
                    </div>

                    <div className="flex items-end gap-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                        >
                            {isLoading ? 'Meklē...' : 'Meklēt'}
                        </button>
                        <button
                            type="button"
                            onClick={onResetAction}
                            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                            Notīrīt
                        </button>
                    </div>
                </div>

                {selectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedCategories.map(category => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => handleCategoryRemove(category.id)}
                                className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
                            >
                                {category.name} ×
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-4">
                        <label className={`flex items-center gap-2 text-sm ${disableSocialFilters ? 'text-gray-400' : 'text-gray-700'}`}>
                            <input
                                type="checkbox"
                                checked={value.friends_only}
                                onChange={event => update({ friends_only: event.target.checked })}
                                disabled={disableSocialFilters}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Tikai draugi
                        </label>

                        <label className={`flex items-center gap-2 text-sm ${disableSocialFilters ? 'text-gray-400' : 'text-gray-700'}`}>
                            <input
                                type="checkbox"
                                checked={value.following_only}
                                onChange={event => update({ following_only: event.target.checked })}
                                disabled={disableSocialFilters}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Tikai tie, kam sekoju
                        </label>

                        {disableSocialFilters && (
                            <span className="text-xs text-gray-500">Piesakieties, lai izmantotu sociālos filtrus.</span>
                        )}
                    </div>

                    {showSort && (
                        <div className="relative self-start lg:self-auto">
                            <button
                                type="button"
                                onClick={() => setIsSortOpen(open => !open)}
                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                            >
                                Kārtošana: {SORT_BY_OPTIONS.find(option => option.value === value.sort_by)?.label ?? ''} ({SORT_DIRECTION_OPTIONS.find(option => option.value === value.sort_direction)?.label ?? ''})
                            </button>

                            {isSortOpen && (
                                <div className="absolute right-0 z-20 mt-2 min-w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Kārtot pēc</label>
                                    <select
                                        value={value.sort_by}
                                        onChange={event => update({ sort_by: event.target.value as EventSortBy })}
                                        className="mb-3 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-blue-500"
                                    >
                                        {SORT_BY_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>

                                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Virziens</label>
                                    <select
                                        value={value.sort_direction}
                                        onChange={event => update({ sort_direction: event.target.value as SortDirection })}
                                        className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-blue-500"
                                    >
                                        {SORT_DIRECTION_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}








