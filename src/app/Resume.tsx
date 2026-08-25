import * as React from 'react';

import '@/assets/fonts/icofont.subset.css';
import 'popright/styles.css';
import 'popright/dropdown.css';
import 'purecss/build/pure-min.css';
import '@/sass/index.scss';

import ResumeAppContainer from '@/app/ResumeAppContainer';
import ResumeEditor from '@/app/ResumeEditor';
import ResumeLanding from '@/app/ResumeLanding';
import ResumeShell from '@/app/ResumeShell';
import ResumeTemplateSelector from '@/app/ResumeTemplateSelector';
import {
    resolveResumeAppExtensions,
    type ResumeProps
} from '@/app/ResumeAppContracts';
import PageSize from '@/types/PageSize';

export {
    mergeResumeAppExtensions,
    resolveResumeAppExtensions
} from '@/app/ResumeAppContracts';
export type {
    AdditionalSidebarTab,
    AdditionalTemplateGroup,
    AdditionalTemplateOption,
    DeleteDocumentConfirmationRequest,
    ResumeAppConfiguration,
    ResumeAppExtensions,
    ResumeDocumentAction,
    ResumeDocumentGroup,
    ResumeDocumentOpeningExtensions,
    ResumeDocumentOpeningRenderProps,
    ResumeEditorExtensions,
    ResumeLandingExtensions,
    ResumeProps,
    ResumeShellExtensions,
    ResumeTemplateExtensions,
    ResumeWrapperProps
} from '@/app/ResumeAppContracts';

/** Public facade and application-mode composition boundary. */
export function Resume(props: ResumeProps) {
    const extensions = resolveResumeAppExtensions(props);
    const pageSize = props.pageSize || PageSize.Letter;
    const nodes = props.tree.childNodes || [];
    const documentOpen = props.documentOpen?.status === 'loading'
        || props.documentOpen?.status === 'error'
        ? props.documentOpen
        : undefined;
    const isEditing = !documentOpen && (props.mode || 'landing') === 'normal';
    const shell = (
        <ResumeShell
            isEditing={isEditing}
            pageSize={pageSize}
            nodes={nodes}
            stylesheet={props.stylesheet}
            documentFonts={props.documentFonts}
            documents={props.documents}
            documentLabels={extensions.landing?.documentLabels}
            activeDocumentId={props.activeDocumentId}
            saveCurrentDocument={props.saveCurrentDocument}
            selectDocument={props.selectDocument}
            renameDocument={props.renameDocument}
            importDocument={props.importDocument}
            saveStatus={props.saveStatus}
            landingNavigationDisabled={Boolean(documentOpen)}
            additionalToolbarSections={extensions.editor?.additionalToolbarSections}
            extensions={extensions.shell}
        />
    );

    if (documentOpen) {
        const opening = extensions.documentOpening?.render?.({
            topNav: shell,
            state: documentOpen,
            retry: props.retryDocumentOpen,
            dismiss: props.dismissDocumentOpen
        });
        return <>{opening ?? shell}</>;
    }

    switch (props.mode) {
        case 'changingTemplate':
            return (
                <ResumeTemplateSelector
                    topNav={shell}
                    pageSize={pageSize}
                    additionalTemplateGroups={extensions.templates?.additionalTemplateGroups}
                    createDocumentFromTemplate={props.createDocumentFromTemplate}
                />
            );
        case 'landing':
            return (
                <ResumeLanding
                    topNav={shell}
                    className={extensions.landing?.landingClassName}
                    documents={props.documents}
                    documentLabels={extensions.landing?.documentLabels}
                    documentGroups={extensions.landing?.documentGroups}
                    documentActions={extensions.landing?.documentActions}
                    activeDocumentId={props.activeDocumentId}
                    lastDocumentId={props.lastDocumentId}
                    hasSuspendedSession={props.hasSuspendedSession}
                    selectDocument={props.selectDocument}
                    deleteDocument={props.deleteDocument}
                    renameDocument={props.renameDocument}
                    importDocument={props.importDocument}
                    renderLead={extensions.landing?.renderLandingLead}
                    showSocialLinks={extensions.landing?.showLandingSocialLinks}
                />
            );
        default:
            return (
                <ResumeEditor
                    topNav={shell}
                    nodes={nodes}
                    pageSize={pageSize}
                    selectedNodeId={props.selectedNodeId}
                    stylesheet={props.stylesheet}
                    additionalSidebarTabs={extensions.editor?.additionalSidebarTabs}
                />
            );
    }
}

export default ResumeAppContainer;
