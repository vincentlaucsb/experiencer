import { useSyncExternalStore } from 'react';

import { Button } from '@/controls/Buttons';
import { useEditorStore } from '@/shared/stores/editorStore';
import { HintKey, hintStore } from '@/shared/stores/hintStore';

/** Renders dismissible selection guidance in the sidebar's normal layout flow. */
export default function SelectionHint() {
    const selectedNodeId = useEditorStore(state => state.selectedNodeId);
    const isEditingSelected = useEditorStore(state => state.isEditingSelected);
    const hints = useSyncExternalStore(hintStore.subscribe, hintStore.getSnapshot);

    if (!selectedNodeId || isEditingSelected || hints.dismissed[HintKey.NodeOptions]) return null;

    return (
        <div
            className="resume-selection-hint no-print app-gap-2 app-p-2 app-m-2"
            role="note"
        >
            <span>Tip: use the node menu or right-click the selected node for more options.</span>
            <Button
                type="button"
                className="resume-selection-hint__close"
                aria-label="Dismiss node options tip"
                title="Dismiss tip"
                onClick={() => hintStore.dismiss(HintKey.NodeOptions)}
            >
                <i className="icofont-close" aria-hidden="true" />
            </Button>
        </div>
    );
}
