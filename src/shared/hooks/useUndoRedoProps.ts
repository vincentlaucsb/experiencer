import { useHistoryStore } from "../stores/historyStore";

export default function useUndoRedoProps() {
    const canUndo = useHistoryStore((state) => state.past.length > 0);
    const canRedo = useHistoryStore((state) => state.future.length > 0);
    const undo = useHistoryStore((state) => state.undo);
    const redo = useHistoryStore((state) => state.redo);

    return {
        undo: canUndo ? undo : undefined,
        redo: canRedo ? redo : undefined
    };
}
