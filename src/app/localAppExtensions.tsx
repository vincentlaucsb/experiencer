import type { ResumeAppExtensions } from './ResumeAppContracts';
import { readOnlyNotesStore } from '@/shared/stores/readOnlyNotesStore';
import DocumentNotesPreview, { ReadOnlyNotesModal } from '@/controls/DocumentNotesPreview';
import { Button } from '@/controls/Buttons';

/** Configures the standalone editor's read-only notes offer. */
const notice = <>
    <p>Save prompt instructions, tailoring guidance, or notes about the job you’re applying for with Experiencer Pro.</p>
    <p>Existing notes remain readable and are included in JSON backups, but never in rendered resumes. Pro is required to edit notes.</p>
    <form action="https://experiencer.app/pricing"><Button variant="primary" type="submit">Upgrade to Pro</Button></form>
</>;
export const localAppExtensions: ResumeAppExtensions = {
    shell: { overlays: <ReadOnlyNotesModal notice={notice} /> },
    editor: { nodeActions: readOnlyNotesStore.nodeActions,
        additionalSidebarTabs: [{ key: 'Notes', content: <DocumentNotesPreview notice={notice} /> }] }
};
