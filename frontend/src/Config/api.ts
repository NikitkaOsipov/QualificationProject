import { Capacitor } from '@capacitor/core'

const isAndroid = Capacitor.getPlatform() == "android";

export const API_BASE_URL = isAndroid
    ? "http://10.0.2.2:8000"
    : process.env.NEXT_PUBLIC_BACKEND_URL!;