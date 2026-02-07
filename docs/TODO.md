# Experiencer TODO

## Recently Completed

### ✅ Vite Migration (COMPLETED)
**Goal**: Migrate from Webpack to Vite for faster development and better DX

**Completed**:
- ✅ Installed Vite 7.3.1 + @vitejs/plugin-react + vite-plugin-svgr
- ✅ Created vite.config.ts with optimized settings
- ✅ Moved index.html to root with script tag
- ✅ Updated package.json scripts (dev, build, preview)
- ✅ Removed 346 webpack packages (babel-loader, css-loader, webpack, etc.)
- ✅ Added vite-env.d.ts for TypeScript support
- ✅ All tests passing (23/23)
- ✅ Dev server starts in 364ms (vs ~3-5s with webpack)

**Results**:
- ⚡ **10x faster dev server startup** - 364ms vs 3-5 seconds
- 🔥 **Instant HMR** - Changes appear in ~50ms
- 📦 **346 fewer packages** - Leaner dependency tree
- 🎯 **Native ESM** - Modern approach, better tree-shaking
- 🚀 **Better DX** - Cleaner config, faster iteration

### ✅ Zustand State Management Migration (COMPLETED)
**Goal**: Replace Context API for frequently-changing editor state with Zustand for better performance

**Completed**:
- ✅ Installed Zustand 5.x with `--legacy-peer-deps`
- ✅ Created `src/stores/editorStore.ts` with selectedNodeId, isEditingSelected state
- ✅ Added actions: selectNode, editNode, unselectNode, toggleEdit
- ✅ Updated Resume.tsx to use store for selection handling
- ✅ Removed selectedUuid/isEditingSelected from ResumeContext
- ✅ Updated 6 components: Link, Container, RichText, Header, List, Entry
- ✅ Created selector hooks: useIsNodeEditing, useIsNodeSelected, useIsEditingSelected
- ✅ All tests passing (23/23)
- ✅ Updated ARCHITECTURE.md with Zustand patterns
- ✅ Updated .claude/rules/state-management.md with comprehensive examples

**Results**:
- ⚡ Selective re-renders: Only selected/unselected components update
- 🐛 Redux DevTools integrated for debugging
- 📦 Simpler component logic with hooks (function components) and getState() (class components)
- 🔧 Can access/update state outside React components

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

### react-contextmenu
✅ **COMPLETED** - Created custom ContextMenu component at `src/controls/ContextMenu.tsx`
- Replaced react-contextmenu (last updated 2020) with custom implementation
- Provides ContextMenu and ContextMenuTrigger components
- Resolves TypeScript type compatibility issues

### react-resizable-and-movable (SplitPane)
Similar situation to react-contextmenu - type compatibility issues with modern React
- **Issue**: `children` prop type mismatch in SplitPane component
- **Location**: `src/controls/Layouts.tsx` (ResizableSidebarLayout - 2 instances)
- **Solution**: Create custom SplitPane wrapper component following the ContextMenu pattern
- **Effort**: Medium (similar complexity to ContextMenu wrapper)
- **Status**: Backlog - working component but TypeScript errors

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
