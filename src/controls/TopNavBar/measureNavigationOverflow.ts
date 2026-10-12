import {
    measureHorizontalChildOverflow,
    type HorizontalOverflowMeasure
} from "@/shared/utils/overflow";

/** Checks the navigation's peer groups without treating labels inside buttons as collisions. */
export const measureNavigationOverflow: HorizontalOverflowMeasure = (element, tolerance = 1) => {
    const outer = measureHorizontalChildOverflow(element, tolerance);
    const groups = element.querySelectorAll<HTMLElement>(
        ":scope > .brand-primary, :scope > .brand-secondary, #top-menu > .pure-menu-list"
    );
    let deficit = 0;
    groups.forEach(group => {
        const measurement = measureHorizontalChildOverflow(group, tolerance);
        if (measurement.isOverflowing) {
            deficit = Math.max(deficit, measurement.scrollWidth - measurement.clientWidth);
        }
    });
    const scrollWidth = Math.max(outer.scrollWidth, outer.clientWidth + deficit);
    return {
        clientWidth: outer.clientWidth,
        scrollWidth,
        isOverflowing: outer.clientWidth > 0 && scrollWidth > outer.clientWidth + tolerance
    };
};
