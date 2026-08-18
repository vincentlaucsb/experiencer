import type { ResumeAppExtensions } from '@/app/ResumeAppContracts';

function sameGroup<T extends object>(left?: T, right?: T): boolean {
    if (left === right) return true;
    if (!left || !right) return false;

    const leftKeys = Object.keys(left) as Array<keyof T>;
    const rightKeys = Object.keys(right) as Array<keyof T>;
    if (leftKeys.length !== rightKeys.length) return false;

    return leftKeys.every((key) => left[key] === right[key]);
}

function sameExtensions(left: ResumeAppExtensions, right: ResumeAppExtensions): boolean {
    return sameGroup(left.shell, right.shell)
        && sameGroup(left.editor, right.editor)
        && sameGroup(left.landing, right.landing)
        && sameGroup(left.templates, right.templates);
}

/** Hosts shell, editor, landing, and template extensions independently of React. */
export class ResumeAppExtensionsStore {
    private snapshot: ResumeAppExtensions = {};
    private readonly listeners = new Set<() => void>();

    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    getSnapshot = () => this.snapshot;

    replace(extensions: ResumeAppExtensions): void {
        if (sameExtensions(this.snapshot, extensions)) return;
        this.snapshot = extensions;
        this.emit();
    }

    setShell(shell?: ResumeAppExtensions['shell']): void {
        this.replace({ ...this.snapshot, shell });
    }

    setEditor(editor?: ResumeAppExtensions['editor']): void {
        this.replace({ ...this.snapshot, editor });
    }

    setLanding(landing?: ResumeAppExtensions['landing']): void {
        this.replace({ ...this.snapshot, landing });
    }

    setTemplates(templates?: ResumeAppExtensions['templates']): void {
        this.replace({ ...this.snapshot, templates });
    }

    reset(): void {
        this.replace({});
    }

    private emit(): void {
        this.listeners.forEach((listener) => listener());
    }
}

export const resumeAppExtensionsStore = new ResumeAppExtensionsStore();
