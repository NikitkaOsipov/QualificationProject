'use client';

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
    ssr: false,
});

export default function Page() {
    return <Map position={[56.9496, 24.1052]} zoom={13} />;
}