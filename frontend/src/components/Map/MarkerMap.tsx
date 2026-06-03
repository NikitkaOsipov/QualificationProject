'use client';

import Map from '@/components/Map/Map';
import { Marker, MapContainerProps } from 'react-leaflet';
import type { EventType } from '@/utils/Types';
import L from 'leaflet';
import { API_BASE_URL } from '@/Config/api';

export type MarkerMapProps = MapContainerProps & {
    markers: EventType[];
    onMarkerClick: (event: EventType) => void;

}

var logoIcon = L.icon({
    iconUrl: 'Logo.png',

    iconSize:     [45, 45], // size of the icon
    iconAnchor:   [22.5, 42], // point of the icon which will correspond to marker's location
});

const MapPage = ({markers, onMarkerClick, ...props}: MarkerMapProps) => {
    const toCoordinate = (value: unknown): number => {
        const numeric = typeof value === 'number' ? value : Number(value);
        return numeric ? numeric : 0;
    };

    return (
        <>
            <Map
                {...props}
            >
                { markers ? markers.map((m, index) =>
                    <Marker
                        key={index}
                        position={[toCoordinate(m.address.lat), toCoordinate(m.address.lng)]}
                        eventHandlers={{ click: () => onMarkerClick(m) }}
                        icon={logoIcon}
                    >
                    </Marker>) : <></>
                }

            </Map>
        </>
    )
}

export default MapPage;