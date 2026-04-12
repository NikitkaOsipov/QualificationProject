import Pusher from 'pusher-js';
import Echo from 'laravel-echo';
import { API_BASE_URL, isNative } from '@/Config/api';
import { Preferences } from '@capacitor/preferences';
import axios from '@/lib/axios';

let configured = false;
let echoInstance: Echo<'reverb'> | null = null;

const getApiUrl = () => {
	try {
		return new URL(API_BASE_URL);
	} catch {
		return null;
	}
};

export const configureAppEcho = async () => {
	if (typeof window === 'undefined' || configured) {
		return;
	}

	const apiUrl = getApiUrl();
	const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY;

	if (!apiUrl || !key) {
		return;
	}

	const isSecure = apiUrl.protocol === 'https:';

	(window as any).Pusher = Pusher;

	const token = isNative ? (await Preferences.get({ key: 'auth_token' })).value : null;

	if (!isNative) {
		await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
	}

	echoInstance = new Echo({
		broadcaster: 'reverb',
		key,
		wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? apiUrl.hostname,
		wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
		wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
		forceTLS: isSecure,
		enabledTransports: ['ws', 'wss'],
		authEndpoint: `${API_BASE_URL}/broadcasting/auth`,
		auth: {
			headers: {
				Accept: 'application/json',
			},
		},
		channelAuthorization: {
			endpoint: `${API_BASE_URL}/broadcasting/auth`,
			customHandler: (params, callback) => {
				void axios
					.post(
						'/broadcasting/auth',
						{
							socket_id: params.socketId,
							channel_name: params.channelName,
						},
					)
					.then((response) => callback(null, response.data))
					.catch((error) => callback(error, null));
			},
		},
		bearerToken: token ?? null,
	});

	configured = true;
};

export const getEcho = (): Echo<'reverb'> | null => echoInstance;

