import React from "react";
import { ToolbarItemData } from "@/controls/toolbar/ToolbarButton";
import { BasicResumeNode, ResumeComponentProps, ResumeNode } from "@/types";

/** Schema information for a resume node */
type ResumeNodeDefinition = {
    /** Child node types that this node can contain */
    childTypes?: string | string[];

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

    /** Display name for this node type */
    text: string;

    toolbarOptions?: (updateNode: (key: string, value: any) => void, node: ResumeNode) => ToolbarItemData[];

    /** Unique name for this node */
    type: string;
};

export default ResumeNodeDefinition;