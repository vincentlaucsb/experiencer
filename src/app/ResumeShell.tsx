import * as React from 'react';

import type { ResumeShellExtensions } from '@/app/ResumeAppContracts';
import { toResumeOutputDocument } from '@/app/ResumeAppContracts';
import SaveAsDialog from '@/controls/SaveAsDialog';
import TopEditingBar from '@/controls/TopEditingBar';
import TopNavBar from '@/controls/TopNavBar';
import type { ToolbarData } from '@/controls/toolbar/ToolbarMaker';
import type { ResumeDocumentSummary } from '@/shared/repositories/ResumeRepository';
import {
    resumeAppCoordinator,
    type ResumeAppCoordinator
} from '@/shared/services/ResumeAppCoordinator';
import {
    resumeOutputController,
    type ResumeOutputController
} from '@/shared/services/ResumeOutputController';
import type { ResumeFont, ResumeNode } from '@/types';
import type PageSize from '@/types/PageSize';

export interface ResumeShellProps {
    isEditing: boolean;
    pageSize?: PageSize;
    nodes: ResumeNode[];
    stylesheet: string;
    documentFonts?: ResumeFont[];
    documents?: ResumeDocumentSummary[];
    documentLabels?: Record<string, string>;
    activeDocumentId?: string;
    saveCurrentDocument?: () => void;
    selectDocument?: (id: string) => void;
    renameDocument?: (id: string, title: string) => Promise<string | null>;
    importDocument?: (data: object, title?: string) => void;
    saveStatus?: string;
    additionalToolbarSections?: ToolbarData;
    extensions?: ResumeShellExtensions;
    coordinator?: ResumeAppCoordinator;
    output?: ResumeOutputController;
}

/** Renders shared header chrome from a prepared model and binds output commands. */
export default function ResumeShell(props: ResumeShellProps) {
    const coordinator = props.coordinator ?? resumeAppCoordinator;
    const output = props.output ?? resumeOutputController;
    const extensions = props.extensions ?? {};
    const source = toResumeOutputDocument({
        tree: { type: 'Resume', uuid: 'shell-root', childNodes: props.nodes },
        stylesheet: props.stylesheet,
        pageSize: props.pageSize,
        documentFonts: props.documentFonts,
        documents: props.documents,
        activeDocumentId: props.activeDocumentId
    });
    const sourceRef = React.useRef(source);
    sourceRef.current = source;
    const activeDocumentTitle = props.documents?.find(
        (document) => document.id === props.activeDocumentId
    )?.title;

    React.useEffect(() => coordinator.bindDocumentTitle(activeDocumentTitle), [
        activeDocumentTitle,
        coordinator
    ]);

    React.useEffect(() => output.bindBrowserOutput(() => sourceRef.current), [output]);

    return (
        <header id="app-header" className="no-print app-mb-4">
            {extensions.overlays}
            <SaveAsDialog isEditing={props.isEditing} />
            <TopNavBar
                exportHtml={() => output.exportHtml(source)}
                exportToPng={() => output.exportPng(source)}
                print={() => output.print(source)}
                new={() => coordinator.showTemplateSelector()}
                documents={props.documents}
                documentLabels={props.documentLabels}
                activeDocumentId={props.activeDocumentId}
                selectDocument={props.selectDocument}
                renameDocument={props.renameDocument}
                loadData={props.importDocument}
                saveLocal={props.saveCurrentDocument}
                saveStatus={props.saveStatus}
                isEditing={props.isEditing}
                proBadge={extensions.proBadge}
                accountLabel={extensions.accountLabel}
                editingStorage={extensions.editingStorage}
                signOut={extensions.signOut}
                signIn={extensions.signIn}
                fileMenuItems={extensions.fileMenuItems}
                helpMenuItems={extensions.helpMenuItems}
                secondaryItems={extensions.topSecondaryItems}
                documentItems={extensions.documentMenuItems}
            />
            {props.isEditing ? (
                <TopEditingBar
                    saveLocal={props.saveCurrentDocument}
                    additionalToolbarSections={props.additionalToolbarSections}
                />
            ) : <></>}
        </header>
    );
}
