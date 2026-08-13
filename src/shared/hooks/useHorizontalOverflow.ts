import { useLayoutEffect, useState, type RefObject } from "react";

import {
    observeHorizontalOverflow,
    type HorizontalOverflowMeasurement
} from "@/shared/utils/overflow";

const EMPTY_MEASUREMENT: HorizontalOverflowMeasurement = {
    clientWidth: 0,
    scrollWidth: 0,
    isOverflowing: false
};

/** Thin React subscription bridge for the DOM-only overflow observer. */
export default function useHorizontalOverflow<T extends HTMLElement>(
    ref: RefObject<T | null>,
    options?: {
        tolerance?: number;
        observeMutations?: boolean;
    }
): HorizontalOverflowMeasurement {
    const tolerance = options?.tolerance ?? 1;
    const observeMutations = options?.observeMutations ?? false;
    const [measurement, setMeasurement] = useState(EMPTY_MEASUREMENT);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;

        return observeHorizontalOverflow(element, setMeasurement, {
            tolerance,
            observeMutations
        });
    }, [observeMutations, ref, tolerance]);

    return measurement;
}
