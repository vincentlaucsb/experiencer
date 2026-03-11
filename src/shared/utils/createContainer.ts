function isNull(value: unknown): value is null {
    return value === null;
}

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
