'use client';

import { MapContainer, MapContainerProps, TileLayer } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { LATVIA_BOUNDS } from '@/utils/app_consts';


const Map = (props: MapContainerProps) => {
    return (
        <MapContainer
            {...props}
            scrollWheelZoom={true}
            zoomControl={props.zoomControl ?? false}
            maxBounds={props.maxBounds ?? LATVIA_BOUNDS}
            maxBoundsViscosity={props.maxBoundsViscosity ?? 1.0}
            minZoom={props.minZoom ?? 7}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                noWrap={true}
            />
            {props.children}
        </MapContainer>
    );
}

export default Map;