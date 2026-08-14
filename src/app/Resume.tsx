import * as React from 'react';
import { createPortal } from 'react-dom';
import { useRef, useCallback, useSyncExternalStore } from 'react';
import type { MenuItem } from 'popright';

import '@/assets/fonts/icofont.min.css';
import 'popright/styles.css';
import 'popright/dropdown.css';
import 'purecss/build/pure-min.css';
import '@/sass/index.scss';

// Utilities
import { createContainer } from '@/shared/utils/createContainer';
import { exportResumeAsHtml, printResume } from '@/shared/utils/PrintHelpers';

// Components
import { Button } from '@/controls/Buttons';
import ConfirmationModal from '@/controls/ConfirmationModal';
import { ResizableSidebarLayout, StaticSidebarLayout, DefaultLayout } from '@/controls/Layouts';
import ResumeHotKeys from '@/controls/ResumeHotkeys';
import TopEditingBar from '@/controls/TopEditingBar';
import TopNavBar, { TopNavBarWrapperProps } from '@/controls/TopNavBar';
import Tabs from '@/controls/Tabs';
import Toast from '@/controls/Toast';
import PureMenu, { PureMenuLink, PureMenuItem } from '@/controls/menus/PureMenu';
import NodeTreeVisualizer from '@/editor/NodeTreeVisualizer';
import Landing, { LandingActions, LandingContext } from '@/help/Landing';
import { ResumePreviewFrame } from '@/resume/ResumePreview';
import ResumeRenderer from '@/resume/ResumeRenderer';
import ResumeTemplates from '@/templates/ResumeTemplates';
import builtinTemplatePreviewImages from '@/templates/builtinTemplatePreviewImages';
import ResumeCssEditor from '@/app/ResumeCssEditor';
import PngExportFeature from '@/app/PngExportFeature';
import PageSize from '@/types/PageSize';

// Stores
import { useEditorStore, usePageSize, useSelectedNodeId, useIsEditingSelected } from '@/shared/stores/editorStore';
import { workspaceStore } from '@/shared/stores/workspaceStore';
import { useWorkspaceSnapshot } from '@/shared/stores/workspaceStoreHooks';
import { useResumeTree, resumeNodeStore } from '@/shared/stores/resumeNodeStore';
import { useTreeStylesheet } from '@/shared/stores/cssStoreHooks';
import { useDocumentFonts } from '@/shared/stores/documentFontsStore';
import { showToast } from '@/shared/stores/toastStore';

// Types
import { IdType, NodeProperty, ResumeSaveData, ResumeNode, EditorMode } from '@/types';
import type { ResumeFont } from '@/types';
import type { ResumeDocumentSource } from '@/shared/resumeDocument/prepareResumeDocument';
import useHandlePrint from '@/shared/hooks/useHandlePrint';
import useStylesheet from '@/shared/hooks/useStylesheet';
import { useEffect } from 'react';
import loadData, { loadLocal } from '@/shared/stores/loadData';
import { ResumeDocumentSummary, ResumeRepository } from '@/shared/repositories/ResumeRepository';
import ResumeLibraryStore, { ResumeLibraryController } from '@/shared/stores/resumeLibraryStore';
import { pngExportStore } from '@/shared/stores/pngExportStore';
import type { ToolbarData } from '@/controls/toolbar/ToolbarMaker';

// Dynamic imports (lazy-loaded on-demand)
const SelectedNodeHighlightBox = React.lazy(
    () => import('@/editor/HighlightBox').then(m => ({ default: m.SelectedNodeHighlightBox }))
);

function TemplatePreview(props: { templateKey: string }) {
    const image = builtinTemplatePreviewImages[props.templateKey]
        ?? builtinTemplatePreviewImages.Integrity;

    return (
        <div className="template-preview-image">
            <img src={image} alt={`${props.templateKey} template preview`} />
        </div>
    );
}

export interface AdditionalTemplateOption {
    id: string;
    title: string;
    loadPreview?: () => Promise<ResumeSaveData>;
    previewImage?: string;
    previewAlt?: string;
    previewLabel?: string;
    use: () => Promise<void> | void;
    useLabel?: string;
    useDescription?: React.ReactNode;
}

