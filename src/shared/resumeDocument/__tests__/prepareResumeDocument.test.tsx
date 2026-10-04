import registerNodes from '@/resume/schema';
import {
    createResumeDocumentSource,
    prepareResumeDocument
} from '@/shared/resumeDocument/prepareResumeDocument';
import { renderResumeMarkup } from '@/shared/resumeDocument/renderResumeMarkup';
import { useEditorStore } from '@/shared/stores/editorStore';
import ResumeTemplates from '@/templates/ResumeTemplates';
import { deepCopy } from '@/shared/utils/deepCopy';

registerNodes();

test.each(['print', 'export', 'render-service'] as const)('%s omits empty entry subtitle headings', async target => {
    const document = {
        ...ResumeTemplates.templates.Integrity,
        childNodes: [
            { type: 'Entry', title: ['No subtitle'], subtitle: [], childNodes: [] },
            { type: 'Entry', title: ['Empty fields'], subtitle: ['', ' '], childNodes: [] },
            { type: 'Entry', title: ['Populated'], subtitle: ['Visible role'], childNodes: [] }
        ]
    };
    const markup = await renderResumeMarkup(prepareResumeDocument(createResumeDocumentSource(document, 'Optional subtitles'), target));
    expect(markup.match(/<h4 class="subtitle"/g)).toHaveLength(1);
    expect(markup).toContain('Visible role');
});

const source = createResumeDocumentSource(
    ResumeTemplates.templates.Integrity,
    'Integrity resume'
);

test.each(['print', 'export'] as const)(
    '%s omits editor controls and empty-field hints while the editor is open',
    async (target) => {
        const document = {
            ...ResumeTemplates.templates.Integrity,
            childNodes: [
                { type: 'Header', value: '', subtitle: '', childNodes: [] },
                { type: 'Entry', title: ['', 'QA Overflow Entry'], subtitle: ['', 'Visible role'], childNodes: [] },
                { type: 'Markdown', value: '', childNodes: [] },
                { type: 'Link', value: '', url: 'https://example.com', childNodes: [] },
                { type: 'Column', childNodes: [] }
            ]
        };
        const prepared = prepareResumeDocument(
            createResumeDocumentSource(document, 'Print hints'),
            target
        );
        const header = prepared.nodes.find((node) => node.type === 'Header');
        const entry = prepared.nodes.find((node) => node.type === 'Entry');
        if (!header?.uuid || !entry?.uuid) {
            throw new Error('prepared nodes did not receive rendering identities');
        }

        useEditorStore.getState().editNode(entry.uuid);
        const markup = await renderResumeMarkup(prepared);
        expect(markup).toContain('QA Overflow Entry');
        expect(markup).toContain('Visible role');
        expect(markup).not.toContain('Enter a value');
        expect(markup).not.toContain('Add title');
        expect(markup).not.toContain('Add detail');
        expect(markup).not.toContain('Click to add content');
        expect(markup).not.toContain('Link text');
        expect(markup).toContain('href="https://example.com"');
        expect(markup).toContain('https://example.com');
        expect(markup).not.toContain('Click to select');
        expect(markup).toContain('text-content');

        useEditorStore.getState().editNode(header.uuid);
        const editingHeader = await renderResumeMarkup(prepared);
        expect(editingHeader).not.toContain('Enter a title');
        expect(editingHeader).not.toContain('<input');
        useEditorStore.getState().unselectNode();
    }
);

test.each(['print', 'export'] as const)(
    '%s keeps blank markdown and link cells so later grid items stay in place',
    async (target) => {
        const document = {
            ...ResumeTemplates.templates.Integrity,
            childNodes: [
                {
                    type: 'Grid',
                    childNodes: [
                        { type: 'Markdown', value: '   ' },
                        { type: 'Entry', title: ['Entry column'], subtitle: [], childNodes: [] },
                        { type: 'Link', value: ' \t ', url: 'https://example.com' },
                        { type: 'Markdown', value: 'After the link' }
                    ]
                }
            ]
        };
        const markup = await renderResumeMarkup(
            prepareResumeDocument(createResumeDocumentSource(document, 'Grid cells'), target)
        );
        const slots: string[] = [];
        for (const match of markup.matchAll(/class="([^"]*)"/g)) {
            const name = match[1].split(/\s+/).find((token) =>
                token === 'text-content' || token === 'entry' || token === 'link'
            );
            if (name) {
                slots.push(name);
            }
        }

        expect(slots).toEqual(['text-content', 'entry', 'link', 'text-content']);
        expect(markup.indexOf('Entry column')).toBeGreaterThan(markup.indexOf('text-content'));
        expect(markup.indexOf('After the link')).toBeGreaterThan(markup.indexOf('https://example.com'));
        expect(markup).not.toContain('Click to add content');
        expect(markup).not.toContain('Link text');
    }
);

test('only the editor target scopes authored CSS to #resume', () => {
    const editor = prepareResumeDocument(source, 'editor');
    const standalone = prepareResumeDocument(source, 'export');

    expect(editor.root).toBe('editor-host');
    expect(editor.stylesheet).toContain('#resume');
    expect(standalone.root).toBe('document-body');
    expect(standalone.stylesheet).not.toContain('#resume');
});

test('standalone markup contains body descendants without an editor host', async () => {
    const markup = await renderResumeMarkup(prepareResumeDocument(source, 'export'));

    expect(markup).toContain('class="grid-container"');
    expect(markup).not.toContain('id="resume"');
    expect(markup).not.toContain('data-resume-host');
});

test.each(['print', 'export', 'render-service'] as const)(
    '%s markup preserves page breaks without editor-only labels',
    async (target) => {
        const sourceWithPageBreak = {
            ...source,
            nodes: [
                ...source.nodes,
                { type: 'PageBreak', uuid: 'output-page-break' }
            ]
        };

        const markup = await renderResumeMarkup(
            prepareResumeDocument(sourceWithPageBreak, target)
        );

        expect(markup).toContain('class="page-break"');
        expect(markup).not.toContain('page-break-editing');
        expect(markup).not.toContain('page-break-label');
        expect(markup).not.toContain('Page Break');
    }
);

test('the public review target alone emits the server-owned #resume shell', async () => {
    const markup = await renderResumeMarkup(prepareResumeDocument(source, 'public-review'));

    expect(markup).toContain('id="resume"');
    expect(markup).toContain('data-resume-host="public-review"');
    expect(markup).not.toContain('data-resume-host="editor"');
});

test('saved editor-host selectors are removed without weakening the pipeline invariant', () => {
    const legacyTemplate = deepCopy(ResumeTemplates.templates.Integrity);
    legacyTemplate.builtinCss.selector = '#resume';
    legacyTemplate.builtinCss.children[0].selector = '#resume .authored-rule';

    const legacySource = createResumeDocumentSource(legacyTemplate, 'Legacy resume');
    expect(legacySource.stylesheet).toContain('body');
    expect(legacySource.stylesheet).toContain('.authored-rule');
    expect(legacySource.stylesheet).not.toContain('#resume');
    expect(() => prepareResumeDocument(legacySource, 'editor')).not.toThrow();
    expect(() => prepareResumeDocument(legacySource, 'export')).not.toThrow();

    const invalidSource = { ...legacySource, stylesheet: '#resume .authored-rule {}' };
    expect(() => prepareResumeDocument(invalidSource, 'export'))
        .toThrow('#resume is reserved');
});
