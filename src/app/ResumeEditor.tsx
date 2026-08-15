import * as React from 'react';
import { createPortal } from 'react-dom';

import PngExportFeature from '@/app/PngExportFeature';
import ResumeCssEditor from '@/app/ResumeCssEditor';
import { ResizableSidebarLayout } from '@/controls/Layouts';
import ResumeHotKeys from '@/controls/ResumeHotkeys';
import Tabs from '@/controls/Tabs';
import Toast from '@/controls/Toast';
import NodeTreeVisualizer from '@/editor/NodeTreeVisualizer';
import ResumeRenderer, {
    type UpdateResumeData,
    type UpdateResumeDataFields
} from '@/resume/ResumeRenderer';
import { useEditorStore } from '@/shared/stores/editorStore';
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
    const sidebar = (
        <Tabs>
            <NodeTreeVisualizer
                key="Tree"
                childNodes={props.nodes}
                selectNode={(uuid) => useEditorStore.getState().selectNode(uuid)}
                selectedNode={props.selectedNodeId}
            />
            <ResumeCssEditor key="CSS" selectedNodeId={props.selectedNodeId} />
            <div key="Raw CSS">
                <pre>
                    <code>{props.stylesheet}</code>
                </pre>
            </div>
            {(props.additionalSidebarTabs ?? []).map((tab) => (
                <React.Fragment key={tab.key}>{tab.content}</React.Fragment>
            ))}
        </Tabs>
    );
    const canvas = (
        <>
            <PngExportFeature />
            <ResumeRenderer
                nodes={props.nodes}
                pageSize={props.pageSize}
                root="editor-host"
                containerRef={resumeRef}
                beforeNodes={<ResumeHotKeys />}
                updateResumeData={updateResumeData}
                updateResumeDataFields={updateResumeDataFields}
            />
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
