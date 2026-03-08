import { useEffect } from "react";
import PageSize from "@/types/PageSize";
import { useEditorStore } from "../stores/editorStore";

const PRINT_PAGE_SIZE_STYLE_ID = 'print-page-size-style';

function getPageSizeCss(pageSize: PageSize) {
    const cssSize = pageSize === PageSize.A4 ? 'A4' : 'Letter';
    return `@page { size: ${cssSize}; }`;
}

/**
 * Custom hook to handle print mode toggling for the resume editor,
 * i.e. when the user hits Ctrl+P or uses the browser's print functionality.
 * Listens for browser print events and updates editor mode accordingly.
 * Ensures that the editor switches to 'printing' mode during print preview and reverts back after printing.
 */
export default function useHandlePrint() {
    const pageSize = useEditorStore((state) => state.pageSize);

    useEffect(() => {
        let styleElement = document.getElementById(PRINT_PAGE_SIZE_STYLE_ID) as HTMLStyleElement | null;

        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = PRINT_PAGE_SIZE_STYLE_ID;
            styleElement.media = 'print';
            document.head.appendChild(styleElement);
        }

        styleElement.textContent = getPageSizeCss(pageSize);
    }, [pageSize]);

    useEffect(() => {
        const handleBeforePrint = () => {
            const currentMode = useEditorStore.getState().mode || 'landing';
            if (currentMode !== 'printing') {
                useEditorStore.getState().setMode('printing');
            }
        };

        const handleAfterPrint = () => {
            const currentMode = useEditorStore.getState().mode || 'landing';
            if (currentMode === 'printing') {
                useEditorStore.getState().setMode('normal');
            }
        };

        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, []);
}
