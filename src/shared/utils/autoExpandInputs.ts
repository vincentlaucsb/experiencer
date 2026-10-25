/** Binds inline input sizing without changing the value used by editing or persistence. */
export function bindAutoExpandInputs(inputs: readonly (HTMLInputElement | null)[]): () => void {
    const listeners = inputs.flatMap(input => {
        if (!input) return [];
        const resize = () => fitInput(input);
        resize();
        input.addEventListener('input', resize);
        return [{ input, resize }];
    });

    return () => listeners.forEach(({ input, resize }) => input.removeEventListener('input', resize));
}

function fitInput(input: HTMLInputElement): void {
    input.style.width = '0px';
    if (input.value || !input.placeholder) {
        input.style.width = `${input.scrollWidth}px`;
        return;
    }

    // Chromium does not include placeholder text in a collapsed input's scrollWidth.
    // Measure the displayed hint separately so clearing a field never hides its guidance.
    const document = input.ownerDocument;
    const view = document.defaultView;
    if (!view || !document.body) return;
    const style = view.getComputedStyle(input);
    const placeholderStyle = view.getComputedStyle(input, '::placeholder');
    const mirror = document.createElement('span');
    mirror.setAttribute('aria-hidden', 'true');
    Object.assign(mirror.style, {
        position: 'fixed', visibility: 'hidden', pointerEvents: 'none', whiteSpace: 'pre',
        font: placeholderStyle.font || style.font,
        letterSpacing: placeholderStyle.letterSpacing,
        wordSpacing: placeholderStyle.wordSpacing,
        textTransform: placeholderStyle.textTransform
    });
    mirror.textContent = input.placeholder;
    document.body.append(mirror);
    try {
        const padding = pixels(style.paddingLeft) + pixels(style.paddingRight);
        const border = pixels(style.borderLeftWidth) + pixels(style.borderRightWidth);
        const box = style.boxSizing === 'border-box' ? padding + border : 0;
        input.style.width = `${Math.ceil(mirror.getBoundingClientRect().width + box)}px`;
    } finally {
        mirror.remove();
    }
}

function pixels(value: string): number {
    return Number.parseFloat(value) || 0;
}
