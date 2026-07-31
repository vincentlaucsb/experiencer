import { useCallback, useRef, useState } from "react";

import {
    ImageNormalizationError,
    normalizeImageFile,
} from "@/shared/images/normalizeImageFile";

export interface ImageNormalizationState {
    error: string | null;
    isProcessing: boolean;
    normalizeFile(file: File): Promise<void>;
}

function errorMessage(error: unknown): string {
    if (error instanceof ImageNormalizationError) {
        return error.message;
    }
    return "The image could not be processed.";
}

export default function useImageNormalization(
    onNormalized: (dataUrl: string) => void,
): ImageNormalizationState {
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const requestId = useRef(0);

    const normalizeFile = useCallback(async (file: File) => {
        const currentRequest = ++requestId.current;
        setError(null);
        setIsProcessing(true);

        try {
            const dataUrl = await normalizeImageFile(file);
            if (requestId.current === currentRequest) {
                onNormalized(dataUrl);
            }
        } catch (normalizationError) {
            if (requestId.current === currentRequest) {
                setError(errorMessage(normalizationError));
            }
        } finally {
            if (requestId.current === currentRequest) {
                setIsProcessing(false);
            }
        }
    }, [onNormalized]);

    return { error, isProcessing, normalizeFile };
}

