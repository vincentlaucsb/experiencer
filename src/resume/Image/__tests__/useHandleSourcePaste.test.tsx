import { renderHook } from "@testing-library/react";

import useHandleSourcePaste from "../useHandleSourcePaste";

describe("useHandleSourcePaste", () => {
    test("prevents text insertion and sends an image file through normalization", () => {
        const file = new File(["image"], "portrait.png", { type: "image/png" });
        const normalizeFile = jest.fn(async () => undefined);
        const preventDefault = jest.fn();
        const stopPropagation = jest.fn();
        const { result } = renderHook(() => useHandleSourcePaste(normalizeFile));

        result.current({
            clipboardData: {
                items: [{
                    kind: "file",
                    type: "image/png",
                    getAsFile: () => file,
                }],
            },
            preventDefault,
            stopPropagation,
        } as unknown as React.ClipboardEvent<HTMLTextAreaElement>);

        expect(preventDefault).toHaveBeenCalled();
        expect(stopPropagation).toHaveBeenCalled();
        expect(normalizeFile).toHaveBeenCalledWith(file);
    });

    test("leaves ordinary text paste untouched", () => {
        const normalizeFile = jest.fn(async () => undefined);
        const preventDefault = jest.fn();
        const { result } = renderHook(() => useHandleSourcePaste(normalizeFile));

        result.current({
            clipboardData: {
                items: [{
                    kind: "string",
                    type: "text/plain",
                    getAsFile: () => null,
                }],
            },
            preventDefault,
            stopPropagation: jest.fn(),
        } as unknown as React.ClipboardEvent<HTMLTextAreaElement>);

        expect(preventDefault).not.toHaveBeenCalled();
        expect(normalizeFile).not.toHaveBeenCalled();
    });
});

