import * as React from 'react';
import { useRef, useCallback, useSyncExternalStore } from 'react';
import type { MenuItem } from 'popright';

import '@/assets/fonts/icofont.min.css';
import 'popright/styles.css';
import 'popright/dropdown.css';
import 'purecss/build/pure-min.css';
import '@/sass/index.scss';

// Utilities
import { exportResumeAsHtml, printResume } from '@/shared/utils/PrintHelpers';

// Components
import ConfirmationModal from '@/controls/ConfirmationModal';
import TopEditingBar from '@/controls/TopEditingBar';
import TopNavBar, { TopNavBarWrapperProps } from '@/controls/TopNavBar';
import type { LandingActions, LandingContext } from '@/help/Landing';
import ResumeEditor, { type AdditionalSidebarTab } from '@/app/ResumeEditor';
import ResumeLanding from '@/app/ResumeLanding';
import ResumeTemplateSelector, {
    type AdditionalTemplateGroup,
    type AdditionalTemplateOption
} from '@/app/ResumeTemplateSelector';
import PageSize from '@/types/PageSize';

// Stores
import { usePageSize, useSelectedNodeId, useIsEditingSelected } from '@/shared/stores/editorStore';
import { workspaceStore } from '@/shared/stores/workspaceStore';
import { useWorkspaceSnapshot } from '@/shared/stores/workspaceStoreHooks';
import { useResumeTree, resumeNodeStore } from '@/shared/stores/resumeNodeStore';
import { useTreeStylesheet } from '@/shared/stores/cssStoreHooks';
import { useDocumentFonts } from '@/shared/stores/documentFontsStore';
import { showToast } from '@/shared/stores/toastStore';

// Types
import { ResumeNode, EditorMode } from '@/types';
import type { ResumeFont } from '@/types';
import type { ResumeDocumentSource } from '@/shared/resumeDocument/prepareResumeDocument';
import useHandlePrint from '@/shared/hooks/useHandlePrint';
import useStylesheet from '@/shared/hooks/useStylesheet';
import { useEffect } from 'react';
import { ResumeDocumentSummary, ResumeRepository } from '@/shared/repositories/ResumeRepository';
import ResumeLibraryStore, { ResumeLibraryController } from '@/shared/stores/resumeLibraryStore';
import { pngExportStore } from '@/shared/stores/pngExportStore';
import type { ToolbarData } from '@/controls/toolbar/ToolbarMaker';

export type { AdditionalSidebarTab } from '@/app/ResumeEditor';
export type {
    AdditionalTemplateGroup,
    AdditionalTemplateOption
} from '@/app/ResumeTemplateSelector';

export interface ResumeDocumentGroup {
    id: string;
    title: string;
    summary?: string;
    showWhenEmpty?: boolean;
    documentIds: string[];
}

export interface ResumeDocumentAction {
    id: string;
    label: string;
    disabled?: boolean;
    run: () => Promise<void> | void;
}

/** Allows an embedding product to replace the default delete confirmation for a document. */
export type DeleteDocumentConfirmationRequest = (
    document: ResumeDocumentSummary,
    defaultConfirm: () => void
) => void;

export interface ResumeProps {
    mode?: EditorMode;
    selectedNodeId?: string;
    isEditingSelected?: boolean;
    pageSize?: PageSize;
    nodes?: Array<ResumeNode>;
    stylesheet: string;
    tree: ResumeNode;
    documentFonts?: ResumeFont[];
    documents?: ResumeDocumentSummary[];
    documentLabels?: Record<string, string>;
    documentGroups?: ResumeDocumentGroup[];
    documentActions?: Record<string, ResumeDocumentAction[]>;
    activeDocumentId?: string;
    suspendedDocumentId?: string;
    hasSuspendedSession?: boolean;
    lastDocumentId?: string;
    saveStatus?: string;
    proBadge?: string;
    accountLabel?: string;
    editingStorage?: "local" | "cloud";
    signOut?: () => void;
    signIn?: () => void;
    saveCurrentDocument?: () => void;
    additionalToolbarSections?: ToolbarData;
    selectDocument?: (id: string) => void;
    deleteDocument?: (id: string) => void;
    requestDeleteConfirmation?: DeleteDocumentConfirmationRequest;
    renameDocument?: (id: string, title: string) => Promise<string | null>;
    createDocumentFromTemplate?: (key?: string) => Promise<void> | void;
    importDocument?: (data: object, title?: string) => void;
    fileMenuItems?: MenuItem[];
    helpMenuItems?: MenuItem[];
    topSecondaryItems?: React.ReactNode;
    documentMenuItems?: React.ReactNode;
    renderLandingLead?: (actions: LandingActions, context: LandingContext) => React.ReactNode;
    landingClassName?: string;
    showLandingSocialLinks?: boolean;
    additionalTemplateGroups?: AdditionalTemplateGroup[];
    overlays?: React.ReactNode;
    additionalSidebarTabs?: AdditionalSidebarTab[];
}

