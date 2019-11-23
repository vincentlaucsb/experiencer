/**
 * Return a copy of an array with the i-th element removed
 * @param i: The index of the item to be deleted, zero-indexed
 */
export function deleteAt<T>(arr: Array<T>, i: number) {
    if (i == 0) {
        arr.shift();
    }
    else if (i == arr.length - 1) {
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