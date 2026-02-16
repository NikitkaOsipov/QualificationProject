import Header from '@/app/(app)/Header'
import Map from '@/components/Map/DynamicMap'

export const metadata = {
    title: 'Laravel - Dashboard',
}

const Dashboard = () => {
    return (
        <>
            <Header title="Dashboard" />
            <Map
                center={{
                    lat: 10,
                    lng: 10
                }}
                size={{
                    height: "400px",
                    width: "400px"
                }}
                zoom={8}
            />
        </>
    )
}

export default Dashboard