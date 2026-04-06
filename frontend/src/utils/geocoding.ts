export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=lv`
        );

        if (!response.ok) {
            return '';
        }

        const result = await response.json();
        return result.address?.name || result.display_name || '';
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return '';
    }
};
