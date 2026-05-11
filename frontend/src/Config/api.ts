import { Capacitor } from '@capacitor/core'

const isAndroid = Capacitor.getPlatform() === 'android';
const androidBaseUrl =
    process.env.NEXT_PUBLIC_ANDROID_BACKEND_URL
    ?? 'http://10.0.2.2:8000';

const webBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

export const API_BASE_URL = isAndroid
    ? androidBaseUrl
    : webBaseUrl;

export const isNative = Capacitor.isNativePlatform();