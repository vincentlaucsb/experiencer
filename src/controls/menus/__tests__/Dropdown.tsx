/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";

import Dropdown from "@/controls/menus/Dropdown";
import ToolbarButton from "@/controls/toolbar/ToolbarButton";

const items = [{
    id: "item",
    label: "Item",
    onSelect: jest.fn()
}];

describe("Dropdown", () => {
    beforeEach(() => {
        items[0].onSelect.mockClear();
    });

    test("toggles the Popright menu from the trigger", () => {
        render(
            <Dropdown items={items} trigger={<button type="button">Open</button>} />
        );

        const trigger = screen.getByRole("button", { name: "Open" });
        expect(document.querySelector("[data-popright-menu]")).toBeNull();

        fireEvent.click(trigger);
        expect(screen.getByRole("menuitem", { name: "Item" })).toBeTruthy();

        fireEvent.click(trigger);
        expect(document.querySelector("[data-popright-menu]")).toBeNull();
    });

    test("closes when clicking outside", () => {
        render(
            <>
                <Dropdown items={items} trigger={<button type="button">Open</button>} />
                <button type="button">Outside</button>
            </>
        );

        fireEvent.click(screen.getByRole("button", { name: "Open" }));
        expect(screen.getByRole("menuitem", { name: "Item" })).toBeTruthy();

        fireEvent.mouseDown(screen.getByRole("button", { name: "Outside" }));
        expect(document.querySelector("[data-popright-menu]")).toBeNull();
    });

    test("works with ToolbarButton triggers", () => {
        render(
            <Dropdown
                items={items}
                trigger={<ToolbarButton text="Insert" icon="ui-add" />}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Insert" }));
        expect(screen.getByRole("menuitem", { name: "Item" })).toBeTruthy();
    });

    test("supports a class on the menu item wrapper", () => {
        render(
            <Dropdown
                items={items}
                trigger={<button type="button">Open</button>}
                wrapperClassName="document-selector"
            />
        );

        expect(screen.getByRole("button", { name: "Open" }).closest("li")?.className)
            .toBe("pure-menu-item document-selector");
    });

    test("closes after selecting a menu item", () => {
        render(
            <Dropdown items={items} trigger={<button type="button">Open</button>} />
        );

        fireEvent.click(screen.getByRole("button", { name: "Open" }));
        fireEvent.click(screen.getByRole("menuitem", { name: "Item" }));

        expect(items[0].onSelect).toHaveBeenCalledTimes(1);
        expect(document.querySelector("[data-popright-menu]")).toBeNull();
    });
});
