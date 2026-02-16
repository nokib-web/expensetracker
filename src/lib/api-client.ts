import toast from "react-hot-toast";

export async function apiClient<T>(url: string, options?: RequestInit): Promise<T> {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            // If it's a JSON response with a message, use it
            const errorMessage = (typeof data === 'object' && data !== null && 'message' in data)
                ? (data as any).message
                : `Request failed with status ${response.status}`;

            throw new Error(errorMessage);
        }

        return data as T;
    } catch (error: any) {
        if (error instanceof TypeError) {
            const networkError = 'Network error. Please check your connection.';
            toast.error(networkError);
            throw new Error(networkError);
        }

        // Only show toast if it hasn't been handled elsewhere (optional)
        // Most mutations/queries will handle their own error toasts
        // but this is a good safety net.
        // toast.error(error.message || 'Something went wrong');

        throw error;
    }
}

// Helper methods for common operations
export const api = {
    get: <T>(url: string, options?: RequestInit) => apiClient<T>(url, { ...options, method: 'GET' }),
    post: <T>(url: string, body: any, options?: RequestInit) => apiClient<T>(url, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body)
    }),
    put: <T>(url: string, body: any, options?: RequestInit) => apiClient<T>(url, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(body)
    }),
    delete: <T>(url: string, options?: RequestInit) => apiClient<T>(url, { ...options, method: 'DELETE' }),
};
