'use client'

import type { MarkerType } from '@/utils/Types'
import Map from '@/components/Map/DynamicMarkerMap'
import { useEffect, useState } from 'react'
import { getPosts } from '@/utils/post_service'
import Loading from '@/components/Loading'

const MapPage = () => {

    const [posts, setPosts] = useState<MarkerType[]>([]);

    useEffect(() => {
        const fetchPosts = async () => {
            const result = await getPosts();
            setPosts(result);
        }

        fetchPosts();
    }, [])

    return (
        <>
            {posts.length !== 0 ? (
                <Map
                    center={[10, 10]}
                    zoom={8}
                    markers={posts}
                    className={"w-full h-full"}
                >
                </Map>
            ) : (
                <Loading/>
            )}
        </>
    )
}

export default MapPage;