﻿import uuid from 'uuid/v4';

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

export function arraysEqual<T>(left: Array<T>, right: Array<T>) {
    if (left.length != right.length) {
        return false;
    }

    for (let i = 0; i < left.length; i++) {
        if (left[i] != right[i]) {
            return false;
        }
    }

    return true;
}

/**
 * Assign unique IDs to a node and its children, or an array of nodes by reference
 * @param nodeOrArray An object describing a node or an array of nodes
 */
export function assignIds(nodeOrArray: object) {
    if (nodeOrArray instanceof Array) {
        assignIdsToNodeArray(nodeOrArray);
        return nodeOrArray as Array<object>;
    }

    nodeOrArray['uuid'] = uuid();
    let children = nodeOrArray['children'] as Array<object>;
    if (children) {
        assignIdsToNodeArray(nodeOrArray['children']);
    }

    return nodeOrArray;
}

/**
 * Assign unique IDs to an array of nodes by reference
 * @param children An array of nodes
 */
function assignIdsToNodeArray(children: Array<object>) {
    // Assign unique IDs to all children
    let workQueue = [ children ];
    while(workQueue.length) {
        let nextItem = workQueue.pop() as Array<object>;
        nextItem.forEach((elem) => {
            elem['uuid'] = uuid();

            if (elem['children']) {
                workQueue.push(elem['children']);
            }
        });
    }
}

/**
 * Return a deep copy of a JavaScript object
 * @param obj Object to be copied
 */
export function deepCopy(obj: any) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Perform helpful text processing
 * @param text Text to be processed
 */
// TODO: Convert URLs to anchors
export function process(text?: string) {
    if (text) {
        // Replace '--' with en dash and '---' with em dash
        return text.replace(/---/g, '\u2014').replace(/--/g, '\u2013');
    }

    return "";
}