import * as React from 'react';
import { createPortal } from 'react-dom';
import { useRef, useCallback, useSyncExternalStore } from 'react';

import '@/assets/fonts/icofont.min.css';
import 'popright/styles.css';
import 'purecss/build/pure-min.css';
import '@/sass/index.scss';

// Utilities
import { createContainer } from '@/shared/utils/createContainer';
import { exportResumeAsHtml } from '@/shared/utils/PrintHelpers';
import { exportResumeToPng } from '@/shared/utils/ExportPng';

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
import Help from '@/help/Help';
import Landing from '@/help/Landing';
import ResumePreview from '@/resume/ResumePreview';
import ResumeRenderer from '@/resume/ResumeRenderer';
import ResumeTemplates from '@/templates/ResumeTemplates';
import ResumeCssEditor from '@/app/ResumeCssEditor';
import PageSize from '@/types/PageSize';

// Stores
import { useEditorStore, usePageSize, useSelectedNodeId, useIsEditingSelected } from '@/shared/stores/editorStore';
import { workspaceStore } from '@/shared/stores/workspaceStore';
import { useWorkspaceSnapshot } from '@/shared/stores/workspaceStoreHooks';
import { useResumeTree, resumeNodeStore } from '@/shared/stores/resumeNodeStore';
import { useTreeStylesheet } from '@/shared/stores/cssStoreHooks';

// Types
import { IdType, NodeProperty, ResumeSaveData, ResumeNode, EditorMode } from '@/types';
import useHandlePrint from '@/shared/hooks/useHandlePrint';
import useStylesheet from '@/shared/hooks/useStylesheet';
import { useEffect } from 'react';
import loadData, { loadLocal } from '@/shared/stores/loadData';
import { ResumeDocumentSummary, ResumeRepository } from '@/shared/repositories/ResumeRepository';
import ResumeLibraryStore, { ResumeLibraryController } from '@/shared/stores/resumeLibraryStore';

// Dynamic imports (lazy-loaded on-demand)
const SelectedNodeHighlightBox = React.lazy(
    () => import('@/editor/HighlightBox').then(m => ({ default: m.SelectedNodeHighlightBox }))
);

function TemplatePreview(props: { pageSize: PageSize; templateKey: string }) {
    const template = ResumeTemplates.templates[props.templateKey]
        ?? ResumeTemplates.templates.Integrity;

    return (
        <ResumePreview
            data={template}
            pageSize={props.pageSize}
            ariaLabel={`${props.templateKey} template preview`}
        />
    );
}

export interface AdditionalTemplateOption {
    id: string;
    title: string;
    loadPreview: () => Promise<ResumeSaveData>;
    use: () => Promise<void> | void;
}

export interface AdditionalTemplateGroup {
    id: string;
    heading: React.ReactNode;
    templates: AdditionalTemplateOption[];
    emptyState?: React.ReactNode;
}

export interface ResumeDocumentGroup {
    id: string;
    title: string;
    documentIds: string[];
}

export interface ResumeDocumentAction {
    id: string;
    label: string;
    disabled?: boolean;
    run: () => Promise<void> | void;
}

type AdditionalTemplatePreviewState = {
    key?: string;
    status: 'idle' | 'loading' | 'ready' | 'error';
    data?: ResumeSaveData;
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
    signOut?: () => void;
    signIn?: () => void;
    saveCurrentDocument?: () => void;
    selectDocument?: (id: string) => void;
    deleteDocument?: (id: string) => void;
    renameDocument?: (id: string, title: string) => Promise<string | null>;
    createDocumentFromTemplate?: (key?: string) => void;
    importDocument?: (data: object, title?: string) => void;
    fileMenuItems?: React.ReactNode;
    topMenuItems?: React.ReactNode;
    documentMenuItems?: React.ReactNode;
    additionalTemplateGroups?: AdditionalTemplateGroup[];
    overlays?: React.ReactNode;
}

export type ResumeWrapperProps = Partial<Omit<ResumeProps, 'selectedNodeId' | 'isEditingSelected'>> & {
    resumeRepository?: ResumeRepository;
    proBadge?: string;
    accountLabel?: string;
    signOut?: () => void;
    signIn?: () => void;
    resumeLibraryStore?: ResumeLibraryController;
};

