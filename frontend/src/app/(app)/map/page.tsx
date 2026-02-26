'use client'

import type { MarkerType } from '@/utils/Types'
import Map from '@/components/Map/DynamicMarkerMap'
import SideModal from '@/components/SideModal'
import { useEffect, useState } from 'react'

import { getPosts } from '@/utils/post_service'
import Loading from '@/components/Loading'
import EventPreview from '@/components/Map/UI/EventPreview'

const MapPage = () => {

    const [posts, setPosts] = useState<MarkerType[]>([]);
    const [open, setOpen] = useState<boolean>(false);
    const [selectedEvent, setSelectedEvent] = useState<MarkerType | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            const result = await getPosts();
            setPosts(result);
        }

        fetchPosts();
    }, [])

    const closePreview = () => setOpen(false);
    const selectEvent = (event: MarkerType) => setSelectedEvent(event);

    return (
        <>
            {posts.length !== 0 ? (
                    <div
                        className="relative w-full h-full"
                    >

                        <Map
                            center={[10, 10]}
                            zoom={8}
                            markers={posts}
                            className={"w-full h-full"}
                            onMarkerClick={selectEvent}
                        >
                        </Map>

                        {/* MAP UI */}
                        <div
                            className="pointer-events-auto absolute left-0 top-0 h-full"
                        >
                            <EventPreview
                                isOpen={open}
                                onClose={closePreview}
                                event={selectedEvent}/>
                        </div>
                    </div>
            ) : (
                <Loading/>
            )}
        </>
    )
}


export default MapPage;