import { createResumeDocumentSource, prepareResumeDocument } from '@/shared/resumeDocument/prepareResumeDocument';
import CssNode from '@/shared/CssTree';
const emptyDocument = () => ({ childNodes: [], builtinCss: new CssNode('Resume CSS', {}, 'body').dump(), rootCss: new CssNode(':root', {}, ':root').dump() });
import { documentNotesStore, MAXIMUM_NOTES_LENGTH } from '../documentNotesStore';
import { hydrateResumeData } from '../loadData';
import { dump } from '../saveResume';
import { resumeDocumentDirtyState } from '../resumeDocumentDirtyState';
import { cssStore, rootCssStore } from '../cssStoreHooks';
import { resumeNodeStore } from '../resumeNodeStore';

beforeEach(() => {
    hydrateResumeData(emptyDocument());
    resumeNodeStore.clearUnsavedChanges();
    cssStore.clearUnsavedChanges();
    rootCssStore.clearUnsavedChanges();
});

test('notes survive JSON serialization and hydration, independently of rendered trees', () => {
    documentNotesStore.setMarkdown('# Job context\n\nFollow up next week.');
    expect(resumeDocumentDirtyState.getSnapshot()).toBe(true);
    const exported = JSON.parse(JSON.stringify(dump()));
    expect(exported.childNodes).toEqual([]);
    hydrateResumeData(exported);
    expect(documentNotesStore.data?.markdown).toBe('# Job context\n\nFollow up next week.');
    expect(documentNotesStore.hasUnsavedChanges()).toBe(false);
    hydrateResumeData(emptyDocument());
    expect(dump().notes).toBeUndefined();
});

test('editing notes preserves the inherited snapshot and does not mutate the import', () => {
    const notes = { markdown: 'Current context', templateGuidance: 'Preserve leadership' };
    documentNotesStore.load(notes);
    documentNotesStore.setMarkdown('New context');
    expect(dump().notes).toEqual({ markdown: 'New context', templateGuidance: 'Preserve leadership' });
    expect(notes.markdown).toBe('Current context');
});

test('malformed addenda do not prevent editing and oversized edits are rejected', () => {
    for (const notes of [null, 'text', [], { markdown: 4 }]) {
        hydrateResumeData({ ...emptyDocument(), notes });
        expect(documentNotesStore.data).toBeUndefined();
    }
    expect(documentNotesStore.setMarkdown('x'.repeat(MAXIMUM_NOTES_LENGTH + 1))).toBe(false);
    expect(documentNotesStore.hasUnsavedChanges()).toBe(false);
});


test('canonical output preparation excludes the private addendum', () => {
    const source = createResumeDocumentSource({ ...emptyDocument(), notes: { markdown: 'PRIVATE_NOTES', templateGuidance: 'PRIVATE_GUIDANCE' } }, 'Resume');
    expect(JSON.stringify(prepareResumeDocument(source, 'print'))).not.toContain('PRIVATE_');
});


test('entry notes survive edits, copies and JSON round trips but are removed from rendering inputs', () => {
    hydrateResumeData({ ...emptyDocument(), childNodes: [
        { type: 'Entry', title: ['Example'], notes: 'PRIVATE_ENTRY', childNodes: [] },
        { type: 'Entry', title: ['Second'], childNodes: [] }
    ] });
    const first = resumeNodeStore.data.childNodes[0];
    resumeNodeStore.updateNode(first.uuid, 'title', ['Tailored title']);
    resumeNodeStore.moveNodeDown(first.uuid);
    const exported = JSON.parse(JSON.stringify(dump()));
    expect(exported.childNodes[1].notes).toBe('PRIVATE_ENTRY');
    hydrateResumeData(exported);
    expect(dump().childNodes[1].notes).toBe('PRIVATE_ENTRY');
    const duplicate = resumeNodeStore.duplicateNode(resumeNodeStore.data.childNodes[1].uuid, false);
    expect(resumeNodeStore.getNodeByUuid(duplicate!)?.notes).toBe('PRIVATE_ENTRY');
    const source = createResumeDocumentSource(dump(), 'Resume');
    for (const target of ['print', 'export', 'png', 'public-review', 'render-service'] as const)
        expect(JSON.stringify(prepareResumeDocument(source, target))).not.toContain('PRIVATE_ENTRY');
});
