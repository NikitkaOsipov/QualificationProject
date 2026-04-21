import type { EventFormData } from '@/utils/Types';

export type EventValidationSection = 'location' | 'details' | 'visuals' | 'all';

export type EventValidationInput = Pick<
    EventFormData,
    'address' | 'latitude' | 'longitude' | 'title' | 'startDate' | 'endDate' | 'price' | 'backgroundImage'
>;

type EventValidationMessageKey =
    | 'addressRequired'
    | 'locationRequired'
    | 'titleRequired'
    | 'titleTooLong'
    | 'startDateRequired'
    | 'priceInvalid'
    | 'endDateBeforeStart'
    | 'backgroundImageInvalidType'
    | 'backgroundImageTooLarge';

// transforms EventValdationMessageKey to an object type
export type EventValidationMessages = Partial<Record<EventValidationMessageKey, string>>;

const DEFAULT_MESSAGES = {
    addressRequired: 'Address is required',
    locationRequired: 'Location coordinates are required. Click on the map or search for an address.',
    titleRequired: 'Title is required',
    titleTooLong: 'Title must be 255 characters or less',
    startDateRequired: 'Start date is required',
    priceInvalid: 'Price must be a valid number',
    endDateBeforeStart: 'End date cannot be earlier than start date',
    backgroundImageInvalidType: 'Invalid image type. Please use PNG, JPG, JPEG, SVG, or WebP',
    backgroundImageTooLarge: 'Image is too large. Maximum size is 2MB',
};

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml', 'image/webp'];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export function validateEventData(
    values: EventValidationInput,
    section: EventValidationSection = 'all',
    messages: EventValidationMessages = {},
) {
    const resolvedMessages = { ...DEFAULT_MESSAGES, ...messages };
    const errors: Record<string, string> = {};

    if (section === 'location' || section === 'all') {
        if (!values.address.trim()) {
            errors.address = resolvedMessages.addressRequired;
        }

        if (values.latitude === null || values.longitude === null) {
            errors.location = resolvedMessages.locationRequired;
        }
    }

    if (section === 'details' || section === 'all') {
        if (!values.title.trim()) {
            errors.title = resolvedMessages.titleRequired;
        }

        if (values.title.length > 255) {
            errors.title = resolvedMessages.titleTooLong;
        }

        if (!values.startDate) {
            errors.startDate = resolvedMessages.startDateRequired;
        }

        if (values.price && Number.isNaN(Number(values.price))) {
            errors.price = resolvedMessages.priceInvalid;
        }

        if (values.endDate && values.startDate && new Date(values.endDate) < new Date(values.startDate)) {
            errors.endDate = resolvedMessages.endDateBeforeStart;
        }
    }

    if (section === 'visuals' || section === 'all') {
        if (values.backgroundImage) {
            if (!IMAGE_TYPES.includes(values.backgroundImage.type)) {
                errors.backgroundImage = resolvedMessages.backgroundImageInvalidType;
            }

            if (values.backgroundImage.size > MAX_IMAGE_SIZE) {
                errors.backgroundImage = resolvedMessages.backgroundImageTooLarge;
            }
        }
    }

    return errors;
}
