# CHANGELOG

## 2026-03-10

### CSS tree reliability
- Added `findOrCreateNode(path)` to `src/shared/CssTree/index.tsx` to guarantee path creation for missing CSS nodes.
- Updated `ensureCssNodeForType` to avoid silent no-op behavior:
  - If a default template node exists, seed from it.
  - If no default exists, still create an empty node path so the CSS editor always has a target.

### Test coverage
- Expanded `src/shared/CssTree/__tests__/CssNode.navigation.test.tsx` with targeted coverage for `findOrCreateNode`:
  - Existing-path reuse
  - Leaf creation
  - Intermediate path creation
  - Partial-path creation with parent reuse
  - Empty-path behavior
  - New-node properties baseline
  - Names containing spaces (e.g. `Page Break`)

### Documentation refresh
- Updated `docs/CHANGELOG.md`, `docs/TODO.md`, and `docs/ARCHITECTURE.md` to reflect current branch status and completed work.
- Added/maintained clear cross-references for remaining accessibility work in `docs/ARIA-TODO.md`.

## 2026-03-08

### Accessibility (ARIA) pass
- Added fallback `aria-label` for icon-only toolbar buttons; decorative icons/shortcuts marked `aria-hidden`.
- Dropdown menus now expose `aria-haspopup="menu"`, `aria-controls`, `aria-expanded` on triggers; menu container gets `role="menu"`; Escape closes active dropdown.
- Standardized toolbar/menu callback key: renamed `action` → `onClick` across all toolbar item types, toolbar producers, context-menu option shapes, and `TopEditingBar.tsx`. Removed trigger heuristics and aligned to explicit click contract.
- `Tabs` upgraded: `role="tablist"`, `role="tab"` + `aria-selected` + `aria-controls` per tab, `role="tabpanel"` + `aria-labelledby` on active panel.
- `TopNavBar`: app title made keyboard-operable with button semantics; GitHub external link given explicit `aria-label`.
- Created `docs/ARIA-TODO.md` to track future accessibility work (keyboard nav in menus, label coverage, modal focus trapping, etc.).

## 2026-03-05

### Print preview
- Added Print Preview bar with Exit and Print buttons (rendered above resume in `printing` mode).
- `exportResumeAsHtml` injects `@page { size: ... }` rule matching the active page size.

### Page size system
- New `PageSize` enum (`Letter` | `A4`) in `src/types/PageSize.ts`.
- `editorStore` gains `pageSize` state and `setPageSize` action; `usePageSize` selector exported.
- `getResumeMinHeight` utility: computes `#resume` minimum height from page count × page height.
- `#resume` element receives `data-page-size` attribute and dynamic `minHeight` style so CSS and print dialogs both reflect the active size.
- Page size toggle (Letter / A4) added to `TopEditingBar` as a new "Page Setup" toolbar section; collapses to a dropdown menu at narrow widths.

### PageBreak component
- New `PageBreak` resume node type renders a visual "Page Break" label in editor mode and is invisible in print mode.
- Registered in schema with `cssName: 'Page Break'` (demonstrates custom `cssName` override in `ResumeNodeDefinition`).
- Added "Add Page Break" button to `TopEditingBar` → "Resume Components" section; automatically calls `ensureCssNodeForType` on insert.

### SCSS architecture overhaul
- Moved all shared styles from `src/shared/scss/` (deleted) to a new `src/sass/` top-level directory.
- New color system: `src/sass/colors/` — semantic tokens (`semantic.scss`), raw palette (`palette.scss`), utility classes (`utilities.scss`), barrel `index.scss`.
- New spacing system: `src/sass/spacing/` — scale (`scale.scss`) and utility classes (`index.scss`): `app-mb-*`, `app-gap-*`, `app-p-*`, `app-text-*`, etc.
- `src/sass/variables.scss` – CSS custom properties.
- Overlay editing and context-menu styles, hl-box, form inputs, modals all extracted into focused files.
- `src/app/Resume.tsx` import updated from `@/shared/scss/index.scss` → `@/sass/index.scss`.