export type ResumeWrapperProps = Partial<Omit<ResumeProps, 'selectedNodeId' | 'isEditingSelected'>> & {
    resumeRepository?: ResumeRepository;
    /** Let an embedding application own library initialization when it has a feature runtime. */
    initializeLibrary?: boolean;
    proBadge?: string;
    accountLabel?: string;
    signOut?: () => void;
    signIn?: () => void;
    resumeLibraryStore?: ResumeLibraryController;
};

export function Resume(props: ResumeProps) {
    const applicationTitle = useRef(
        typeof document === 'undefined' ? 'Experiencer' : document.title
    );
    const resumeNodes = props.tree.childNodes || [];
    const pageSize = props.pageSize || PageSize.Letter;
    const outputDocument = React.useMemo<ResumeDocumentSource>(() => ({
        nodes: resumeNodes,
        stylesheet: props.stylesheet ?? '',
        pageSize,
        fonts: props.documentFonts,
        ariaLabel: props.documents?.find((item) => item.id === props.activeDocumentId)?.title
            ?? 'Resume'
    }), [
        pageSize,
        props.activeDocumentId,
        props.documentFonts,
        props.documents,
        props.stylesheet,
        resumeNodes
    ]);
    // Returns true if we are actively editing a resume
    const isEditing = (() => {
        const mode = props.mode || 'landing';
        return mode === 'normal';
    })();
    const activeDocumentTitle = props.documents?.find(
        (document) => document.id === props.activeDocumentId
    )?.title;

    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        document.title = activeDocumentTitle
            ? `${activeDocumentTitle} | ${applicationTitle.current}`
            : applicationTitle.current;

        return () => {
            document.title = applicationTitle.current;
        };
    }, [activeDocumentTitle]);

    const openTemplateSelector = useCallback(() => {
        workspaceStore.showTemplateSelector();
    }, []);

    // Serialization
    const exportHtml = useCallback(() => {
        void exportResumeAsHtml(outputDocument, 'resume.zip')
            .catch((error: unknown) => showToast(
                error instanceof Error ? error.message : 'Could not export the HTML package.'
            ));
    }, [outputDocument]);

    const printDocument = useCallback(() => {
        void printResume(outputDocument)
            .catch((error: unknown) => showToast(
                error instanceof Error ? error.message : 'Could not open the print preview.'
            ));
    }, [outputDocument]);

    useHandlePrint(printDocument);

    const exportToPng = useCallback(() => {
        pngExportStore.start(outputDocument);
    }, [outputDocument]);

    // Helper Component Props
    const topMenuProps: TopNavBarWrapperProps = {
        exportHtml: exportHtml,
        exportToPng: exportToPng,
        print: printDocument,
        new: openTemplateSelector,
        documents: props.documents,
        documentLabels: props.documentLabels,
        activeDocumentId: props.activeDocumentId,
        selectDocument: props.selectDocument,
        renameDocument: props.renameDocument,
        loadData: props.importDocument,
        saveLocal: props.saveCurrentDocument,
        saveStatus: props.saveStatus,
        isEditing,
        proBadge: props.proBadge,
        accountLabel: props.accountLabel,
        editingStorage: props.editingStorage,
        signOut: props.signOut,
        signIn: props.signIn,
        fileMenuItems: props.fileMenuItems,
        helpMenuItems: props.helpMenuItems,
        secondaryItems: props.topSecondaryItems,
        documentItems: props.documentMenuItems
    };

    // Main Render Logic
    const { mode } = props;
    
    const editingTop = (
        <header id="app-header" className="no-print app-mb-4">
            {props.overlays}
            <TopNavBar {...topMenuProps} />
            {isEditing ? (
                <TopEditingBar
                    saveLocal={props.saveCurrentDocument}
                    additionalToolbarSections={props.additionalToolbarSections}
                />
            ) : <></>}
        </header>
    );

    // Render the final layout based on editor mode
    switch (mode) {
        case 'changingTemplate':
            return <ResumeTemplateSelector
                topNav={editingTop}
                pageSize={pageSize}
                additionalTemplateGroups={props.additionalTemplateGroups}
                createDocumentFromTemplate={props.createDocumentFromTemplate}
            />
        case 'landing':
            return <ResumeLanding
                topNav={editingTop}
                className={props.landingClassName}
                documents={props.documents}
                documentLabels={props.documentLabels}
                documentGroups={props.documentGroups}
                documentActions={props.documentActions}
                activeDocumentId={props.activeDocumentId}
                lastDocumentId={props.lastDocumentId}
                hasSuspendedSession={props.hasSuspendedSession}
                selectDocument={props.selectDocument}
                deleteDocument={props.deleteDocument}
                renameDocument={props.renameDocument}
                importDocument={props.importDocument}
                createResume={openTemplateSelector}
                renderLead={props.renderLandingLead}
                showSocialLinks={props.showLandingSocialLinks}
            />
        default:
            return <ResumeEditor
                topNav={editingTop}
                nodes={resumeNodes}
                pageSize={pageSize}
                selectedNodeId={props.selectedNodeId}
                stylesheet={props.stylesheet}
                additionalSidebarTabs={props.additionalSidebarTabs}
            />
    }
}

