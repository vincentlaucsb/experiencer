import React, { useEffect } from "react";

import { observeElementGeometry, type ElementGeometry } from "@/shared/utils/observeElementGeometry";
import { positionSelectionControl } from "@/shared/utils/selectionControlPosition";

interface HighlightBoxProps {
    /** The selected HTML node in question */
    elem: Element;

    /** The left pane element (resume editor) for scroll tracking */
    leftPaneElement?: HTMLDivElement | null;

    /** Attributes for the highlight boxes */
    attributes?: any;
    className: string;
    calcStyle?: (bounds: DOMRect, style: CSSStyleDeclaration) => any;
    /** Interactive controls positioned against the measured highlight bounds. */
    children?: React.ReactNode;
}

const selectionControlSize = 28;

function defaultCalcStyle(bounds: DOMRect, style: CSSStyleDeclaration) {
    return {
        left: `${bounds.left}px`,
        top: `${bounds.top}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`
    }
}

export function HighlightBox(props: HighlightBoxProps) {
    const node = props.elem;
    const calcStyle = props.calcStyle || defaultCalcStyle;

    const [geometry, setGeometry] = React.useState<ElementGeometry>();

    useEffect(() => observeElementGeometry(node, props.leftPaneElement, setGeometry),
        [node, props.leftPaneElement]);

    if (geometry) {
        const { bounds, computedStyle, boundary: paneBounds } = geometry;
        const controlPosition = positionSelectionControl(
            bounds,
            paneBounds,
            selectionControlSize,
            selectionControlSize
        );
        const highlightStyle = {
            position: "fixed",
            ...calcStyle(bounds, computedStyle),
            "--selection-controls-left": `${controlPosition.leftOffset}px`,
            "--selection-controls-top": `${controlPosition.topOffset}px`
        } as React.CSSProperties;

        return (
            <div className={props.className}
                style={highlightStyle}
                data-controls-placement={props.children ? controlPosition.placement : undefined}
                {...props.attributes}
            >
                {props.children}
            </div>
        );
    }

    return <></>
}
