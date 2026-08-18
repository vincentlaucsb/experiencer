import { loadLocal } from '@/shared/stores/loadData';
import { workspaceStore, type WorkspaceStore } from '@/shared/stores/workspaceStore';

export interface ResumeLandingSession {
    hasSuspendedSession?: boolean;
    lastDocumentId?: string;
    selectDocument?: (id: string) => Promise<void> | void;
}

export interface ResumeAppCoordinatorOptions {
    workspace?: Pick<WorkspaceStore, 'returnToEditing' | 'showTemplateSelector'>;
    loadLocalDraft?: () => void;
}

/**
 * Coordinates workspace and library lifecycle commands independently of React.
 *
 * Landing resume priority: a suspended editing session, then the last persisted
 * document, then a legacy localStorage draft.
 */
export class ResumeAppCoordinator {
    private readonly workspace: Pick<WorkspaceStore, 'returnToEditing' | 'showTemplateSelector'>;
    private readonly loadLocalDraft: () => void;
    private baseDocumentTitle?: string;

    constructor(options: ResumeAppCoordinatorOptions = {}) {
        this.workspace = options.workspace ?? workspaceStore;
        this.loadLocalDraft = options.loadLocalDraft ?? loadLocal;
    }

    showTemplateSelector(): void {
        this.workspace.showTemplateSelector();
    }

    /**
     * Keep the browser title aligned with the active document.
     * The first call remembers the host title so landing can restore it.
     */
    bindDocumentTitle(activeDocumentTitle?: string): () => void {
        if (typeof document === 'undefined') {
            return () => undefined;
        }

        if (this.baseDocumentTitle === undefined) {
            this.baseDocumentTitle = document.title;
        }

        const baseTitle = this.baseDocumentTitle;
        document.title = activeDocumentTitle
            ? `${activeDocumentTitle} | ${baseTitle}`
            : baseTitle;

        return () => {
            document.title = baseTitle;
            this.baseDocumentTitle = undefined;
        };
    }

    /**
     * Open the best available resume from the landing surface.
     * A suspended editing session wins over the last persisted document,
     * which wins over a legacy localStorage draft.
     */
    resumeFromLanding(session: ResumeLandingSession = {}): Promise<void> | void {
        if (session.hasSuspendedSession) {
            this.workspace.returnToEditing();
            return;
        }

        if (session.lastDocumentId) {
            return session.selectDocument?.(session.lastDocumentId);
        }

        this.loadLocalDraft();
    }
}

export const resumeAppCoordinator = new ResumeAppCoordinator();
