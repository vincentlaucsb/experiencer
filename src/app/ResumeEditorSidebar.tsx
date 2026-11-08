import ResumeCssEditor from '@/app/ResumeCssEditor';
import SelectionHint from '@/app/SelectionHint';
import type { AdditionalSidebarTab } from '@/app/ResumeEditor';
import Tabs from '@/controls/Tabs';
import NodeTreeVisualizer from '@/editor/NodeTreeVisualizer';
import { useEditorStore } from '@/shared/stores/editorStore';
import type { ResumeNode } from '@/types';
import './ResumeEditorSidebar.scss';

interface ResumeEditorSidebarProps {
    nodes: ResumeNode[];
    selectedNodeId?: string;
    additionalSidebarTabs?: AdditionalSidebarTab[];
}

/** Composes the sidebar tabs and binds them to the current node selection. */
export default function ResumeEditorSidebar(props: ResumeEditorSidebarProps) {
    const activeTab = useEditorStore(state => state.activeSidebarTab);
    return (
        <div className="resume-editor-sidebar">
            <SelectionHint />
            <Tabs activeKey={activeTab} onActiveKeyChange={key => useEditorStore.getState().setActiveSidebarTab(key)}>
                <NodeTreeVisualizer key="Tree" childNodes={props.nodes}
                    selectNode={uuid => useEditorStore.getState().selectNode(uuid)} selectedNode={props.selectedNodeId} />
                <ResumeCssEditor key="CSS" selectedNodeId={props.selectedNodeId} />
                {(props.additionalSidebarTabs ?? []).map(tab => <div key={tab.key}>{tab.content}</div>)}
            </Tabs>
        </div>
    );
}
