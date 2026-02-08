import React, { useEffect } from "react";

interface HighlightBoxProps {
    /** The selected HTML node in question */
    elem: Element;

    /** The left pane element (resume editor) for scroll tracking */
    leftPaneElement?: HTMLDivElement | null;

    /** Attributes for the highlight boxes */
    attributes?: any;
    className: string;
    calcStyle?: (bounds: DOMRect, style: CSSStyleDeclaration) => any;
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
        return (
            <div className={props.className}
                style={{
                    position: "fixed",
                    ...calcStyle(bounds, computedStyle),
                }}
                {...props.attributes}
            />
        );
    }

    return <></>
}