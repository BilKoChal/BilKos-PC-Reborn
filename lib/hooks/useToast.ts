import { useState, useCallback } from 'react';

/**
 * Custom hook for toast notification state management.
 * Extracted from App.tsx to reduce component complexity.
 */
export function useToast() {
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = useCallback((msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    }, []);

    const hideToast = useCallback(() => {
        setToastMessage(null);
    }, []);

    return { toastMessage, showToast, hideToast };
}
