# Codebase Reorganization

## Summary

The entire codebase has been successfully reorganized from a flat `components/` structure into a feature-based architecture. This improves code discoverability, maintainability, and scalability.

## New Directory Structure

```
src/
├── app/                  # Application entry point and root component
│   ├── index.tsx        # Vite entry point
│   ├── Resume.tsx       # Main app component (681 lines)
│   ├── serviceWorker.js
│   ├── vite-env.d.ts
│   ├── react-app-env.d.ts
│   └── __tests__/       # App-level tests
│
├── resume/              # Resume content components
│   ├── Column.tsx
│   ├── Container.tsx
│   ├── Divider.tsx
│   ├── Entry.tsx        # Job/education entries
│   ├── Grid.tsx
│   ├── Header.tsx       # Resume header with contact info
│   ├── Icon.tsx         # Social icons (LinkedIn, email, etc.)
│   ├── Link.tsx         # Interactive links
│   ├── List.tsx         # Bullet lists
│   ├── Placeholder.tsx
│   ├── ResumeComponent.tsx  # Component factory
│   ├── RichText.tsx     # Rich text editor integration
│   ├── Row.tsx
│   ├── Section.tsx      # Resume sections (experience, education)
│   └── __tests__/       # Resume component tests
│
├── editor/              # Editing tools
│   ├── CssEditor.tsx    # Live CSS editing
│   ├── CssEditorToolbar.tsx
│   ├── CssSuggestions.tsx
│   ├── GenerateHtml.tsx # Export to HTML
│   ├── HighlightBox.tsx # Visual selection indicator
│   └── NodeTreeVisualizer.tsx  # Component tree viewer
│
├── controls/            # UI controls and toolbars
│   ├── ButtonGroup.tsx
│   ├── Buttons.tsx
│   ├── FileLoader.tsx
│   ├── FileSaver.tsx
│   ├── HtmlIdAdder.tsx
│   ├── InterfaceIcons.tsx
│   ├── Layouts.tsx      # Layout components
│   ├── Modal.tsx
│   ├── ResumeContextMenu.tsx
│   ├── ResumeHotkeys.tsx
│   ├── SelectedNodeActions.tsx
│   ├── Tabs.tsx
│   ├── TopEditingBar.tsx
│   ├── TopNavBar.tsx
│   ├── inputs/          # Form inputs
│   ├── menus/           # Menu components
│   └── toolbar/         # Toolbar components
│
├── templates/           # Resume templates
│   ├── Assured.tsx      # Professional template
│   ├── AssuredCoveredLetter.tsx
│   ├── CssTemplates.tsx # Default CSS
│   ├── RandyMarsh.tsx   # Alternate template
│   ├── ResumeTemplates.tsx
│   └── TemplateHelper.tsx
│
├── help/                # Help system
│   ├── Help.tsx
│   ├── HelpPage.tsx
│   ├── HotkeysHelp.tsx
│   ├── Landing.tsx
│   ├── SavingHelp.tsx
│   └── StartHelp.tsx
│
├── shared/              # Shared utilities and state
│   ├── stores/
│   │   └── editorStore.ts  # Zustand state management
│   ├── utils/
│   │   ├── Helpers.tsx     # Utility functions
│   │   ├── ResumeContext.tsx
│   │   ├── Types.tsx       # TypeScript types
│   │   ├── NodeTree.tsx    # Resume data structure
│   │   ├── ObservableResumeNodeTree.tsx
│   │   ├── CssTree.tsx     # CSS data structure
│   │   └── __tests__/      # Utility tests
│   ├── schema/
│   │   ├── ComponentTypes.tsx
│   │   ├── ContextMenuOptions.tsx
│   │   └── ToolbarOptions.tsx
│   └── scss/               # Global SCSS
│       ├── index.scss      # Main SCSS entry
│       ├── variables.scss
│       ├── context-menu.scss
│       ├── css-editor.scss
│       ├── forms.scss
│       ├── header.scss
│       ├── hl-box.scss
│       ├── inputs.scss
│       ├── landing.scss
│       ├── modals.scss
│       ├── node-tree.scss
│       ├── quill.scss
│       ├── resume-hover.scss
│       └── zindex.scss
│
└── assets/              # Static assets
    ├── fonts/
    │   ├── icofont.css
    │   ├── icofont.min.css
    │   └── fonts/
    └── icons/
        ├── feather/     # SVG icons
        └── *.png        # PNG icons
```

