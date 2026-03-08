# Experiencer TODO

## Scratchpad

### Misc
 - (Moved to CHANGELOG)

### CSS Editor
 - [ ] Raw CSS view should have button next to each section that goes to corresponding section in CSS
 - [ ] In scoped view, consider showing `:root` styles
 - [ ] Consider adding color picker

### Nodes
 - [ ] Finish semantic HTML migrations
 - [ ] Fix Image component editing mode

### Markdown Component (Replace RichText) - IN PROGRESS
**Goal**: Move away from react-quill (React 18 compatibility issues) to Markdown-based text editing

**Architecture**:
- **Markdown RichText**: General-purpose freeform text (intro paragraphs, summaries, formatted content)
- **BulletedList** (Phase 1): Markdown RichText with `- ` prefix pre-populated, `hideBullets` toggle
- **BulletedList** (Phase 2): Dedicated component with array structure (when feature demands justify refactor)

**Phase 1 - Markdown RichText (CURRENT)**:
1. ⏳ Create `src/resume/Markdown.tsx`:
   - Function component with hooks
   - Edit mode: Plain textarea with markdown syntax hints
   - View mode: Rendered markdown via react-markdown
   - Uses isPrinting context for export
2. ⏳ Update ComponentTypes.tsx:
   - Add Markdown to childTypes for Grid, Column, Entry, Section, Header
   - Keep RichText for backward compatibility initially
   - Add defaultValue for Markdown type ("# " for headers, "- " for lists)
   - Add cssName mapping
3. ⏳ Add Markdown to ResumeComponent.tsx factory
4. ⏳ Update CssTemplates.tsx:
   - Styles for rendered markdown (headings, lists, code blocks, blockquotes)
5. ⏳ Update templates to use Markdown instead of RichText
6. ⏳ Test rendering, editing, export, print
7. ⏳ Remove/deprecate RichText component

**Phase 2 - Bulleted List Refactor** (Backlog):
- Create dedicated `src/resume/BulletedList.tsx` component
- Data structure: `{ items: string[], showBullets: boolean }`
- Features: drag-to-reorder, bulk operations, consistent presentation
- Migrate existing Markdown lists with `- ` prefix automatically
- Add list-specific UI (add/remove item buttons)

**Phase 3 - WYSIWYG Editor** (Nice-to-have, Backlog):
- Evaluate `@uiw/react-md-editor` (modern, TypeScript-first, preview pane)
- Provides visual toolbar while maintaining markdown compatibility
- Can be added later without breaking Phase 1 implementation

**Supported Markdown Features**:
- Headings (# h1, ## h2, etc.)
- Bold (**text**), italic (*text*), strikethrough (~~text~~)
- Ordered lists (1. item)
- Unordered lists (- item)
- Links ([text](url))
- Code blocks (` `` `code` `` `)
- Blockquotes (> quote)
- Horizontal rules (---)

**Estimated effort**:
- Phase 1: 2-3 hours
- Phase 2: 1.5-2 hours (when ready)
- Phase 3: 1-2 hours (optional improvement)

---

## Medium Priority

### UX & Visual Polish
**Goal**: Elevate the interface from functional to premium
- [ ] Modern visual design: Subtle shadows, glassmorphism effects, refined spacing
- [ ] Onboarding experience: Quick tutorial or template wizard for first-time users
- [ ] Template gallery view: Show all templates at once instead of dropdown selection
- [ ] Improved tree view: Better visual hierarchy, drag-and-drop indicators
- [ ] Responsive design improvements: Better mobile/tablet layout
**Estimated effort**: 4-6 hours

### Export & Output Features
**Goal**: Professional-grade export capabilities
- [ ] PDF export with print CSS optimization
- [ ] Multiple format support: JSON, YAML, plain text
- [ ] Custom page size options (A4, Letter, Legal)
- [ ] Print preview mode with margin guides
- [ ] Mobile preview: Real-time preview on mobile while editing on desktop
**Estimated effort**: 3-5 hours

### AI-Assisted Editing
**Goal**: Help users improve their resume content
- [ ] Suggest improvements to bullet points (clarity, impact, action verbs)
- [ ] Identify weak phrasing or passive voice
- [ ] Recommend relevant skills based on job description
- [ ] Grammar and spelling suggestions
- [ ] Tone analyzer (professional, casual, technical)
**Estimated effort**: 8-12 hours (requires API integration)
**Status**: Nice-to-have, long-term feature

### Image Component for Data URIs
**Issue**: react-markdown doesn't properly render base64 data URIs in `<img src="data:image/...">`
**Use Case**: Embedded signature images in cover letters (previously supported in RichText)
**Solution**: Create dedicated Image component for resume nodes
- Component: `src/resume/Image.tsx`
- Props: `{ src: string, alt?: string, width?: string, height?: string }`
- Edit mode: Input fields for src/alt/width/height or file upload with base64 conversion
- View mode: Standard `<img>` tag (no react-markdown processing)
- Add to ComponentTypes and ResumeComponent factory
**Estimated effort**: 1-2 hours

### react-resizable-and-movable (SplitPane)
Similar situation to react-contextmenu - type compatibility issues with modern React
- **Issue**: `children` prop type mismatch in SplitPane component
- **Location**: `src/controls/Layouts.tsx` (ResizableSidebarLayout - 2 instances)
- **Solution**: Create custom SplitPane wrapper component following the ContextMenu pattern
- **Effort**: Medium (similar complexity to ContextMenu wrapper)
- **Status**: Backlog - working component but TypeScript errors

### Improve Link Component
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
- [ ] Accessibility audit and improvements (tracked in `ARIA-TODO.md`)
- [ ] Dark mode for editor UI (not resume)
- [ ] Collaborative editing (WebRTC?)
- [ ] Resume versioning/history

### Build & Deploy
- [ ] PWA support for offline editing
- [ ] GitHub Pages deployment automation
- [ ] Docker container for local development

---

## Documented Tradeoffs to Reevaluate

- [ ] Page break spacing enforcement: currently we do not enforce a full-page minimum gap between consecutive `PageBreak` nodes in editing mode.
   - **Current approach**: dynamic `#resume` min-height based on `pageBreakCount + 1`, with natural content flow.
   - **Reason**: avoids high-complexity layout constraints and editor jank for a low-frequency edge case.
   - **Reevaluate if**: users repeatedly report confusing pagination or overlapping mental model between visual breaks and print output.

- [ ] Resume host architecture: keep resume rendering in same-document `#resume` container rather than moving editing to an iframe.
   - **Current approach**: render resume directly in app DOM for WYSIWYG interactions (selection, overlays, context menus, live CSS, print-preview parity).
   - **Reason**: iframe isolation is cleaner for CSS boundaries, but significantly increases complexity for event routing, portals/highlight overlays, and editing fidelity.
   - **Reevaluate if**: CSS collision issues become frequent/high-impact, or we introduce a dedicated read-only preview surface where iframe isolation provides clear value.

---

Completed work is tracked in `CHANGELOG.md`.

Accessibility/ARIA completed + future work is tracked in `ARIA-TODO.md`.
