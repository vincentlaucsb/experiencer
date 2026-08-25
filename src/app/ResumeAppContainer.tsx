import * as React from 'react';
import { useSyncExternalStore } from 'react';

import ConfirmationModal from '@/controls/ConfirmationModal';
import { Resume, type ResumeWrapperProps } from '@/app/Resume';
import { mergeResumeAppExtensions } from '@/app/ResumeAppContracts';
import { usePageSize, useSelectedNodeId, useIsEditingSelected } from '@/shared/stores/editorStore';
import { resumeAppExtensionsStore } from '@/shared/stores/resumeAppExtensionsStore';
import { workspaceStore } from '@/shared/stores/workspaceStore';
import { useWorkspaceSnapshot } from '@/shared/stores/workspaceStoreHooks';
import { useResumeTree, resumeNodeStore } from '@/shared/stores/resumeNodeStore';
import { useTreeStylesheet } from '@/shared/stores/cssStoreHooks';
import { useDocumentFonts } from '@/shared/stores/documentFontsStore';
import useStylesheet from '@/shared/hooks/useStylesheet';
import type { ResumeDocumentSummary } from '@/shared/repositories/ResumeRepository';
import ResumeLibraryStore, {
    type ResumeLibraryController
} from '@/shared/stores/resumeLibraryStore';

/**
 * Subscribes to application stores and projects snapshots into the composition view.
 */
export default function ResumeAppContainer(props: ResumeWrapperProps) {
    const libraryStore = React.useMemo<ResumeLibraryController>(
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
    const extensionsStore = props.extensionsStore ?? resumeAppExtensionsStore;
    const hostedExtensions = useSyncExternalStore(
        extensionsStore.subscribe,
        extensionsStore.getSnapshot,
        extensionsStore.getSnapshot
    );
    const extensions = mergeResumeAppExtensions(hostedExtensions, props.extensions);
    const [documentPendingDelete, setDocumentPendingDelete] = React.useState<ResumeDocumentSummary>();
    const mode = props.mode || workspace.mode;

    React.useEffect(() => {
        if (props.nodes) {
            resumeNodeStore.setNodes(props.nodes);
        }
        if (props.mode) {
            workspaceStore.transitionTo(props.mode, props.activeDocumentId);
        }
    }, []);

    React.useEffect(() => {
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

    useStylesheet(mode === 'changingTemplate' ? '' : stylesheet, {
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
                documentOpen={library.documentOpen}
                retryDocumentOpen={libraryStore.retryDocumentOpen}
                dismissDocumentOpen={libraryStore.dismissDocumentOpen}
                extensions={extensions}
            />
        </>
    );
}
