import Axios from 'axios'
import { Preferences } from '@capacitor/preferences'
import { API_BASE_URL, isNative } from '@/Config/api'

const axios = Axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'accept': 'application/json, text/plain, */*',
        ...(isNative ? { 'X-Client-Platform': 'native' } : {}),
    },
    withCredentials: !isNative
})

axios.interceptors.request.use(async (config) => {
    if (isNative) {
        const { value } = await Preferences.get({ key: 'auth_token' });
        if (value) {
            config.headers.Authorization = `Bearer ${value}`;
        }
    }
    return config;
});

export default axios
