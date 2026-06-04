import { describe, it, expect, vi } from 'vitest';
import { hasUnsavedWork, createBeforeUnloadHandler } from '../lib/utils/sessionGuard';

describe('sessionGuard (TODO §1 — unsaved-work protection)', () => {
  describe('hasUnsavedWork', () => {
    it('returns false for an empty session', () => {
      expect(hasUnsavedWork([])).toBe(false);
    });

    it('returns false when every tab is clean', () => {
      expect(hasUnsavedWork([{ isDirty: false }, { isDirty: false }])).toBe(false);
    });

    it('returns true when any tab is dirty', () => {
      expect(hasUnsavedWork([{ isDirty: false }, { isDirty: true }])).toBe(true);
    });

    it('returns true when all tabs are dirty', () => {
      expect(hasUnsavedWork([{ isDirty: true }])).toBe(true);
    });
  });

  describe('createBeforeUnloadHandler', () => {
    function makeEvent(): BeforeUnloadEvent {
      // Minimal stand-in for the BeforeUnloadEvent shape we touch.
      return {
        preventDefault: vi.fn(),
        returnValue: undefined,
      } as unknown as BeforeUnloadEvent;
    }

    it('does nothing and returns undefined when there is no unsaved work', () => {
      const handler = createBeforeUnloadHandler(() => false);
      const event = makeEvent();
      const result = handler(event);
      expect(result).toBeUndefined();
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('blocks unload when there is unsaved work', () => {
      const handler = createBeforeUnloadHandler(() => true);
      const event = makeEvent();
      const result = handler(event);
      expect(result).toBe('');
      expect(event.preventDefault).toHaveBeenCalledOnce();
      expect(event.returnValue).toBe('');
    });

    it('re-evaluates the dirty predicate on each call (latest state wins)', () => {
      let dirty = false;
      const handler = createBeforeUnloadHandler(() => dirty);
      expect(handler(makeEvent())).toBeUndefined();
      dirty = true;
      expect(handler(makeEvent())).toBe('');
    });
  });
});
