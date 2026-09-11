import type { ResumeAppExtensions } from './ResumeAppContracts';
import DocumentNotesPreview from '@/controls/DocumentNotesPreview';
import { Button } from '@/controls/Buttons';

/** Configures the standalone editor's read-only notes offer. */
export const localAppExtensions: ResumeAppExtensions = { editor: { additionalSidebarTabs: [{
    key: 'Notes',
    content: <DocumentNotesPreview notice={<>
        <p>Save prompt instructions, tailoring guidance, or notes about the job you’re applying for with Experiencer Pro.</p>
        <p>Existing notes remain readable and are included in JSON backups, but never in rendered resumes. Pro is required to edit notes.</p>
        <form action="https://experiencer.app/pricing"><Button variant="primary" type="submit">Upgrade to Pro</Button></form>
    </>} />
}] } };
