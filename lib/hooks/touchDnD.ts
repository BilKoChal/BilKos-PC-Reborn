/**
 * Touch-based Drag & Drop system for mobile devices.
 *
 * HTML5 Drag & Drop does NOT work on touch/mobile browsers — only mouse events.
 * This module provides a lightweight touch DnD implementation that:
 *   1. On touchstart + move: creates a floating drag preview following the finger
 *   2. On touchmove: highlights the slot under the finger
 *   3. On touchend: identifies the target slot and executes the drop
 *
 * Slot elements MUST have data-dnd-slot, data-dnd-index, and optionally data-dnd-box
 * attributes so we can identify them via document.elementFromPoint().
 */

// ─── Global Touch Drag State ────────────────────────────────────────────

interface TouchDragInfo {
    sourceTabId: string;
    sourceLocation: SourceLocation;
    previewEl: HTMLElement;
    lastTargetEl: HTMLElement | null;
}

export type SourceLocation =
    | { type: 'party'; index: number }
    | { type: 'box'; boxIndex: number; index: number };

let activeTouchDrag: TouchDragInfo | null = null;

/** CSS class applied to the slot currently under the finger during a touch drag */
const TOUCH_DRAG_OVER_CLASS = 'touch-drag-over';

// ─── Public API ─────────────────────────────────────────────────────────

/** Check if a touch drag is currently in progress */
export function isTouchDragging(): boolean {
    return activeTouchDrag !== null;
}

/**
 * Start a touch drag session.
 * Called from the source slot's touchstart handler after the finger moves enough.
 */
export function startTouchDrag(
    sourceTabId: string,
    sourceLocation: SourceLocation,
    spriteUrl: string,
    startX: number,
    startY: number
): void {
    // If there's already a drag, clean it up
    if (activeTouchDrag) cancelTouchDrag();

    // Create floating preview
    const preview = document.createElement('div');
    preview.id = 'touch-drag-preview';
    preview.style.cssText = `
        position: fixed;
        z-index: 99999;
        pointer-events: none;
        opacity: 0.85;
        transform: scale(0.7);
        filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
        transition: none;
    `;

    const img = document.createElement('img');
    img.src = spriteUrl;
    img.style.cssText = `
        width: 72px;
        height: 72px;
        object-fit: contain;
        image-rendering: pixelated;
    `;
    preview.appendChild(img);
    document.body.appendChild(preview);

    activeTouchDrag = {
        sourceTabId,
        sourceLocation,
        previewEl: preview,
        lastTargetEl: null,
    };

    moveTouchDrag(startX, startY);
}

/**
 * Update the drag preview position and highlight the slot under the finger.
 * Called from touchmove.
 */
export function moveTouchDrag(x: number, y: number): void {
    if (!activeTouchDrag) return;

    // Move preview
    activeTouchDrag.previewEl.style.left = (x - 36) + 'px';
    activeTouchDrag.previewEl.style.top = (y - 80) + 'px';

    // Hide preview momentarily to find element underneath
    activeTouchDrag.previewEl.style.display = 'none';
    const el = document.elementFromPoint(x, y);
    activeTouchDrag.previewEl.style.display = '';

    // Find nearest slot parent
    const slotEl = el?.closest?.('[data-dnd-slot]') as HTMLElement | null;

    // Update highlight
    if (activeTouchDrag.lastTargetEl && activeTouchDrag.lastTargetEl !== slotEl) {
        activeTouchDrag.lastTargetEl.classList.remove(TOUCH_DRAG_OVER_CLASS);
        activeTouchDrag.lastTargetEl = null;
    }
    if (slotEl && !slotEl.classList.contains(TOUCH_DRAG_OVER_CLASS)) {
        // Don't highlight the source slot
        const slotIndex = parseInt(slotEl.dataset.dndIndex ?? '-1', 10);
        const slotBox = slotEl.dataset.dndBox !== undefined ? parseInt(slotEl.dataset.dndBox, 10) : undefined;
        const slotType = slotEl.dataset.dndSlot;

        // Narrow the discriminated union instead of casting to `any` (TODO 4.1):
        // boxIndex only exists on the 'box' variant of SourceLocation.
        const src = activeTouchDrag.sourceLocation;
        const sameBox = src.type === 'box' ? src.boxIndex === slotBox : true;
        const isSameAsSource = src.type === slotType &&
            src.index === slotIndex &&
            (slotType === 'party' || sameBox);

        if (!isSameAsSource) {
            slotEl.classList.add(TOUCH_DRAG_OVER_CLASS);
            activeTouchDrag.lastTargetEl = slotEl;
        }
    } else if (slotEl && slotEl === activeTouchDrag.lastTargetEl) {
        // Already highlighted
    }
}

/**
 * End a touch drag session and return info needed to execute the drop.
 * Called from touchend.
 */
export function endTouchDrag(): { sourceTabId: string; sourceLocation: SourceLocation; targetLocation: SourceLocation } | null {
    if (!activeTouchDrag) return null;

    const targetEl = activeTouchDrag.lastTargetEl;
    let targetLocation: SourceLocation | null = null;

    if (targetEl) {
        const slotType = targetEl.dataset.dndSlot;
        const slotIndex = parseInt(targetEl.dataset.dndIndex ?? '-1', 10);
        const slotBox = targetEl.dataset.dndBox !== undefined ? parseInt(targetEl.dataset.dndBox, 10) : undefined;

        if (slotType === 'party' && slotIndex >= 0) {
            targetLocation = { type: 'party', index: slotIndex };
        } else if (slotType === 'box' && slotIndex >= 0 && slotBox !== undefined && slotBox >= 0) {
            targetLocation = { type: 'box', boxIndex: slotBox, index: slotIndex };
        }
    }

    const result = targetLocation ? {
        sourceTabId: activeTouchDrag.sourceTabId,
        sourceLocation: activeTouchDrag.sourceLocation,
        targetLocation,
    } : null;

    // Clean up
    activeTouchDrag.previewEl.remove();
    if (activeTouchDrag.lastTargetEl) {
        activeTouchDrag.lastTargetEl.classList.remove(TOUCH_DRAG_OVER_CLASS);
    }
    activeTouchDrag = null;

    return result;
}

/** Cancel a touch drag without dropping (e.g., when the touch is cancelled) */
export function cancelTouchDrag(): void {
    if (!activeTouchDrag) return;
    activeTouchDrag.previewEl.remove();
    if (activeTouchDrag.lastTargetEl) {
        activeTouchDrag.lastTargetEl.classList.remove(TOUCH_DRAG_OVER_CLASS);
    }
    activeTouchDrag = null;
}
