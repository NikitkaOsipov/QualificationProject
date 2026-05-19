'use client'

import Map from '@/components/Map/Map'
import { Marker, MapContainerProps } from 'react-leaflet'
import type { EventType } from '@/utils/Types'

export type MarkerMapProps = MapContainerProps & {
    markers: EventType[];
    onMarkerClick: (event: EventType) => void;

}

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
                        eventHandlers={{ click: () => onMarkerClick(m) }}>
                    </Marker>) : <></>
                }

            </Map>
        </>
    )
}

export default MapPage;