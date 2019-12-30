export type IdType = Array<number>;
export type Action = (() => void);
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
    selector: string;
    properties: Array<[string, string]>;
}

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