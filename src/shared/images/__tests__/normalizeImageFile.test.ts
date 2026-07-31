import {
    DecodedImage,
    IMAGE_NORMALIZATION_LIMITS,
    ImageNormalizationError,
    ImageNormalizationRuntime,
    normalizeImageFile,
} from "../normalizeImageFile";

const JPEG_HEADER = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
const PNG_HEADER = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const ANIMATED_WEBP = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0x0e, 0x00, 0x00, 0x00,
    0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x58,
    0x0a, 0x00, 0x00, 0x00, 0x02, 0x00,
]);

function imageFile(
    header: Uint8Array = JPEG_HEADER,
    type = "image/jpeg",
    size = header.byteLength,
): File {
    const padding = Math.max(0, size - header.byteLength);
    const headerBytes = header.buffer.slice(
        header.byteOffset,
        header.byteOffset + header.byteLength,
    ) as ArrayBuffer;
    return new File([headerBytes, new ArrayBuffer(padding)], "portrait", { type });
}

function runtime(
    dimensions = { width: 800, height: 600 },
    encodedSizes: number[] = [100],
): jest.Mocked<ImageNormalizationRuntime> & { decoded: DecodedImage } {
    const decoded: DecodedImage = {
        source: {} as CanvasImageSource,
        ...dimensions,
        close: jest.fn(),
    };
    let encodeIndex = 0;
    return {
        decoded,
        decode: jest.fn(async (_file: File) => decoded),
        encode: jest.fn(async (
            _image: DecodedImage,
            _width: number,
            _height: number,
            _mimeType: "image/webp",
            _quality: number,
        ) => {
            const size = encodedSizes[Math.min(encodeIndex, encodedSizes.length - 1)];
            encodeIndex += 1;
            return new Blob([new ArrayBuffer(size)], { type: "image/webp" });
        }),
        blobToDataUrl: jest.fn(async (blob: Blob) => `data:${blob.type};base64,normalized`),
    };
}

async function expectCode(
    promise: Promise<unknown>,
    code: ImageNormalizationError["code"],
): Promise<void> {
    await expect(promise).rejects.toMatchObject({ code });
}

describe("normalizeImageFile", () => {
    test("rejects source bytes above 10 MiB before decoding", async () => {
        const testRuntime = runtime();
        const file = imageFile(
            JPEG_HEADER,
            "image/jpeg",
            IMAGE_NORMALIZATION_LIMITS.maxSourceBytes + 1,
        );

        await expectCode(normalizeImageFile(file, testRuntime), "source_too_large");
        expect(testRuntime.decode).not.toHaveBeenCalled();
    });

    test("accepts the exact source-byte boundary", async () => {
        const testRuntime = runtime();
        const file = imageFile(
            JPEG_HEADER,
            "image/jpeg",
            IMAGE_NORMALIZATION_LIMITS.maxSourceBytes,
        );

        await expect(normalizeImageFile(file, testRuntime))
            .resolves.toBe("data:image/webp;base64,normalized");
        expect(testRuntime.decode).toHaveBeenCalledWith(file);
    });

    test.each([
        ["image/svg+xml", new Uint8Array([0x3c, 0x73, 0x76, 0x67]), "unsupported_type"],
        ["image/jpeg", PNG_HEADER, "invalid_signature"],
    ])("rejects unsafe or mismatched input (%s)", async (type, header, code) => {
        const testRuntime = runtime();
        await expectCode(
            normalizeImageFile(imageFile(header, type), testRuntime),
            code as ImageNormalizationError["code"],
        );
        expect(testRuntime.decode).not.toHaveBeenCalled();
    });

    test("rejects animated raster input before decoding", async () => {
        const testRuntime = runtime();

        await expectCode(
            normalizeImageFile(imageFile(ANIMATED_WEBP, "image/webp"), testRuntime),
            "animated_source",
        );
        expect(testRuntime.decode).not.toHaveBeenCalled();
    });

    test("rejects decoded images above 20 megapixels and releases the decoder", async () => {
        const testRuntime = runtime({ width: 5_001, height: 4_000 });

        await expectCode(
            normalizeImageFile(imageFile(), testRuntime),
            "too_many_pixels",
        );
        expect(testRuntime.decoded.close).toHaveBeenCalled();
        expect(testRuntime.encode).not.toHaveBeenCalled();
    });

    test("resizes the longest edge to 1600 without upscaling", async () => {
        const largeRuntime = runtime({ width: 4_000, height: 3_000 });
        await normalizeImageFile(imageFile(), largeRuntime);
        expect(largeRuntime.encode).toHaveBeenCalledWith(
            largeRuntime.decoded,
            1_600,
            1_200,
            "image/webp",
            0.9,
        );

        const smallRuntime = runtime({ width: 640, height: 480 });
        await normalizeImageFile(imageFile(), smallRuntime);
        expect(smallRuntime.encode).toHaveBeenCalledWith(
            smallRuntime.decoded,
            640,
            480,
            "image/webp",
            0.9,
        );
    });

    test("lowers quality before reducing dimensions", async () => {
        const tooLarge = IMAGE_NORMALIZATION_LIMITS.maxOutputBytes + 1;
        const testRuntime = runtime(
            { width: 1_600, height: 1_200 },
            [tooLarge, tooLarge, 200],
        );

        await normalizeImageFile(imageFile(), testRuntime);

        expect(testRuntime.encode.mock.calls.map((call) => call[4]))
            .toEqual([0.9, 0.82, 0.74]);
        expect(testRuntime.encode.mock.calls.map((call) => [call[1], call[2]]))
            .toEqual([[1_600, 1_200], [1_600, 1_200], [1_600, 1_200]]);
    });

    test("progressively reduces dimensions when quality alone is insufficient", async () => {
        const tooLarge = IMAGE_NORMALIZATION_LIMITS.maxOutputBytes + 1;
        const sizes = [
            ...Array(7).fill(tooLarge),
            200,
        ];
        const testRuntime = runtime({ width: 1_600, height: 1_200 }, sizes);

        await normalizeImageFile(imageFile(), testRuntime);

        expect(testRuntime.encode).toHaveBeenLastCalledWith(
            testRuntime.decoded,
            1_360,
            1_020,
            "image/webp",
            0.9,
        );
    });

    test("returns the bounded encoded data URL and closes the decoded image", async () => {
        const testRuntime = runtime({ width: 800, height: 600 }, [500 * 1024]);

        const result = await normalizeImageFile(imageFile(), testRuntime);

        expect(result).toBe("data:image/webp;base64,normalized");
        expect(testRuntime.blobToDataUrl).toHaveBeenCalledWith(
            expect.objectContaining({ size: 500 * 1024, type: "image/webp" }),
        );
        expect(testRuntime.decoded.close).toHaveBeenCalled();
    });

    test("turns encoder failures into a stable user-facing error", async () => {
        const testRuntime = runtime();
        testRuntime.encode.mockRejectedValueOnce(new Error("canvas failed"));

        await expect(normalizeImageFile(imageFile(), testRuntime)).rejects.toMatchObject({
            code: "encode_failed",
            message: "The image could not be compressed.",
        });
        expect(testRuntime.decoded.close).toHaveBeenCalled();
    });
});
