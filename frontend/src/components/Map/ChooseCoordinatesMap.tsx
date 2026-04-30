"use client";

import { useRef, useEffect } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LATVIA_BOUNDS } from '@/utils/app_consts';
import Map from '@/components/Map/Map';

interface LocationMapProps {
    latitude: number | null;
    longitude: number | null;
    onCoordinatesChange: (lat: number, lng: number) => void;
}

function MapContent({ latitude, longitude, onCoordinatesChange }: LocationMapProps) {
    const map = useMap();
    const markerRef = useRef<L.Marker>(null);
    const latviaBounds = L.latLngBounds(LATVIA_BOUNDS);

    useEffect(() => {
        if (latitude && longitude) {
            map.setView([latitude, longitude]);
        }
    }, [latitude, longitude, map]);

    const handleMapClick = (e: any) => {
        if (!latviaBounds.contains(e.latlng)) {
            return;
        }
        const { lat, lng } = e.latlng;
        onCoordinatesChange(lat, lng);
    };

    useEffect(() => {
        map.on('click', handleMapClick);
        return () => {
            map.off('click', handleMapClick);
        };
    }, [map]);

    return latitude && longitude ? (
        <Marker position={[latitude, longitude]} ref={markerRef} />
    ) : null;
}

export default function ChooseCoordinatesMap({ latitude, longitude, onCoordinatesChange }: LocationMapProps) {
    return (
        <Map
            center={[56.88, 24.28]}
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
    );
}
