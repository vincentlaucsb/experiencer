import * as React from 'react';
import { createPortal } from 'react-dom';

import PngExportFeature from '@/app/PngExportFeature';
import ResumeEditorSidebar from '@/app/ResumeEditorSidebar';
import SelectionHint from '@/app/SelectionHint';
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
}

const updateResumeData: UpdateResumeData = (id, key, data) => {
    resumeNodeStore.updateNode(id, key, data);
};

const updateResumeDataFields: UpdateResumeDataFields = (id, patch) => {
    resumeNodeStore.updateNodeFields(id, patch);
};

/** Renders the active editing workspace and binds its views to editor stores. */
export default function ResumeEditor(props: ResumeEditorProps) {
    const resumeRef = React.useRef<HTMLDivElement>(null);
    const highlightContainer = createContainer('hl-box-container');
    const sidebar = <ResumeEditorSidebar
        nodes={props.nodes}
        selectedNodeId={props.selectedNodeId}
        stylesheet={props.stylesheet}
        additionalSidebarTabs={props.additionalSidebarTabs}
    />;
    const canvas = (
        <>
            <PngExportFeature />
            <SelectionHint />
            <div id="resume-container">
                <ResumeRenderer
                    nodes={props.nodes}
                    pageSize={props.pageSize}
                    root="editor-host"
                    containerRef={resumeRef}
                    beforeNodes={<ResumeHotKeys save={props.saveCurrentDocument} />}
                    updateResumeData={updateResumeData}
                    updateResumeDataFields={updateResumeDataFields}
                />
            </div>
            {createPortal(
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
            sidebar={sidebar}
        />
    );
}
