import React from "react";
import ResizeObserver from "resize-observer-polyfill";
import SplitPane from "react-split-pane";

interface HighlightBoxProps {
    /** The selected HTML node in question */
    elem: Element;

    /** Ref for the vertical split pane */
    verticalSplitRef: React.RefObject<SplitPane>;

    /** Attributes for the highlight boxes */
    className: string;
    calcStyle?: (bounds: ClientRect | DOMRect, style: CSSStyleDeclaration) => any;
}

function defaultCalcStyle(bounds: ClientRect | DOMRect, style: CSSStyleDeclaration) {
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

    let [bounds, updateBounds] = React.useState<ClientRect | DOMRect>();
    let [computedStyle, updateComputedStyle] = React.useState<CSSStyleDeclaration>();

    const updateBoxes = () => {
        if (node) {
            requestAnimationFrame(() => {
                updateBounds(node.getBoundingClientRect());
                updateComputedStyle(window.getComputedStyle(node));
            });
        }
    };

    const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach(() => updateBoxes());
    });

    React.useEffect(() => {
        // Perform initial load
        updateBoxes();

        // Add resize listeners
        window.addEventListener("resize", updateBoxes);
        if (node) {
            resizeObserver.observe(node);
        }

        return function cleanup() {
            window.removeEventListener("resize", updateBoxes);

            if (node) {
                resizeObserver.unobserve(node);
            }
        }

    }, [props.elem]);

    React.useEffect(() => {
        // Add scroll listener
        if (props.verticalSplitRef.current) {
            const mainPane = props.verticalSplitRef.current['pane1'];
            if (mainPane) {
                mainPane.addEventListener("scroll", updateBoxes);
                resizeObserver.observe(mainPane);
            }
        }

        return function cleanup() {
            if (props.verticalSplitRef.current) {
                const mainPane = props.verticalSplitRef.current['pane1'];
                if (mainPane) {
                    resizeObserver.unobserve(mainPane);
                    props.verticalSplitRef.current['pane1'].removeEventListener("scroll", updateBoxes);
                }
            }
        }
    }, [props.elem, props.verticalSplitRef]);

    if (node && bounds && computedStyle) {
        return (
            <div className={props.className}
                style={{
                    position: "fixed",
                    ...calcStyle(bounds, computedStyle),
                }}
            />
        );
    }

    return <></>
}