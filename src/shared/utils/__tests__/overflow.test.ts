import {
    measureHorizontalOverflow,
    observeHorizontalOverflow
} from "@/shared/utils/overflow";

function mockWidths(element: HTMLElement, clientWidth: number, scrollWidth: number) {
    Object.defineProperty(element, "clientWidth", {
        configurable: true,
        value: clientWidth
    });
    Object.defineProperty(element, "scrollWidth", {
        configurable: true,
        value: scrollWidth
    });
}

test("measures horizontal overflow with a one-pixel tolerance", () => {
    const element = document.createElement("div");
    mockWidths(element, 100, 101);

    expect(measureHorizontalOverflow(element)).toEqual({
        clientWidth: 100,
        scrollWidth: 101,
        isOverflowing: false
    });

    mockWidths(element, 100, 102);
    expect(measureHorizontalOverflow(element).isOverflowing).toBe(true);
});

test("notifies only when the measured dimensions change", () => {
    const element = document.createElement("div");
    mockWidths(element, 100, 100);
    const onChange = jest.fn();
    const requestFrame = jest.spyOn(window, "requestAnimationFrame")
        .mockImplementation((callback) => {
            callback(0);
            return 1;
        });
    const stopObserving = observeHorizontalOverflow(element, onChange);

    try {
        expect(onChange).toHaveBeenCalledTimes(1);
        window.dispatchEvent(new Event("resize"));
        expect(onChange).toHaveBeenCalledTimes(1);

        mockWidths(element, 100, 120);
        window.dispatchEvent(new Event("resize"));
        expect(onChange).toHaveBeenCalledTimes(2);
    }
    finally {
        stopObserving();
        requestFrame.mockRestore();
    }
});
