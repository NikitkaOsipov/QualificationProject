import Axios from 'axios'
import { API_BASE_URL } from '@/Config/api'

console.log("API URL - " + API_BASE_URL);

const axios = Axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true
})

export default axios
