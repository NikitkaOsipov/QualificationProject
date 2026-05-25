'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { getCategories } from '@/utils/category_service';
import type { Category, EventFilters, EventSortBy, SortDirection } from '@/utils/Types';
import Button from '@/components/Button'

interface EventSearchAndFiltersProps {
    filters: EventFilters;
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
    filters,
    onChangeAction, // When filters changes
    onSubmitAction, // When clicks submit
    onResetAction,
    showSort = false,
    disableSocialFilters = false,
    isLoading = false,
}: EventSearchAndFiltersProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isDateOpen, setIsDateOpen] = useState(false);
    const sortWrapperRef = useRef<HTMLDivElement | null>(null);
    const dateWrapperRef = useRef<HTMLDivElement | null>(null);

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

    // Check for click outside of sorting options dropdown
    useEffect(() => {
        if (!isSortOpen && !isDateOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const clickedInsideSort = !!sortWrapperRef.current?.contains(target);
            const clickedInsideDate = !!dateWrapperRef.current?.contains(target);

            if (!clickedInsideSort) {
                setIsSortOpen(false);
            }

            if (!clickedInsideDate) {
                setIsDateOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSortOpen, isDateOpen]);

    const selectedCategories = useMemo(
        () => categories.filter(category => filters.categories.includes(category.id)),
        [categories, filters.categories],
    );

    const isDateRangeInvalid =
        filters.date_from
        && filters.date_to
        && filters.date_to < filters.date_from;

    const update = (newFilters: Partial<EventFilters>) => onChangeAction({ ...filters, ...newFilters });

    const handleCategoryRemove = (categoryId: number) => {
        update({ categories: filters.categories.filter(id => id !== categoryId) });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (isDateRangeInvalid) {
            return;
        }

        onSubmitAction();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="p-0"
        >
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_auto]">
                    {/* Search */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Meklēt pasākumus</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={event => update({ search: event.target.value })}
                            placeholder="Pasākuma nosaukums vai vieta"
                            className="h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Categories */}
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
                                    borderRadius: '0.25rem',
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

                    {/* Submit and reset buttons */}
                    <div className="flex items-end gap-2">
                        <Button
                            type="submit"
                            disabled={isLoading || isDateRangeInvalid}
                            variant="primary"
                            className="h-10 text-sm font-medium"
                        >
                            {isLoading ? 'Meklē...' : 'Meklēt'}
                        </Button>
                        <Button
                            type="button"
                            onClick={onResetAction}
                            variant="secondary"
                            className="h-10 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Notīrīt
                        </Button>
                    </div>
                </div>

                {/* Selected categories display */}
                {selectedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedCategories.map(category => (
                            <Button
                                key={category.id}
                                type="button"
                                onClick={() => handleCategoryRemove(category.id)}
                                variant="secondary"
                                className="bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
                            >
                                {category.name} ×
                            </Button>
                        ))}
                    </div>
                )}

                {/* Social filters (friends only/following only) */}
                <div className="flex flex-col gap-3 items-end lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex w-full flex-wrap items-center gap-4 lg:w-auto">
                        <label className={`flex items-center gap-2 text-sm ${disableSocialFilters ? 'text-gray-400' : 'text-gray-700'}`}>
                            <input
                                type="checkbox"
                                checked={filters.friends_only}
                                onChange={event => update({ friends_only: event.target.checked })}
                                disabled={disableSocialFilters}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Tikai draugi
                        </label>

                        <label className={`flex items-center gap-2 text-sm ${disableSocialFilters ? 'text-gray-400' : 'text-gray-700'}`}>
                            <input
                                type="checkbox"
                                checked={filters.following_only}
                                onChange={event => update({ following_only: event.target.checked })}
                                disabled={disableSocialFilters}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            Tikai tie, kam sekoju
                        </label>

                        {disableSocialFilters && (
                            <span className="text-xs text-gray-500">Pieslegties, lai izmantotu sociālos filtrus.</span>
                        )}
                    </div>

                    {/* Date filters and Sorting dropdowns */}
                    <div className="ml-auto flex max-w-md flex-col gap-2 lg:w-auto lg:max-w-none lg:flex-row">
                        <div ref={dateWrapperRef} className="relative w-auto">
                            <Button
                                type="button"
                                onClick={() => setIsDateOpen(open => !open)}
                                variant="secondary"
                                className="w-full border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 w-auto"
                            >
                                Datuma periods
                            </Button>

                            {/* Date filters */}
                            {isDateOpen && (
                                <div className="absolute right-0 z-20 mt-2 min-w-72 rounded border border-gray-200 bg-white p-3 shadow-lg">
                                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">No datuma</label>
                                    <TextField
                                        type="date"
                                        value={filters.date_from ?? ''}
                                        onChange={event => {
                                            const nextFrom = event.target.value;
                                            const nextTo = filters.date_to && nextFrom && filters.date_to < nextFrom
                                                ? nextFrom
                                                : filters.date_to;

                                            update({ date_from: nextFrom, date_to: nextTo });
                                        }}
                                        fullWidth
                                        size="small"
                                        slotProps={{
                                            htmlInput: {
                                                max: filters.date_to || undefined,
                                            },
                                        }}
                                        sx={{ mb: 1.5 }}
                                    />

                                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Līdz datumam</label>
                                    <TextField
                                        type="date"
                                        value={filters.date_to ?? ''}
                                        onChange={event => update({ date_to: event.target.value })}
                                        fullWidth
                                        size="small"
                                        slotProps={{
                                            htmlInput: {
                                                min: filters.date_from || undefined,
                                            },
                                        }}
                                        error={isDateRangeInvalid}
                                        helperText={isDateRangeInvalid ? 'Beigu datums nedrīkst būt agrāks par sākuma datumu.' : ' '}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Sorting */}
                        {showSort && (
                            <div ref={sortWrapperRef} className="relative w-full lg:w-auto">
                                <Button
                                    type="button"
                                    onClick={() => setIsSortOpen(open => !open)}
                                    variant="secondary"
                                    className="bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 lg:w-auto"
                                >
                                    Kārtošana: {SORT_BY_OPTIONS.find(option => option.value === filters.sort_by)?.label ?? ''} ({SORT_DIRECTION_OPTIONS.find(option => option.value === filters.sort_direction)?.label ?? ''})
                                </Button>

                                {isSortOpen && (
                                    <div className="absolute right-0 z-20 mt-2 min-w-72 rounded border border-gray-200 bg-white p-3 shadow-lg">
                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Kārtot pēc</label>
                                        <select
                                            value={filters.sort_by}
                                            onChange={event => update({ sort_by: event.target.value as EventSortBy })}
                                            className="mb-3 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-blue-500"
                                        >
                                            {SORT_BY_OPTIONS.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>

                                        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Virziens</label>
                                        <select
                                            value={filters.sort_direction}
                                            onChange={event => update({ sort_direction: event.target.value as SortDirection })}
                                            className="h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-blue-500"
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
            </div>
        </form>
    );
}