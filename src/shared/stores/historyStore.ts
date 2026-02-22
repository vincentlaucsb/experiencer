import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { resumeNodeStore } from './resumeNodeStore';
import { ResumeNode } from '@/types';

interface HistoryState {
    past: ResumeNode[][];
    future: ResumeNode[][];
}

interface HistoryActions {
    undo: () => void;
    redo: () => void;
    clear: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
}

type HistoryStore = HistoryState & HistoryActions;

/**
 * History store for undo/redo functionality.
 * Tracks changes to the resume tree and allows time-travel.
 * 
 * Automatically captures state from resumeStore on mutations.
 */
export const useHistoryStore = create<HistoryStore>()(
    devtools(
        (set, get) => ({
            // State
            past: [],
            future: [],

            // Undo - restore previous state
            undo: () => {
                const { past, future } = get();
                
                if (past.length === 0) {
                    return; // Nothing to undo
                }

                const previous = past[past.length - 1];
                const newPast = past.slice(0, -1);
                
                // Save current state to future before changing
                const current = resumeNodeStore.data.childNodes;
                
                set(
                    {
                        past: newPast,
                        future: [current, ...future],
                    },
                    false,
                    'undo'
                );

                // Update resume store with previous state
                resumeNodeStore.setNodes(previous);
            },

            // Redo - restore next state
            redo: () => {
                const { past, future } = get();
                
                if (future.length === 0) {
                    return; // Nothing to redo
                }

                const next = future[0];
                const newFuture = future.slice(1);
                
                // Save current state to past before changing
                const current = resumeNodeStore.data.childNodes;
                
                set(
                    {
                        past: [...past, current],
                        future: newFuture,
                    },
                    false,
                    'redo'
                );

                // Update resume store with next state
                resumeNodeStore.setNodes(next);
            },

            // Clear history (useful after loading a new file)
            clear: () => set({ past: [], future: [] }, false, 'clearHistory'),

            // Check if undo is available
            canUndo: () => get().past.length > 0,

            // Check if redo is available
            canRedo: () => get().future.length > 0,
        }),
        { name: 'HistoryStore' }
    )
);

/**
 * Record a snapshot of current state for undo/redo.
 * Call this BEFORE making changes to the resume tree.
 * This is a regular function (not a hook) so it can be called from anywhere.
 */
export const recordHistory = () => {
    const current = resumeNodeStore.data.childNodes;
    const { past } = useHistoryStore.getState();
    
    // Deep clone to prevent reference issues
    const snapshot = JSON.parse(JSON.stringify(current));
    
    // Limit history to 50 entries to prevent memory issues
    const newPast = past.length >= 50 
        ? [...past.slice(1), snapshot]
        : [...past, snapshot];
    
    useHistoryStore.setState({
        past: newPast,
        future: [], // Clear future when new action is performed
    });
};

/**
 * Hook to record a snapshot of current state for undo/redo.
 * Call this BEFORE making changes to the resume tree.
 */
export const useRecordHistory = () => {
    return recordHistory;
};

// Selector hooks
export const useCanUndo = () => useHistoryStore((state) => state.canUndo());
export const useCanRedo = () => useHistoryStore((state) => state.canRedo());
