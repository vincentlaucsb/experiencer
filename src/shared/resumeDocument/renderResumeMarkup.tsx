import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import ResumeRenderer from '@/resume/ResumeRenderer';
import type { PreparedResumeDocument } from '@/shared/resumeDocument/prepareResumeDocument';

const noopUpdate = () => undefined;

/** Serialize one prepared document through an isolated instance of the editor's React renderer. */
export async function renderResumeMarkup(
    prepared: PreparedResumeDocument,
    ownerDocument: Document = document
): Promise<string> {
    const host = ownerDocument.createElement('div');
    host.hidden = true;
    ownerDocument.body.appendChild(host);
    const root = createRoot(host);

    try {
        flushSync(() => {
            root.render(
                <ResumeRenderer
                    nodes={prepared.nodes}
                    pageSize={prepared.pageSize}
                    ariaLabel={prepared.ariaLabel}
                    readOnly={prepared.readOnly}
                    root={prepared.root}
                    updateResumeData={noopUpdate}
                    updateResumeDataFields={noopUpdate}
                />
            );
        });
        if (prepared.readOnly) {
            stripEditorOnlyPageBreakMarkup(host);
        }
        return prepared.root === 'document-body'
            ? host.innerHTML
            : host.querySelector<HTMLElement>('#resume')?.outerHTML ?? '';
    } finally {
        flushSync(() => root.unmount());
        host.remove();
    }
}

/** Preserve pagination while removing the page-break affordance shown only in the editor. */
function stripEditorOnlyPageBreakMarkup(host: HTMLElement): void {
    host.querySelectorAll('.page-break-label').forEach((label) => label.remove());
    host.querySelectorAll('.page-break-editing').forEach((pageBreak) => {
        pageBreak.classList.remove('page-break-editing');
    });
}
