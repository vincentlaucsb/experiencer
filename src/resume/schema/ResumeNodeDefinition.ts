import React from "react";
import { ToolbarItemData } from "@/controls/toolbar/ToolbarButton";
import { BasicResumeNode, ResumeComponentProps, ResumeNode } from "@/types";
import DefaultChildren from "./DefaultChildren";

export type ChildTypeDefinition = string | string[] | DefaultChildren;
export type TreeRepresentation = string | ((node: ResumeNode) => React.ReactNode);

/** Schema information for a resume node */
type ResumeNodeDefinition = {
    /** Optional CSS node path/name override used by the CSS editor */
    cssName?: string | string[];

    /** Child node types that this node can contain */
    childTypes?: ChildTypeDefinition;

    /** React component to render this node type */
    component: typeof React.Component | React.FC<ResumeComponentProps>

    /** Indicates if this node type is a default child type */
    isDefaultChildType?: boolean;

    /** Indicates if this node type can be edited inline (has text fields) */
    isEditable?: boolean;

    /** Template node data (type will be automatically set if omitted) */
    defaultValue?: Omit<BasicResumeNode & Record<string, any>, 'type'>;

    /** Optional icon for this node type */
    icon?: string;

    /** Optional class names for this node when rendered in the node tree */
    treeClassNames?: string | string[];

    /** Optional label renderer for this node in the node tree */
    treeRepresentation?: TreeRepresentation;

    /** Display name for this node type */
    text: string;

    toolbarOptions?: (updateNode: (key: string, value: any) => void, node: ResumeNode) => ToolbarItemData[];

    /** Unique name for this node */
    type: string;
};

export default ResumeNodeDefinition;