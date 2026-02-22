import { renderHook, act } from '@testing-library/react';
import { useHasUnsavedChanges, cssStore, rootCssStore, useCss, useRootCss } from '../cssStoreHooks';
import CssNode from '@/shared/CssTree';
import { CssNodeDump } from '@/types';

describe('CSS Store Hooks - Unsaved Changes', () => {
    beforeEach(() => {
        // Reset stores to clean state
        cssStore.setCss(new CssNode("Resume CSS", {}, "#resume"));
        rootCssStore.setCss(new CssNode(":root", {}, ":root"));
        cssStore.clearUnsavedChanges();
        rootCssStore.clearUnsavedChanges();
    });

    describe('useHasUnsavedChanges', () => {
        test('returns false on initial load', () => {
            const { result } = renderHook(() => useHasUnsavedChanges());
            
            expect(result.current).toBe(false);
        });

        test('returns true after cssStore mutation', () => {
            const { result } = renderHook(() => useHasUnsavedChanges());
            
            expect(result.current).toBe(false);
            
            act(() => {
                cssStore.updateCss((css) => {
                    css.add('Test', { color: 'red' });
                });
            });
            
            expect(result.current).toBe(true);
        });

        test('returns true after rootCssStore mutation', () => {
            const { result } = renderHook(() => useHasUnsavedChanges());
            
            expect(result.current).toBe(false);
            
            act(() => {
                rootCssStore.updateCss((css) => {
                    css.properties.set('--test-var', '10px');
                });
            });
            
            expect(result.current).toBe(true);
        });

        test('returns true if either store has unsaved changes', () => {
            const { result } = renderHook(() => useHasUnsavedChanges());
            
            act(() => {
                cssStore.updateCss((css) => {
                    css.add('Test1', { color: 'red' });
                });
            });
            
            expect(result.current).toBe(true);
            
            act(() => {
                cssStore.clearUnsavedChanges();
            });
            
            expect(result.current).toBe(false);
            
            act(() => {
                rootCssStore.updateCss((css) => {
                    css.properties.set('--test-var', '10px');
                });
            });
            
            expect(result.current).toBe(true);
        });

        test('returns false after clearing both stores', () => {
            const { result } = renderHook(() => useHasUnsavedChanges());
            
            act(() => {
                cssStore.updateCss((css) => {
                    css.add('Test', { color: 'red' });
                });
                rootCssStore.updateCss((css) => {
                    css.properties.set('--test-var', '10px');
                });
            });
            
            expect(result.current).toBe(true);
            
            act(() => {
                cssStore.clearUnsavedChanges();
                rootCssStore.clearUnsavedChanges();
            });
            
            expect(result.current).toBe(false);
        });

        test('re-renders when cssStore changes', () => {
            const { result } = renderHook(() => useHasUnsavedChanges());
            const initialRender = result.current;
            
            act(() => {
                cssStore.updateCss((css) => {
                    css.add('Test', { color: 'red' });
                });
            });
            
            // Should have re-rendered with new value
            expect(result.current).not.toBe(initialRender);
            expect(result.current).toBe(true);
        });

        test('re-renders when rootCssStore changes', () => {
            const { result } = renderHook(() => useHasUnsavedChanges());
            const initialRender = result.current;
            
            act(() => {
                rootCssStore.updateCss((css) => {
                    css.properties.set('--test-var', '10px');
                });
            });
            
            // Should have re-rendered with new value
            expect(result.current).not.toBe(initialRender);
            expect(result.current).toBe(true);
        });
    });

    describe('Integration with other hooks', () => {
        test('useCss and useHasUnsavedChanges are synchronized', () => {
            const { result: cssResult } = renderHook(() => useCss());
            const { result: changesResult } = renderHook(() => useHasUnsavedChanges());
            
            expect(changesResult.current).toBe(false);
            expect(cssResult.current.children.length).toBe(0);
            
            act(() => {
                cssStore.updateCss((css) => {
                    css.add('NewStyle', { margin: '0' });
                });
            });
            
            // Both hooks should have updated
            expect(cssResult.current.children.length).toBe(1);
            expect(changesResult.current).toBe(true);
        });

        test('useRootCss and useHasUnsavedChanges are synchronized', () => {
            const { result: rootCssResult } = renderHook(() => useRootCss());
            const { result: changesResult } = renderHook(() => useHasUnsavedChanges());
            
            expect(changesResult.current).toBe(false);
            expect(rootCssResult.current.properties.size).toBe(0);
            
            act(() => {
                rootCssStore.updateCss((css) => {
                    css.properties.set('--color-primary', '#000');
                });
            });
            
            // Both hooks should have updated
            expect(rootCssResult.current.properties.size).toBe(1);
            expect(rootCssResult.current.properties.get('--color-primary')).toBe('#000');
            expect(changesResult.current).toBe(true);
        });
    });

    describe('Edge cases', () => {
        test('multiple mutations keep flag set', () => {
            const { result } = renderHook(() => useHasUnsavedChanges());
            
            act(() => {
                cssStore.updateCss((css) => {
                    css.add('Test1', { color: 'red' });
                });
            });
            
            expect(result.current).toBe(true);
            
            act(() => {
                cssStore.updateCss((css) => {
                    css.add('Test2', { color: 'blue' });
                });
            });
            
            expect(result.current).toBe(true);
        });

        test('setCss still marks as unsaved', () => {
            const { result } = renderHook(() => useHasUnsavedChanges());
            
            act(() => {
                cssStore.setCss(new CssNode("New CSS", {}, "#new"));
            });
            
            expect(result.current).toBe(true);
        });

        test('loadCss marks as unsaved', () => {
            const { result } = renderHook(() => useHasUnsavedChanges());
            
            const testData: CssNodeDump = {
                name: "Loaded CSS",
                selector: "#loaded",
                properties: [['color', 'blue']] as [string, string][],
                children: []
            };
            
            act(() => {
                cssStore.loadCss(testData);
            });
            
            expect(result.current).toBe(true);
        });
    });
});
