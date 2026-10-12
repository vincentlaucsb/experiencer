import { findElementCollisions, getRectangleIntersection } from "../collision";

function rectangle(left: number, top: number, width: number, height: number): DOMRect {
    return { left, top, width, height, right: left + width, bottom: top + height,
        x: left, y: top, toJSON: () => undefined };
}

test("requires positive overlap on both axes beyond rounding tolerance", () => {
    const first = rectangle(0, 0, 100, 30);
    expect(getRectangleIntersection(first, rectangle(80, 10, 100, 30)))
        .toEqual({ width: 20, height: 20 });
    expect(getRectangleIntersection(first, rectangle(100, 0, 100, 30))).toBeUndefined();
    expect(getRectangleIntersection(first, rectangle(99.5, 0, 100, 30))).toBeUndefined();
    expect(getRectangleIntersection(first, rectangle(80, 30, 100, 30))).toBeUndefined();
    expect(getRectangleIntersection(first, rectangle(80, 29.5, 100, 30))).toBeUndefined();
    expect(getRectangleIntersection(first, rectangle(99.5, 0, 100, 30), 0))
        .toEqual({ width: 0.5, height: 30 });
});

test("finds peer collisions without duplicate, hidden, or ancestor pairs", () => {
    const parent = document.createElement("div");
    const first = document.createElement("button");
    const label = document.createElement("span");
    const second = document.createElement("button");
    const hidden = document.createElement("button");
    parent.append(first, second, hidden);
    first.append(label);
    jest.spyOn(parent, "getBoundingClientRect").mockReturnValue(rectangle(0, 0, 300, 30));
    jest.spyOn(first, "getBoundingClientRect").mockReturnValue(rectangle(0, 0, 100, 30));
    jest.spyOn(label, "getBoundingClientRect").mockReturnValue(rectangle(0, 0, 40, 30));
    jest.spyOn(second, "getBoundingClientRect").mockReturnValue(rectangle(80, 0, 100, 30));
    hidden.style.visibility = "hidden";
    jest.spyOn(hidden, "getBoundingClientRect").mockReturnValue(rectangle(0, 0, 100, 30));
    expect(findElementCollisions([parent, first, label, second, second, hidden]))
        .toEqual([{ first, second, intersection: { width: 20, height: 30 } }]);
});
