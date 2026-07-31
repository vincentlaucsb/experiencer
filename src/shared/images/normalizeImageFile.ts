export const IMAGE_NORMALIZATION_LIMITS = {
    maxSourceBytes: 10 * 1024 * 1024,
    maxSourcePixels: 20_000_000,
    maxLongestEdge: 1_600,
    maxOutputBytes: 500 * 1024,
} as const;

const SUPPORTED_SOURCE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

const QUALITY_STEPS = [0.9, 0.82, 0.74, 0.66, 0.58, 0.5, 0.42];
const RESIZE_FACTOR = 0.85;
const MIN_LONGEST_EDGE = 256;

export type ImageNormalizationErrorCode =
    | "empty_source"
    | "source_too_large"
    | "unsupported_type"
    | "invalid_signature"
    | "animated_source"
    | "decode_failed"
    | "invalid_dimensions"
    | "too_many_pixels"
    | "encode_failed"
    | "output_too_large";

/** Reports a stable, user-actionable reason that image normalization failed. */
export class ImageNormalizationError extends Error {
    public readonly cause?: unknown;

    constructor(
        public readonly code: ImageNormalizationErrorCode,
        message: string,
        options?: { cause?: unknown },
    ) {
        super(message);
        this.name = "ImageNormalizationError";
        this.cause = options?.cause;
    }
}

export interface DecodedImage {
    readonly source: CanvasImageSource;
    readonly width: number;
    readonly height: number;
    close?(): void;
}

export interface ImageNormalizationRuntime {
    decode(file: File): Promise<DecodedImage>;
    encode(
        image: DecodedImage,
        width: number,
        height: number,
        mimeType: "image/webp",
        quality: number,
    ): Promise<Blob>;
    blobToDataUrl(blob: Blob): Promise<string>;
}

function hasBytes(bytes: Uint8Array, expected: readonly number[], offset = 0): boolean {
    return expected.every((value, index) => bytes[offset + index] === value);
}

function signatureMatches(mimeType: string, bytes: Uint8Array): boolean {
    switch (mimeType) {
        case "image/jpeg":
            return hasBytes(bytes, [0xff, 0xd8, 0xff]);
        case "image/png":
            return hasBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
        case "image/webp":
            return hasBytes(bytes, [0x52, 0x49, 0x46, 0x46])
                && hasBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8);
        default:
            return false;
    }
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
    return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

function isAnimatedPng(bytes: Uint8Array): boolean {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let offset = 8;
    while (offset + 12 <= bytes.byteLength) {
        const length = view.getUint32(offset);
        const type = ascii(bytes, offset + 4, 4);
        if (type === "acTL") {
            return true;
        }
        if (type === "IDAT" || type === "IEND") {
            return false;
        }
        offset += 12 + length;
    }
    return false;
}

function isAnimatedWebp(bytes: Uint8Array): boolean {
    let offset = 12;
    while (offset + 8 <= bytes.byteLength) {
        const type = ascii(bytes, offset, 4);
        const length = new DataView(
            bytes.buffer,
            bytes.byteOffset + offset + 4,
            4,
        ).getUint32(0, true);
        if (type === "ANIM" || type === "ANMF") {
            return true;
        }
        if (type === "VP8X" && length >= 1 && offset + 8 < bytes.byteLength) {
            const animationFlag = 0x02;
            if ((bytes[offset + 8] & animationFlag) !== 0) {
                return true;
            }
        }
        offset += 8 + length + (length % 2);
    }
    return false;
}

function readBytes(blob: Blob): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => reader.result instanceof ArrayBuffer
            ? resolve(new Uint8Array(reader.result))
            : reject(new Error("File reading failed."));
        reader.onerror = () => reject(reader.error ?? new Error("File reading failed."));
        reader.onabort = () => reject(new Error("File reading was cancelled."));
        reader.readAsArrayBuffer(blob);
    });
}

async function validateSource(file: File): Promise<void> {
    if (file.size === 0) {
        throw new ImageNormalizationError("empty_source", "The image file is empty.");
    }
    if (file.size > IMAGE_NORMALIZATION_LIMITS.maxSourceBytes) {
        throw new ImageNormalizationError(
            "source_too_large",
            "Choose an image no larger than 10 MiB.",
        );
    }

    const mimeType = file.type.toLowerCase();
    if (!SUPPORTED_SOURCE_TYPES.has(mimeType)) {
        throw new ImageNormalizationError(
            "unsupported_type",
            "Use a JPEG, PNG, or WebP image.",
        );
    }

    const sourceBytes = await readBytes(file);
    if (!signatureMatches(mimeType, sourceBytes)) {
        throw new ImageNormalizationError(
            "invalid_signature",
            "The file contents do not match its image type.",
        );
    }
    if (
        (mimeType === "image/png" && isAnimatedPng(sourceBytes))
        || (mimeType === "image/webp" && isAnimatedWebp(sourceBytes))
    ) {
        throw new ImageNormalizationError(
            "animated_source",
            "Animated images are not supported.",
        );
    }
}

