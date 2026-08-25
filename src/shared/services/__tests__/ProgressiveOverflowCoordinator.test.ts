/**
 * @jest-environment jsdom
 */
import ProgressiveOverflowCoordinator from "../ProgressiveOverflowCoordinator";
import type {
    HorizontalOverflowMeasurement,
    HorizontalOverflowObserverOptions
} from "@/shared/utils/overflow";

function createHarness(options: { clientWidth?: number; scrollWidth?: number } = {}) {
    let clientWidth = options.clientWidth ?? 500;
    let scrollWidth = options.scrollWidth ?? 1000;
    let callback: ((measurement: HorizontalOverflowMeasurement) => void) | undefined;
    const stop = jest.fn();
    const element = document.createElement("div");
    Object.defineProperties(element, {
        clientWidth: { configurable: true, get: () => clientWidth },
        scrollWidth: { configurable: true, get: () => scrollWidth }
    });
    const observe = jest.fn((
        observed: HTMLElement,
        onChange: (measurement: HorizontalOverflowMeasurement) => void,
        _observerOptions?: HorizontalOverflowObserverOptions
    ) => {
        callback = onChange;
        onChange({
            clientWidth: observed.clientWidth,
            scrollWidth: observed.scrollWidth,
            isOverflowing: observed.scrollWidth > observed.clientWidth + 1
        });
        return stop;
    });
    const coordinator = new ProgressiveOverflowCoordinator({ observe });

    return {
        coordinator,
        element,
        observe,
        stop,
        emit() {
            callback?.({
                clientWidth,
                scrollWidth,
                isOverflowing: scrollWidth > clientWidth + 1
            });
        },
        resize(nextClientWidth: number, nextScrollWidth: number) {
            clientWidth = nextClientWidth;
            scrollWidth = nextScrollWidth;
        }
    };
}

test("collapses one item per observation in priority and declaration order", () => {
    const harness = createHarness();
    harness.coordinator.setItems([
        { id: "Editing", priority: 100 },
        { id: "Page Setup", priority: 50 },
        { id: "AI Review", priority: 0 }
    ]);

    harness.coordinator.connect(harness.element);
    expect([...harness.coordinator.getSnapshot().collapsedIds]).toEqual(["AI Review"]);

    harness.emit();
    expect([...harness.coordinator.getSnapshot().collapsedIds]).toEqual([
        "AI Review",
        "Page Setup"
    ]);
});

test("restores a collapsed item from its cached required width with headroom", () => {
    const harness = createHarness({ clientWidth: 500, scrollWidth: 1000 });
    harness.coordinator.setItems([{ id: "AI Review", priority: 0 }]);
    harness.coordinator.connect(harness.element);
    expect(harness.coordinator.getSnapshot().collapsedIds.has("AI Review")).toBe(true);

    // Real browsers report scrollWidth equal to clientWidth when content fits.
    harness.resize(1023, 1023);
    harness.emit();
    expect(harness.coordinator.getSnapshot().collapsedIds.has("AI Review")).toBe(true);

    harness.resize(1024, 1024);
    harness.emit();
    expect(harness.coordinator.getSnapshot().collapsedIds.has("AI Review")).toBe(false);
});

test("expands higher-priority and later equal-priority items first", () => {
    const harness = createHarness({ clientWidth: 500, scrollWidth: 900 });
    harness.coordinator.setItems([
        { id: "first", priority: 50 },
        { id: "second", priority: 50 },
        { id: "editing", priority: 100 }
    ]);
    harness.coordinator.connect(harness.element);
    harness.emit();
    harness.emit();
    expect([...harness.coordinator.getSnapshot().collapsedIds]).toEqual([
        "first",
        "second",
        "editing"
    ]);

    harness.resize(1000, 1000);
    harness.emit();
    expect([...harness.coordinator.getSnapshot().collapsedIds]).toEqual([
        "first",
        "second"
    ]);
    harness.emit();
    expect([...harness.coordinator.getSnapshot().collapsedIds]).toEqual(["first"]);
});

test("removes stale collapsed identities when the projected items change", () => {
    const harness = createHarness();
    harness.coordinator.setItems([{ id: "root" }]);
    harness.coordinator.connect(harness.element);
    expect(harness.coordinator.getSnapshot().collapsedIds.has("root")).toBe(true);

    harness.coordinator.setItems([{ id: "selected" }]);
    expect([...harness.coordinator.getSnapshot().collapsedIds]).toEqual([]);
});

test("disconnects the observer idempotently", () => {
    const harness = createHarness();
    harness.coordinator.setItems([{ id: "one" }]);
    const disconnect = harness.coordinator.connect(harness.element);

    disconnect();
    disconnect();
    expect(harness.stop).toHaveBeenCalledTimes(1);
});
