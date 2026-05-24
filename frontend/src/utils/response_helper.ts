import axios from 'axios';

// Errors Laravel returns

/**
 * Laravel 422 - validation failed
 * { message: "...", errors: { email: ["..."], password: ["..."] } }
 */
export interface LaravelValidationError {
    message: string
    errors: Record<string, string[]>
}

/**
 * Laravel 401 / 403 / 404 / 500 - generic error
 * { message: "Unauthenticated." }
 */
export interface LaravelErrorResponse {
    message: string
}

// Success responses

export interface LaravelPaginatedResponse<T> {
    data: T[]
    meta: {
        current_page: number
        per_page: number
        total: number
        last_page: number
    }
}

/**
 * For endpoints that return no meaningful body (e.g. updateOnlineStatus, logout)
 * { status: 'ok', message?: '...' }
 */
export interface LaravelStatusResponse {
    status: 'ok' | 'error'
    message?: string
}

// Checks

/**
 * Check if error is a network error (will be without response body)
 */
export function isNetworkError(error: unknown) {
    return axios.isAxiosError(error) && !error.response
}

/**
 * Check error is laravel error with response body
 */
export function isLaravelError(error: unknown) {
    if (!axios.isAxiosError(error)) {
        return false
    }

    return !!error.response
}

/**
 * Check if a Laravel error contains validation errors (422)
 */
export function isValidationError(error: unknown) {
    return isLaravelError(error) && error.response?.status === 422 && 'errors' in (error.response?.data ?? {})
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract field-level validation errors. Returns null if not a 422.
 */
export function extractValidationErrors(error: unknown): Record<string, string[]> {
    if (isValidationError(error)) {
        return error.response!.data.errors
    }
    return null
}

/**
 * Extract the top-level message from any Laravel error response.
 */
export function extractErrorMessage(error: unknown): string | null {
    if (isLaravelError(error)) {
        return (error.response?.data as LaravelErrorResponse)?.message ?? null;
    }

    if (isNetworkError(error)) {
        return 'Tīkla kļūda';
    }

    return null;
}