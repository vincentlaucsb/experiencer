import { ToolbarItemData } from "@/controls/toolbar/ToolbarButton";
import { BasicResumeNode, ResumeNode } from "@/types";

/** Schema information for a resume node */
type ResumeNodeDefinition = {
    /** Child node types that this node can contain */
    childTypes?: string | string[];

    /** Indicates if this node type is a default child type */
    isDefaultChildType?: boolean;

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