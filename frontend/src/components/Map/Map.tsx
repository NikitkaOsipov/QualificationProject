import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

const Map = (props) => {
    return (
        <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false} style={{ height: '100vh', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[51.505, -0.09]}>
                <Popup>Marker in London</Popup>
            </Marker>
        </MapContainer>
    );
}

export default Map;