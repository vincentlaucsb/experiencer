import { useRef, useState } from 'react';

/**
 * Hook for managing overlay-based editing (edit UI displayed as popover over content)
 * 
 * This prevents layout shift by keeping the original content visible while showing
 * an editing UI as an overlay popover.
 * 
 * @param isEditing Whether the component is in edit mode
 * @param onSave Callback when user saves changes
 * @param onCancel Callback when user cancels editing
 * 
 * @example
 * const { triggerRef, isEditingOverlay } = useOverlayEditing(isEditing, handleSave, handleCancel);
 * 
 * return (
 *   <>
 *     <Popover content={<EditForm />} isOpen={isEditingOverlay}>
 *       <span ref={triggerRef} onClick={handleEditClick}>
 *         Display content here
 *       </span>
 *     </Popover>
 *   </>
 * );
 */
export function useOverlayEditing(
    isEditing: boolean,
    onSave?: () => void,
    onCancel?: () => void
) {
    const triggerRef = useRef<HTMLElement>(null);
    const [isEditingOverlay, setIsEditingOverlay] = useState(false);

    const handleSave = () => {
        setIsEditingOverlay(false);
        onSave?.();
    };

    const handleCancel = () => {
        setIsEditingOverlay(false);
        onCancel?.();
    };

    // Sync overlay state with parent editing state
    // When parent says we're editing, open the overlay
    const handleEditClick = () => {
        if (isEditing) {
            setIsEditingOverlay(true);
        }
    };

    return {
        triggerRef,
        isEditingOverlay: isEditing && isEditingOverlay,
        handleEditClick,
        handleSave,
        handleCancel,
    };
}
