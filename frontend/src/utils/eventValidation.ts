import type { EventFormData } from '@/utils/Types';
import { LATVIA_BOUNDS } from '@/utils/app_consts';

export type EventValidationSection = 'location' | 'details' | 'visuals' | 'all';

const DEFAULT_MESSAGES = {
    addressRequired: 'Adrese ir obligāta',
    locationRequired: 'Lūdzu izvēlieties atrašanās vietu kartē',
    titleRequired: 'Nosaukums ir obligāts',
    titleTooLong: 'Nosaukumam jābūt 255 rakstzīmes vai mazāk',
    startDateRequired: 'Sākuma laiks ir obligāts',
    coordinatesOutOfBounds: 'Koordinātām jābūt Latvijā',
    priceInvalid: 'Cenai jābūt skaitlim',
    endDateBeforeStart: 'Beigu laiks nevar būt pirms sākuma laika',
    backgroundImageInvalidType: 'Nederīgs attēla formāts',
    backgroundImageTooLarge: 'Attēls ir pārāk liels (maks. 2MB)',
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml', 'image/webp'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export function validateEventData(
    values: EventFormData,
    section: EventValidationSection = 'all',
) {
    const errors: Record<string, string> = {};

    if (section === 'location' || section === 'all') {
        if (!values.address.trim()) {
            errors.address = DEFAULT_MESSAGES.addressRequired;
        }

        if (values.latitude === null || values.longitude === null) {
            errors.location = DEFAULT_MESSAGES.locationRequired;
        }
        
        // If lat or lng is outside latvia bounds, reset lat and lng
        if (values.latitude < LATVIA_BOUNDS[0][0]
            || values.latitude > LATVIA_BOUNDS[1][0]
            || values.longitude < LATVIA_BOUNDS[0][1]
            || values.longitude > LATVIA_BOUNDS[1][1]) {
            errors.location = DEFAULT_MESSAGES.coordinatesOutOfBounds;
        }
    }

    if (section === 'details' || section === 'all') {
        if (!values.title.trim()) {
            errors.title = DEFAULT_MESSAGES.titleRequired;
        }

        if (values.title.length > 255) {
            errors.title = DEFAULT_MESSAGES.titleTooLong;
        }

        if (!values.startDate) {
            errors.startDate = DEFAULT_MESSAGES.startDateRequired;
        }

        if (values.price && Number.isNaN(Number(values.price))) {
            errors.price = DEFAULT_MESSAGES.priceInvalid;
        }

        if (values.endDate && values.startDate && new Date(values.endDate) < new Date(values.startDate)) {
            errors.endDate = DEFAULT_MESSAGES.endDateBeforeStart;
        }
    }

    if (section === 'visuals' || section === 'all') {
        if (values.backgroundImage) {
            if (!IMAGE_TYPES.includes(values.backgroundImage.type)) {
                errors.backgroundImage = DEFAULT_MESSAGES.backgroundImageInvalidType;
            }

            if (values.backgroundImage.size > MAX_IMAGE_SIZE) {
                errors.backgroundImage = DEFAULT_MESSAGES.backgroundImageTooLarge;
            }
        }
    }

    return errors;
}
