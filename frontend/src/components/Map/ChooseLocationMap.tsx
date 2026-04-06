'use client';

import { useRef, useEffect } from 'react';
import Map from '@/components/Map/DynamicMap';
import { LATVIA_BOUNDS } from '@/components/Map/Map';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

interface LocationMapProps {
    latitude: number | null;
    longitude: number | null;
    onCoordinatesChange: (lat: number, lng: number) => void;
}

function MapContent({ latitude, longitude, onCoordinatesChange }: LocationMapProps) {
    const map = useMap();
    const markerRef = useRef<L.Marker>(null);
    const latviaBounds = L.latLngBounds(LATVIA_BOUNDS);

    // Update the center of the map when coordinates change
    useEffect(() => {
        if (latitude && longitude) {
            map.setView([latitude, longitude]);
        }
    }, [latitude, longitude, map]);

    const handleMapClick = (e: any) => {
        // Ignore clicks outside Latvia
        if (!latviaBounds.contains(e.latlng)) {
            return;
        }

        const { lat, lng } = e.latlng;
        onCoordinatesChange(lat, lng);
    };

    // handle map click
    useEffect(() => {
        map.on('click', handleMapClick);
        return () => {
            map.off('click', handleMapClick);
        };
    }, [map, onCoordinatesChange]);

    return latitude && longitude ? (
        <Marker position={[latitude, longitude]} ref={markerRef} />
    ) : null;
}

export default function ChooseLocationMap({
    latitude,
    longitude,
    onCoordinatesChange,
}: LocationMapProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Map Preview (Click to set location)
            </label>
            <div className="h-96 rounded-lg border border-gray-300 overflow-hidden">
                <Map
                    center={[56.88, 24.28]} // center of latvia
                    zoom={10}
                    maxZoom={18}
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
                Use the address search field above or click anywhere on the map to set the exact location
            </p>
        </div>
    );
}