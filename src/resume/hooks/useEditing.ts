import { useEffect, useState, useRef } from "react";

/**
 * Custom hook for managing editable state with synchronization to external value.
 * 
 * Keeps local state during editing to prevent input reverting on every keystroke.
 * Syncs to parent on edit mode exit, syncs from parent on edit mode entry.
 * 
 * @param initialValue - The initial value of the editable state.
 * @param isEditing - Boolean indicating whether the component is in editing mode.
 * @param onChange - Callback function to notify parent of value changes.
 * @returns A tuple containing the current editable value and a setter function.
 */
export default function useEditing<T>(
    initialValue: T,
    isEditing: boolean,
    onChange: (value: T) => void
) {
    const [editValue, setEditValue] = useState(initialValue);
    const prevEditingRef = useRef(isEditing);
    
    useEffect(() => {
        const wasEditing = prevEditingRef.current;
        const isEnteringEditMode = !wasEditing && isEditing;
        const isExitingEditMode = wasEditing && !isEditing;
        
        if (isEnteringEditMode) {
            // Entering edit mode - sync from parent
            setEditValue(initialValue);
        } else if (isExitingEditMode) {
            // Exiting edit mode - save to parent
            onChange(editValue);
        } else if (!isEditing) {
            // Not editing - keep synced with parent (e.g., undo/redo)
            setEditValue(initialValue);
        }
        
        prevEditingRef.current = isEditing;
    }, [isEditing, initialValue, editValue, onChange]);

    return [editValue, setEditValue] as const;
}