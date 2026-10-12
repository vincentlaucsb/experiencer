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

test("detects sibling collisions entirely inside the container and records a width deficit", () => {
    const element = document.createElement("div");
    const first = document.createElement("div");
    const second = document.createElement("div");
    element.append(first, second);
    mockWidths(element, 500, 500);
    mockWidths(first, 100, 100);
    mockWidths(second, 100, 100);
    const bounds = (left: number): DOMRect => ({
        left, right: left + 100, top: 0, bottom: 30, width: 100, height: 30,
        x: left, y: 0, toJSON: () => undefined
    });
    jest.spyOn(first, "getBoundingClientRect").mockReturnValue(bounds(100));
    jest.spyOn(second, "getBoundingClientRect").mockReturnValue(bounds(175));
    expect(measureHorizontalOverflow(element).isOverflowing).toBe(false);
    expect(measureHorizontalChildOverflow(element)).toEqual({
        clientWidth: 500, scrollWidth: 525, isOverflowing: true
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

test("does not count margins or gaps belonging to display-none controls", () => {
    const element = document.createElement("div");
    const hidden = document.createElement("span");
    const visible = document.createElement("button");
    element.append(hidden, visible);
    element.style.gap = "8px";
    hidden.style.display = "none";
    hidden.style.marginRight = "8px";
    mockWidths(element, 100, 100);
    mockWidths(visible, 100, 100);
    expect(measureHorizontalChildOverflow(element).isOverflowing).toBe(false);
});

test("does not accumulate integer scroll-width rounding across fractional-width peers", () => {
    const element = document.createElement("div");
    mockWidths(element, 150, 150);
    for (let index = 0; index < 4; index += 1) {
        const child = document.createElement("span");
        element.append(child);
        mockWidths(child, 38, 38);
        const left = index * 37.6;
        jest.spyOn(child, "getBoundingClientRect").mockReturnValue({
            left, right: left + 37.6, top: 0, bottom: 30, width: 37.6, height: 30,
            x: left, y: 0, toJSON: () => undefined
        });
    }
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

test("observes changing descendant sizes and releases removed targets", async () => {
    const observed = new Set<Element>();
    let notifyResize: () => void = () => undefined;
    const previousObserver = globalThis.ResizeObserver;
    // ResizeObserver is a browser boundary; use its real MutationObserver counterpart below.
    class TestResizeObserver {
        constructor(callback: () => void) { notifyResize = callback; }
        observe = (target: Element) => { observed.add(target); };
        unobserve = (target: Element) => { observed.delete(target); };
        disconnect = () => { observed.clear(); };
    }
    globalThis.ResizeObserver = TestResizeObserver as unknown as typeof ResizeObserver;
    const element = document.createElement("div");
    const child = document.createElement("span");
    element.append(child);
    const onChange = jest.fn();
    const requestFrame = jest.spyOn(window, "requestAnimationFrame").mockImplementation(callback => {
        callback(0);
        return 1;
    });
    const stop = observeHorizontalOverflow(element, onChange, {
        observeMutations: true, observeDescendants: true, notifyOnEveryObservation: true
    });
    try {
        expect(observed.has(child)).toBe(true);
        notifyResize();
        expect(onChange).toHaveBeenCalledTimes(2);
        const replacement = document.createElement("button");
        child.replaceWith(replacement);
        await Promise.resolve();
        expect(observed.has(child)).toBe(false);
        expect(observed.has(replacement)).toBe(true);
        expect(onChange).toHaveBeenCalledTimes(3);
        stop();
        expect(observed.size).toBe(0);
        notifyResize();
        expect(onChange).toHaveBeenCalledTimes(3);
    } finally {
        stop();
        requestFrame.mockRestore();
        globalThis.ResizeObserver = previousObserver;
    }
});
