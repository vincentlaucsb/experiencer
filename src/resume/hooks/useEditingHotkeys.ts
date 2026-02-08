import { useEffect, useRef } from "react";

export interface useEditingHotkeysOptions {
    /** Whether the component is currently being edited */
    isEditing: boolean;

    /** Called when text changes */
    onChange: (text: string) => void;

    /** The current text value; stored on edit start and used for Escape rollback */
    value: string;

    /** Called when save hotkey is pressed (Enter or Ctrl+Enter) */
    toggleEditing: () => void;

    /** If true, requires Ctrl+Enter to save; if false, Enter alone saves. Default: true */
    ctrlEnter?: boolean; 
}

/**
 * Hook for managing keyboard shortcuts in editing contexts
 * 
 * Provides two keyboard behaviors while editing:
 * - **Enter/Ctrl+Enter**: Save changes and exit editing mode
 * - **Escape**: Cancel changes and restore the original value
 * 
 * The hook attaches a global keydown listener that only activates while `isEditing` is true.
 * 
 * @param options - Configuration for keyboard behavior
 * @param options.isEditing - Whether the component is currently in edit mode
 * @param options.onChange - Called with original value when Escape is pressed
 * @param options.value - Current text value; captured when editing starts for rollback
 * @param options.toggleEditing - Called when save hotkey is pressed (Enter/Ctrl+Enter)
 * @param options.ctrlEnter - Save key behavior:
 *   - `true` (default): Requires Ctrl+Enter to save (good for multiline textareas)
 *   - `false`: Enter alone saves (good for single-line inputs)
 * 
 * @example
 * // Multiline textarea - Ctrl+Enter to save
 * useEditingHotkeys({
 *   isEditing,
 *   value: content,
 *   onChange: (original) => reset(original),
 *   toggleEditing: () => exitEditMode(),
 *   ctrlEnter: true
 * });
 * 
 * @example
 * // Single line input - Enter to save
 * useEditingHotkeys({
 *   isEditing,
 *   value: title,
 *   onChange: (original) => reset(original),
 *   toggleEditing: () => exitEditMode(),
 *   ctrlEnter: false
 * });
 */
export default function useEditingHotkeys(options: useEditingHotkeysOptions) {
    const valueRef = useRef<string>(options.value);

    // Capture the original value when editing starts.
    // NOTE: options.value is intentionally omitted from dependencies.
    // This ensures we only capture the value once when entering edit mode,
    // allowing Escape to restore the original state even if the value changes during editing.
    useEffect(() => {
        if (options.isEditing) {
            valueRef.current = options.value;
        }
    }, [options.isEditing]);
    
    // Set up keyboard listener while editing
    useEffect(() => {
        const { isEditing, onChange, toggleEditing, ctrlEnter } = options;
        if (!isEditing) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                // Check if this Enter keypress should trigger save
                const requiresCtrl = ctrlEnter !== false;
                const hasCtrl = e.ctrlKey || e.metaKey;
                const shouldSave = requiresCtrl ? hasCtrl : true;

                if (shouldSave) {
                    e.preventDefault();
                    toggleEditing();
                }
            }
            else if (e.key === 'Escape') {
                e.preventDefault();
                // Restore original value and exit editing
                onChange(valueRef.current);
                toggleEditing();
            }
        };

        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [options]);
}
