import {
    useLayoutEffect,
    useRef,
    useSyncExternalStore,
    type RefObject
} from "react";

import ProgressiveOverflowCoordinator, {
    type ProgressiveOverflowItem
} from "@/shared/services/ProgressiveOverflowCoordinator";
import type { HorizontalOverflowMeasure } from "@/shared/utils/overflow";

/** Thin React bridge for a component-owned progressive overflow coordinator. */
export default function useProgressiveOverflow<T extends HTMLElement>(
    ref: RefObject<T | null>,
    items: readonly ProgressiveOverflowItem[],
    measure?: HorizontalOverflowMeasure
): ReadonlySet<string> {
    const coordinatorRef = useRef<ProgressiveOverflowCoordinator | undefined>(undefined);
    if (!coordinatorRef.current) {
        coordinatorRef.current = new ProgressiveOverflowCoordinator();
    }
    const coordinator = coordinatorRef.current;

    useLayoutEffect(() => {
        coordinator.setItems(items);
    }, [coordinator, items]);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;
        return coordinator.connect(element, measure);
    }, [coordinator, measure, ref]);

    return useSyncExternalStore(
        coordinator.subscribe,
        () => coordinator.getSnapshot().collapsedIds,
        () => coordinator.getSnapshot().collapsedIds
    );
}
