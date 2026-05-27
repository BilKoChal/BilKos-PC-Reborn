/**
 * ModalPortal — Renders children into the #modal-root container.
 *
 * Required for modals that use `inertBackground: true` in useModalA11y.
 * When that hook sets `inert` on #root, everything inside #root becomes
 * non-interactive. By portaling the modal into #modal-root (a sibling of
 * #root), the modal stays interactive while the background is inert.
 *
 * Usage:
 *   <ModalPortal>
 *     <div className="fixed inset-0 ...">modal content</div>
 *   </ModalPortal>
 */
import React from 'react';
import { createPortal } from 'react-dom';

const MODAL_ROOT_ID = 'modal-root';

export const ModalPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [target, setTarget] = React.useState<HTMLElement | null>(null);

    React.useEffect(() => {
        setTarget(document.getElementById(MODAL_ROOT_ID));
    }, []);

    // During SSR or before the DOM is ready, render children in-place as fallback
    if (!target) return <>{children}</>;

    return createPortal(children, target);
};
