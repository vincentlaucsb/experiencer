export type RectangleBounds = Pick<DOMRectReadOnly, "left" | "right" | "top" | "bottom">;

export interface RectangleIntersection {
    width: number;
    height: number;
}

export interface ElementCollision {
    first: Element;
    second: Element;
    intersection: RectangleIntersection;
}

/** Returns positive overlap on both axes, ignoring edge contact and rounding noise. */
export function getRectangleIntersection(
    first: RectangleBounds,
    second: RectangleBounds,
    tolerance = 1
): RectangleIntersection | undefined {
    const width = Math.min(first.right, second.right) - Math.max(first.left, second.left);
    const height = Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top);
    return width > tolerance && height > tolerance ? { width, height } : undefined;
}

/** Measures explicitly chosen peers; hidden elements and ancestor/descendant pairs cannot collide. */
export function findElementCollisions(
    elements: Iterable<Element>,
    tolerance = 1
): ElementCollision[] {
    const measured = [...new Set(elements)].map(element => ({
        element,
        bounds: element.getBoundingClientRect()
    })).filter(({ element, bounds }) => {
        if (bounds.width <= 0 || bounds.height <= 0) return false;
        const visibility = element.ownerDocument.defaultView?.getComputedStyle(element).visibility;
        return visibility !== "hidden" && visibility !== "collapse";
    });
    const collisions: ElementCollision[] = [];
    for (let index = 0; index < measured.length; index += 1) {
        const first = measured[index];
        for (const second of measured.slice(index + 1)) {
            if (first.element.contains(second.element) || second.element.contains(first.element)) continue;
            const intersection = getRectangleIntersection(first.bounds, second.bounds, tolerance);
            if (intersection) {
                collisions.push({ first: first.element, second: second.element, intersection });
            }
        }
    }
    return collisions;
}
