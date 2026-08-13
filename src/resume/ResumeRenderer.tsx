import * as React from "react";

import ResumeComponentFactory from "@/resume/ResumeComponent";
import PageBoundaries from "@/resume/PageBoundaries";
import getResumeMinHeight from "@/shared/utils/getResumeMinHeight";
import { IdType, NodeProperty, ResumeNode } from "@/types";
import PageSize from "@/types/PageSize";

export type UpdateResumeData = (
    id: IdType,
    key: string,
    data: NodeProperty
) => void;

export type UpdateResumeDataFields = (
    id: IdType,
    patch: Partial<Record<string, NodeProperty>>
) => void;

export interface ResumeRendererProps {
    nodes: ResumeNode[];
    pageSize: PageSize;
    updateResumeData: UpdateResumeData;
    updateResumeDataFields: UpdateResumeDataFields;
    ariaLabel?: string;
    readOnly?: boolean;
    containerRef?: React.Ref<HTMLDivElement>;
    beforeNodes?: React.ReactNode;
}

/**
 * The shared resume canvas. Editing and preview hosts supply their own
 * persistence behavior, while this component owns the rendered document shape.
 */
export default function ResumeRenderer(props: ResumeRendererProps) {
    const resumeRef = React.useRef<HTMLDivElement>(null);

    const setResumeRef = React.useCallback((element: HTMLDivElement | null) => {
        resumeRef.current = element;

        if (!props.containerRef) return;
        if (typeof props.containerRef === 'function') {
            props.containerRef(element);
        } else {
            props.containerRef.current = element;
        }
    }, [props.containerRef]);

    return (
        <div
            id="resume"
            aria-label={props.ariaLabel}
            data-page-size={props.pageSize}
            ref={setResumeRef}
            style={{
                minHeight: getResumeMinHeight(props.nodes, props.pageSize),
                ...(props.readOnly ? { pointerEvents: "none" } : {})
            }}
        >
            {!props.readOnly && (
                <PageBoundaries pageSize={props.pageSize} resumeRef={resumeRef} />
            )}
            {props.beforeNodes}
            {props.nodes.map((element, index, all) => (
                <ResumeComponentFactory
                    key={element.uuid}
                    {...element}
                    updateResumeData={props.updateResumeData}
                    updateResumeDataFields={props.updateResumeDataFields}
                    index={index}
                    numSiblings={all.length}
                />
            ))}
        </div>
    );
}