/**
 * Functional wrapper that subscribes to mode and selection state.
 * Provides these as props to the Resume component for selective re-rendering.
 */
function ResumeContainer(props: ResumeWrapperProps) {
    const libraryStore = React.useMemo(
        () => props.resumeLibraryStore ?? new ResumeLibraryStore(props.resumeRepository),
        [props.resumeLibraryStore, props.resumeRepository]
    );
    const library = useSyncExternalStore(
        libraryStore.subscribe,
        libraryStore.getSnapshot,
        libraryStore.getSnapshot
    );
    const stylesheet = useTreeStylesheet();
    const documentFonts = useDocumentFonts();
    const workspace = useWorkspaceSnapshot();
    const pageSize = usePageSize();
    const selectedNodeId = useSelectedNodeId();
    const isEditingSelected = useIsEditingSelected();
    const tree = useResumeTree();
    const [documentPendingDelete, setDocumentPendingDelete] = React.useState<ResumeDocumentSummary>();
    
    // Use prop mode if provided (for tests), otherwise use store mode
    const mode = props.mode || workspace.mode;

    // Initialize stores with props if provided (unit tests only)
    useEffect(() => {
        if (props.nodes) {
            resumeNodeStore.setNodes(props.nodes);
        }
        if (props.mode) {
            workspaceStore.transitionTo(props.mode, props.activeDocumentId);
        }
    }, []); // Run once on mount

    useEffect(() => {
        if (!props.mode) {
            workspaceStore.reset();
        }
        if (props.initializeLibrary !== false) {
            void libraryStore.initialize();
        }
    }, [libraryStore, props.initializeLibrary, props.mode]);

    const requestDeleteDocument = React.useCallback((id: string) => {
        const document = library.documents.find((item) => item.id === id);
        if (!document) {
            return;
        }

        const defaultConfirm = () => setDocumentPendingDelete(document);
        if (props.requestDeleteConfirmation) {
            props.requestDeleteConfirmation(document, defaultConfirm);
        } else {
            defaultConfirm();
        }
    }, [library.documents, props.requestDeleteConfirmation]);

    const confirmDeleteDocument = React.useCallback(async () => {
        if (!documentPendingDelete) {
            return;
        }

        const id = documentPendingDelete.id;
        setDocumentPendingDelete(undefined);
        await libraryStore.deleteDocument(id);
    }, [documentPendingDelete, libraryStore]);

    useStylesheet(mode === "changingTemplate" ? "" : stylesheet, {
        fontFamilies: documentFonts,
        documentFonts
    });

    return (
        <>
            <ConfirmationModal
                isOpen={Boolean(documentPendingDelete)}
                title="Delete resume"
                confirmLabel="Delete"
                onCancel={() => setDocumentPendingDelete(undefined)}
                onConfirm={confirmDeleteDocument}
            >
                <p>
                    Delete <strong>{documentPendingDelete?.title}</strong>? This action cannot be undone.
                </p>
            </ConfirmationModal>
            <Resume
                {...props}
                mode={mode}
                pageSize={pageSize}
                selectedNodeId={selectedNodeId}
                isEditingSelected={isEditingSelected}
                stylesheet={stylesheet}
                documentFonts={documentFonts}
                tree={tree}
                documents={library.documents}
                activeDocumentId={workspace.activeDocumentId}
                suspendedDocumentId={workspace.suspendedDocumentId}
                hasSuspendedSession={workspace.hasSuspendedSession}
                lastDocumentId={library.activeDocumentId}
                selectDocument={libraryStore.selectDocument}
                deleteDocument={requestDeleteDocument}
                renameDocument={libraryStore.renameDocument}
                saveCurrentDocument={libraryStore.saveCurrentDocument}
                createDocumentFromTemplate={libraryStore.createDocumentFromTemplate}
                importDocument={libraryStore.importDocument}
                saveStatus={library.saveStatus}
                proBadge={props.proBadge}
                accountLabel={props.accountLabel}
                signOut={props.signOut}
                signIn={props.signIn}
            />
        </>
    );
}

export default ResumeContainer;
