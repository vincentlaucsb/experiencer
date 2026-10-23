import ResumeCssEditor from '@/app/ResumeCssEditor';
import SelectionHint from '@/app/SelectionHint';
import type { AdditionalSidebarTab } from '@/app/ResumeEditor';
import Tabs from '@/controls/Tabs';
import NodeTreeVisualizer from '@/editor/NodeTreeVisualizer';
import RawCssRules from '@/editor/RawCssRules';
import { useEditorStore } from '@/shared/stores/editorStore';
import type { ResumeNode } from '@/types';
import './ResumeEditorSidebar.scss';

interface ResumeEditorSidebarProps {
    nodes: ResumeNode[];
    selectedNodeId?: string;
    stylesheet: string;
    additionalSidebarTabs?: AdditionalSidebarTab[];
}

/** Owns the sidebar's transient tab and rule-expansion presentation state. */
export default function ResumeEditorSidebar(props: ResumeEditorSidebarProps) {
    const activeTab = useEditorStore(state => state.activeSidebarTab);
    const target = useEditorStore(state => state.cssRuleTarget);
    return (
        <div className="resume-editor-sidebar">
            <SelectionHint />
            <Tabs activeKey={activeTab} onActiveKeyChange={key => useEditorStore.getState().setActiveSidebarTab(key)}>
                <NodeTreeVisualizer key="Tree" childNodes={props.nodes}
                    selectNode={uuid => useEditorStore.getState().selectNode(uuid)} selectedNode={props.selectedNodeId} />
                <ResumeCssEditor key="CSS" selectedNodeId={props.selectedNodeId}
                    target={target} />
                <RawCssRules key="Raw CSS" stylesheet={props.stylesheet} onInspect={target => useEditorStore.getState().inspectCssRule(target)} />
                {(props.additionalSidebarTabs ?? []).map(tab => <div key={tab.key}>{tab.content}</div>)}
            </Tabs>
        </div>
    );
}