export function Resume(props: ResumeProps) {
    const resumeRef = useRef<HTMLDivElement>(null);
    const [selectedTemplateKey, setSelectedTemplateKey] = React.useState('Integrity');
    const [selectedAdditionalTemplateKey, setSelectedAdditionalTemplateKey] = React.useState<string>();
    const [additionalPreview, setAdditionalPreview] = React.useState<AdditionalTemplatePreviewState>({
        status: 'idle'
    });
    const [templateActionStatus, setTemplateActionStatus] = React.useState<'idle' | 'using'>('idle');
    const [templateActionError, setTemplateActionError] = React.useState<string>();
    const resumeNodes = props.tree.childNodes || [];
    const pageSize = props.pageSize || PageSize.Letter;
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
        return mode === 'normal' || mode === 'help';
    })();

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
        const templateNames = Object.keys(ResumeTemplates.templates);
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
                    {(props.additionalTemplateGroups ?? []).map((group) => (
                        <React.Fragment key={group.id}>
                            <PureMenuItem className="template-selector-group-heading">
                                {group.heading}
                            </PureMenuItem>
                            {group.templates.length
                                ? group.templates.map((template) => {
                                    const key = `${group.id}:${template.id}`;
                                    return (
                                        <PureMenuItem
                                            key={key}
                                            selected={selectedAdditionalTemplateKey === key}
                                            onClick={() => selectAdditionalTemplate(group.id, template.id)}
                                        >
                                            <PureMenuLink>{template.title}</PureMenuLink>
                                        </PureMenuItem>
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
                <Button
                    className="template-selector-primary-action"
                    disabled={templateActionStatus === 'using'
                        || Boolean(additionalTemplate && additionalPreview.status !== 'ready')}
                    onClick={useSelectedTemplate}
                    variant="primary"
                >
                    {templateActionStatus === 'using' ? 'Creating…' : 'Use this Template'}
                </Button>
            </div>
        );
    };

    const renderTemplatePreview = () => {
        if (!additionalTemplate) {
            return <TemplatePreview pageSize={pageSize} templateKey={selectedTemplateKey} />;
        }

        if (additionalPreview.status === 'error') {
            return (
                <div className="template-preview-status" role="alert">
                    {additionalPreview.message}
                </div>
            );
        }

        if (additionalPreview.status !== 'ready' || !additionalPreview.data) {
            return (
                <div className="template-preview-status" role="status">
                    Loading template preview…
                </div>
            );
        }

        return (
            <ResumePreview
                data={additionalPreview.data}
                pageSize={pageSize}
                ariaLabel={`${additionalTemplate.title} template preview`}
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
        // TODO: Make this user defineable
        const filename = 'resume.html';
        exportResumeAsHtml(resumeRef.current, props.stylesheet ?? '', filename);
    }, [props.stylesheet]);

    const exportToPng = useCallback(() => {
        exportResumeToPng(resumeRef.current);
    }, []);

    const exitPrintPreview = useCallback(() => {
        workspaceStore.finishPrinting();
    }, []);

    const openPrintDialog = useCallback(() => {
        window.print();
    }, []);

    // Helper Component Props
    const topMenuProps: TopNavBarWrapperProps = {
        exportHtml: exportHtml,
        exportToPng: exportToPng,
        new: openTemplateSelector,
        documents: props.documents,
        documentLabels: props.documentLabels,
        activeDocumentId: props.activeDocumentId,
        selectDocument: props.selectDocument,
        loadData: props.importDocument,
        saveLocal: props.saveCurrentDocument,
        saveStatus: props.saveStatus,
        isEditing,
        proBadge: props.proBadge,
        accountLabel: props.accountLabel,
        signOut: props.signOut,
        signIn: props.signIn,
        fileMenuItems: props.fileMenuItems,
        extraItems: props.topMenuItems,
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
        </Tabs>
    };

    // Main Render Logic
    const { mode } = props;
    const hlBoxContainer = createContainer("hl-box-container");
    const resume = (
        <>
            <ResumeRenderer
                nodes={resumeNodes}
                pageSize={pageSize}
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
    
    const editingTop = mode === 'printing' ? <></> : (
        <header id="app-header" className="no-print app-mb-4">
            {props.overlays}
            <TopNavBar {...topMenuProps} />
            {isEditing ? <TopEditingBar saveLocal={props.saveCurrentDocument} /> : <></>}
        </header>
    );

    // Render the final layout based on editor mode
    switch (mode) {
        case 'help':
            return <ResizableSidebarLayout
                topNav={editingTop}
                main={resume}
                sidebar={<Help close={workspaceStore.toggleHelp} />}
            />
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
                />
                } />
        case 'printing':
            return (
                <>
                    <div id="print-preview-actions" className="no-print app-gap-4 app-p-4">
                        <Button className="print-preview-exit" onClick={exitPrintPreview}>
                            Exit Print Preview
                        </Button>
                        <Button
                            className="print-preview-print"
                            variant="primary"
                            onClick={openPrintDialog}
                        >
                            Print
                        </Button>
                    </div>
                    {resume}
                </>
            );
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
        void libraryStore.initialize();
    }, [libraryStore]);

    const requestDeleteDocument = React.useCallback((id: string) => {
        setDocumentPendingDelete(
            library.documents.find((document) => document.id === id)
        );
    }, [library.documents]);

    const confirmDeleteDocument = React.useCallback(async () => {
        if (!documentPendingDelete) {
            return;
        }

        const id = documentPendingDelete.id;
        setDocumentPendingDelete(undefined);
        await libraryStore.deleteDocument(id);
    }, [documentPendingDelete, libraryStore]);

    useHandlePrint();
    useStylesheet(mode === "changingTemplate" ? "" : stylesheet);

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