export interface AdditionalTemplateGroup {
    id: string;
    heading: React.ReactNode;
    templates: AdditionalTemplateOption[];
    emptyState?: React.ReactNode;
}

export interface AdditionalSidebarTab {
    key: string;
    content: React.ReactNode;
}

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

type AdditionalTemplatePreviewState = {
    key?: string;
    status: 'idle' | 'loading' | 'ready' | 'error';
    data?: ResumeSaveData;
    image?: string;
    message?: string;
};

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
    createDocumentFromTemplate?: (key?: string) => void;
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
    const resumeRef = useRef<HTMLDivElement>(null);
    const applicationTitle = useRef(
        typeof document === 'undefined' ? 'Experiencer' : document.title
    );
    const [selectedTemplateKey, setSelectedTemplateKey] = React.useState('Integrity');
    const [selectedAdditionalTemplateKey, setSelectedAdditionalTemplateKey] = React.useState<string>();
    const [additionalPreview, setAdditionalPreview] = React.useState<AdditionalTemplatePreviewState>({
        status: 'idle'
    });
    const [templateActionStatus, setTemplateActionStatus] = React.useState<'idle' | 'using'>('idle');
    const [templateActionError, setTemplateActionError] = React.useState<string>();
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
    const additionalTemplate = React.useMemo(() => {
        if (!selectedAdditionalTemplateKey) {
            return undefined;
        }

        for (const group of props.additionalTemplateGroups ?? []) {
            for (const template of group.templates) {
                if (`${group.id}:${template.id}` === selectedAdditionalTemplateKey) {
                    return template;
                }
            }
        }

        return undefined;
    }, [props.additionalTemplateGroups, selectedAdditionalTemplateKey]);

    useEffect(() => {
        if (selectedAdditionalTemplateKey && !additionalTemplate) {
            setSelectedAdditionalTemplateKey(undefined);
            setTemplateActionError('This template is no longer available.');
            setAdditionalPreview({ status: 'idle' });
            return;
        }

        if (!selectedAdditionalTemplateKey) {
            setAdditionalPreview({ status: 'idle' });
            return;
        }
        if (!additionalTemplate) {
            setAdditionalPreview({ status: 'idle' });
            return;
        }

        let cancelled = false;
        setAdditionalPreview({
            key: selectedAdditionalTemplateKey,
            status: 'loading'
        });

        if (additionalTemplate.previewImage) {
            setAdditionalPreview({
                key: selectedAdditionalTemplateKey,
                status: 'ready',
                image: additionalTemplate.previewImage
            });
            return;
        }

        if (!additionalTemplate.loadPreview) {
            setAdditionalPreview({
                key: selectedAdditionalTemplateKey,
                status: 'error',
                message: 'This template preview is unavailable.'
            });
            return;
        }

        additionalTemplate.loadPreview()
            .then((data) => {
                if (!cancelled) {
                    setAdditionalPreview({
                        key: selectedAdditionalTemplateKey,
                        status: 'ready',
                        data
                    });
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setAdditionalPreview({
                        key: selectedAdditionalTemplateKey,
                        status: 'error',
                        message: error instanceof Error
                            ? error.message
                            : 'Could not load this template preview.'
                    });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [additionalTemplate, selectedAdditionalTemplateKey]);

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

    // Change Templates
    const loadTemplate = useCallback((key = 'Integrity') => {
        if (props.createDocumentFromTemplate) {
            props.createDocumentFromTemplate(key);
            return;
        }

        const template: ResumeSaveData = ResumeTemplates.templates[key];
        loadData(template, 'changingTemplate');
    }, [props.createDocumentFromTemplate]);

    const selectBuiltInTemplate = useCallback((key: string) => {
        setSelectedAdditionalTemplateKey(undefined);
        setSelectedTemplateKey(key);
        setTemplateActionError(undefined);
    }, []);

    const selectAdditionalTemplate = useCallback((groupId: string, templateId: string) => {
        setSelectedAdditionalTemplateKey(`${groupId}:${templateId}`);
        setTemplateActionError(undefined);
    }, []);

    const useSelectedTemplate = useCallback(async () => {
        setTemplateActionError(undefined);
        if (!additionalTemplate) {
            loadTemplate(selectedTemplateKey);
            return;
        }

        setTemplateActionStatus('using');
        try {
            await additionalTemplate.use();
        } catch (error: unknown) {
            setTemplateActionError(error instanceof Error
                ? error.message
                : 'Could not create a document from this template.');
        } finally {
            setTemplateActionStatus('idle');
        }
    }, [additionalTemplate, loadTemplate, selectedTemplateKey]);

    const openTemplateSelector = useCallback(() => {
        workspaceStore.showTemplateSelector();
    }, []);

    const importLocalData = useCallback((data: object) => {
        loadData(data);
    }, []);

    const renderTemplateChanger = () => {
        const compareTitles = (left: string, right: string) => left.localeCompare(
            right,
            undefined,
            { sensitivity: 'base' }
        );
        const templateNames = Object.keys(ResumeTemplates.templates).sort(compareTitles);
        const additionalTemplateGroups = (props.additionalTemplateGroups ?? []).map((group) => ({
            ...group,
            templates: [...group.templates].sort((left, right) => compareTitles(left.title, right.title))
        }));
        return (
            <div id="template-selector">
                <PureMenu>
                    {templateNames.map((key: string) =>
                        <PureMenuItem
                            key={key}
                            selected={!selectedAdditionalTemplateKey && key === selectedTemplateKey}
                            onClick={() => selectBuiltInTemplate(key)}
                        >
                            <PureMenuLink>{key}</PureMenuLink>
                        </PureMenuItem>
                    )}
                    {additionalTemplateGroups.map((group) => (
                        <React.Fragment key={group.id}>
                            <PureMenuItem className="template-selector-group-heading">
                                {group.heading}
                            </PureMenuItem>
                            {group.templates.length
                                ? group.templates.map((template) => {
                                    const key = `${group.id}:${template.id}`;
                                    const selected = selectedAdditionalTemplateKey === key;
                                    return (
                                        <React.Fragment key={key}>
                                            <PureMenuItem
                                                selected={selected}
                                                onClick={() => selectAdditionalTemplate(group.id, template.id)}
                                            >
                                                <PureMenuLink>{template.title}</PureMenuLink>
                                            </PureMenuItem>
                                            {selected
                                                ? (
                                                    <PureMenuItem className="template-selector-selected-action">
                                                        {template.useDescription
                                                            ? (
                                                                <p className="template-selector-action-description">
                                                                    {template.useDescription}
                                                                </p>
                                                            )
                                                            : <></>}
                                                        <Button
                                                            className="template-selector-primary-action"
                                                            disabled={templateActionStatus === 'using'
                                                                || additionalPreview.status !== 'ready'}
                                                            onClick={useSelectedTemplate}
                                                            variant="primary"
                                                        >
                                                            {templateActionStatus === 'using'
                                                                ? 'Creating…'
                                                                : template.useLabel ?? 'Use this Template'}
                                                        </Button>
                                                    </PureMenuItem>
                                                )
                                                : <></>}
                                        </React.Fragment>
                                    );
                                })
                                : (
                                    <PureMenuItem className="template-selector-empty-state">
                                        {group.emptyState}
                                    </PureMenuItem>
                                )}
                        </React.Fragment>
                    ))}
                </PureMenu>
                {templateActionError
                    ? <p className="template-selector-error" role="alert">{templateActionError}</p>
                    : <></>}
                {!additionalTemplate
                    ? (
                        <Button
                            className="template-selector-primary-action"
                            disabled={templateActionStatus === 'using'}
                            onClick={useSelectedTemplate}
                            variant="primary"
                        >
                            {templateActionStatus === 'using' ? 'Creating…' : 'Use this Template'}
                        </Button>
                    )
                    : <></>}
            </div>
        );
    };

    const renderTemplatePreview = () => {
        if (!additionalTemplate) {
            return <TemplatePreview templateKey={selectedTemplateKey} />;
        }

        if (additionalPreview.status === 'error') {
            return (
                <div className="template-preview-status" role="alert">
                    {additionalPreview.message}
                </div>
            );
        }

        if (additionalPreview.status !== 'ready' || !additionalPreview.data) {
            if (additionalPreview.status === 'ready' && additionalPreview.image) {
                return (
                    <div className="template-preview-image">
                        <div className="template-preview-label">
                            {additionalTemplate.previewLabel ?? 'Preview only'}
                        </div>
                        <img
                            src={additionalPreview.image}
                            alt={additionalTemplate.previewAlt ?? `${additionalTemplate.title} template preview`}
                        />
                    </div>
                );
            }
            return (
                <div className="template-preview-status" role="status">
                    Loading template preview…
                </div>
            );
        }

        return (
            <ResumePreviewFrame
                data={additionalPreview.data}
                pageSize={pageSize}
                ariaLabel={`${additionalTemplate.title} template preview`}
                target="isolated-preview"
                iframeClassName="template-preview-frame"
            />
        );
    };

    // Creating/Editing Nodes
    const updateData = useCallback((id: IdType, key: string, data: any) => {
        resumeNodeStore.updateNode(id, key, data);
    }, []);

    const updateDataFields = useCallback((id: IdType, patch: Partial<Record<string, NodeProperty>>) => {
        resumeNodeStore.updateNodeFields(id, patch);
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

    const renderSidebar = () => {
        return <Tabs>
            <NodeTreeVisualizer key="Tree" childNodes={resumeNodes}
                selectNode={(uuid) => useEditorStore.getState().selectNode(uuid)}
                selectedNode={props.selectedNodeId}
            />
            <ResumeCssEditor key="CSS" selectedNodeId={props.selectedNodeId} />
            <div key="Raw CSS">
                <pre>
                    <code>
                        {props.stylesheet}
                    </code>
                </pre>
            </div>
            {(props.additionalSidebarTabs ?? []).map((tab) => (
                <React.Fragment key={tab.key}>{tab.content}</React.Fragment>
            ))}
        </Tabs>
    };

    // Main Render Logic
    const { mode } = props;

    const hlBoxContainer = createContainer("hl-box-container");
    const resume = (
        <>
            <PngExportFeature />
            <ResumeRenderer
                nodes={resumeNodes}
                pageSize={pageSize}
                root="editor-host"
                containerRef={resumeRef}
                beforeNodes={<ResumeHotKeys />}
                updateResumeData={updateData}
                updateResumeDataFields={updateDataFields}
            />
            {createPortal(
                <React.Suspense fallback={null}>
                    <SelectedNodeHighlightBox />
                </React.Suspense>,
                hlBoxContainer
            )}
            <Toast />
        </>
    );
    
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
            return <StaticSidebarLayout
                topNav={editingTop}
                main={renderTemplatePreview()}
                sidebar={renderTemplateChanger()}
            />
        case 'landing':
            return <DefaultLayout
                topNav={editingTop}
                main={<Landing
                    className={props.landingClassName}
                    loadLocal={() => {
                        if (props.hasSuspendedSession) {
                            workspaceStore.returnToEditing();
                            return;
                        }
                        if (props.lastDocumentId) {
                            props.selectDocument?.(props.lastDocumentId);
                            return;
                        }
                        loadLocal();
                    }}
                    new={openTemplateSelector}
                    loadData={props.importDocument ?? importLocalData}
                    hasLocalResume={props.hasSuspendedSession
                        || Boolean(props.lastDocumentId)}
                    documents={props.documents}
                    documentLabels={props.documentLabels}
                    documentGroups={props.documentGroups}
                    documentActions={props.documentActions}
                    activeDocumentId={props.activeDocumentId}
                    openDocument={props.selectDocument}
                    deleteDocument={props.deleteDocument}
                    renameDocument={props.renameDocument}
                    renderLead={props.renderLandingLead}
                    showSocialLinks={props.showLandingSocialLinks}
                />
                } />
        default:
            return <ResizableSidebarLayout
                topNav={editingTop}
                main={resume}
                sidebar={renderSidebar()}
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
