import * as React from 'react';

import { DefaultLayout } from '@/controls/Layouts';
import Landing, { type LandingActions, type LandingContext } from '@/help/Landing';
import type { ResumeDocumentAction, ResumeDocumentGroup } from '@/app/ResumeAppContracts';
import {
    resumeAppCoordinator,
    type ResumeAppCoordinator
} from '@/shared/services/ResumeAppCoordinator';
import type { ResumeDocumentSummary } from '@/shared/repositories/ResumeRepository';
import loadData from '@/shared/stores/loadData';
import Toast from '@/controls/Toast';

export interface ResumeLandingProps {
    topNav: React.ReactNode;
    className?: string;
    documents?: ResumeDocumentSummary[];
    documentLabels?: Record<string, string>;
    documentGroups?: ResumeDocumentGroup[];
    documentActions?: Record<string, ResumeDocumentAction[]>;
    activeDocumentId?: string;
    lastDocumentId?: string;
    hasSuspendedSession?: boolean;
    selectDocument?: (id: string) => Promise<void> | void;
    deleteDocument?: (id: string) => void;
    renameDocument?: (id: string, title: string) => Promise<string | null>;
    importDocument?: (data: object, title?: string) => void;
    createResume?: () => void;
    renderLead?: (actions: LandingActions, context: LandingContext) => React.ReactNode;
    showSocialLinks?: boolean;
    coordinator?: ResumeAppCoordinator;
}

function importLocalData(data: object) {
    loadData(data);
}

/** Renders the no-active-document experience and landing-owned extension points. */
export default function ResumeLanding(props: ResumeLandingProps) {
    const coordinator = props.coordinator ?? resumeAppCoordinator;
    const createResume = props.createResume ?? (() => coordinator.showTemplateSelector());
    const resumeFromLanding = () => coordinator.resumeFromLanding({
        hasSuspendedSession: props.hasSuspendedSession,
        lastDocumentId: props.lastDocumentId,
        selectDocument: props.selectDocument
    });

    return (
        <DefaultLayout
            topNav={props.topNav}
            main={<>
                <Landing
                    className={props.className}
                    loadLocal={() => { void resumeFromLanding(); }}
                    new={createResume}
                    loadData={props.importDocument ?? importLocalData}
                    hasLocalResume={props.hasSuspendedSession || Boolean(props.lastDocumentId)}
                    documents={props.documents}
                    documentLabels={props.documentLabels}
                    documentGroups={props.documentGroups}
                    documentActions={props.documentActions}
                    activeDocumentId={props.activeDocumentId}
                    openDocument={props.selectDocument}
                    deleteDocument={props.deleteDocument}
                    renameDocument={props.renameDocument}
                    renderLead={props.renderLead}
                    showSocialLinks={props.showSocialLinks}
                />
                <Toast />
            </>}
        />
    );
}
