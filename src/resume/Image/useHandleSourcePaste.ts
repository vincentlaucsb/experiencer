import { useCallback } from "react";

/**
 * Handle pasting an image from the clipboard into the textarea. If an image is found,
 * it reads the file and sets the temporary source for the image.
 */
export default function useHandleSourcePaste(setTempSrc: (src: string) => void):
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

        const reader = new FileReader();
        const cleanup = () => {
            reader.onload = null;
            reader.onerror = null;
            reader.onabort = null;
        };

        reader.onload = () => {
            if (typeof reader.result === "string") {
                setTempSrc(reader.result);
            }
            cleanup();
        };
        reader.onerror = cleanup;
        reader.onabort = cleanup;

        try {
            reader.readAsDataURL(file);
        } catch {
            cleanup();
        }
    }, [setTempSrc]);
}