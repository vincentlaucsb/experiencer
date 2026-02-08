import { v4 as uuid } from 'uuid';
import { BasicResumeNode, ResumeNode } from '@/types';

function isNull(value: any): value is null {
    return value === null;
}

/**
 * Helper function to check if value is null or undefined
 */
export function isNullOrUndefined<T>(value: T | null | undefined): value is null | undefined {
    return value === null || value === undefined;
}

/**
 * Create a container for holding context menus and other dialogs
 * as a child of the <body> tag
 * 
 * @param elementId The desired HTML id of the container
 * @returns A reference to the contaienr
 */
export function createContainer(elementId: string) {
    const htmlBody = document.getElementsByTagName("body")[0];
    if (isNull(document.getElementById(elementId))) {
        const container = document.createElement("div");
        container.setAttribute("id", elementId);
        return htmlBody.appendChild(container);
    }
    
    const container = document.getElementById(elementId);
    if (container) {
        return container;
    }

    throw new Error(`Couldn't create or find ${elementId}`);
}

export function getElementById(elementId: string) {
    const elem = document.getElementById(elementId);
    if (elem) {
        return elem;
    }

    throw new Error(`The element with id "${elementId}" was not found.`);
}

/**
 * Assign unique IDs to a node and its children, or an array of nodes by reference
 * @param nodeOrArray An object describing a node or an array of nodes
 */
export function assignIds(nodeOrArray: BasicResumeNode): ResumeNode;
export function assignIds(nodeOrArray: Array<BasicResumeNode>) : Array<ResumeNode>;
export function assignIds(nodeOrArray: BasicResumeNode | Array<BasicResumeNode>) {
    if (nodeOrArray instanceof Array) {
        assignIdsToNodeArray(nodeOrArray);
        return nodeOrArray as Array<ResumeNode>;
    }

    nodeOrArray['uuid'] = uuid();
    let children = nodeOrArray.childNodes as Array<ResumeNode>;
    if (children) {
        assignIdsToNodeArray(children);
    }

    return nodeOrArray as ResumeNode;
}

/**
 * Assign unique IDs to an array of nodes by reference
 * @param children An array of nodes
 */
function assignIdsToNodeArray(children: Array<BasicResumeNode>) {
    // Assign unique IDs to all children
    let workQueue = [ children ];
    while(workQueue.length) {
        let nextItem = workQueue.pop() as Array<BasicResumeNode>;
        nextItem.forEach((elem) => {
            elem['uuid'] = uuid();

            if (elem.childNodes) {
                workQueue.push(elem.childNodes);
            }
        });
    }
}

/**
 * Return a deep copy of a JavaScript object
 * @param obj Object to be copied
 */
export function deepCopy<T>(obj: T): T{
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Perform helpful text processing
 * @param text Text to be processed
 */
export function process(text?: string) {
    if (text) {
        // Replace '--' with en dash and '---' with em dash
        return text.replace(/---/g, '\u2014').replace(/--/g, '\u2013');
    }

    return "";
}

/**
 * Convert URLs to <a href="" />
 * @param text
 */
export function toUrl(text?: string) {
    if (text) {
        var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
        const regex = new RegExp(expression);
        if (text.match(regex)) {
            return `<a href="${text}">${text}</a>`;
        }

        return text;
    }

    return "";
}