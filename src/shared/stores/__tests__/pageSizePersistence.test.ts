import CssNode from '@/shared/CssTree';
import PageSize from '@/types/PageSize';

import { useEditorStore } from '../editorStore';
import loadData from '../loadData';

const savedData = (pageSize?: 'letter' | 'a4') => ({
    builtinCss: new CssNode('Resume CSS', {}, '#resume').dump(),
    rootCss: new CssNode(':root', {}, ':root').dump(),
    childNodes: [],
    pageSize
});

describe('page-size persistence', () => {
    beforeEach(() => {
        useEditorStore.getState().loadPageSize(PageSize.Letter);
    });

    test('loads A4 and establishes a clean saved baseline', () => {
        loadData(savedData(PageSize.A4));

        expect(useEditorStore.getState().pageSize).toBe(PageSize.A4);
        expect(useEditorStore.getState().hasUnsavedPageSizeChanges).toBe(false);
    });

    test('defaults legacy saves to Letter', () => {
        useEditorStore.getState().loadPageSize(PageSize.A4);

        loadData(savedData());

        expect(useEditorStore.getState().pageSize).toBe(PageSize.Letter);
        expect(useEditorStore.getState().hasUnsavedPageSizeChanges).toBe(false);
    });

    test('tracks changes relative to the loaded page size', () => {
        loadData(savedData(PageSize.Letter));

        useEditorStore.getState().setPageSize(PageSize.A4);
        expect(useEditorStore.getState().hasUnsavedPageSizeChanges).toBe(true);

        useEditorStore.getState().setPageSize(PageSize.Letter);
        expect(useEditorStore.getState().hasUnsavedPageSizeChanges).toBe(false);
    });
});