### Utility module split (Helpers.tsx removed)
- Deleted monolithic `src/shared/utils/Helpers.tsx`.
- Replaced with six single-responsibility modules: `assignIds.ts`, `createContainer.ts`, `deepCopy.ts`, `isNullOrUndefined.ts`, `processText.ts`, `stripNodeProperties.ts`.
- All 22 import sites across the codebase updated.

### dump() — UUID stripping
- `dump()` in `saveResume.ts` is now exported.
- Serialised resume data no longer includes runtime `uuid` fields (stripped recursively via `stripNodeProperties`).
- `ResumeSaveData.childNodes` type narrowed from `ResumeNode[]` to `BasicResumeNode[]`.

### HtmlIdAdder improvements
- Visible `#` prefix span displayed before the ID input field.
- Input sanitisation: strips `#` characters and whitespace on change.
- Bug fix: clearing the ID field now correctly removes the `htmlId` from the node (previously triggered an invalid-ID error).
- `addHtmlId.ts` store: renames/removes the corresponding CSS subtree when the ID changes or is cleared.
- Added `data-testid` attributes for stable test targeting.

### ComponentTypes fixes
- `childTypes()` and `cssName()` now return defensive copies so callers cannot mutate stored arrays.
- New `cssName` field on `ResumeNodeDefinition` allows per-type CSS path overrides.
- `_cssNames` cache populated at registration time.

### CssTree mutation bug fix
- `CssNode.findNode()` previously called `.reverse()` + `.pop()` on the caller's array, corrupting the singleton cache.
- Replaced with a forward `for...of` loop; no copies of the caller's input are made or mutated.

### ensureCssNodeForType utility
- New `src/shared/stores/ensureCssNodeForType.ts`: lazily copies a CSS node skeleton from the default template into the live CSS tree on first use of a given component type.

### Image component
- Cleaned up `src/resume/Image.tsx` editing UX.

### Test coverage additions
- `src/controls/__tests__/HtmlIdAdder.test.tsx` — 8 tests, 100 % coverage (statements, branches, functions, lines).
- `src/shared/stores/__tests__/addHtmlId.test.ts` — store-level ID-removal test.
- `src/shared/stores/__tests__/saveResume.test.ts` — 7 tests covering `dump()` UUID stripping.
- `src/shared/utils/__tests__/PrintHelpers.test.ts` — export functionality tests.
- `src/shared/utils/__tests__/getResumeMinHeight.test.ts` — page-height calculation tests.
- `src/shared/CssTree/__tests__/CssNode.navigation.test.tsx` — regression tests for the findNode mutation fix.
- `src/controls/menus/__tests__/Dropdown.tsx` — dropdown behaviour tests.

## 2026-03-01
- Added Streamline template and template polish updates.
- Refactored dropdown/menu behavior and ensured menu closes on outside click.

## 2026-02-16
- Centralized editor mode handling in stores.
- Completed print mode state synchronization with store-backed mode.
- Continued store refactors for cleaner state boundaries.

## 2026-02-12
- Simplified printing flow and print-mode transitions.

## 2026-02-08
- Completed Markdown migration setup (including `react-markdown` dependency groundwork).
- Continued modernization work (React/SWC era updates and refactors).

## 2026-02-07
- Replaced RichText workflows with Markdown-based editing paths.
- Replaced legacy context menu dependency with custom context menu implementation.

## 2026-02-06
- Completed Vite migration (tooling/config/scripts/HMR/dev-speed improvements).
- Completed major Zustand state-management migration.

## 2026-02-05
- Added Link component and integrated link support into schema/templates.
- Completed link milestones:
  - URL input in toolbar
  - Edit mode context menu
  - Proper `href` export behavior

## 2026-02-04
- Upgraded app from React 16 to React 18 baseline.

## 2023-02-27
- Removed deprecated `node-sass` dependency lineage during dependency maintenance.

## 2020-02-26
- Established function-component preference for newer component work.

## 2019-12-11
- Established Jest-based testing foundation and early test suite scaffolding.

## 2019-12-09
- Added core project documentation foundation that later expanded into AI-friendly docs (`CLAUDE.md`, architecture/migration docs).

