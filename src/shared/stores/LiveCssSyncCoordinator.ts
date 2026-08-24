import type { ReadonlyCssNode } from "@/shared/CssTree";
import type { CssEditorCommands } from "@/shared/stores/cssEditorCommands";
import { cssStore, rootCssStore } from "@/shared/stores/cssStoreHooks";
import applyScopedLiveCssChanges from "@/shared/stores/applyScopedLiveCssChanges";
import { showToast } from "@/shared/stores/toastStore";
import {
    inspectScopedLiveCssChanges,
    liveCssBaselineStore,
    type LiveCssTreeName,
    type ScopedLiveCssTreeChange
} from "@/shared/utils/liveCssBaseline";
import {
    countLiveCssDeclarationChanges,
    inspectLiveCssTree,
    type LiveCssTreeChange
} from "@/shared/utils/liveCssSync";

export type { LiveCssTreeName } from "@/shared/utils/liveCssBaseline";

const LIVE_CSS_POLL_INTERVAL_MS = 1000;

export interface LiveCssSyncSnapshot {
    changes: ReadonlyArray<ScopedLiveCssTreeChange>;
    changeCount: number;
    reviewOpen: boolean;
}

interface LiveCssSyncScheduler {
    setInterval(callback: () => void, intervalMs: number): unknown;
    clearInterval(handle: unknown): void;
}

export interface LiveCssSyncDependencies {
    inspectAll(): ReadonlyArray<ScopedLiveCssTreeChange>;
    inspectSection(node: ReadonlyCssNode): ReadonlyArray<LiveCssTreeChange>;
    filter(changes: ReadonlyArray<ScopedLiveCssTreeChange>): ReadonlyArray<ScopedLiveCssTreeChange>;
    applyAll(changes: ReadonlyArray<ScopedLiveCssTreeChange>): void;
    notify(message: string): void;
    scheduler: LiveCssSyncScheduler;
    pollIntervalMs: number;
}

const EMPTY_SNAPSHOT: LiveCssSyncSnapshot = {
    changes: [],
    changeCount: 0,
    reviewOpen: false
};

function changesSignature(changes: ReadonlyArray<ScopedLiveCssTreeChange>) {
    return JSON.stringify(changes.map((change) => ({
        tree: change.tree,
        path: change.path,
        declarations: Array.from(change.declarations.entries())
    })));
}

function importedChangesMessage(changeCount: number) {
    return `Imported ${changeCount} live CSS change${changeCount === 1 ? "" : "s"}.`;
}

const defaultDependencies: LiveCssSyncDependencies = {
    inspectAll: () => inspectScopedLiveCssChanges(cssStore.data, rootCssStore.data),
    inspectSection: (node) => inspectLiveCssTree(node),
    filter: (changes) => liveCssBaselineStore.filter(changes),
    applyAll: applyScopedLiveCssChanges,
    notify: showToast,
    scheduler: {
        setInterval: (callback, intervalMs) => globalThis.setInterval(callback, intervalMs),
        clearInterval: (handle) => globalThis.clearInterval(handle as ReturnType<typeof setInterval>)
    },
    pollIntervalMs: LIVE_CSS_POLL_INTERVAL_MS
};

/** Owns detection, review state, and atomic imports for authored live CSS. */
export class LiveCssSyncCoordinator {
    private readonly listeners = new Set<() => void>();
    private snapshot = EMPTY_SNAPSHOT;
    private connectionCount = 0;
    private intervalHandle: unknown;

    constructor(private readonly dependencies: LiveCssSyncDependencies = defaultDependencies) {}

    readonly subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    readonly getSnapshot = () => this.snapshot;

    /** Starts one shared polling lifecycle and stops it after the final view disconnects. */
    connect(): () => void {
        this.connectionCount++;
        if (this.connectionCount === 1) {
            this.refresh();
            this.intervalHandle = this.dependencies.scheduler.setInterval(
                this.refresh,
                this.dependencies.pollIntervalMs
            );
        }

        let connected = true;
        return () => {
            if (!connected) return;
            connected = false;
            this.connectionCount--;
            if (this.connectionCount === 0) {
                if (this.intervalHandle !== undefined) {
                    this.dependencies.scheduler.clearInterval(this.intervalHandle);
                    this.intervalHandle = undefined;
                }
                this.setSnapshot(EMPTY_SNAPSHOT);
            }
        };
    }

    readonly refresh = () => {
        const changes = this.dependencies.filter(this.dependencies.inspectAll());
        if (changesSignature(changes) === changesSignature(this.snapshot.changes)) {
            return;
        }

        this.setSnapshot({
            ...this.snapshot,
            changes,
            changeCount: countLiveCssDeclarationChanges(changes)
        });
    };

    openReview(): void {
        if (this.snapshot.changes.length > 0) {
            this.setSnapshot({ ...this.snapshot, reviewOpen: true });
        }
    }

    closeReview(): void {
        this.setSnapshot({ ...this.snapshot, reviewOpen: false });
    }

    importAll(): void {
        const { changes, changeCount } = this.snapshot;
        if (changes.length === 0) return;

        this.dependencies.applyAll(changes);
        this.setSnapshot(EMPTY_SNAPSHOT);
        this.dependencies.notify(importedChangesMessage(changeCount));
    }

    importSection(
        tree: LiveCssTreeName,
        node: ReadonlyCssNode,
        commands: CssEditorCommands
    ): number {
        const scopedChanges = this.dependencies.inspectSection(node)
            .map((change): ScopedLiveCssTreeChange => ({ ...change, tree }));
        const changes = this.dependencies.filter(scopedChanges);

        if (changes.length === 0) {
            this.dependencies.notify("This CSS section already matches the live stylesheet.");
            return 0;
        }

        commands.replaceProperties(changes);
        const changeCount = countLiveCssDeclarationChanges(changes);
        this.dependencies.notify(importedChangesMessage(changeCount));
        return changeCount;
    }

    private setSnapshot(snapshot: LiveCssSyncSnapshot): void {
        if (
            snapshot.reviewOpen === this.snapshot.reviewOpen
            && snapshot.changeCount === this.snapshot.changeCount
            && changesSignature(snapshot.changes) === changesSignature(this.snapshot.changes)
        ) {
            return;
        }

        this.snapshot = snapshot;
        this.listeners.forEach((listener) => listener());
    }
}

export const liveCssSyncCoordinator = new LiveCssSyncCoordinator();
