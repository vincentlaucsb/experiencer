import { BasicResumeNode } from "@/types";

/** Information about a node, including its display text, the node data, and an optional icon */
export interface NodeInformation {
    text: string;

    /** Template node data */
    node: BasicResumeNode & Record<string, any>;

    icon?: string;
}