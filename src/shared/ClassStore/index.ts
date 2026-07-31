/**
 * Supplies React-compatible subscriptions, snapshots, and dirty tracking to
 * framework-neutral mutable stores.
 */
export default abstract class ClassStore<T> {
    private listeners = new Set<() => void>();
    protected version = 0;
    private cachedSnapshot: { data: T; version: number } | null = null;
    private _initialLoad = false;
    private _unsavedChanges = false;

    protected abstract _data: T;

    get data() {
        return this._data;
    }

    protected set data(newData: T) {
        this._data = newData;
    }

    /**
     * Subscribe to store changes. Compatible with useSyncExternalStore.
     * 
     * @param listener - Callback invoked when store notifies of changes
     * @returns Unsubscribe function to remove the listener
     */
    subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * Get the current snapshot of the store data. Compatible with useSyncExternalStore.
     * Returns a cached object that only changes when version increments.
     * 
     * @returns An object with data and version for change detection
     */
    getSnapshot = (): { data: T; version: number } => {
        if (!this.cachedSnapshot || this.cachedSnapshot.version !== this.version) {
            this.cachedSnapshot = { data: this.data, version: this.version };
        }
        return this.cachedSnapshot;
    }

    /**
     * Notify all subscribers of a change.
     * Subclasses should call this after mutating the data.
     */
    protected notifyListeners(): void {
        this.version++;
        this.listeners.forEach(fn => fn());
    }

    /**
     * Helper to wrap mutations with unsaved flag and notification.
     * Reduces boilerplate in subclass mutation methods.
     * 
     * @param operation - Function that performs the mutation
     * @returns The result of the operation
     */
    protected withMutation<R>(operation: () => R): R {
        const result = operation();
        if (this._initialLoad) {
            this._unsavedChanges = true;
        }
        else {
            this._initialLoad = true;
        }

        this.notifyListeners();
        return result;
    }

    /**
     * Check if there are unsaved changes.
     */
    hasUnsavedChanges(): boolean {
        return this._unsavedChanges;
    }

    /**
     * Clear the unsaved changes flag (typically after save).
     */
    clearUnsavedChanges(): void {
        this._unsavedChanges = false;
        this.notifyListeners();
    }
}
