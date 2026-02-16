import { CircularProgress } from '@mui/material'

const Loading = () => {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-100">
            <CircularProgress/>
        </div>
    )
}

export default Loading
