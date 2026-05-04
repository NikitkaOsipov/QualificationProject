'use client';

import dynamic from 'next/dynamic';

const ChooseCoordinatesMap = dynamic(() => import('@/components/Map/ChooseCoordinatesMap'), { ssr: false });

interface LocationMapProps {
    latitude: number | null;
    longitude: number | null;
    onCoordinatesChange: (lat: number, lng: number) => void;
}

export default function ChooseLocationMap({
    latitude,
    longitude,
    onCoordinatesChange,
}: LocationMapProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Kartes priekšskats (spiediet, lai izvēlētos vietu)
            </label>
            <div className="h-96 rounded-lg border border-gray-300 overflow-hidden">
                <ChooseCoordinatesMap
                    latitude={latitude}
                    longitude={longitude}
                    onCoordinatesChange={onCoordinatesChange}
                />
            </div>
            <p className="text-xs text-gray-500 mt-2">
                Izmantojiet adreses meklēšanas lauku augstāk vai klikšķiniet kartē, lai iestatītu precīzu vietu
            </p>
        </div>
    );
}