# Resume Component Refactoring TODO

## Overview

Resume.tsx is the main orchestrator but has accumulated too many responsibilities through React version migrations (16 → 18 → 19). This file documents the refactoring path to reduce it from ~500 lines to a simple layout orchestrator (~50 lines).

## Phase 1: Extract CSS State to Zustand Store

**Goal**: Move CSS management (css, rootCss, stylesheet generation) from React state to a Zustand store.

- [ ] Create `src/shared/stores/cssStore.ts`
  - [ ] State: `css: CssNode`, `rootCss: CssNode`
  - [ ] Actions: `updateCss()`, `loadCss()`, `setRootCss()`, `updateRootCss()`
  - [ ] Getters: `stylesheet()`, `getCssNode()`, `getRootCssNode()`
  - [ ] Lifecycle: `loadCssFromSavedData()`, `dumpCss()`

- [ ] Remove from Resume.tsx state:
  - [ ] `css: CssNode`
  - [ ] `rootCss: CssNode`
  - [ ] `this.style` DOM manipulation

- [ ] Update Resume methods to use store:
  - [ ] `addHtmlId()` → calls `cssStore.updateCss()`
  - [ ] `renderCssEditor()` → reads from store
  - [ ] `loadData()` → calls `cssStore.loadCssFromSavedData()`
  - [ ] `dump()` → reads from store

- [ ] Create stylesheet effect hook:
  - [ ] Auto-update `<style>` tag when css/rootCss changes
  - [ ] Can be in Resume or in a separate hook

- [ ] Tests:
  - [ ] CSS store unit tests
  - [ ] CSS persistence and loading

## Phase 2: Extract UI Modes to Zustand Store

**Goal**: Move mode, clipboard, and visibility state from React state to store.

- [ ] Create `src/shared/stores/uiStore.ts`
  - [ ] State: `mode: EditorMode`, `clipboard?: ResumeNode`, `activeTemplate?: string`
  - [ ] Actions: `setMode()`, `toggleMode()`, `setClipboard()`, `clearClipboard()`, `setActiveTemplate()`
  - [ ] Getters: `isEditing()`, `isPrinting()`

- [ ] Remove from Resume.tsx state:
  - [ ] `mode: EditorMode`
  - [ ] `clipboard?: ResumeNode`
  - [ ] `activeTemplate?: string`

- [ ] Update Resume methods:
  - [ ] `toggleMode()` → `uiStore.toggleMode()`
  - [ ] `clipboardProps` → reads from store
  - [ ] `loadTemplate()` → calls `uiStore.setActiveTemplate()` and `uiStore.setMode('changingTemplate')`

- [ ] Eliminate ResumeContext.isPrinting:
  - [ ] Components read `useUiStore((state) => state.isPrinting)` directly
  - [ ] Remove `<ResumeContext.Provider>` wrapping in render

## Phase 3: Create Store-Connected Wrappers

**Goal**: Extract prop synthesis logic into focused wrapper components using presentation pattern.

### 3a: TopNavBarConnected

- [ ] Create `src/controls/TopNavBar/TopNavBarConnected.tsx`
  - [ ] Reads: `uiStore` (mode), `resumeStore` (unsavedChanges)
  - [ ] Synthesizes: All props for TopNavBar presentation
  - [ ] Exports wrapper as default

- [ ] Update Resume to use `<TopNavBarConnected />` instead of synthesizing props

- [ ] Tests: TopNavBarConnected reads store correctly

### 3b: TopEditingBarConnected

- [ ] Create `src/controls/TopEditingBar/TopEditingBarConnected.tsx`
  - [ ] Reads: `editorStore`, `resumeStore`, `historyStore`, `cssStore`
  - [ ] Synthesizes: All props for TopEditingBar presentation
  - [ ] Exports wrapper as default

- [ ] Update Resume to use `<TopEditingBarConnected />` instead of synthesizing props

- [ ] Tests: TopEditingBarConnected reads store correctly

### 3c: ResumeHotKeysConnected

- [ ] Create `src/controls/ResumeHotkeys/ResumeHotKeysConnected.tsx`
  - [ ] Reads: `editorStore`, `resumeStore`, `historyStore`, `uiStore`
  - [ ] Synthesizes: All props for ResumeHotKeys presentation
  - [ ] Exports wrapper as default

- [ ] Update Resume to use `<ResumeHotKeysConnected />` instead of synthesizing props

- [ ] Tests: ResumeHotKeysConnected reads store correctly

## Phase 4: Eliminate ResumeContext

**Goal**: Remove Context API, relying on Zustand stores and hooks instead.

- [ ] Identify all ResumeContext consumers
  - [ ] Currently used for: `isPrinting`
  - [ ] Search codebase: `ResumeContext`

- [ ] Replace ResumeContext usage with Zustand:
  - [ ] Create `usePrintMode()` hook in `uiStore`
  - [ ] Update components to use hook instead of context

- [ ] Remove from Resume.tsx:
  - [ ] Import of ResumeContext
  - [ ] `<ResumeContext.Provider>` wrapper
  - [ ] Related imports and logic

- [ ] Delete `src/shared/utils/ResumeContext.tsx`

- [ ] Tests: Verify components read isPrinting correctly

## Phase 5: Simplify Resume Component

**Goal**: Reduce Resume to a pure layout orchestrator reading stores.

- [ ] Remove all method bindings in constructor
  - [ ] Methods that are now in stores
  - [ ] Methods that moved to Connected wrappers

- [ ] Remove `componentDidMount` store subscriptions
  - [ ] Zustand handles re-renders automatically via hooks
  - [ ] Class component can use store directly in render

- [ ] Simplify state to layout-only concerns:
  - [ ] Remove everything, handle in stores

- [ ] Simplify render method:
  - [ ] Remove prop synthesis (using Connected wrappers)
  - [ ] Remove context wrapping
  - [ ] Just read stores and compose layout

- [ ] Final structure should be:
  ```tsx
  class Resume extends React.Component {
      private resumeRef = React.createRef<HTMLDivElement>();
      
      render() {
          const mode = useUiStore((state) => state.mode);
          const isPrinting = useUiStore((state) => state.isPrinting);
          const isEditing = useUiStore((state) => state.isEditing());
          
          // Just layout logic here
          switch (mode) {
              case 'help': return <ResizableSidebarLayout ... />
              // etc
          }
      }
  }
  ```

- [ ] Tests: Resume renders correctly with all stores

## Verification Checklist

- [ ] All existing tests still pass
- [ ] No console warnings or errors
- [ ] App functionality unchanged:
  - [ ] Selection/editing works
  - [ ] CSS editing works
  - [ ] Print mode works
  - [ ] Mode switching works
  - [ ] Save/load works
  - [ ] Undo/redo works
  
- [ ] Code quality:
  - [ ] Resume component <100 lines
  - [ ] Each store has single responsibility
  - [ ] Each Connected wrapper is focused
  - [ ] No prop drilling

## Dependencies Between Phases

```
Phase 1 (CSS Store)
    ↓
Phase 2 (UI Store)
    ↓
Phase 3 (Connected Wrappers) ← depends on phases 1-2
    ↓
Phase 4 (Eliminate ResumeContext) ← depends on phase 2
    ↓
Phase 5 (Simplify Resume) ← depends on phases 1-4
```

Start with Phase 1. Each phase should be verified and tested before moving to the next.

## Notes

- Class component is fine to keep; doesn't prevent cleanup
- CSS stylesheet management could move to a useEffect hook in a separate component if preferred
- Consider creating a `src/app/Resume/` folder to colocate Resume with Connected wrappers if it grows
