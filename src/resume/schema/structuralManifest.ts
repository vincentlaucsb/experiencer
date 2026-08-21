import type ResumeNodeDefinition from "./ResumeNodeDefinition";
import DefaultChildren from "./DefaultChildren";
import manifestJson from "./resume-structure.json";

export type PortableFieldType = "string" | "boolean" | "stringArray" | "integerArray";

export interface PortableFieldDefinition {
    type: PortableFieldType;
    maximumLength?: number;
    maximumItems?: number;
    enum?: string[];
    protectedPii?: boolean;
}

export interface PortableNodeKind {
    kind: string;
    aliasOf?: string;
    children: { mode: "explicit" | "defaultPlus"; kinds: string[] };
    fields: Record<string, PortableFieldDefinition>;
    defaults: Record<string, unknown>;
    defaultChild?: boolean;
    inlineEditable?: boolean;
}

export interface PortableResumeStructureManifest {
    version: string;
    rootKind: string;
    rootChildren: string[];
    limits: {
        maximumOperations: number;
        maximumNodes: number;
        maximumDepth: number;
        maximumFieldCharacters: number;
        maximumTotalFieldCharacters: number;
    };
    commonFields: Record<string, PortableFieldDefinition>;
    nodeKinds: PortableNodeKind[];
}

export const resumeStructureManifest = manifestJson as unknown as PortableResumeStructureManifest;

type PortableRegistration = Pick<
    ResumeNodeDefinition,
    "type" | "childTypes" | "defaultValue" | "isDefaultChildType" | "isEditable"
>;

export type PortableNodeViewDefinition = Omit<
    ResumeNodeDefinition,
    "type" | "childTypes" | "defaultValue" | "isDefaultChildType" | "isEditable"
>;

/** Resolves one immutable portable grammar entry for the React registry adapter. */
export function portableRegistration(kind: string): PortableRegistration {
    const definition = resumeStructureManifest.nodeKinds.find((candidate) => candidate.kind === kind);
    if (!definition) {
        throw new Error(`Portable resume node kind is not registered: ${kind}`);
    }

    const childTypes = definition.children.mode === "defaultPlus"
        ? DefaultChildren.create().plus(definition.children.kinds)
        : [...definition.children.kinds];

    return {
        type: definition.kind,
        childTypes,
        defaultValue: JSON.parse(JSON.stringify(definition.defaults)),
        isDefaultChildType: definition.defaultChild,
        isEditable: definition.inlineEditable
    };
}
