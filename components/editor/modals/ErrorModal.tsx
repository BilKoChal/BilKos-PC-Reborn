import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useModalA11y } from '../../../lib/hooks/useModalA11y';
import { ModalPortal } from '../../../lib/hooks/ModalPortal';

interface ErrorModalProps {
    errorMessage: string | null;
    onDismiss: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ errorMessage, onDismiss }) => {
    const { modalRef, handleKeyDown, handleBackdropClick, modalProps, headingId } = useModalA11y({
        isOpen: errorMessage !== null,
        onClose: onDismiss,
        alert: true,               // alertdialog for error/urgent dialogs
        closeOnBackdrop: false,    // user must explicitly acknowledge
        closeOnEscape: false,      // prevent accidental dismissal of errors
    });

    if (!errorMessage) return null;
    return (
    <ModalPortal>
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleBackdropClick}>
            <div
                ref={modalRef as React.RefObject<HTMLDivElement>}
                {...modalProps}
                aria-labelledby={headingId}
                className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-2xl border border-red-200 dark:border-red-900/50 overflow-hidden animate-in zoom-in-95 duration-200"
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-500"><AlertCircle size={32} /></div>
                    <h3 id={headingId} className="text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-wide">Load Error</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{errorMessage}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-950/50 border-t border-gray-100 dark:border-gray-800">
                    <button onClick={onDismiss} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-red-500/20">Dismiss</button>
                </div>
            </div>
        </div>
    </ModalPortal>
    );
};
