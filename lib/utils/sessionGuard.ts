/**
 * Session guard helpers (TODO §1 — unsaved-work protection).
 *
 * Saves live only in React state; a refresh, accidental tab close, or navigation
 * would silently discard every edit. These pure helpers let `App.tsx` wire a
 * `beforeunload` listener without embedding the logic in a component, so the
 * "should we warn?" decision is unit-testable in isolation.
 */

/** Minimal shape we need to decide whether unsaved work exists. */
export interface DirtyFlag {
  isDirty: boolean;
}

/**
 * True if ANY open tab has unsaved changes. Empty/clean sessions return false so
 * the browser never shows a spurious "leave site?" prompt.
 */
export function hasUnsavedWork(tabs: ReadonlyArray<DirtyFlag>): boolean {
  return tabs.some((tab) => tab.isDirty);
}

/**
 * Standard `beforeunload` handler factory. Returning a non-empty string and
 * calling `preventDefault()` is the cross-browser idiom for triggering the
 * native confirmation dialog. The custom string is ignored by modern browsers
 * (they show their own generic copy), but we still set it for older engines.
 *
 * @param isDirty - callback re-evaluated at unload time so the latest state wins.
 */
export function createBeforeUnloadHandler(
  isDirty: () => boolean,
): (event: BeforeUnloadEvent) => string | undefined {
  return (event: BeforeUnloadEvent) => {
    if (!isDirty()) return undefined;
    event.preventDefault();
    // Legacy browsers read the returnValue / returned string.
    event.returnValue = '';
    return '';
  };
}
