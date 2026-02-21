'use client'

import { MapContainer, MapContainerProps, Popup, TileLayer } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { ReactNode } from 'react'

const Map = (props: MapContainerProps) => {
    return (
        <MapContainer scrollWheelZoom={true} {...props}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {props.children}
        </MapContainer>
    );
}

export default Map;