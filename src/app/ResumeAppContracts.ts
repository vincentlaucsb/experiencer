import type { ResumeDocumentStatusSource } from '@/shared/stores/ResumeDocumentStatusSource';
import type { MenuItem } from 'popright';
import type * as React from 'react';

import type { AdditionalSidebarTab } from '@/app/ResumeEditor';
import type { AdditionalTemplateGroup } from '@/app/ResumeTemplateSelector';
import type { ToolbarData } from '@/controls/toolbar/ToolbarMaker';
import type { LandingActions, LandingContext } from '@/help/Landing';
import type { ResumeDocumentSummary, ResumeRepository } from '@/shared/repositories/ResumeRepository';
import type { ResumeAppExtensionsStore } from '@/shared/stores/resumeAppExtensionsStore';
import type {
    ResumeDocumentOpenSnapshot,
    ResumeLibraryController
} from '@/shared/stores/resumeLibraryStore';
import type { ResumeDocumentSource } from '@/shared/resumeDocument/prepareResumeDocument';
import type { EditorMode, ResumeFont, ResumeNode } from '@/types';
import PageSize from '@/types/PageSize';

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

export interface ResumeShellExtensions {
    proBadge?: string;
    accountLabel?: string;
    editingStorage?: 'local' | 'cloud';
    signOut?: () => void;
    signIn?: () => void;
    fileMenuItems?: MenuItem[];
    helpMenuItems?: MenuItem[];
    topSecondaryItems?: React.ReactNode;
    documentMenuItems?: React.ReactNode;
    overlays?: React.ReactNode;
}

export interface ResumeEditorExtensions {
    additionalToolbarSections?: ToolbarData;
    additionalSidebarTabs?: AdditionalSidebarTab[];
}

export interface ResumeDocumentOpeningRenderProps {
    topNav: React.ReactNode;
    state: Exclude<ResumeDocumentOpenSnapshot, { status: 'idle' }>;
    retry?: () => void;
    dismiss?: () => void;
}

export interface ResumeDocumentOpeningExtensions {
    render?: (props: ResumeDocumentOpeningRenderProps) => React.ReactNode;
}

export interface ResumeLandingExtensions {
    documentStatusSource?: ResumeDocumentStatusSource;
    renderLandingLead?: (actions: LandingActions, context: LandingContext) => React.ReactNode;
    landingClassName?: string;
    showLandingSocialLinks?: boolean;
    documentLibraryLead?: React.ReactNode;
    documentLabels?: Record<string, string>;
    documentMetadata?: Record<string, string>;
    documentGroups?: ResumeDocumentGroup[];
    documentActions?: Record<string, ResumeDocumentAction[]>;
}

export interface ResumeTemplateExtensions {
    additionalTemplateGroups?: AdditionalTemplateGroup[];
}

export interface ResumeAppExtensions {
    shell?: ResumeShellExtensions;
    editor?: ResumeEditorExtensions;
    documentOpening?: ResumeDocumentOpeningExtensions;
    landing?: ResumeLandingExtensions;
    templates?: ResumeTemplateExtensions;
}

export interface ResumeAppConfiguration {
    resumeLibraryStore?: ResumeLibraryController;
    resumeRepository?: ResumeRepository;
    initializeLibrary?: boolean;
    requestDeleteConfirmation?: DeleteDocumentConfirmationRequest;
    extensions?: ResumeAppExtensions;
    extensionsStore?: ResumeAppExtensionsStore;
}

/** Compatibility surface for existing OSS and Pro callers during migration. */
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
    documentOpen?: ResumeDocumentOpenSnapshot;
    proBadge?: string;
    accountLabel?: string;
    editingStorage?: 'local' | 'cloud';
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
    retryDocumentOpen?: () => void;
    dismissDocumentOpen?: () => void;
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
    extensions?: ResumeAppExtensions;
    extensionsStore?: ResumeAppExtensionsStore;
}

export function mergeResumeAppExtensions(
    base: ResumeAppExtensions = {},
    override: ResumeAppExtensions = {}
): ResumeAppExtensions {
    return {
        shell: { ...base.shell, ...override.shell },
        editor: { ...base.editor, ...override.editor },
        documentOpening: { ...base.documentOpening, ...override.documentOpening },
        landing: { ...base.landing, ...override.landing },
        templates: { ...base.templates, ...override.templates }
    };
}

export type ResumeWrapperProps = Partial<Omit<ResumeProps, 'selectedNodeId' | 'isEditingSelected'>>
    & ResumeAppConfiguration;

export function resolveResumeAppExtensions(props: ResumeWrapperProps | ResumeProps): ResumeAppExtensions {
    return {
        shell: {
            proBadge: props.extensions?.shell?.proBadge ?? props.proBadge,
            accountLabel: props.extensions?.shell?.accountLabel ?? props.accountLabel,
            editingStorage: props.extensions?.shell?.editingStorage ?? props.editingStorage,
            signOut: props.extensions?.shell?.signOut ?? props.signOut,
            signIn: props.extensions?.shell?.signIn ?? props.signIn,
            fileMenuItems: props.extensions?.shell?.fileMenuItems ?? props.fileMenuItems,
            helpMenuItems: props.extensions?.shell?.helpMenuItems ?? props.helpMenuItems,
            topSecondaryItems: props.extensions?.shell?.topSecondaryItems ?? props.topSecondaryItems,
            documentMenuItems: props.extensions?.shell?.documentMenuItems ?? props.documentMenuItems,
            overlays: props.extensions?.shell?.overlays ?? props.overlays
        },
        editor: {
            additionalToolbarSections: props.extensions?.editor?.additionalToolbarSections
                ?? props.additionalToolbarSections,
            additionalSidebarTabs: props.extensions?.editor?.additionalSidebarTabs
                ?? props.additionalSidebarTabs
        },
        documentOpening: props.extensions?.documentOpening,
        landing: {
            renderLandingLead: props.extensions?.landing?.renderLandingLead ?? props.renderLandingLead,
            landingClassName: props.extensions?.landing?.landingClassName ?? props.landingClassName,
            showLandingSocialLinks: props.extensions?.landing?.showLandingSocialLinks
                ?? props.showLandingSocialLinks,
            documentLibraryLead: props.extensions?.landing?.documentLibraryLead,
            documentStatusSource: props.extensions?.landing?.documentStatusSource,
            documentLabels: props.extensions?.landing?.documentLabels ?? props.documentLabels,
            documentMetadata: props.extensions?.landing?.documentMetadata,
            documentGroups: props.extensions?.landing?.documentGroups ?? props.documentGroups,
            documentActions: props.extensions?.landing?.documentActions ?? props.documentActions
        },
        templates: {
            additionalTemplateGroups: props.extensions?.templates?.additionalTemplateGroups
                ?? props.additionalTemplateGroups
        }
    };
}

export function toResumeOutputDocument(props: Pick<
    ResumeProps,
    'tree' | 'stylesheet' | 'pageSize' | 'documentFonts' | 'documents' | 'activeDocumentId'
>): ResumeDocumentSource {
    const nodes = props.tree.childNodes ?? [];
    return {
        nodes,
        stylesheet: props.stylesheet ?? '',
        pageSize: props.pageSize ?? PageSize.Letter,
        fonts: props.documentFonts,
        ariaLabel: props.documents?.find((item) => item.id === props.activeDocumentId)?.title
            ?? 'Resume'
    };
}
