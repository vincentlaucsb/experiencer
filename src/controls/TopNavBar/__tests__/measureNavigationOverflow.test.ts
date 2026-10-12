import { measureNavigationOverflow } from "../measureNavigationOverflow";

test("finds collisions inside a nested menu even when outer group widths fit", () => {
    const element = document.createElement("div");
    element.innerHTML = '<div class="brand-primary"><div id="top-menu"><ul class="pure-menu-list">'
        + '<li></li><li></li></ul></div></div><div class="brand-secondary"></div>';
    const widths = (target: Element, width: number) => Object.defineProperties(target, {
        clientWidth: { configurable: true, value: width },
        scrollWidth: { configurable: true, value: width }
    });
    widths(element, 1000);
    widths(element.children[0], 600);
    widths(element.children[1], 200);
    const menu = element.querySelector("#top-menu")!;
    const list = menu.children[0];
    widths(menu, 600);
    widths(list, 600);
    Array.from(list.children).forEach((child, index) => {
        widths(child, 100);
        const left = index === 0 ? 100 : 150;
        jest.spyOn(child, "getBoundingClientRect").mockReturnValue({
            left, right: left + 100, top: 0, bottom: 30, width: 100, height: 30,
            x: left, y: 0, toJSON: () => undefined
        });
    });
    expect(measureNavigationOverflow(element)).toEqual({
        clientWidth: 1000, scrollWidth: 1050, isOverflowing: true
    });
});
