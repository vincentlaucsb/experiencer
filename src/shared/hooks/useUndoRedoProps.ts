import { useHistoryStore } from "../stores/historyStore";

export default function useUndoRedoProps() {
    const { canUndo, canRedo, undo, redo } = useHistoryStore.getState();
    
    return {
        undo: canUndo() ? undo : undefined,
        redo: canRedo() ? redo : undefined
    };
}