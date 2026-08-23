export interface SaveAsDialogSnapshot {
    isOpen: boolean;
}

const closedSnapshot: SaveAsDialogSnapshot = { isOpen: false };
const openSnapshot: SaveAsDialogSnapshot = { isOpen: true };

/** Owns Save As visibility and rejects attempts to open outside an editing session. */
export class SaveAsDialogStore {
    private snapshot = closedSnapshot;
    private available = false;
    private readonly listeners = new Set<() => void>();

    subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    getSnapshot = (): SaveAsDialogSnapshot => this.snapshot;

    setAvailable = (available: boolean): void => {
        this.available = available;
        if (!available) this.close();
    };

    open = (): void => {
        if (!this.available || this.snapshot.isOpen) return;
        this.setSnapshot(openSnapshot);
    };

    close = (): void => {
        if (!this.snapshot.isOpen) return;
        this.setSnapshot(closedSnapshot);
    };

    reset = (): void => {
        this.available = false;
        this.close();
    };

    private setSnapshot(snapshot: SaveAsDialogSnapshot): void {
        this.snapshot = snapshot;
        this.listeners.forEach((listener) => listener());
    }
}

export const saveAsDialogStore = new SaveAsDialogStore();
