'use client'

import Map from '@/components/Map/Map'
import { Marker, MapContainerProps, Popup } from 'react-leaflet'
import type { MarkerType } from '@/utils/Types'

export type MarkerMapProps = MapContainerProps & {
    markers: MarkerType[];
}

const MapPage = ({markers, ...props}: MarkerMapProps) => {

    return (
        <>
            <Map
                {...props}
            >
                { markers.map((m, index) =>
                    <Marker key={index} position={[m.address.lat, m.address.lng]}>
                        <Popup>{m.title}</Popup>
                    </Marker>)
                }

            </Map>
        </>
    )
}

export default MapPage;