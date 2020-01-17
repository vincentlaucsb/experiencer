// For simplicity, and to avoid problems, avoid all
// imports in this file

export class Globals {
    static readonly localStorageKey = 'experiencer';
}

export type IdType = Array<number>;
export type Action = (() => void);
export type AddChild = ((id: IdType, node: ResumeNode) => void);
export type ModifyChild = (id: IdType) => void;
export type NodeProperty = string | string[] | boolean | number | number[];

/** The properties a node can be expected to have
 *  in a JSON representation
 *  
 *  This is a non-exclusive list... there may be others
 * */
export interface BasicResumeNode {
    childNodes?: Array<BasicResumeNode>;
    classNames?: string;
    htmlId?: string;
    value?: string;

    // TODO: Change to 'Row' | 'Column' | etc. ?
    type: string;
}

/** Return a JSON serializable format of a CssNode and its descendents */
export interface CssNodeDump {
    children: Array<CssNodeDump>;
    root?: CssNodeDump;
    name: string;
    description?: string;
    selector: string;
    properties: Array<[string, string]>;
}

export type EditorMode = 'normal'
    | 'landing'
    | 'help'
    | 'changingTemplate'
    | 'printing';

export interface ResumeNode extends BasicResumeNode {
    childNodes?: Array<ResumeNode>;

    // UUIDs are assigned by the app and need not be saved
    uuid: string;
}

export interface ResumeSaveData {
    builtinCss: CssNodeDump;
    rootCss: CssNodeDump;
    childNodes: Array<ResumeNode>;
}

/** Methods and properties used by the top level component
 *  for managing selection */
export interface SelectedNodeManagement {
    clicked: (id: IdType) => void;
    selectedUuid?: string;
}

/** Used in creating React components over resume nodes */
export default interface ResumeComponentProps extends ResumeNode, SelectedNodeManagement {
    id: IdType;   // Hierarchical ID based on the node's position in the resume; subject to change
    isEditing: boolean;
    isLast: boolean;
    isSelected: boolean;
    updateData: (key: string, data: NodeProperty) => void;
}