'use client'

import Map from '@/components/Map/Map'
import { Marker, MapContainerProps, Popup } from 'react-leaflet'
import type { MarkerType } from '@/utils/Types'

export type MarkerMapProps = MapContainerProps & {
    markers: MarkerType[];
    onMarkerClick: (event: MarkerType) => void;

}

const MapPage = ({markers, onMarkerClick, ...props}: MarkerMapProps) => {

    return (
        <>
            <Map
                {...props}
            >
                { markers ? markers.map((m, index) =>
                    <Marker
                        key={index}
                        position={[m.address.lat, m.address.lng]}
                        eventHandlers={{ click: () => onMarkerClick(m) }}>
                    </Marker>) : <></>
                }

            </Map>
        </>
    )
}

export default MapPage;