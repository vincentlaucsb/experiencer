import { useCallback } from "react";

/**
 * Handles image clipboard files. Normalization is supplied separately so paste
 * and file selection share exactly the same ingestion path.
 */
export default function useHandleSourcePaste(normalizeFile: (file: File) => Promise<void>):
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => void
{
    return useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const imageItem = Array.from(e.clipboardData.items).find(
            (item) => item.kind === "file" && item.type.startsWith("image/")
        );

        if (!imageItem) {
            return;
        }

        const file = imageItem.getAsFile();
        if (!file) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        void normalizeFile(file);
    }, [normalizeFile]);
}
