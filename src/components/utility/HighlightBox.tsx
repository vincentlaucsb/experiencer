import React from "react";
import ResizeObserver from "resize-observer-polyfill";
import SplitPane from "react-split-pane";

interface HighlightBoxProps {
    /** The selected HTML node in question */
    elem: HTMLElement;

    /** Ref for the vertical split pane */
    verticalSplitRef: React.RefObject<SplitPane>;
}

interface BoxDimensions {
    left: number;
    top: number;
    width: number;
    height: number;
}

export function HighlightBox(props: HighlightBoxProps) {
    const node = props.elem;
    let [dims, setDims] = React.useState<BoxDimensions>();

    const updateDimensions = () => {
        if (node) {
            const bounds = node.getBoundingClientRect();
            requestAnimationFrame(() => {
                setDims({
                    left: bounds.left,
                    top: bounds.top,
                    width: bounds.width,
                    height: bounds.height
                });
            });
        }
    };

    const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach(() => updateDimensions());
    });

    React.useEffect(() => {
        // Perform initial load
        updateDimensions();

        // Add resize listeners
        window.addEventListener("resize", updateDimensions);
        if (node) {
            resizeObserver.observe(node);
        }

        return function cleanup() {
            window.removeEventListener("resize", updateDimensions);

            if (node) {
                resizeObserver.unobserve(node);
            }
        }

    }, [props.elem]);

    React.useEffect(() => {
        // Add scroll listener
        if (props.verticalSplitRef.current) {
            const mainPane = props.verticalSplitRef.current['pane1'];
            mainPane.addEventListener("scroll", updateDimensions);
            resizeObserver.observe(mainPane);
        }

        return function cleanup() {
            if (props.verticalSplitRef.current) {
                const mainPane = props.verticalSplitRef.current['pane1'];
                resizeObserver.unobserve(mainPane);
                props.verticalSplitRef.current['pane1'].removeEventListener("scroll", updateDimensions);
            }
        }
    }, [props.elem, props.verticalSplitRef]);

    if (dims) {
        return (
            <div className="resume-hl-box resume-hl-box-selected-node"
                style={{
                    position: "fixed",
                    left: `${dims.left}px`,
                    top: `${dims.top}px`,
                    width: `${dims.width}px`,
                    height: `${dims.height}px`,
                    boxSizing: "border-box",
                    zIndex: 2000
                }}
            />
        );
    }

    return <></>
}