'use client'

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { ReactNode } from 'react'

export interface Props {
    center: { lat: number, lng: number};
    size: { height: string, width: string };
    zoom: number;
    children?: ReactNode;
}

const Map = ({center, size, zoom, children}: Props) => {
    return (
        <MapContainer center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom={true} style={size}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {children}
        </MapContainer>
    );
}

export default Map;