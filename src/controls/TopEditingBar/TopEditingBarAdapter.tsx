import React, { useSyncExternalStore } from "react";

import addHtmlId from "@/shared/stores/addHtmlId";
import addCssClasses from "@/shared/stores/resumeStore/addCssClasses";
import { useEditorStore } from "@/shared/stores/editorStore";
import { useHistoryStore } from "@/shared/stores/historyStore";
import { resumeDocumentDirtyState } from "@/shared/stores/resumeDocumentDirtyState";
import { resumeNodeStore, useResumeNodeByUuid } from "@/shared/stores/resumeNodeStore";
import { saveLocal } from "@/shared/stores/saveResume";
import useSelectedNodeActions from "@/shared/hooks/useSelectedNodeActions";
import type { NodeProperty, ResumeNode } from "@/types";

import TopEditingBarView from "./TopEditingBarView";
import type { TopEditingBarWrapperProps } from "./types";

/** Supplies store-backed editor state and commands to the stateless editing-bar view. */
export default function TopEditingBarAdapter(props: TopEditingBarWrapperProps) {
    const canUndo = useHistoryStore((state) => state.past.length > 0);
    const canRedo = useHistoryStore((state) => state.future.length > 0);
    const undo = useHistoryStore((state) => state.undo);
    const redo = useHistoryStore((state) => state.redo);
    const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
    const pageSize = useEditorStore((state) => state.pageSize);
    const setPageSize = useEditorStore((state) => state.setPageSize);
    const unselectNode = useEditorStore((state) => state.unselectNode);
    const selectedNode = useResumeNodeByUuid(selectedNodeId ?? "");
    const unsavedChanges = useSyncExternalStore(
        resumeDocumentDirtyState.subscribe,
        resumeDocumentDirtyState.getSnapshot,
        resumeDocumentDirtyState.getSnapshot
    );
    const selectedNodeActions = useSelectedNodeActions();

    return (
        <TopEditingBarView
            {...props}
            {...selectedNodeActions}
            addHtmlId={addHtmlId}
            addCssClasses={(classes: string) => {
                const node = selectedNodeId
                    ? resumeNodeStore.data.getNodeByUuid(selectedNodeId)
                    : undefined;
                addCssClasses(node, classes);
            }}
            addChild={(parentUuid: string | undefined, node: ResumeNode) => {
                resumeNodeStore.addNode(parentUuid, node);
            }}
            pageSize={pageSize}
            redo={canRedo ? redo : undefined}
            saveLocal={props.saveLocal ?? (unsavedChanges ? saveLocal : undefined)}
            selectedNode={selectedNode}
            setPageSize={setPageSize}
            undo={canUndo ? undo : undefined}
            unselect={unselectNode}
            updateSelected={(key: string, data: NodeProperty) => {
                if (selectedNodeId) {
                    resumeNodeStore.updateNode(selectedNodeId, key, data);
                }
            }}
        />
    );
}
