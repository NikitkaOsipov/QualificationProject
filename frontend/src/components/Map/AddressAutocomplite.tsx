"use client";

import { useState, useEffect } from 'react';
import { GeoapifyGeocoderAutocomplete, GeoapifyContext } from '@geoapify/react-geocoder-autocomplete';
import '@geoapify/geocoder-autocomplete/styles/minimal.css';

interface AddressAutocompleteProps {
    value: string;
    onSelect: (address: string, lat: number, lng: number) => void;
    placeholder?: string;
    className?: string;
}

export default function AddressAutocomplete({
    value,
    onSelect,
    placeholder = "Search for address...",
    className = ""
}: AddressAutocompleteProps) {
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handlePlaceSelect = (place: any) => {
        if (place && place.properties) {
            const address = place.properties.formatted || place.properties.address_line1 || '';
            const lat = place.properties.lat;
            const lng = place.properties.lon;

            if (address && lat && lng) {
                setInputValue(address);
                onSelect(address, lat, lng);
            }
        }
    };

    const handleSuggestionsChange = (suggestions: any[]) => {
        // In case I will need this
    };

    return (
        <div className={`w-full ${className}`}>
            <GeoapifyContext apiKey={process.env.NEXT_PUBLIC_GEOPIFY_API_KEY}>
                <style jsx global>{`
                    .geoapify-autocomplete-input {
                        width: 100% !important;
                        display: flex !important;
                        align-items: center !important;
                        gap: 0 !important;
                    }
                    .geoapify-autocomplete-input input {
                        width: 100% !important;
                        flex: 1 !important;
                        padding: 0.75rem 1rem !important;
                        border: 1px solid #d1d5db !important;
                        border-radius: 0.5rem !important;
                        font-size: 1rem !important;
                        line-height: 1.5rem !important;
                        background-color: white !important;
                        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out !important;
                        margin: 0 !important;
                    }
                    .geoapify-autocomplete-input input:focus {
                        outline: none !important;
                        border-color: #3b82f6 !important;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
                    }
                    .geoapify-autocomplete-input button,
                    .geoapify-autocomplete-input svg {
                        display: none !important;
                        width: 0 !important;
                        height: 0 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none !important;
                        flex: none !important;
                        visibility: hidden !important;
                        position: absolute !important;
                        opacity: 0 !important;
                        pointer-events: none !important;
                    }
                    .geoapify-autocomplete-input .geoapify-autocomplete-items {
                        border: 1px solid #d1d5db !important;
                        border-radius: 0.5rem !important;
                        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                        margin-top: 0.25rem !important;
                        max-height: 16rem !important;
                        overflow-y: auto !important;
                        width: 100% !important;
                    }
                    .geoapify-autocomplete-input .geoapify-autocomplete-item {
                        padding: 0.75rem 1rem !important;
                        cursor: pointer !important;
                        transition: background-color 0.15s ease-in-out !important;
                    }
                    .geoapify-autocomplete-input .geoapify-autocomplete-item:hover {
                        background-color: #eff6ff !important;
                    }
                    .geoapify-autocomplete-input .geoapify-autocomplete-item.active {
                        background-color: #eff6ff !important;
                    }
                `}</style>
                <GeoapifyGeocoderAutocomplete
                    placeholder={placeholder}
                    type="street"
                    lang="lv"
                    limit={5}
                    countryCodes={["lv"]}
                    filterByCountryCode={["lv"]}
                    value={inputValue}
                    placeSelect={handlePlaceSelect}
                    suggestionsChange={handleSuggestionsChange}
                />
            </GeoapifyContext>
        </div>
    );
}