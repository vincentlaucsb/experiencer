import { useSyncExternalStore } from 'react';

import ClassStore from '@/shared/ClassStore';
import type { ResumeFont } from '@/types';
import { getBuiltinFont, isBuiltinFontFamily } from '@/shared/fonts/builtinFonts';

export const MAXIMUM_DOCUMENT_FONTS = 10;

/** Owns the small, serializable external-font manifest for the active document. */
class DocumentFontsStore extends ClassStore<ResumeFont[] | undefined> {
    protected _data: ResumeFont[] | undefined;

    constructor() {
        super();
        this._data = undefined;
    }

    load(fonts: ResumeFont[] | undefined): void {
        this.withMutation(() => {
            this.data = normalizeFonts(fonts);
        });
        this.clearUnsavedChanges();
    }

    add(font: ResumeFont): boolean {
        if (!font || !['builtin', 'google'].includes(font.provider)
            || !font.family?.trim()
            || this.has(font.family)
            || (this.data?.length ?? 0) >= MAXIMUM_DOCUMENT_FONTS) {
            return false;
        }

        this.withMutation(() => {
            this.data = [...(this.data ?? []), normalizeFont(font)];
        });
        return true;
    }

    remove(family: string): boolean {
        const current = this.data ?? [];
        const next = current.filter((font) => !sameFamily(font.family, family));
        if (next.length === current.length) {
            return false;
        }

        this.withMutation(() => {
            this.data = next;
        });
        return true;
    }

    has(family: string): boolean {
        return (this.data ?? []).some((font) => sameFamily(font.family, family));
    }
}

function sameFamily(left: string, right: string): boolean {
    return left.localeCompare(right, undefined, { sensitivity: 'accent' }) === 0;
}

function normalizeFont(font: ResumeFont): ResumeFont {
    const builtin = font.provider === 'builtin' || isBuiltinFontFamily(font.family)
        ? getBuiltinFont(font.family)
        : undefined;
    return {
        provider: font.provider === 'google' && builtin
            ? 'builtin'
            : font.provider,
        family: font.family.trim(),
        ...(font.category || builtin?.category
            ? { category: font.category?.trim() || builtin?.category }
            : {}),
        ...(font.variants?.length ? { variants: [...new Set(font.variants)].sort() } : {}),
        ...(font.subsets?.length ? { subsets: [...new Set(font.subsets)].sort() } : {})
    };
}

function normalizeFonts(fonts: ResumeFont[] | undefined): ResumeFont[] | undefined {
    if (!fonts) return undefined;
    const normalized: ResumeFont[] = [];
    for (const font of fonts) {
        if (!font || !['builtin', 'google'].includes(font.provider) || !font.family?.trim()) continue;
        if (normalized.some((item) => sameFamily(item.family, font.family))) continue;
        normalized.push(normalizeFont(font));
        if (normalized.length === MAXIMUM_DOCUMENT_FONTS) break;
    }
    return normalized;
}

export const documentFontsStore = new DocumentFontsStore();

export const useDocumentFonts = (): ResumeFont[] | undefined => {
    const snapshot = useSyncExternalStore(
        documentFontsStore.subscribe,
        documentFontsStore.getSnapshot,
        documentFontsStore.getSnapshot
    );
    return snapshot.data;
};

export const useDocumentFontsUnsavedChanges = (): boolean => {
    useSyncExternalStore(
        documentFontsStore.subscribe,
        documentFontsStore.getSnapshot,
        documentFontsStore.getSnapshot
    );
    return documentFontsStore.hasUnsavedChanges();
};
