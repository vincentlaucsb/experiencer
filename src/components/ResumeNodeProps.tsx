import { NodeProperty, IdType, ResumeNode } from "./utility/Types";

export type ModifyChild = (id: IdType) => void;
export type AddChild = ((id: IdType, node: ResumeNode) => void);

/** Represents resume prop properties and methods passed
 *  from the top down
 * */
export interface ResumePassProps extends ResumeNode {
    hoverOver: (id: IdType) => void;
    hoverOut: (id: IdType) => void;
    isSelectBlocked: (id: IdType) => boolean;
    updateSelected: (id?: IdType) => void;
    selectedUuid?: string;
}

/** Actual props which go into a resume component */
export default interface ResumeNodeProps extends ResumePassProps {
    id: IdType;   // Hierarchical ID based on the node's position in the resume; subject to change
    isEditing: boolean;
    isLast: boolean;
    isSelected: boolean;
    updateData: (key: string, data: NodeProperty) => void;
}