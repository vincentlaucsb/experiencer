import React from "react";
import SplitPane from "react-split-pane";

interface HighlightBoxProps {
    /** Ref for the selected node in question */
    objectRef: React.RefObject<HTMLElement>;

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
    const node = props.objectRef.current;
    let [dims, setDims] = React.useState<BoxDimensions>();

    const updateDimensions = () => {
        if (node) {
            const bounds = node.getBoundingClientRect();
            setDims({
                left: bounds.left,
                top: bounds.top,
                width: bounds.width,
                height: bounds.height
            });
        }
    };

    React.useEffect(() => {
        // Perform initial load
        updateDimensions();

        // Add resize listener
        window.addEventListener("resize", updateDimensions);
        return function cleanup() {
            window.removeEventListener("resize", updateDimensions);
        }

    }, [props.objectRef]);

    React.useEffect(() => {
        // Add scroll listener
        if (props.verticalSplitRef.current) {
            props.verticalSplitRef.current['pane1'].addEventListener("scroll", updateDimensions);

            return function cleanup() {
                if (props.verticalSplitRef.current) {
                    props.verticalSplitRef.current['pane1'].removeEventListener("scroll", updateDimensions);
                }
            }
        }
    }, [props.objectRef, props.verticalSplitRef]);

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