import registerNodes from '@/resume/schema';
import {
    createResumeDocumentSource,
    prepareResumeDocument
} from '@/shared/resumeDocument/prepareResumeDocument';
import { renderResumeMarkup } from '@/shared/resumeDocument/renderResumeMarkup';
import ResumeTemplates from '@/templates/ResumeTemplates';
import { deepCopy } from '@/shared/utils/deepCopy';

registerNodes();

const source = createResumeDocumentSource(
    ResumeTemplates.templates.Integrity,
    'Integrity resume'
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
