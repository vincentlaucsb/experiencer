import { TemplateSelectorStore } from '@/shared/stores/templateSelectorStore';
import ResumeTemplates from '@/templates/ResumeTemplates';
import type { ResumeSaveData } from '@/types';

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
}

const preview = ResumeTemplates.templates.Assured as ResumeSaveData;

test('uses the selected built-in template through the configured command', async () => {
    const fallback = jest.fn();
    const configured = jest.fn();
    const store = new TemplateSelectorStore(fallback);
    store.configure({ groups: [], useBuiltInTemplate: configured });

    store.selectBuiltIn('Streamline');
    await store.useSelected();

    expect(configured).toHaveBeenCalledWith('Streamline');
    expect(fallback).not.toHaveBeenCalled();
});

test('loads an additional template preview and reports action progress', async () => {
    const useTemplate = deferred<void>();
    const store = new TemplateSelectorStore(jest.fn());
    store.configure({
        groups: [{
            id: 'saved',
            templates: [{
                id: 'canonical',
                loadPreview: async () => preview,
                use: () => useTemplate.promise
            }]
        }]
    });

    store.selectAdditional('saved', 'canonical');
    expect(store.getSnapshot().preview.status).toBe('loading');

    await Promise.resolve();
    expect(store.getSnapshot().preview).toEqual({ status: 'ready', data: preview });

    const action = store.useSelected();
    expect(store.getSnapshot().actionStatus).toBe('using');

    useTemplate.resolve();
    await action;
    expect(store.getSnapshot().actionStatus).toBe('idle');
});

test('ignores a preview result after a newer selection', async () => {
    const firstPreview = deferred<ResumeSaveData>();
    const store = new TemplateSelectorStore(jest.fn());
    store.configure({
        groups: [{
            id: 'saved',
            templates: [
                {
                    id: 'first',
                    loadPreview: () => firstPreview.promise,
                    use: jest.fn()
                },
                {
                    id: 'second',
                    previewImage: '/second.png',
                    use: jest.fn()
                }
            ]
        }]
    });

    store.selectAdditional('saved', 'first');
    store.selectAdditional('saved', 'second');
    firstPreview.resolve(preview);
    await Promise.resolve();

    expect(store.getSnapshot()).toMatchObject({
        selectedAdditionalKey: 'saved:second',
        preview: { status: 'ready', image: '/second.png' }
    });
});

test('reports preview and use-action failures in the snapshot', async () => {
    const store = new TemplateSelectorStore(jest.fn());
    store.configure({
        groups: [{
            id: 'saved',
            templates: [{
                id: 'broken',
                loadPreview: async () => {
                    throw new Error('Preview failed');
                },
                use: async () => {
                    throw new Error('Creation failed');
                }
            }]
        }]
    });

    store.selectAdditional('saved', 'broken');
    await Promise.resolve();
    await Promise.resolve();
    expect(store.getSnapshot().preview).toEqual({
        status: 'error',
        message: 'Preview failed'
    });

    await store.useSelected();
    expect(store.getSnapshot()).toMatchObject({
        actionStatus: 'idle',
        actionError: 'Creation failed'
    });
});

test('invalidates an in-flight action when selection changes', async () => {
    const useTemplate = deferred<void>();
    const store = new TemplateSelectorStore(jest.fn());
    store.configure({
        groups: [{
            id: 'saved',
            templates: [{
                id: 'first',
                previewImage: '/first.png',
                use: () => useTemplate.promise
            }]
        }]
    });

    store.selectAdditional('saved', 'first');
    const action = store.useSelected();
    store.selectBuiltIn('Integrity');
    useTemplate.reject(new Error('stale failure'));
    await action;

    expect(store.getSnapshot()).toMatchObject({
        selectedBuiltInKey: 'Integrity',
        actionStatus: 'idle'
    });
    expect(store.getSnapshot().selectedAdditionalKey).toBeUndefined();
    expect(store.getSnapshot().actionError).toBeUndefined();
});

test('returns to the built-in selection when an additional template disappears', () => {
    const option = {
        id: 'canonical',
        previewImage: '/canonical.png',
        use: jest.fn()
    };
    const store = new TemplateSelectorStore(jest.fn());
    store.configure({ groups: [{ id: 'saved', templates: [option] }] });
    store.selectAdditional('saved', 'canonical');

    store.configure({ groups: [] });

    expect(store.getSnapshot()).toMatchObject({
        selectedBuiltInKey: 'Integrity',
        preview: { status: 'idle' },
        actionError: 'This template is no longer available.'
    });
    expect(store.getSnapshot().selectedAdditionalKey).toBeUndefined();
});
