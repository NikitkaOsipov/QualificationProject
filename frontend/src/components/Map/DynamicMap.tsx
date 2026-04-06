'use client';

import { useMemo} from 'react'
import dynamic from "next/dynamic"
import Loading from '@/components/Loading'
import { MapContainerProps } from 'react-leaflet'

function DynamicMap(props: MapContainerProps) {
    const Map = useMemo(() => dynamic(
        () => import('./Map'),
        {
            loading: () => <Loading/>,
            ssr: false
        }
    ), [])

    return <Map {...props}/>;
}

export default DynamicMap;