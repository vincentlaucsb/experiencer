import { useHistoryStore } from "../stores/historyStore";

// TODO: See if we can make canUndo and canRedo work without having to call getState() every time. Maybe by using a selector or something?
export default function useUndoRedoProps() {
    const { canUndo, canRedo, undo, redo } = useHistoryStore.getState();

    return {
        undo: canUndo() ? undo : undefined,
        redo: canRedo() ? redo : undefined
    };
}