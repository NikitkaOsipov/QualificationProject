'use client'

import Map from '@/components/Map/Map'
import { Marker, Popup } from 'react-leaflet'
import type { MarkerType } from '@/utils/Types'

export interface MarkerMapProps {
    markers: MarkerType[]
}

const MapPage = ({ markers }: MarkerMapProps) => {

    return (
        <>
            <Map
                center={{
                    lat: 10,
                    lng: 10
                }}
                size={{
                    height: "400px",
                    width: "400px"
                }}
                zoom={8}
            >
                { markers.map((m, index) =>
                    <Marker key={index} position={[m.lat, m.lng]}>
                        <Popup>{m.title}</Popup>
                    </Marker>)
                }

            </Map>
        </>
    )
}

export default MapPage;