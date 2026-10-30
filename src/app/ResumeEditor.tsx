import * as React from 'react';
import { createPortal } from 'react-dom';

import ResumeTextOverflowNotice from '@/app/ResumeTextOverflowNotice';
import type { ResumeEditorExtensions } from '@/app/ResumeAppContracts';
import PngExportFeature from '@/app/PngExportFeature';
import ResumeEditorSidebar from '@/app/ResumeEditorSidebar';
import { ResizableSidebarLayout } from '@/controls/Layouts';
import ResumeHotKeys from '@/controls/ResumeHotkeys';
import Toast from '@/controls/Toast';
import ResumeRenderer, {
    type UpdateResumeData,
    type UpdateResumeDataFields
} from '@/resume/ResumeRenderer';
import { resumeNodeStore } from '@/shared/stores/resumeNodeStore';
import { createContainer } from '@/shared/utils/createContainer';
import type { ResumeNode } from '@/types';
import PageSize from '@/types/PageSize';

const SelectedNodeHighlightBox = React.lazy(
    () => import('@/editor/HighlightBox').then(m => ({ default: m.SelectedNodeHighlightBox }))
);

export interface AdditionalSidebarTab {
    key: string;
    content: React.ReactNode;
}

export interface ResumeEditorProps {
    topNav: React.ReactNode;
    nodes: ResumeNode[];
    pageSize: PageSize;
    selectedNodeId?: string;
    stylesheet: string;
    saveCurrentDocument?: () => void;
    additionalSidebarTabs?: AdditionalSidebarTab[];
    extensions?: ResumeEditorExtensions;
}

const updateResumeData: UpdateResumeData = (id, key, data) => {
    resumeNodeStore.updateNode(id, key, data);
};

const updateResumeDataFields: UpdateResumeDataFields = (id, patch) => {
    resumeNodeStore.updateNodeFields(id, patch);
};

/** Renders the active editing workspace and binds its views to editor stores. */
export default function ResumeEditor(props: ResumeEditorProps) {
    const readOnly = props.extensions?.readOnly;
    const resumeRef = React.useRef<HTMLDivElement>(null);
    const highlightContainer = createContainer('hl-box-container');
    const sidebar = <ResumeEditorSidebar
        nodes={props.nodes}
        selectedNodeId={props.selectedNodeId}
        stylesheet={props.stylesheet}
        additionalSidebarTabs={props.extensions?.additionalSidebarTabs ?? props.additionalSidebarTabs}
    />;
    const canvas = (
        <>
            <PngExportFeature />
            {!readOnly && <ResumeTextOverflowNotice resumeRef={resumeRef} pageSize={props.pageSize} />}
            <div id="resume-container">
                <ResumeRenderer
                    nodes={props.nodes}
                    pageSize={props.pageSize}
                    root="editor-host"
                    readOnly={readOnly}
                    containerRef={resumeRef}
                    beforeNodes={!readOnly && <ResumeHotKeys save={props.saveCurrentDocument} />}
                    updateResumeData={updateResumeData}
                    updateResumeDataFields={updateResumeDataFields}
                />
            </div>
            {!readOnly && createPortal(
                <React.Suspense fallback={null}>
                    <SelectedNodeHighlightBox />
                </React.Suspense>,
                highlightContainer
            )}
            <Toast />
        </>
    );


    return (
        <ResizableSidebarLayout
            topNav={props.topNav}
            main={canvas}
            sidebar={readOnly ? undefined : sidebar}
        />
    );
}
