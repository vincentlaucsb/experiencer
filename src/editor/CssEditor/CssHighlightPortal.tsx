import ReactDOM from "react-dom";

import { HighlightBox } from "@/editor/HighlightBox";
import { useEditorStore } from "@/shared/stores/editorStore";
import { createContainer } from "@/shared/utils/createContainer";

interface CssHighlightPortalProps {
    active: boolean;
    selector: string;
}

function calculateHighlightStyle(bounds: DOMRect, computedStyle: CSSStyleDeclaration) {
    return {
        left: `calc(${bounds.left}px - ${computedStyle.marginLeft})`,
        top: `calc(${bounds.top}px - ${computedStyle.marginTop})`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        borderLeftWidth: computedStyle.marginLeft,
        borderRightWidth: computedStyle.marginRight,
        borderTopWidth: computedStyle.marginTop,
        borderBottomWidth: computedStyle.marginBottom
    };
}

/** Projects highlight boxes for every document element matched by an authored rule. */
export default function CssHighlightPortal({ active, selector }: CssHighlightPortalProps) {
    try {
        const hits = document.querySelectorAll(selector);
        const container = createContainer("hl-box-container");
        if (!container || !active) return <></>;

        const leftPaneElement = useEditorStore.getState().leftPaneElement;
        const boxes = Array.from(hits).map((node, key) => (
            <HighlightBox
                key={key}
                className="resume-hl-box"
                elem={node}
                leftPaneElement={leftPaneElement}
                calcStyle={calculateHighlightStyle}
            />
        ));

        return ReactDOM.createPortal(boxes, container);
    } catch (error) {
        // Invalid stored selectors remain visible for repair without breaking the editor.
        console.log(error);
        return <></>;
    }
}
