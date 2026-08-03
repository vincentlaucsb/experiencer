/**
 * Array manipulation helpers.
 *
 * These functions return new arrays and never mutate their inputs. Resume node
 * arrays are commonly passed through React props, so mutating one here can
 * change the live document before the store has a chance to record history.
 */

/**
 * Remove the element at position i from an array
 * @param arr The source array
 * @param i The index of the element to remove
 * @returns A new array without the requested element
 */
export function deleteAt<T>(arr: ReadonlyArray<T>, i: number): Array<T> {
    if (i < 0 || i >= arr.length) {
        return [...arr];
    }

    return [...arr.slice(0, i), ...arr.slice(i + 1)];
}

/**
 * Move the element at position i up one space by swapping
 * it with the one above it.
 * @param arr The source array
 * @param i The current index of the element
 * @returns A new array with the element moved
 */
export function moveUp<T>(arr: ReadonlyArray<T>, i: number): Array<T> {
    const next = [...arr];
    if (i <= 0 || i >= next.length) return next;

    [next[i - 1], next[i]] = [next[i], next[i - 1]];

    return next;
}

/**
 * Move the element at position i down one space by swapping
 * it with the one below it.
 * @param arr The source array
 * @param i The current index of the element
 * @returns A new array with the element moved
 */
export function moveDown<T>(arr: ReadonlyArray<T>, i: number): Array<T> {
    const next = [...arr];
    if (i < 0 || i >= next.length - 1) return next;

    [next[i], next[i + 1]] = [next[i + 1], next[i]];

    return next;
}

/**
 * Check if two arrays are equal by reference comparison
 * @param left First array
 * @param right Second array (optional)
 * @returns true if arrays have same length and all elements match
 */
export function arraysEqual<T>(left: ReadonlyArray<T>, right?: ReadonlyArray<T>): boolean {
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

export function arrayNormalize<T>(item: T | ReadonlyArray<T>): Array<T> {
    if (Array.isArray(item)) {
        return [...(item as ReadonlyArray<T>)];
    }

    return [item as T];
}

/**
 * Add an element to an array without modifying the input.
 */
export function pushArray<T>(arr: ReadonlyArray<T>, data: T): Array<T> {
    return [...arr, data];
}
