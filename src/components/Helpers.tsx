import uuid from 'uuid/v4';
import { isNullOrUndefined, isNull } from 'util';
import { BasicResumeNode, ResumeNode } from './utility/Types';

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
 * Return a copy of an array with the i-th element removed
 * @param i: The index of the item to be deleted, zero-indexed
 */
export function deleteAt<T>(arr: Array<T>, i: number) {
    if (i === 0) {
        arr.shift();
    }
    else if (i === arr.length - 1) {
        arr.pop();
    }
    else {
        arr.splice(i, 1);
    }

    return arr;
}

/**
 * Move the element at position i up one space by swapping
 * it with the one above it
 * @param arr
 * @param i
 */
export function moveUp<T>(arr: Array<T>, i: number) {
    if (i > 0) {
        // Swap places with element above it
        let willSwap = arr[i - 1];
        arr[i - 1] = arr[i];
        arr[i] = willSwap;
    }

    return arr;
}

/**
 * Move the element at position i down one space by swapping
 * it with the one below it
 * @param arr
 * @param i
 */
export function moveDown<T>(arr: Array<T>, i: number) {
    if (i < arr.length - 1) {
        // Swap places with element above it
        let willSwap = arr[i + 1];
        arr[i + 1] = arr[i];
        arr[i] = willSwap;
    }

    return arr;
}

export function arraysEqual<T>(left: Array<T>, right?: Array<T>) {
    if (right) {
        if (left.length !== right.length) {
            return false;
        }

        for (let i = 0; i < left.length; i++) {
            if (left[i] !== right[i]) {
                return false;
            }
        }

        return true;
    }

    return false;
}

/**
 * Returns true if children are null or empty
 * @param arr
 */
export function isEmpty<T>(children: Array<T> | {} | number | boolean | string | null | undefined) {
    if (isNullOrUndefined(children)) {
        return true;
    }
    else if (Array.isArray(children)) {
        return children.length === 0;
    }

    return children > 0;
}

export function pushArray<T>(arr: Array<T>, data: T) {
    arr.push(data);
    return arr;
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