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
        preview: { status: 'ready' },
        actionError: 'This template is no longer available.'
    });
    expect(store.getSnapshot().selectedAdditionalKey).toBeUndefined();
});


test('starting points change only content, retain the chosen theme and reach the creation command', async () => {
    let created: ResumeSaveData | undefined;
    const store = new TemplateSelectorStore((_key, data) => {created = data;});
    store.selectBuiltIn('Integrity');
    expect(store.getSnapshot().selectedStartingPointId).toBe('sample');
    const original = store.getSnapshot().preview.data!;
    expect(JSON.stringify(original.childNodes)).toContain('Randy');
    store.selectTheme('forest');
    const themed = store.getSnapshot().preview.data!;
    store.selectStartingPoint('professional');
    const professional = store.getSnapshot().preview.data!;
    expect(store.getSnapshot().selectedThemeId).toBe('forest');
    expect(JSON.stringify(professional.childNodes)).toContain('Maya Patel');
    expect(JSON.stringify(professional.childNodes)).not.toContain('Randy');
    expect(professional.builtinCss).toEqual(themed.builtinCss);
    expect(professional.rootCss).toEqual(themed.rootCss);
    expect(professional.fonts).toEqual(themed.fonts);
    expect(professional.pageSize).toBe(themed.pageSize);
    store.selectTheme('ocean');
    expect(JSON.stringify(store.getSnapshot().preview.data!.childNodes)).toContain('Maya Patel');
    await store.useSelected();
    expect(JSON.stringify(created!.childNodes)).toContain('Maya Patel');
    store.selectBuiltIn('Streamline');
    expect(store.getSnapshot().startingPoints).toBeUndefined();
    expect(store.getSnapshot().selectedStartingPointId).toBeUndefined();
    store.selectStartingPoint('professional');
    expect(store.getSnapshot().startingPoints).toBeUndefined();
});


test('an additional template with a thumbnail and starting points loads real content without requiring themes', async () => {
    let created: ResumeSaveData | undefined;
    const store = new TemplateSelectorStore(() => {});
    store.configure({groups: [{id: 'local', templates: [{id: 'example', previewImage: '/example.png',
        loadPreview: async () => preview, use: data => {created = data;},
        startingPoints: [{id: 'original', label: 'Original', createContent: () => preview.childNodes},
            {id: 'alternate', label: 'Alternate', createContent: () => [{type: 'Header', value: 'Alternate name', childNodes: []}]}]}]}]});
    store.selectAdditional('local', 'example');
    await Promise.resolve();
    expect(store.getSnapshot().preview.data).toBeDefined();
    store.selectStartingPoint('alternate');
    expect(JSON.stringify(store.getSnapshot().preview.data?.childNodes)).toContain('Alternate name');
    await store.useSelected();
    expect(JSON.stringify(created?.childNodes)).toContain('Alternate name');
});
