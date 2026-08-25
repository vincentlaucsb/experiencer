import {
    measureHorizontalOverflow,
    observeHorizontalOverflow,
    type HorizontalOverflowMeasure
} from "@/shared/utils/overflow";

export interface ProgressiveOverflowItem {
    id: string;
    /** Lower priorities collapse first; higher priorities expand first. */
    priority?: number;
}

export interface ProgressiveOverflowSnapshot {
    collapsedIds: ReadonlySet<string>;
}

export interface ProgressiveOverflowCoordinatorOptions {
    expansionBufferPx?: number;
    observe?: typeof observeHorizontalOverflow;
}

const DEFAULT_PRIORITY = 50;
const DEFAULT_EXPANSION_BUFFER_PX = 24;

/**
 * Owns progressive horizontal compaction independently from any view framework.
 *
 * The width observed immediately before an item collapses is the minimum width
 * needed to restore that item. This is intentionally not derived from
 * `clientWidth - scrollWidth`: browsers clamp `scrollWidth` to at least
 * `clientWidth`, so that difference cannot describe free space.
 */
export default class ProgressiveOverflowCoordinator {
    private readonly expansionBufferPx: number;
    private readonly observe: typeof observeHorizontalOverflow;
    private readonly listeners = new Set<() => void>();
    private readonly requiredWidthById = new Map<string, number>();
    private items: ProgressiveOverflowItem[] = [];
    private snapshot: ProgressiveOverflowSnapshot = { collapsedIds: new Set() };
    private element?: HTMLElement;
    private measure: HorizontalOverflowMeasure = measureHorizontalOverflow;
    private stopObserving?: () => void;
    private connection = 0;

    constructor(options: ProgressiveOverflowCoordinatorOptions = {}) {
        this.expansionBufferPx = options.expansionBufferPx
            ?? DEFAULT_EXPANSION_BUFFER_PX;
        this.observe = options.observe ?? observeHorizontalOverflow;
    }

    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    getSnapshot = () => this.snapshot;

    setItems(items: readonly ProgressiveOverflowItem[]): void {
        const nextItems = items.map((item) => ({
            id: item.id,
            priority: item.priority ?? DEFAULT_PRIORITY
        }));
        const itemsChanged = !sameItems(this.items, nextItems);
        const availableIds = new Set(nextItems.map((item) => item.id));
        const nextCollapsed = new Set(
            [...this.snapshot.collapsedIds].filter((id) => availableIds.has(id))
        );

        for (const id of this.requiredWidthById.keys()) {
            if (!availableIds.has(id)) {
                this.requiredWidthById.delete(id);
            }
        }

        this.items = nextItems;
        if (!sameIds(this.snapshot.collapsedIds, nextCollapsed)) {
            this.publish(nextCollapsed);
            return;
        }

        if (itemsChanged) {
            this.reconcile();
        }
    }

    connect(
        element: HTMLElement,
        measure: HorizontalOverflowMeasure = measureHorizontalOverflow
    ): () => void {
        this.disconnect();
        this.element = element;
        this.measure = measure;
        const connection = ++this.connection;
        this.stopObserving = this.observe(
            element,
            this.reconcile,
            {
                observeMutations: true,
                notifyOnEveryObservation: true
            }
        );

        return () => {
            if (connection === this.connection) {
                this.disconnect();
            }
        };
    }

    disconnect(): void {
        this.connection += 1;
        this.stopObserving?.();
        this.stopObserving = undefined;
        this.element = undefined;
        this.measure = measureHorizontalOverflow;
    }

    private readonly reconcile = (): void => {
        const element = this.element;
        if (!element || element.clientWidth <= 0 || this.items.length === 0) {
            return;
        }

        const measurement = this.measure(element);
        if (measurement.isOverflowing) {
            const next = this.sortedExpandedItems()[0];
            if (!next) return;

            this.requiredWidthById.set(next.id, measurement.scrollWidth);
            this.publish(new Set([...this.snapshot.collapsedIds, next.id]));
            return;
        }

        const next = this.sortedCollapsedItems()[0];
        if (!next) return;

        const requiredWidth = this.requiredWidthById.get(next.id);
        if (requiredWidth !== undefined
            && measurement.clientWidth >= requiredWidth + this.expansionBufferPx) {
            const collapsedIds = new Set(this.snapshot.collapsedIds);
            collapsedIds.delete(next.id);
            this.publish(collapsedIds);
        }
    };

    private sortedExpandedItems(): ProgressiveOverflowItem[] {
        return this.items
            .map((item, index) => ({ ...item, index }))
            .filter((item) => !this.snapshot.collapsedIds.has(item.id))
            .sort((left, right) => (
                (left.priority ?? DEFAULT_PRIORITY) - (right.priority ?? DEFAULT_PRIORITY)
                || left.index - right.index
            ));
    }

    private sortedCollapsedItems(): ProgressiveOverflowItem[] {
        return this.items
            .map((item, index) => ({ ...item, index }))
            .filter((item) => this.snapshot.collapsedIds.has(item.id))
            .sort((left, right) => (
                (right.priority ?? DEFAULT_PRIORITY) - (left.priority ?? DEFAULT_PRIORITY)
                || right.index - left.index
            ));
    }

    private publish(collapsedIds: ReadonlySet<string>): void {
        this.snapshot = { collapsedIds };
        this.listeners.forEach((listener) => listener());
    }
}

function sameIds(left: ReadonlySet<string>, right: ReadonlySet<string>): boolean {
    return left.size === right.size && [...left].every((id) => right.has(id));
}

function sameItems(
    left: readonly ProgressiveOverflowItem[],
    right: readonly ProgressiveOverflowItem[]
): boolean {
    return left.length === right.length && left.every((item, index) => (
        item.id === right[index].id && item.priority === right[index].priority
    ));
}
