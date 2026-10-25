/**
 * @jest-environment jsdom
 */
import { fireEvent, render } from "@testing-library/react";
import { ContainerPresentation } from "@/resume/infrastructure/Container";
import {
    isTouchClick,
    notePointerDown,
    recordSelectingTap,
    resetTouchDoubleTap,
    takeDoubleTapTarget,
    TOUCH_DOUBLE_TAP_MS,
    TOUCH_DOUBLE_TAP_SLOP_PX
} from "@/resume/infrastructure/touchDoubleTap";

jest.mock("@/resume/infrastructure/OverlayEditor", () => ({
    __esModule: true,
    default: () => null
}));

beforeEach(() => resetTouchDoubleTap());

describe("touch double-tap tracking", () => {
    test("a quick nearby second tap returns the node the first tap selected", () => {
        recordSelectingTap("first", 100, 200, 1000);
        expect(takeDoubleTapTarget(110, 205, 1000 + TOUCH_DOUBLE_TAP_MS - 1)).toBe("first");
    });

    test("a slow, distant, or repeated second tap is not a double-tap", () => {
        recordSelectingTap("first", 100, 200, 1000);
        expect(takeDoubleTapTarget(100, 200, 1000 + TOUCH_DOUBLE_TAP_MS + 1)).toBeUndefined();

        recordSelectingTap("first", 100, 200, 1000);
        expect(takeDoubleTapTarget(100 + TOUCH_DOUBLE_TAP_SLOP_PX + 1, 200, 1010)).toBeUndefined();

        recordSelectingTap("first", 100, 200, 1000);
        expect(takeDoubleTapTarget(100, 200, 1010)).toBe("first");
        expect(takeDoubleTapTarget(100, 200, 1020)).toBeUndefined();
    });

    test("falls back to the last press type when a click carries no pointer type", () => {
        const click = new MouseEvent("click");
        notePointerDown("touch");
        expect(isTouchClick(click)).toBe(true);
        notePointerDown("mouse");
        expect(isTouchClick(click)).toBe(false);
    });
});

describe("ContainerPresentation touch double-tap", () => {
    function renderSiblings(selected?: string) {
        const onSelect = jest.fn();
        const onEdit = jest.fn();
        const node = (uuid: string) => (
            <ContainerPresentation
                key={uuid}
                id={[0]}
                uuid={uuid}
                isSelected={selected === uuid}
                isEditing={false}
                onSelect={onSelect}
                onEdit={onEdit}
                onContextMenuOpen={jest.fn()}
            >
                <span>{uuid}</span>
            </ContainerPresentation>
        );
        const view = render(<div>{node("first")}{node("second")}</div>);
        const get = (uuid: string) => view.container.querySelector(`[data-uuid="${uuid}"]`) as HTMLElement;
        return { onSelect, onEdit, get };
    }

    function tap(element: HTMLElement, x: number, y: number, pointerType = "touch") {
        // jsdom has no PointerEvent, so give the press its pointer type directly.
        const press = new MouseEvent("pointerdown", { bubbles: true, clientX: x, clientY: y });
        Object.defineProperty(press, "pointerType", { value: pointerType });
        fireEvent(element, press);
        fireEvent.click(element, { clientX: x, clientY: y });
    }

    test("the second tap edits the first tap's node when the layout moved a neighbour under the finger", () => {
        const { onSelect, onEdit, get } = renderSiblings();
        tap(get("first"), 40, 300);
        expect(onSelect).toHaveBeenCalledWith("first");

        tap(get("second"), 42, 302);
        expect(onEdit).toHaveBeenCalledWith("first");
        expect(onSelect).toHaveBeenCalledTimes(1);
    });

    test("mouse clicks keep the desktop select-then-edit behaviour", () => {
        const { onSelect, onEdit, get } = renderSiblings();
        tap(get("first"), 40, 300, "mouse");
        tap(get("second"), 40, 300, "mouse");
        expect(onSelect.mock.calls).toEqual([["first"], ["second"]]);
        expect(onEdit).not.toHaveBeenCalled();
    });

    test("a distant second tap selects the node under it", () => {
        const { onSelect, onEdit, get } = renderSiblings();
        tap(get("first"), 40, 300);
        tap(get("second"), 40, 300 + TOUCH_DOUBLE_TAP_SLOP_PX * 3);
        expect(onSelect.mock.calls).toEqual([["first"], ["second"]]);
        expect(onEdit).not.toHaveBeenCalled();
    });
});
