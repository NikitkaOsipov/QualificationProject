'use client';

import React, { useState, useCallback, useRef } from 'react';
import Map from '@/components/Map/DynamicMap';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface LocationStageProps {
    address: string;
    latitude: number | null;
    longitude: number | null;
    onAddressChange: (address: string) => void;
    onCoordinatesChange: (lat: number, lng: number) => void;
    error?: string;
}

// Nominatim geocoding service
const geocodeAddress = async (query: string) => {
    if (!query.trim()) return [];
    try {
        // Restrict to Latvia using bbox
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=lv&format=json&limit=5`,
            {
                headers: {
                    'Accept': 'application/json',
                }
            }
        );
        const results = await response.json();
        return results;
    } catch (error) {
        console.error('Geocoding error:', error);
        return [];
    }
};

const reverseGeocode = async (lat: number, lng: number) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            {
                headers: {
                    'Accept': 'application/json',
                }
            }
        );
        const result = await response.json();
        return result.address?.name || result.display_name || '';
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return '';
    }
};

function MapContent({ latitude, longitude, onCoordinatesChange }: any) {
    const map = useMap();
    const markerRef = useRef<L.Marker>(null);

    React.useEffect(() => {
        if (latitude && longitude) {
            map.setView([latitude, longitude], 10);
        }
    }, [latitude, longitude, map]);

    const handleMapClick = (e: any) => {
        const { lat, lng } = e.latlng;
        onCoordinatesChange(lat, lng);
    };

    React.useEffect(() => {
        map.on('click', handleMapClick);
        return () => {
            map.off('click', handleMapClick);
        };
    }, [map, onCoordinatesChange]);

    return latitude && longitude ? (
        <Marker position={[latitude, longitude]} ref={markerRef} />
    ) : null;
}

export default function LocationStage({
    address,
    latitude,
    longitude,
    onAddressChange,
    onCoordinatesChange,
    error,
}: LocationStageProps) {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showCoordinates, setShowCoordinates] = useState(false);
    const [tempLat, setTempLat] = useState(latitude?.toString() || '');
    const [tempLng, setTempLng] = useState(longitude?.toString() || '');
    const debounceTimer = useRef<NodeJS.Timeout>();

    const handleAddressInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onAddressChange(value);

        clearTimeout(debounceTimer.current);
        if (value.trim()) {
            debounceTimer.current = setTimeout(async () => {
                const results = await geocodeAddress(value);
                setSuggestions(results);
                setShowSuggestions(true);
            }, 300);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [onAddressChange]);

    const handleSuggestionClick = async (suggestion: any) => {
        onAddressChange(suggestion.display_name);
        onCoordinatesChange(parseFloat(suggestion.lat), parseFloat(suggestion.lon));
        setSuggestions([]);
        setShowSuggestions(false);
        setTempLat(suggestion.lat);
        setTempLng(suggestion.lon);
    };

    const handleCoordinateChange = (lat: string, lng: string) => {
        setTempLat(lat);
        setTempLng(lng);

        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);

        if (!isNaN(latNum) && !isNaN(lngNum)) {
            onCoordinatesChange(latNum, lngNum);
            // Optionally reverse geocode to update address
            reverseGeocode(latNum, lngNum).then((addr) => {
                if (addr) onAddressChange(addr);
            });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-2">Select Event Location</h2>
                <p className="text-gray-600">Choose a location on the map or search for an address in Latvia</p>
            </div>

            {/*/!* Address Search *!/*/}
            {/*<div className="relative">*/}
            {/*    <label className="block text-sm font-medium text-gray-700 mb-2">*/}
            {/*        Address **/}
            {/*    </label>*/}
            {/*    <div className="relative">*/}
            {/*        <input*/}
            {/*            type="text"*/}
            {/*            placeholder="Search for an address in Latvia..."*/}
            {/*            value={address}*/}
            {/*            onChange={handleAddressInput}*/}
            {/*            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"*/}
            {/*        />*/}
            {/*        {showSuggestions && suggestions.length > 0 && (*/}
            {/*            <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 z-10 max-h-64 overflow-y-auto">*/}
            {/*                {suggestions.map((suggestion, index) => (*/}
            {/*                    <li key={index}>*/}
            {/*                        <button*/}
            {/*                            type="button"*/}
            {/*                            onClick={() => handleSuggestionClick(suggestion)}*/}
            {/*                            className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition"*/}
            {/*                        >*/}
            {/*                            <div className="text-sm font-medium text-gray-900">*/}
            {/*                                {suggestion.display_name.split(',')[0]}*/}
            {/*                            </div>*/}
            {/*                            <div className="text-xs text-gray-500">*/}
            {/*                                {suggestion.display_name.split(',').slice(1, 3).join(',')}*/}
            {/*                            </div>*/}
            {/*                        </button>*/}
            {/*                    </li>*/}
            {/*                ))}*/}
            {/*            </ul>*/}
            {/*        )}*/}
            {/*    </div>*/}
            {/*    {error && <div className="text-sm text-red-600 mt-1">{error}</div>}*/}
            {/*</div>*/}

            {/* Coordinates Toggle */}
            <div className="border rounded-lg p-4 bg-gray-50">
                <button
                    type="button"
                    onClick={() => setShowCoordinates(!showCoordinates)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <span className="font-medium text-gray-700">Coordinates</span>
                    {showCoordinates ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {showCoordinates && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Latitude
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                min="-90"
                                max="90"
                                value={tempLat}
                                onChange={(e) => handleCoordinateChange(e.target.value, tempLng)}
                                placeholder="e.g. 56.9496"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Longitude
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                min="-180"
                                max="180"
                                value={tempLng}
                                onChange={(e) => handleCoordinateChange(tempLat, e.target.value)}
                                placeholder="e.g. 24.1051"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Map */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Map Preview (Click to set location)
                </label>
                <div className="h-96 rounded-lg border border-gray-300 overflow-hidden">
                    <Map
                        center={
                            latitude && longitude
                                ? [latitude, longitude]
                                : [56.88, 24.28] // Center of Latvia
                        }
                        zoom={10}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <MapContent
                            latitude={latitude}
                            longitude={longitude}
                            onCoordinatesChange={onCoordinatesChange}
                        />
                    </Map>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    💡 Click anywhere on the map to set the exact location, or search for an address above
                </p>
            </div>
        </div>
    );
}