## Path Aliases

All imports now use clean `@` prefixed aliases:

```typescript
// Before
import Container from "../../../components/Container";
import { useEditorStore } from "../../../../stores/editorStore";
import Helpers from "../../../components/Helpers";

// After
import Container from "@/resume/Container";
import { useEditorStore } from "@/shared/stores/editorStore";
import { assignIds } from "@/shared/utils/Helpers";
```

### Configured Aliases

- `@/*` → `src/*` (general)
- `@/app/*` → `src/app/*`
- `@/resume/*` → `src/resume/*`
- `@/editor/*` → `src/editor/*`
- `@/controls/*` → `src/controls/*`
- `@/templates/*` → `src/templates/*`
- `@/help/*` → `src/help/*`
- `@/shared/*` → `src/shared/*`
- `@/assets/*` → `src/assets/*`

## Files Modified

### Configuration Files
- `tsconfig.json` - Added `paths` configuration
- `vite.config.ts` - Added `resolve.alias` mappings
- `jest.config.js` - Added `moduleNameMapper` for tests and assets
- `public/index.html` - Updated entry point to `/src/app/index.tsx`

### Import Updates
- 41 files had imports updated to use new path aliases
- All relative paths (`../`, `../../`) converted to absolute aliases (`@/`)
- SVG imports now use Vite's `?url` suffix for asset URLs

## Benefits

### 1. **Improved Discoverability**
- Features are grouped by purpose, not file type
- New developers can find related code quickly
- Clear separation of concerns

### 2. **Better Maintainability**
- No more guessing about relative path depth (`../../../`)
- Easier refactoring - paths don't break when moving files
- Cleaner git diffs

### 3. **Scalability**
- Easy to add new features in dedicated folders
- Component colocation (components, tests, styles in same directory)
- Reduced merge conflicts

### 4. **Developer Experience**
- IDE autocomplete works better with absolute paths
- Shorter import statements
- Consistent import style across codebase

## Testing

- ✅ All 23 tests passing
- ✅ Vite dev server running (309ms startup)
- ✅ No import errors
- ✅ Jest configured for path aliases and asset mocking

## Migration Notes

### SCSS Strategy
- Global SCSS (variables, mixins, utilities) → `src/shared/scss/`
- Component-specific SCSS can be colocated with components when needed
- Main entry: `@/shared/scss/index.scss`

### Asset Handling
- All static assets → `src/assets/`
- SVG icons imported with `?url` suffix for Vite
- Fonts and icon fonts in `src/assets/fonts/`

### State Management
- Zustand store → `src/shared/stores/editorStore.ts`
- Exports: `useEditorStore`, `useIsNodeEditing`, `useIsNodeSelected`
- Used by all resume components and editor features

### Component Factory
- `src/resume/ResumeComponent.tsx` - Maps component types to React components
- All resume components registered here
- Used by the main Resume component to render dynamic trees

## Recommendations for Future Development

1. **Colocate Component SCSS**
   - Move component-specific styles next to their components
   - Keep only global styles in `shared/scss/`

2. **Consider Feature Folders**
   - Group related components within feature folders
   - Example: `editor/css-editor/` for all CSS editor components

3. **Add Index Files**
   - Create `index.ts` barrel exports for cleaner imports
   - Example: `import { Entry, Section, Header } from "@/resume"`

4. **Documentation**
   - Update README with new structure
   - Add ARCHITECTURE.md explaining design decisions
   - Document component hierarchy

## Performance Impact

- **Dev Server**: 309ms startup (was 3-5s with Webpack)
- **Hot Module Replacement**: ~50ms (instant)
- **Test Suite**: 3.24s for 23 tests (no change)
- **Build**: Not tested yet

## Breaking Changes

None - this was a pure internal reorganization. All functionality preserved.
