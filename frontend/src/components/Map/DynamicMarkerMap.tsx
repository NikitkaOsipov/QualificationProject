'use client';

import { useMemo} from 'react'
import type { MarkerMapProps } from './MarkerMap'
import dynamic from "next/dynamic"
import Loading from '@/components/Loading'

function DynamicMap(props: MarkerMapProps) {
    const Map = useMemo(() => dynamic(
        () => import('./MarkerMap'),
        {
            loading: () => <Loading/>,
            ssr: false
        }
    ), [])

    return (
        <>
            <Map
                {...props}
            >
            </Map>
        </>
    )
}

export default DynamicMap;