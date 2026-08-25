import { HintKey, HintStore, type HintPersistence } from '../hintStore';

function createPersistence(initialValue: string | null = null) {
    let value = initialValue;
    const listeners = new Set<() => void>();
    const persistence: HintPersistence = {
        read: jest.fn(() => value),
        write: jest.fn((keys) => { value = JSON.stringify(keys); }),
        clear: jest.fn(() => { value = null; }),
        subscribe: jest.fn((listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        })
    };
    return {
        persistence,
        setExternalValue(nextValue: string | null) {
            value = nextValue;
            listeners.forEach((listener) => listener());
        }
    };
}

test('loads, dismisses, and resets stable string hint keys', () => {
    const host = createPersistence(JSON.stringify([HintKey.NodeOptions]));
    const store = new HintStore(host.persistence);
    const listener = jest.fn();
    store.subscribe(listener);

    expect(store.isDismissed(HintKey.NodeOptions)).toBe(true);
    store.dismiss(HintKey.NodeOptions);
    expect(listener).not.toHaveBeenCalled();

    store.reset();
    expect(store.isDismissed(HintKey.NodeOptions)).toBe(false);
    expect(host.persistence.clear).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);
});

test('synchronizes external storage changes and ignores unknown keys', () => {
    const host = createPersistence();
    const store = new HintStore(host.persistence);
    const listener = jest.fn();
    store.subscribe(listener);

    host.setExternalValue(JSON.stringify(['unknown', HintKey.NodeOptions]));

    expect(store.isDismissed(HintKey.NodeOptions)).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
});

test('persists a dismissal exactly once', () => {
    const host = createPersistence();
    const store = new HintStore(host.persistence);

    store.dismiss(HintKey.NodeOptions);
    store.dismiss(HintKey.NodeOptions);

    expect(host.persistence.write).toHaveBeenCalledTimes(1);
    expect(host.persistence.write).toHaveBeenCalledWith([HintKey.NodeOptions]);
});
