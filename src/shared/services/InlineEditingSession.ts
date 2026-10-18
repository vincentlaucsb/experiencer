type EditingValue = string | Record<string, string>;

export interface InlineEditingOptions<T extends EditingValue> {
    isEditing: boolean;
    value: T;
    onChange(value: T): void;
    toggleEditing(): void;
    ctrlEnter?: boolean;
}

/** Owns an inline edit's original value and keyboard completion/cancellation policy. */
export class InlineEditingSession<T extends EditingValue> {
    private options: InlineEditingOptions<T>;
    private original: T;

    constructor(options: InlineEditingOptions<T>) {
        this.options = options;
        this.original = this.clone(options.value);
    }

    private clone(value: T): T { return typeof value === 'object' ? { ...value } : value; }

    sync(options: InlineEditingOptions<T>): void {
        if (options.isEditing && !this.options.isEditing) this.original = this.clone(options.value);
        this.options = options;
    }

    cancel = (): void => {
        this.options.onChange(this.original);
        this.options.toggleEditing();
    };

    save = (): void => { this.options.toggleEditing(); };

    attach(target: Document): () => void {
        const onKeyDown = (event: KeyboardEvent) => {
            if (!this.options.isEditing || event.defaultPrevented) return;
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopImmediatePropagation();
                this.cancel();
            } else if (event.key === 'Enter' && (this.options.ctrlEnter === false || event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                event.stopImmediatePropagation();
                this.save();
            }
        };
        target.addEventListener('keydown', onKeyDown);
        return () => target.removeEventListener('keydown', onKeyDown);
    }
}
