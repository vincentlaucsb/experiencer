/**
 * Array manipulation helper functions
 * Note: All functions mutate the array in-place
 */

/**
 * Remove the element at position i from an array
 * @param arr The array to modify
 * @param i The index of the element to remove
 * @returns The modified array
 */
export function deleteAt<T>(arr: Array<T>, i: number): Array<T> {
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
 * @param arr The array to modify
 * @param i The current index of the element
 * @returns The element that was moved (now at position i-1)
 */
export function moveUp<T>(arr: Array<T>, i: number): T | undefined {
    if (i <= 0) return undefined;

    // Swap places with element above it
    const temp = arr[i - 1];
    arr[i - 1] = arr[i];
    arr[i] = temp;

    return arr[i - 1];
}

/**
 * Move the element at position i down one space by swapping
 * it with the one below it
 * @param arr The array to modify
 * @param i The current index of the element
 * @returns The element that was moved (now at position i+1)
 */
export function moveDown<T>(arr: Array<T>, i: number): T | undefined {
    if (i >= arr.length - 1) return undefined;

    // Swap places with element below it
    const temp = arr[i + 1];
    arr[i + 1] = arr[i];
    arr[i] = temp;

    return arr[i + 1];
}

/**
 * Check if two arrays are equal by reference comparison
 * @param left First array
 * @param right Second array (optional)
 * @returns true if arrays have same length and all elements match
 */
export function arraysEqual<T>(left: Array<T>, right?: Array<T>): boolean {
    if (!right) {
        return false;
    }

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

/**
 * Add an element to an array
 * @param arr The array to modify
 * @param data The element to add
 * @returns The modified array
 */
export function pushArray<T>(arr: Array<T>, data: T): Array<T> {
    arr.push(data);
    return arr;
}
