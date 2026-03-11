import { ReactNode } from "react";

// For simplicity, and to avoid problems, avoid all
// imports in this file

export class Globals {
    static readonly localStorageKey = 'experiencer';
}

export type IdType = Array<number>;
export type Action = (() => void);
export type AddChild = ((parentUuid: string | undefined, node: ResumeNode) => void);
export type ModifyChild = (id: IdType) => void;
export type NodeProperty = string | string[] | boolean | number | number[];

/**
 * Base properties shared by all resume node types (excludes childNodes).
 */
interface ResumeNodeBase {
    classNames?: string;
    htmlId?: string;
    value?: string;
    type: string;
}

/** Editable properties of a resume node, excluding the `type` field. */
export type ResumeNodeEditable<TExtra extends Record<string, any> = Record<string, any>> = 
    Omit<ResumeNodeBase, 'type'> & TExtra;

/**
 * Common denominator for JSON-serializable resume nodes.
 *
 * This is the base shape persisted in saves/templates (no app-only fields).
 * When a node needs extra, node-specific props, pass them via the generic
 * `TExtra` parameter (e.g., `BasicResumeNode<{ altText?: string }>`).
 */
export type BasicResumeNode<
    TExtra extends Record<string, any> = Record<string, any>,
> = ResumeNodeBase & {
    childNodes?: Array<BasicResumeNode>;
} & TExtra;

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

/**
 * Live app node type used at runtime (adds UUIDs for identity).
 *
 * Use `TExtra` for node-specific props that should exist at runtime but are
 * not part of the common denominator (e.g., `ResumeNode<ImageBase>`).
 */
export type ResumeNode<TExtra extends Record<string, any> = Record<string, any>> = ResumeNodeBase & {
    childNodes?: Array<ResumeNode>;
    
    // UUIDs are assigned by the app and need not be saved
    uuid: string;
} & TExtra;

export interface ResumeSaveData {
    builtinCss: CssNodeDump;
    rootCss: CssNodeDump;
    childNodes: Array<BasicResumeNode>;
}

/**
 * Props passed to React resume components.
 *
 * `TExtra` carries node-specific props without expanding the base types.
 */
export type ResumeComponentProps<TExtra extends Record<string, any> = Record<string, any>> = ResumeNode<TExtra> & {
    children?: ReactNode;

    /** Hierarchical ID based on the node's position in the resume.
     * This may change as the resume structure changes.
     */
    id: IdType;

    /** Whether this node is the last child of its parent. */
    isLast: boolean;

    /** Update a single field. */
    updateData<K extends keyof ResumeNodeEditable<TExtra>>(key: K, data: ResumeNodeEditable<TExtra>[K]): void;

    /** Update multiple fields at once. */
    updateDataFields: (patch: Partial<ResumeNodeEditable<TExtra>>) => void;
};

export default ResumeComponentProps;
