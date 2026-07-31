import { act, renderHook } from "@testing-library/react";

import {
    ImageNormalizationError,
    normalizeImageFile,
} from "@/shared/images/normalizeImageFile";
import useImageNormalization from "../useImageNormalization";

jest.mock("@/shared/images/normalizeImageFile", () => {
    const actual = jest.requireActual("@/shared/images/normalizeImageFile");
    return {
        ...actual,
        normalizeImageFile: jest.fn(),
    };
});

const normalizeImageFileMock = normalizeImageFile as jest.MockedFunction<typeof normalizeImageFile>;

describe("useImageNormalization", () => {
    beforeEach(() => {
        normalizeImageFileMock.mockReset();
    });

    test("publishes a normalized data URL and clears the processing state", async () => {
        normalizeImageFileMock.mockResolvedValue("data:image/webp;base64,result");
        const onNormalized = jest.fn();
        const { result } = renderHook(() => useImageNormalization(onNormalized));
        const file = new File(["jpeg"], "portrait.jpg", { type: "image/jpeg" });

        await act(async () => {
            await result.current.normalizeFile(file);
        });

        expect(onNormalized).toHaveBeenCalledWith("data:image/webp;base64,result");
        expect(result.current.error).toBeNull();
        expect(result.current.isProcessing).toBe(false);
    });

    test("exposes the safe normalization error for the image editor UI", async () => {
        normalizeImageFileMock.mockRejectedValue(
            new ImageNormalizationError("unsupported_type", "Use a JPEG, PNG, or WebP image."),
        );
        const { result } = renderHook(() => useImageNormalization(jest.fn()));

        await act(async () => {
            await result.current.normalizeFile(
                new File(["svg"], "graphic.svg", { type: "image/svg+xml" }),
            );
        });

        expect(result.current.error).toBe("Use a JPEG, PNG, or WebP image.");
        expect(result.current.isProcessing).toBe(false);
    });

    test("does not let an older request overwrite a newer selection", async () => {
        let resolveFirst: ((value: string) => void) | undefined;
        normalizeImageFileMock
            .mockReturnValueOnce(new Promise((resolve) => {
                resolveFirst = resolve;
            }))
            .mockResolvedValueOnce("data:image/webp;base64,newer");
        const onNormalized = jest.fn();
        const { result } = renderHook(() => useImageNormalization(onNormalized));

        let first: Promise<void>;
        await act(async () => {
            first = result.current.normalizeFile(
                new File(["first"], "first.jpg", { type: "image/jpeg" }),
            );
            await result.current.normalizeFile(
                new File(["second"], "second.jpg", { type: "image/jpeg" }),
            );
        });
        await act(async () => {
            resolveFirst?.("data:image/webp;base64,older");
            await first!;
        });

        expect(onNormalized).toHaveBeenCalledTimes(1);
        expect(onNormalized).toHaveBeenCalledWith("data:image/webp;base64,newer");
    });
});

