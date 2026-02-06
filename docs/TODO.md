# Experiencer TODO

## High Priority

### Zustand State Management Migration
**Goal**: Replace Context API for frequently-changing editor state with Zustand for better performance

**Background**:
- Current ResumeContext mixes high-frequency changes (selectedNodeId, isEditingSelected) with low-frequency (isPrinting)
- Every node selection triggers context update → re-renders entire component tree
- Performance degrades with large resume documents

**Proposed Architecture**:
```typescript
// Keep in ResumeContext (infrequent, affects most components)
- isPrinting

// Move to Zustand store (frequent, selective subscriptions)
- selectedNodeId
- isEditingSelected
- clipboard operations
- undo/redo stack (maybe)
```

**Tasks**:
1. Install Zustand: `npm install zustand --legacy-peer-deps`
2. Create `src/stores/editorStore.ts` with:
   - selectedNodeId state
   - isEditingSelected state
   - Actions: selectNode, editNode, unselectNode
3. Update components to use Zustand hooks (~10-15 files):
   - Link.tsx
   - RichText.tsx
   - Container.tsx
   - ResumeContextMenu.tsx
   - TopEditingBar.tsx
   - Others that check selectedUuid/isEditingSelected
4. Refactor Resume.tsx to use store instead of setState
5. Remove selectedUuid/isEditingSelected from ResumeContext
6. Test thoroughly - selection, editing, undo/redo
7. Update ARCHITECTURE.md with new state management pattern

**Benefits**:
- ⚡ Selective re-renders (only components using selected node re-render)
- 🐛 Redux DevTools for debugging
- 📦 Simpler component logic (no context consumer boilerplate)
- 🔧 Can access/update state outside React components

**Estimated effort**: 2-3 hours

---

### Markdown Component (Replace RichText)
**Goal**: Move away from react-quill (React 18 compatibility issues) to Markdown-based text editing

**Decisions needed**:
1. **Editor choice**:
   - Option A: `react-markdown` + `react-simplemde-editor` (full markdown editor with toolbar)
   - Option B: `@uiw/react-md-editor` (modern, TypeScript-first, preview pane)
   - Option C: Plain textarea + `react-markdown` for preview (minimal, flexible)
   - **Recommendation**: Option B (@uiw/react-md-editor) - good balance of features/complexity

2. **Migration strategy**:
   - Option A: Keep both RichText and Markdown, manual migration by users
   - Option B: Create HTML-to-Markdown converter utility for automatic migration
   - **Recommendation**: Option A initially, add converter if needed

**Tasks**:
1. Research & decide on editor library
2. Install dependencies: `npm install react-markdown @uiw/react-md-editor --legacy-peer-deps`
3. Create `src/components/Markdown.tsx`:
   - Function component with hooks
   - Edit mode: Markdown editor
   - View mode: Rendered markdown
   - Uses isPrinting context for export
4. Update ComponentTypes.tsx:
   - Add Markdown to childTypes for Grid, Column, Entry, Section, Header
   - Add defaultValue for Markdown type
   - Add cssName mapping
5. Add Markdown to ResumeComponent.tsx factory
6. Create CSS template in CssTemplates.tsx:
   - Styles for rendered markdown (headings, lists, code blocks, etc.)
7. Optional: Create HTML → Markdown converter utility
8. Update templates to use Markdown instead of RichText
9. Test rendering, editing, export, print
10. Update documentation

**Features to support**:
- Headings (h1-h6)
- Bold, italic, strikethrough
- Ordered/unordered lists
- Links (inline markdown syntax)
- Code blocks (inline and fenced)
- Blockquotes
- Horizontal rules

**Estimated effort**: 3-4 hours

---

## Medium Priority

### Improve Link Component
- [x] Create Link component
- [x] Add to schema and templates
- [x] URL input in toolbar
- [x] Edit mode context menu
- [x] Export with proper href attributes
- [ ] Add keyboard shortcut (Ctrl+K?) to create link from selected text
- [ ] Validate URL format with visual feedback
- [ ] Support for email links (mailto:)
- [ ] Support for phone links (tel:)

### CSS Editor Improvements
- [ ] Add CSS autocomplete for property values
- [ ] Color picker for color properties
- [ ] Visual selector builder
- [ ] Import/export custom CSS themes
- [ ] CSS variable editor with live preview

### Template Enhancements
- [ ] Create more modern templates
- [ ] Template preview thumbnails
- [ ] Custom template import/export
- [ ] Template marketplace/sharing

## Low Priority

### Testing
- [ ] Increase test coverage (currently minimal)
- [ ] Add E2E tests with Playwright/Cypress
- [ ] Visual regression testing for templates
- [ ] Performance benchmarks

### Developer Experience
- [ ] Add Storybook for component development
- [ ] Improve TypeScript strict mode compliance
- [ ] Add ESLint configuration
- [ ] Set up Prettier for code formatting
- [ ] Add pre-commit hooks with Husky

### Features
- [ ] Multi-page resume support
- [ ] Image upload and optimization
- [ ] Font family selector in CSS editor
- [ ] Spell check integration
- [ ] Accessibility audit and improvements
- [ ] Dark mode for editor UI (not resume)
- [ ] Collaborative editing (WebRTC?)
- [ ] Resume versioning/history

### Build & Deploy
- [ ] Consider migration to Vite (faster builds)
- [ ] PWA support for offline editing
- [ ] GitHub Pages deployment automation
- [ ] Docker container for local development

---

## Completed

- ✅ React 16 → 18 upgrade (pragmatic choice vs. 19)
- ✅ Remove react-scripts, migrate to Webpack 5
- ✅ TypeScript 3.7 → 5.7 upgrade
- ✅ Modern SCSS syntax (@use, math.div, color.adjust)
- ✅ Jest test suite setup and fixes
- ✅ Create Link component with proper export
- ✅ Add isPrinting to ResumeContext
- ✅ Create AI-friendly documentation (CLAUDE.md, ARCHITECTURE.md, MIGRATION.md)
- ✅ Establish function component preference for new code
