import React from 'react';
import { Move } from 'lucide-react';

interface ToastProps {
    message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
    if (!message) return null;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in pointer-events-none">
            <Move size={18} className="text-blue-400" />
            <span className="font-bold text-sm">{message}</span>
        </div>
    );
};
