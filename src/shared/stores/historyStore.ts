import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { resumeNodeStore } from './resumeNodeStore';
import { cssStore, rootCssStore } from './cssStoreHooks';
import { deepCopy } from '@/shared/utils/deepCopy';
import { CssNodeDump, ResumeNode } from '@/types';

interface HistoryEntry {
    resumeNodes?: ResumeNode[];
    resumeCss?: CssNodeDump;
    rootCss?: CssNodeDump;
}

type CssHistoryTarget = 'resumeCss' | 'rootCss';

interface HistoryState {
    past: HistoryEntry[];
    future: HistoryEntry[];
}

interface HistoryActions {
    undo: () => void;
    redo: () => void;
    clear: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
}

type HistoryStore = HistoryState & HistoryActions;

const HISTORY_LIMIT = 50;
let transactionDepth = 0;
let pendingTransaction: HistoryEntry | undefined;

function hasHistoryData(entry: HistoryEntry | undefined): entry is HistoryEntry {
    return Boolean(entry && (
        entry.resumeNodes !== undefined
        || entry.resumeCss !== undefined
        || entry.rootCss !== undefined
    ));
}

function captureCurrent(entry: HistoryEntry): HistoryEntry {
    return {
        ...(entry.resumeNodes !== undefined
            ? { resumeNodes: deepCopy(resumeNodeStore.data.childNodes) }
            : {}),
        ...(entry.resumeCss !== undefined
            ? { resumeCss: deepCopy(cssStore.data.dump()) }
            : {}),
        ...(entry.rootCss !== undefined
            ? { rootCss: deepCopy(rootCssStore.data.dump()) }
            : {}),
    };
}

function restoreEntry(entry: HistoryEntry): void {
    if (entry.resumeNodes !== undefined) {
        resumeNodeStore.setNodes(entry.resumeNodes);
    }
    if (entry.resumeCss !== undefined) {
        cssStore.loadCss(entry.resumeCss);
    }
    if (entry.rootCss !== undefined) {
        rootCssStore.loadCss(entry.rootCss);
    }
}

/**
 * History store for undo/redo functionality.
 * Tracks changes to the resume and authored CSS trees and allows time-travel.
 * 
 * Mutation-owning stores provide their committed pre-mutation snapshots.
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
                
                // Save current state to future before changing only affected stores.
                const current = captureCurrent(previous);
                
                set(
                    {
                        past: newPast,
                        future: [current, ...future],
                    },
                    false,
                    'undo'
                );

                restoreEntry(previous);
            },

            // Redo - restore next state
            redo: () => {
                const { past, future } = get();
                
                if (future.length === 0) {
                    return; // Nothing to redo
                }

                const next = future[0];
                const newFuture = future.slice(1);
                
                // Save current state to past before changing only affected stores.
                const current = captureCurrent(next);
                
                set(
                    {
                        past: [...past, current],
                        future: newFuture,
                    },
                    false,
                    'redo'
                );

                restoreEntry(next);
            },

            // Clear history (useful after loading a new file)
            clear: () => {
                pendingTransaction = undefined;
                set({ past: [], future: [] }, false, 'clearHistory');
            },

            // Check if undo is available
            canUndo: () => get().past.length > 0,

            // Check if redo is available
            canRedo: () => get().future.length > 0,
        }),
        { name: 'HistoryStore' }
    )
);

/**
 * Add one immutable entry and reset the abandoned redo branch.
 */
function appendHistory(entry: HistoryEntry): void {
    const { past } = useHistoryStore.getState();
    const snapshot = deepCopy(entry);
    const newPast = past.length >= HISTORY_LIMIT
        ? [...past.slice(1), snapshot]
        : [...past, snapshot];
    
    useHistoryStore.setState({
        past: newPast,
        future: [], // Clear future when new action is performed
    });
}

function recordHistoryEntry(entry: HistoryEntry): void {
    if (!hasHistoryData(entry)) {
        return;
    }

    if (transactionDepth === 0) {
        appendHistory(entry);
        return;
    }

    pendingTransaction ??= {};
    if (pendingTransaction.resumeNodes === undefined && entry.resumeNodes !== undefined) {
        pendingTransaction.resumeNodes = deepCopy(entry.resumeNodes);
    }
    if (pendingTransaction.resumeCss === undefined && entry.resumeCss !== undefined) {
        pendingTransaction.resumeCss = deepCopy(entry.resumeCss);
    }
    if (pendingTransaction.rootCss === undefined && entry.rootCss !== undefined) {
        pendingTransaction.rootCss = deepCopy(entry.rootCss);
    }
}

const recordNodeHistory = (committedSnapshot?: ResumeNode[]) => {
    recordHistoryEntry({
        resumeNodes: committedSnapshot ?? resumeNodeStore.data.childNodes,
    });
};

const recordCssHistory = (
    target: CssHistoryTarget,
    committedSnapshot: CssNodeDump
) => {
    recordHistoryEntry({ [target]: committedSnapshot });
};

/** Groups synchronous mutations into one undoable user action. */
export function runHistoryTransaction<T>(
    operation: () => T & (T extends PromiseLike<unknown> ? never : unknown)
): T {
    const isOutermost = transactionDepth === 0;
    if (isOutermost) {
        pendingTransaction = undefined;
    }

    transactionDepth++;
    try {
        return operation();
    } finally {
        transactionDepth--;
        if (isOutermost) {
            const entry = pendingTransaction;
            pendingTransaction = undefined;
            if (hasHistoryData(entry)) {
                appendHistory(entry);
            }
        }
    }
}

// Inject history recording into the node store without creating a module-init cycle.
resumeNodeStore.setHistoryRecorder(recordNodeHistory);
cssStore.setHistoryRecorder((snapshot) => recordCssHistory('resumeCss', snapshot));
rootCssStore.setHistoryRecorder((snapshot) => recordCssHistory('rootCss', snapshot));

// Preserve the existing node-history API for callers outside the store composition.
export const recordHistory = recordNodeHistory;

/**
 * Hook to record a snapshot of current state for undo/redo.
 * Call this BEFORE making changes to the resume tree.
 */
export const useRecordHistory = () => {
    return recordNodeHistory;
};

// Selector hooks
export const useCanUndo = () => useHistoryStore((state) => state.canUndo());
export const useCanRedo = () => useHistoryStore((state) => state.canRedo());
