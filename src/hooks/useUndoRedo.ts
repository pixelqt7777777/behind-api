'use client';

import { useState, useCallback, useRef } from 'react';

interface UndoRedoState {
  value: string;
  setValue: (value: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (value: string) => void;
}

const MAX_HISTORY = 200;
const COALESCE_MS = 600;

/**
 * Text history with undo/redo. Rapid edits within COALESCE_MS collapse into a
 * single history entry so undo jumps by meaningful chunks, not per-keystroke.
 */
export function useUndoRedo(initial: string): UndoRedoState {
  const [state, setState] = useState<{ stack: string[]; index: number }>({
    stack: [initial],
    index: 0,
  });
  const lastEditRef = useRef<number>(0);

  const setValue = useCallback((value: string) => {
    const now = Date.now();
    const coalesce = now - lastEditRef.current < COALESCE_MS;
    lastEditRef.current = now;

    setState((prev) => {
      const base = prev.stack.slice(0, prev.index + 1);
      if (value === base[base.length - 1]) return prev;

      let stack: string[];
      let index: number;

      if (coalesce && base.length > 1) {
        // Replace current top entry instead of pushing a new one
        stack = [...base.slice(0, -1), value];
        index = stack.length - 1;
      } else {
        stack = [...base, value];
        index = stack.length - 1;
      }

      if (stack.length > MAX_HISTORY) {
        const overflow = stack.length - MAX_HISTORY;
        stack = stack.slice(overflow);
        index -= overflow;
      }

      return { stack, index };
    });
  }, []);

  const undo = useCallback(() => {
    lastEditRef.current = 0;
    setState((prev) =>
      prev.index > 0 ? { ...prev, index: prev.index - 1 } : prev
    );
  }, []);

  const redo = useCallback(() => {
    lastEditRef.current = 0;
    setState((prev) =>
      prev.index < prev.stack.length - 1
        ? { ...prev, index: prev.index + 1 }
        : prev
    );
  }, []);

  const reset = useCallback((value: string) => {
    lastEditRef.current = 0;
    setState({ stack: [value], index: 0 });
  }, []);

  return {
    value: state.stack[state.index] ?? '',
    setValue,
    undo,
    redo,
    canUndo: state.index > 0,
    canRedo: state.index < state.stack.length - 1,
    reset,
  };
}
