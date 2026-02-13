import { useEffect } from "react";
import { useEditorStore } from "../stores/editorStore";

/**
 * Custom hook to handle print mode toggling for the resume editor,
 * i.e. when the user hits Ctrl+P or uses the browser's print functionality.
 * Listens for browser print events and updates editor mode accordingly.
 * Ensures that the editor switches to 'printing' mode during print preview and reverts back after printing.
 */
export default function useHandlePrint() {
    const { mode, setMode } = useEditorStore();

    const handleBeforePrint = () => {
        const currentMode = mode || 'landing';
        if (currentMode !== 'printing') {
            setMode('printing');
        }
    }

    const handleAfterPrint = () => {
        const currentMode = mode || 'landing';
        if (currentMode === 'printing') {
            setMode('normal');
        }
    };

    useEffect(() => {
        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, []);
}
