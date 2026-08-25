import {
    measureHorizontalChildOverflow,
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

test("detects overflow hidden inside shrinkable flex children", () => {
    const element = document.createElement("div");
    const primary = document.createElement("div");
    const secondary = document.createElement("div");
    element.append(primary, secondary);
    mockWidths(element, 100, 100);
    mockWidths(primary, 60, 70);
    mockWidths(secondary, 40, 50);

    expect(measureHorizontalOverflow(element).isOverflowing).toBe(false);
    expect(measureHorizontalChildOverflow(element)).toEqual({
        clientWidth: 100,
        scrollWidth: 120,
        isOverflowing: true
    });
});

test("excludes container padding from the space available to flex children", () => {
    const element = document.createElement("div");
    const child = document.createElement("div");
    element.append(child);
    element.style.padding = "0 10px";
    mockWidths(element, 100, 100);
    mockWidths(child, 85, 85);

    expect(measureHorizontalChildOverflow(element)).toEqual({
        clientWidth: 80,
        scrollWidth: 85,
        isOverflowing: true
    });
});

test("does not combine children that wrap onto separate rows", () => {
    const element = document.createElement("div");
    const primary = document.createElement("div");
    const secondary = document.createElement("div");
    element.append(primary, secondary);
    mockWidths(element, 100, 100);
    mockWidths(primary, 100, 100);
    mockWidths(secondary, 90, 90);
    jest.spyOn(primary, "getBoundingClientRect").mockReturnValue({
        width: 100,
        height: 40,
        top: 0,
        bottom: 40,
        left: 0,
        right: 100,
        x: 0,
        y: 0,
        toJSON: () => undefined
    });
    jest.spyOn(secondary, "getBoundingClientRect").mockReturnValue({
        width: 90,
        height: 40,
        top: 50,
        bottom: 90,
        left: 0,
        right: 90,
        x: 0,
        y: 50,
        toJSON: () => undefined
    });

    expect(measureHorizontalChildOverflow(element).isOverflowing).toBe(false);
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
