'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import AddressAutocomplete from '@/components/Map/AddressAutocomplite';
import LocationMap from '@/components/Map/ChooseLocationMap';
import { reverseGeocode } from '@/utils/geocoding';

interface LocationStageProps {
    address: string;
    latitude: number | null;
    longitude: number | null;
    onAddressChange: (address: string) => void;
    onCoordinatesChange: (lat: number, lng: number) => void;
    error?: string;
}


export default function LocationStage({
    address,
    latitude,
    longitude,
    onAddressChange,
    onCoordinatesChange,
    error,
}: LocationStageProps) {
    const [showCoordinates, setShowCoordinates] = useState(false);
    const [tempLat, setTempLat] = useState(latitude?.toString() || '');
    const [tempLng, setTempLng] = useState(longitude?.toString() || '');

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

            {/* Address Search */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                </label>
                <AddressAutocomplete
                    value={address}
                    onSelect={(selectedAddress, lat, lng) => {
                        onAddressChange(selectedAddress);
                        onCoordinatesChange(lat, lng);
                        setTempLat(lat.toString());
                        setTempLng(lng.toString());
                    }}
                    placeholder="Search for address..."
                />
                {error && <div className="text-sm text-red-600 mt-1">{error}</div>}
            </div>

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
            <LocationMap
                latitude={latitude}
                longitude={longitude}
                onCoordinatesChange={(lat, lng) => {
                    onCoordinatesChange(lat, lng);
                    setTempLat(lat.toString());
                    setTempLng(lng.toString());
                    // Reverse geocode to update address
                    reverseGeocode(lat, lng).then((address) => {
                        if (address && onAddressChange) onAddressChange(address);
                    });
                }}
            />
        </div>
    );
}
