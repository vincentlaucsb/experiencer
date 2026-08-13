import { useEffect } from "react";
import PageSize from "@/types/PageSize";
import { useEditorStore } from "../stores/editorStore";

const PRINT_PAGE_SIZE_STYLE_ID = 'print-page-size-style';

function getPageSizeCss(pageSize: PageSize) {
    const cssSize = pageSize === PageSize.A4 ? 'A4' : 'Letter';
    return `@page { size: ${cssSize}; }`;
}

/**
 * Registers the browser print shortcut and keeps the document's page-size rule current.
 */
export default function useHandlePrint(requestIsolatedPrint?: () => void) {
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
        const handlePrintShortcut = (event: KeyboardEvent) => {
            if (!requestIsolatedPrint || event.defaultPrevented) {
                return;
            }

            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
                event.preventDefault();
                requestIsolatedPrint();
            }
        };

        window.addEventListener('keydown', handlePrintShortcut);

        return () => {
            window.removeEventListener('keydown', handlePrintShortcut);
        };
    }, [requestIsolatedPrint]);
}
