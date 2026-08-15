import React, { useEffect } from "react";

import { Button } from "@/controls/Buttons";
import { positionSelectionCoachmark } from "@/shared/utils/selectionCoachmarkPosition";
import { createPortal } from "react-dom";

interface HighlightBoxProps {
    /** The selected HTML node in question */
    elem: Element;

    /** The left pane element (resume editor) for scroll tracking */
    leftPaneElement?: HTMLDivElement | null;

    /** Attributes for the highlight boxes */
    attributes?: any;
    className: string;
    calcStyle?: (bounds: DOMRect, style: CSSStyleDeclaration) => any;
    selectionHint?: string;
    onDismissSelectionHint?: () => void;
}

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

    let [bounds, updateBounds] = React.useState<DOMRect>();
    let [computedStyle, updateComputedStyle] = React.useState<CSSStyleDeclaration>();

    const updateBoxes = React.useCallback(() => {
        if (!node) return;

        requestAnimationFrame(() => {
            updateBounds(node.getBoundingClientRect());
            updateComputedStyle(window.getComputedStyle(node));
        });
    }, [node]);

    const resizeObserver = React.useMemo(() => new ResizeObserver((entries) => {
        entries.forEach(() => updateBoxes());
    }), [updateBoxes]);

    useEffect(() => {
        // Perform initial load
        if (node) {
            updateBounds(node.getBoundingClientRect());
            updateComputedStyle(window.getComputedStyle(node));
        }

        // Add resize listeners
        window.addEventListener("resize", updateBoxes);
        if (node) {
            resizeObserver.observe(node);
        }

        return function cleanup() {
            window.removeEventListener("resize", updateBoxes);
            resizeObserver.disconnect();
        }

    }, [props.elem, updateBoxes, resizeObserver]);

    useEffect(() => {
        // Add scroll listener to the left pane (resume editor)
        const mainPane = props.leftPaneElement;
        if (!mainPane) return;

        mainPane.addEventListener("scroll", updateBoxes);
        resizeObserver.observe(mainPane);

        return function cleanup() {
            mainPane.removeEventListener("scroll", updateBoxes);
            resizeObserver.unobserve(mainPane);
        }
    }, [props.leftPaneElement, updateBoxes, resizeObserver]);

    if (node && bounds && computedStyle) {
        const resumeBounds = node.closest('#resume')?.getBoundingClientRect() ?? bounds;
        const paneBounds = props.leftPaneElement?.getBoundingClientRect() ?? {
            top: 0,
            right: window.innerWidth,
            bottom: window.innerHeight,
            left: 0
        };
        const coachmarkBounds = {
            top: paneBounds.top,
            bottom: paneBounds.bottom,
            left: paneBounds.left,
            // A one-time tip may overlap the inspector when no gutter exists, but it
            // must not cover the resume content it is explaining.
            right: window.innerWidth
        };
        const coachmarkPosition = positionSelectionCoachmark(
            bounds,
            resumeBounds,
            coachmarkBounds,
            248,
            48
        );

        return (
            <>
                <div className={props.className}
                    style={{
                        position: "fixed",
                        ...calcStyle(bounds, computedStyle),
                    }}
                    {...props.attributes}
                />
                {props.selectionHint ? createPortal(
                    <div
                        className="resume-selection-hint"
                        role="note"
                        style={{
                            position: "fixed",
                            top: `${coachmarkPosition.top}px`,
                            left: `${coachmarkPosition.left}px`
                        }}
                        data-placement={coachmarkPosition.placement}
                    >
                        <span>{props.selectionHint}</span>
                        {props.onDismissSelectionHint ? (
                            <Button
                                type="button"
                                className="resume-selection-hint__close"
                                aria-label="Dismiss field options tip"
                                title="Dismiss tip"
                                onClick={props.onDismissSelectionHint}
                            >
                                <i className="icofont-close" aria-hidden="true" />
                            </Button>
                        ) : <></>}
                    </div>,
                    document.body
                ) : <></>}
            </>
        );
    }

    return <></>
}
