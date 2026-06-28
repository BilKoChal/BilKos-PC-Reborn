import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ErrorBoundary — catches render-time errors in the editor subtree and shows
 * a recovery UI instead of a white screen.
 *
 * UX-U06 fix: previously, if any component in the EditorDashboard tree threw
 * during render (e.g., a malformed save caused a `null` dereference in a
 * child), the entire app crashed to a white screen with no recovery path.
 * This boundary wraps the EditorDashboard so render errors are contained: the
 * header, tab bar, and home page stay functional, and the user sees a
 * "Something went wrong" panel with a "Reload Save" button that resets the
 * boundary's state (re-mounting the editor).
 *
 * Class component because React error boundaries require `componentDidCatch`
 * / `getDerivedStateFromError`, which are not available as hooks.
 */
interface ErrorBoundaryProps {
    children: React.ReactNode;
    /** Optional callback name shown in the recovery UI (e.g., "Reload Save"). */
    resetLabel?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Log to console for debugging — the boundary intentionally doesn't
        // rethrow, so the error would be silently swallowed without this.
        console.error('[ErrorBoundary] Render error caught:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    override render(): React.ReactNode {
        if (this.state.hasError) {
            const { resetLabel = 'Reload Save' } = this.props;
            const errorMessage = this.state.error?.message ?? 'Unknown error';

            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="text-red-600 dark:text-red-400" size={32} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
                        Something went wrong
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-4">
                        The editor hit an unexpected error while rendering this save.
                        Your save data is still in memory — try reloading, or close
                        the tab and re-open the file.
                    </p>
                    <details className="mb-4 text-left w-full max-w-md">
                        <summary className="text-xs font-bold text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">
                            Error details
                        </summary>
                        <pre className="mt-2 text-[10px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg overflow-auto max-h-40 whitespace-pre-wrap break-all">
                            {errorMessage}
                        </pre>
                    </details>
                    <button
                        onClick={this.handleReset}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-sm"
                    >
                        <RefreshCw size={16} />
                        {resetLabel}
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
