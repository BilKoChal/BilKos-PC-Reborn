import React from 'react';
import { Move } from 'lucide-react';

interface ToastProps {
    message: string | null;
}

/**
 * Toast — transient feedback for save operations, transfers, and errors.
 *
 * UX-A01 fix: added `role="status"` + `aria-live="polite"` + `aria-atomic="true"`
 * so screen readers announce toast messages. Without these attributes, toasts
 * were visually visible but completely silent to assistive technology — a
 * critical gap since toasts are the primary feedback mechanism for async ops.
 *
 * UX-T01 fix: migrated the hardcoded `bg-gray-900` to a theme-aware class
 * (`bg-theme-primary`) so the toast respects the active game's theme color
 * instead of always being dark gray. Falls back to the default theme primary
 * (Crimson Red) when no game is active.
 */
export const Toast: React.FC<ToastProps> = ({ message }) => {
    if (!message) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[1000] bg-theme-primary text-theme-text-on-primary px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in pointer-events-none"
        >
            <Move size={18} className="text-theme-text-on-primary opacity-80" />
            <span className="font-bold text-sm">{message}</span>
        </div>
    );
};
