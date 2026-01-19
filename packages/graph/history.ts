/**
 * History management for undo/redo functionality
 */

import type { Node, Edge } from 'reactflow';

export interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

export interface HistoryManager {
  past: HistoryState[];
  present: HistoryState;
  future: HistoryState[];
}

const MAX_HISTORY_SIZE = 50;

/**
 * Create initial history manager
 */
export function createHistoryManager(nodes: Node[], edges: Edge[]): HistoryManager {
  return {
    past: [],
    present: { nodes, edges },
    future: [],
  };
}

/**
 * Push new state to history
 */
export function pushHistory(
  manager: HistoryManager,
  nodes: Node[],
  edges: Edge[]
): HistoryManager {
  const newPast = [...manager.past, manager.present];
  
  // Limit history size
  if (newPast.length > MAX_HISTORY_SIZE) {
    newPast.shift();
  }

  return {
    past: newPast,
    present: { nodes, edges },
    future: [], // Clear future when new action is performed
  };
}

/**
 * Undo last action
 */
export function undo(manager: HistoryManager): {
  manager: HistoryManager;
  state: HistoryState | null;
} {
  if (manager.past.length === 0) {
    return { manager, state: null };
  }

  const previous = manager.past[manager.past.length - 1];
  const newPast = manager.past.slice(0, -1);

  const newManager: HistoryManager = {
    past: newPast,
    present: previous,
    future: [manager.present, ...manager.future],
  };

  return {
    manager: newManager,
    state: previous,
  };
}

/**
 * Redo last undone action
 */
export function redo(manager: HistoryManager): {
  manager: HistoryManager;
  state: HistoryState | null;
} {
  if (manager.future.length === 0) {
    return { manager, state: null };
  }

  const next = manager.future[0];
  const newFuture = manager.future.slice(1);

  const newManager: HistoryManager = {
    past: [...manager.past, manager.present],
    present: next,
    future: newFuture,
  };

  return {
    manager: newManager,
    state: next,
  };
}

/**
 * Check if undo is available
 */
export function canUndo(manager: HistoryManager): boolean {
  return manager.past.length > 0;
}

/**
 * Check if redo is available
 */
export function canRedo(manager: HistoryManager): boolean {
  return manager.future.length > 0;
}

/**
 * Clear all history
 */
export function clearHistory(nodes: Node[], edges: Edge[]): HistoryManager {
  return createHistoryManager(nodes, edges);
}