function scaledDimensions(width: number, height: number): { width: number; height: number } {
    const scale = Math.min(
        1,
        IMAGE_NORMALIZATION_LIMITS.maxLongestEdge / Math.max(width, height),
    );
    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale)),
    };
}

function shrinkDimensions(width: number, height: number): { width: number; height: number } {
    const longestEdge = Math.max(width, height);
    const nextLongestEdge = Math.max(
        MIN_LONGEST_EDGE,
        Math.floor(longestEdge * RESIZE_FACTOR),
    );
    const scale = nextLongestEdge / longestEdge;
    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale)),
    };
}

function normalizeDecodeError(error: unknown): ImageNormalizationError {
    if (error instanceof ImageNormalizationError) {
        return error;
    }
    return new ImageNormalizationError(
        "decode_failed",
        "The image could not be decoded safely.",
        { cause: error },
    );
}

function createBrowserRuntime(): ImageNormalizationRuntime {
    return {
        async decode(file) {
            if (typeof createImageBitmap === "function") {
                try {
                    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
                    return {
                        source: bitmap,
                        width: bitmap.width,
                        height: bitmap.height,
                        close: () => bitmap.close(),
                    };
                } catch {
                    // Fall through to the HTMLImageElement decoder for browsers
                    // whose createImageBitmap implementation rejects the option.
                }
            }

            const objectUrl = URL.createObjectURL(file);
            try {
                const image = await new Promise<HTMLImageElement>((resolve, reject) => {
                    const element = new Image();
                    element.onload = () => resolve(element);
                    element.onerror = () => reject(new Error("Image decoding failed."));
                    element.src = objectUrl;
                });
                return {
                    source: image,
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                };
            } finally {
                URL.revokeObjectURL(objectUrl);
            }
        },

        async encode(image, width, height, mimeType, quality) {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d");
            if (!context) {
                throw new Error("Canvas rendering is unavailable.");
            }
            context.drawImage(image.source, 0, 0, width, height);

            return new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (blob) => blob
                        ? resolve(blob)
                        : reject(new Error("Image encoding failed.")),
                    mimeType,
                    quality,
                );
            });
        },

        blobToDataUrl(blob) {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => typeof reader.result === "string"
                    ? resolve(reader.result)
                    : reject(new Error("Image conversion failed."));
                reader.onerror = () => reject(reader.error ?? new Error("Image conversion failed."));
                reader.onabort = () => reject(new Error("Image conversion was cancelled."));
                reader.readAsDataURL(blob);
            });
        },
    };
}

/**
 * Normalizes one locally supplied raster before it is embedded in resume JSON.
 * Canvas re-encoding removes source metadata, preserves WebP alpha, and avoids
 * changing the image again during subsequent resume saves.
 */
export async function normalizeImageFile(
    file: File,
    runtime: ImageNormalizationRuntime = createBrowserRuntime(),
): Promise<string> {
    await validateSource(file);

    let decoded: DecodedImage;
    try {
        decoded = await runtime.decode(file);
    } catch (error) {
        throw normalizeDecodeError(error);
    }

    try {
        if (
            !Number.isSafeInteger(decoded.width)
            || !Number.isSafeInteger(decoded.height)
            || decoded.width <= 0
            || decoded.height <= 0
        ) {
            throw new ImageNormalizationError(
                "invalid_dimensions",
                "The image has invalid dimensions.",
            );
        }

        if (decoded.width * decoded.height > IMAGE_NORMALIZATION_LIMITS.maxSourcePixels) {
            throw new ImageNormalizationError(
                "too_many_pixels",
                "Choose an image no larger than 20 megapixels.",
            );
        }

        let dimensions = scaledDimensions(decoded.width, decoded.height);
        while (true) {
            for (const quality of QUALITY_STEPS) {
                let output: Blob;
                try {
                    output = await runtime.encode(
                        decoded,
                        dimensions.width,
                        dimensions.height,
                        "image/webp",
                        quality,
                    );
                } catch (error) {
                    throw new ImageNormalizationError(
                        "encode_failed",
                        "The image could not be compressed.",
                        { cause: error },
                    );
                }

                if (output.size <= IMAGE_NORMALIZATION_LIMITS.maxOutputBytes) {
                    try {
                        return await runtime.blobToDataUrl(output);
                    } catch (error) {
                        throw new ImageNormalizationError(
                            "encode_failed",
                            "The compressed image could not be embedded.",
                            { cause: error },
                        );
                    }
                }
            }

            if (Math.max(dimensions.width, dimensions.height) <= MIN_LONGEST_EDGE) {
                break;
            }
            dimensions = shrinkDimensions(dimensions.width, dimensions.height);
        }

        throw new ImageNormalizationError(
            "output_too_large",
            "The image could not be compressed below 500 KiB.",
        );
    } finally {
        decoded.close?.();
    }
}
