import type { MarkerType } from '@/utils/Types'
import Map from '@/components/Map/DynamicMarkerMap'

const MapPage = () => {

    const markers: MarkerType[] = [{title: "Title", lat: 10, lng: 10}];

    return (
        <>
            <Map
                markers={markers}
            >
            </Map>
        </>
    )
}

export default MapPage;