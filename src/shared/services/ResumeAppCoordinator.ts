import { loadLocal } from '@/shared/stores/loadData';
import { workspaceStore, type WorkspaceStore } from '@/shared/stores/workspaceStore';

export interface ResumeLandingSession {
    hasSuspendedSession?: boolean;
    lastDocumentId?: string;
    selectDocument?: (id: string) => Promise<void> | void;
}

export interface ResumeAppCoordinatorOptions {
    workspace?: Pick<WorkspaceStore, 'returnToEditing'>;
    loadLocalDraft?: () => void;
}

/**
 * Coordinates workspace and library lifecycle commands independently of React.
 *
 * Landing resume priority: a suspended editing session, then the last persisted
 * document, then a legacy localStorage draft.
 */
export class ResumeAppCoordinator {
    private readonly workspace: Pick<WorkspaceStore, 'returnToEditing'>;
    private readonly loadLocalDraft: () => void;

    constructor(options: ResumeAppCoordinatorOptions = {}) {
        this.workspace = options.workspace ?? workspaceStore;
        this.loadLocalDraft = options.loadLocalDraft ?? loadLocal;
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
