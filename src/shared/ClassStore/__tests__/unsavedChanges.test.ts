import ClassStore from '..';

// Concrete implementation for testing
class TestStore extends ClassStore<string> {
    protected _data: string;

    constructor(initialData: string) {
        super();
        this._data = initialData;
    }

    getData(): string {
        return this.data;
    }

    setData(newData: string): void {
        this.withMutation(() => {
            this.data = newData;
        });
    }

    setDataWithoutMutation(newData: string): void {
        this.data = newData;
        this.notifyListeners();
    }
}

describe('ClassStore - Unsaved Changes', () => {
    let store: TestStore;

    beforeEach(() => {
        store = new TestStore('initial');
    });

    test('initial state has no unsaved changes', () => {
        expect(store.hasUnsavedChanges()).toBe(false);
    });

    test('first withMutation does not set unsaved flag (initial load baseline)', () => {
        store.setData('modified');
        expect(store.hasUnsavedChanges()).toBe(false);
    });

    test('second withMutation sets unsaved changes flag', () => {
        store.setData('first change');
        expect(store.hasUnsavedChanges()).toBe(false);
        
        store.setData('second change');
        expect(store.hasUnsavedChanges()).toBe(true);
    });

    test('clearUnsavedChanges clears the flag', () => {
        store.setData('first change');
        store.setData('modified');
        expect(store.hasUnsavedChanges()).toBe(true);
        
        store.clearUnsavedChanges();
        expect(store.hasUnsavedChanges()).toBe(false);
    });

    test('multiple mutations keep unsaved changes flag set', () => {
        store.setData('first change');
        expect(store.hasUnsavedChanges()).toBe(false);
        
        store.setData('second change');
        expect(store.hasUnsavedChanges()).toBe(true);
        
        store.setData('third change');
        expect(store.hasUnsavedChanges()).toBe(true);
    });

    test('clearUnsavedChanges does not affect data', () => {
        store.setData('first');
        store.setData('modified');
        store.clearUnsavedChanges();
        
        expect(store.getData()).toBe('modified');
    });

    test('mutation without withMutation does not set flag', () => {
        store.setDataWithoutMutation('modified');
        expect(store.hasUnsavedChanges()).toBe(false);
    });

    test('complete lifecycle: load -> edit -> save -> edit again', () => {
        // Fresh load (first mutation doesn't mark unsaved)
        store.setData('loaded data');
        expect(store.hasUnsavedChanges()).toBe(false);
        
        // Make an edit (second mutation marks unsaved)
        store.setData('edited data');
        expect(store.hasUnsavedChanges()).toBe(true);
        
        // User saves (clear unsaved flag)
        store.clearUnsavedChanges();
        expect(store.hasUnsavedChanges()).toBe(false);
        
        // User makes another edit (should immediately mark unsaved)
        store.setData('edited again');
        expect(store.hasUnsavedChanges()).toBe(true);
    });

    test('getSnapshot returns fresh object after mutation', () => {
        const snapshot1 = store.getSnapshot();
        
        store.setData('modified');
        const snapshot2 = store.getSnapshot();
        
        expect(snapshot1).not.toBe(snapshot2);
        expect(snapshot1.version).toBeLessThan(snapshot2.version);
    });

    test('subscribe callback is called on mutation', () => {
        const listener = jest.fn();
        const unsubscribe = store.subscribe(listener);
        
        store.setData('modified');
        expect(listener).toHaveBeenCalledTimes(1);
        
        unsubscribe();
    });

    test('unsubscribe prevents further notifications', () => {
        const listener = jest.fn();
        const unsubscribe = store.subscribe(listener);
        
        store.setData('first');
        expect(listener).toHaveBeenCalledTimes(1);
        
        unsubscribe();
        
        store.setData('second');
        expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    test('multiple subscribers all get notified', () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        
        store.subscribe(listener1);
        store.subscribe(listener2);
        
        store.setData('modified');
        
        expect(listener1).toHaveBeenCalledTimes(1);
        expect(listener2).toHaveBeenCalledTimes(1);
    });

    test('withMutation returns value from operation', () => {
        const testStore = new (class extends ClassStore<number> {
            protected _data = 0;
            
            public increment(): number {
                return this.withMutation(() => {
                    this.data++;
                    return this.data;
                });
            }
        })();
        
        const result = testStore.increment();
        expect(result).toBe(1);
    });

    test('mutation sets flag even if operation returns undefined', () => {
        const testStore = new (class extends ClassStore<string> {
            protected _data = 'initial';
            
            public doMutation(): void {
                this.withMutation(() => {
                    // Do nothing, return undefined
                });
            }
        })();
        
        testStore.doMutation(); // First mutation (initial load)
        expect(testStore.hasUnsavedChanges()).toBe(false);
        
        testStore.doMutation(); // Second mutation (marks unsaved)
        expect(testStore.hasUnsavedChanges()).toBe(true);
    });
});
