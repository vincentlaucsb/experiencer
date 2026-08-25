export enum HintKey {
    NodeOptions = 'node-options'
}

export interface HintSnapshot {
    dismissed: Readonly<Partial<Record<HintKey, true>>>;
}

export interface HintPersistence {
    read(): string | null;
    write(keys: HintKey[]): void;
    clear(): void;
    subscribe(listener: () => void): () => void;
}

export const dismissedHintsStorageKey = 'experiencer.hints.dismissed';
const knownHintKeys = new Set<string>(Object.values(HintKey));

export function isHintKey(value: string | null): value is HintKey {
    return value !== null && knownHintKeys.has(value);
}

function parseDismissedHints(value: string | null): HintSnapshot {
    if (!value) return { dismissed: {} };
    try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) return { dismissed: {} };

        const dismissed: Partial<Record<HintKey, true>> = {};
        for (const key of parsed) {
            if (typeof key === 'string' && isHintKey(key)) {
                dismissed[key] = true;
            }
        }
        return { dismissed };
    } catch {
        return { dismissed: {} };
    }
}

function sameSnapshot(left: HintSnapshot, right: HintSnapshot): boolean {
    const leftKeys = Object.keys(left.dismissed);
    const rightKeys = Object.keys(right.dismissed);
    return leftKeys.length === rightKeys.length
        && leftKeys.every((key) => right.dismissed[key as HintKey]);
}

/** Owns durable onboarding-hint dismissal independently of React. */
export class HintStore {
    private snapshot: HintSnapshot = { dismissed: {} };
    private readonly listeners = new Set<() => void>();
    private initialized = false;
    private unsubscribePersistence?: () => void;

    constructor(private readonly persistence: HintPersistence) {}

    subscribe = (listener: () => void): (() => void) => {
        this.initialize();
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    getSnapshot = (): HintSnapshot => {
        this.initialize();
        return this.snapshot;
    };

    isDismissed = (key: HintKey): boolean => Boolean(this.getSnapshot().dismissed[key]);

    dismiss = (key: HintKey): void => {
        this.initialize();
        if (this.snapshot.dismissed[key]) return;

        this.snapshot = {
            dismissed: { ...this.snapshot.dismissed, [key]: true }
        };
        this.persist();
        this.emit();
    };

    reset = (): void => {
        this.initialize();
        const hadDismissedHints = Object.keys(this.snapshot.dismissed).length > 0;
        this.snapshot = { dismissed: {} };
        this.persistence.clear();
        if (hadDismissedHints) this.emit();
    };

    destroy = (): void => {
        this.unsubscribePersistence?.();
        this.unsubscribePersistence = undefined;
        this.initialized = false;
        this.listeners.clear();
        this.snapshot = { dismissed: {} };
    };

    private initialize(): void {
        if (this.initialized) return;
        this.initialized = true;
        this.snapshot = parseDismissedHints(this.persistence.read());
        this.unsubscribePersistence = this.persistence.subscribe(this.syncFromPersistence);
    }

    private syncFromPersistence = (): void => {
        const nextSnapshot = parseDismissedHints(this.persistence.read());
        if (sameSnapshot(this.snapshot, nextSnapshot)) return;
        this.snapshot = nextSnapshot;
        this.emit();
    };

    private persist(): void {
        this.persistence.write(Object.keys(this.snapshot.dismissed) as HintKey[]);
    }

    private emit(): void {
        this.listeners.forEach((listener) => listener());
    }
}

const browserPersistence: HintPersistence = {
    read: () => {
        try {
            return localStorage.getItem(dismissedHintsStorageKey);
        } catch {
            return null;
        }
    },
    write: (keys) => {
        try {
            localStorage.setItem(dismissedHintsStorageKey, JSON.stringify(keys));
        } catch {
            // Blocking hints is never important enough to block editing.
        }
    },
    clear: () => {
        try {
            localStorage.removeItem(dismissedHintsStorageKey);
        } catch {
            // Blocking hints is never important enough to block editing.
        }
    },
    subscribe: (listener) => {
        if (typeof window === 'undefined') return () => undefined;
        const handleStorage = (event: StorageEvent) => {
            if (event.key === dismissedHintsStorageKey) listener();
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }
};

export const hintStore = new HintStore(browserPersistence);
