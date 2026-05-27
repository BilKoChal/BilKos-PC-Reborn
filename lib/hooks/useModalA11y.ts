/**
 * useModalA11y — Composable accessibility hook for modal dialogs.
 *
 * Following the WAI-ARIA Authoring Practices Guide (APG) Dialog (Modal) pattern:
 * https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 *
 * Provides:
 * - Focus trapping (Tab / Shift+Tab wrap inside the dialog)
 * - Escape key dismissal
 * - Body scroll lock (position: fixed + scroll restore, cross-browser incl. iOS)
 * - Background inertness (sets `inert` on #root so AT ignores background content)
 * - Focus management (save trigger focus on open, restore on close, initial focus placement)
 * - ARIA attributes (role, aria-modal, aria-labelledby, aria-describedby)
 * - Backdrop click detection
 *
 * PKHeX comparison: PKHeX is a WinForms desktop app that gets all of these behaviors
 * "for free" from the OS (ShowDialog blocks parent, CancelButton auto-handles Escape,
 * focus returns automatically). Web apps must implement each manually. This hook bridges
 * that gap.
 */
import { useEffect, useRef, useCallback, useId, type RefObject } from 'react';

// ─── Focusable Selector ────────────────────────────────────────
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

// ─── Options ───────────────────────────────────────────────────
export interface UseModalA11yOptions {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Use `role="alertdialog"` instead of `"dialog"` (for destructive/urgent confirmations) */
  alert?: boolean;
  /** Close on Escape key? Default: true */
  closeOnEscape?: boolean;
  /** Close on backdrop click? Default: true */
  closeOnBackdrop?: boolean;
  /** Lock body scroll while open? Default: true */
  lockScroll?: boolean;
  /** Make background inert while open? Default: true */
  inertBackground?: boolean;
  /** Optional: focus a specific element on open (e.g., "Cancel" in destructive dialogs) */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Optional: override the root element ID for inert (default: 'root') */
  appRootId?: string;
}

// ─── Return Type ───────────────────────────────────────────────
export interface UseModalA11yReturn {
  /** Ref to assign to the modal container element */
  modalRef: RefObject<HTMLElement | null>;
  /** Keyboard handler to spread on the modal: onKeyDown={handleKeyDown} */
  handleKeyDown: (event: React.KeyboardEvent) => void;
  /** Click handler for backdrop detection: onClick={handleBackdropClick} */
  handleBackdropClick: (event: React.MouseEvent) => void;
  /** ARIA attributes to spread on the modal container */
  modalProps: {
    role: 'dialog' | 'alertdialog';
    'aria-modal': true;
    'aria-labelledby': string;
    tabIndex: -1;
  };
  /** Generated ID for the title heading (use as `id` on the <h2>/<h3>) */
  headingId: string;
}

// ─── Main Hook ─────────────────────────────────────────────────
export function useModalA11y(options: UseModalA11yOptions): UseModalA11yReturn {
  const {
    isOpen,
    onClose,
    alert = false,
    closeOnEscape = true,
    closeOnBackdrop = true,
    lockScroll = true,
    inertBackground = true,
    initialFocusRef,
    appRootId = 'root',
  } = options;

  const modalRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const headingId = useId();

  // ── Focus Trap ──────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (event.shiftKey) {
        // Shift+Tab on first element → wrap to last
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        // Tab on last element → wrap to first
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    },
    []
  );

  // ── Escape Key ──────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // ── Body Scroll Lock (position: fixed + scroll restore) ────
  // This approach works on iOS Safari, unlike simple overflow:hidden.
  useEffect(() => {
    if (!isOpen || !lockScroll) return;

    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen, lockScroll]);

  // ── Inert Background ────────────────────────────────────────
  // Sets `inert` on the app root so background content is hidden from
  // assistive technology and non-interactive. The modal must be rendered
  // outside the inert root (typically via portal or sibling element).
  useEffect(() => {
    if (!isOpen || !inertBackground) return;

    const appRoot = document.getElementById(appRootId);
    if (!appRoot) return;

    appRoot.setAttribute('inert', '');
    return () => appRoot.removeAttribute('inert');
  }, [isOpen, inertBackground, appRootId]);

  // ── Focus Management ────────────────────────────────────────
  // Save the trigger's focus on open, move focus into the modal,
  // then restore focus to the trigger on close.
  useEffect(() => {
    if (isOpen) {
      // Save current focus BEFORE moving it
      triggerRef.current = document.activeElement as HTMLElement | null;

      // Move focus into modal after DOM paints
      requestAnimationFrame(() => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        } else {
          const firstFocusable = modalRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
          if (firstFocusable) {
            firstFocusable.focus();
          } else {
            // Focus the container itself so AT announces it
            modalRef.current?.focus();
          }
        }
      });
    } else if (triggerRef.current) {
      // Restore focus to the element that opened the modal
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen, initialFocusRef]);

  // ── Backdrop Click Detection ────────────────────────────────
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      // Close only when clicking directly on the backdrop (event.currentTarget),
      // NOT on a child element. The previous check (event.target === modalRef.current)
      // was backwards — modalRef points to the inner dialog, not the outer backdrop.
      if (closeOnBackdrop && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose]
  );

  // ── ARIA Props ──────────────────────────────────────────────
  const modalProps = {
    role: (alert ? 'alertdialog' : 'dialog') as 'dialog' | 'alertdialog',
    'aria-modal': true as const,
    'aria-labelledby': headingId,
    tabIndex: -1 as const,
  };

  return {
    modalRef,
    handleKeyDown,
    handleBackdropClick,
    modalProps,
    headingId,
  };
}
