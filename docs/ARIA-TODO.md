# ARIA TODO

This document tracks accessibility/ARIA work for Experiencer, including completed improvements and future items.

## Completed

### 2026-03-08
- Added fallback `aria-label` behavior for condensed/icon-only toolbar buttons.
  - File: `src/controls/toolbar/ToolbarButton.tsx`
- Marked decorative toolbar icon/shortcut content as `aria-hidden`.
  - File: `src/controls/toolbar/ToolbarButton.tsx`
- Improved dropdown/menu semantics with ARIA state wiring:
  - Trigger now exposes `aria-haspopup="menu"`, `aria-controls`, and `aria-expanded`.
  - Dropdown menu now has `role="menu"`.
  - Added `Escape` key handling to close active dropdown.
  - Files: `src/controls/menus/Dropdown.tsx`, `src/controls/menus/PureMenu.tsx`
- Standardized menu/toolbar callback naming from `action` to `onClick` for stable trigger contracts.
  - Updated toolbar item types, toolbar producers, and context-menu option shapes.
  - Removed Dropdown trigger heuristics and aligned trigger wiring to an explicit click contract.
  - Files: `src/types/toolbar.ts`, `src/controls/menus/Dropdown.tsx`, `src/controls/toolbar/*`, `src/controls/TopEditingBar.tsx`, `src/resume/**/toolbarOptions.ts`, and related context-menu files.
- Upgraded tab navigation semantics:
  - `role="tablist"` on container
  - `role="tab"` + `aria-selected` + `aria-controls` on tabs
  - `role="tabpanel"` + `aria-labelledby` on active panel
  - File: `src/controls/Tabs.tsx`
- Improved top-nav accessibility:
  - Made the clickable app title keyboard-operable (`Enter`/`Space`) with button semantics.
  - Added explicit `aria-label` to external GitHub link.
  - File: `src/controls/TopNavBar.tsx`

## Future Work

### Navigation & Menus
- [ ] Add keyboard arrow-key navigation within dropdown menus.
- [ ] Add `role="menuitem"` semantics and focus behavior where appropriate.
- [ ] Add clear focus-visible styling review for all menu and toolbar controls.

### Forms & Inputs
- [ ] Add explicit `<label>` / `aria-labelledby` coverage for editor inputs that currently rely on visual context.
- [ ] Add `aria-describedby` for fields with helper/error text.
- [ ] Review modal form controls for initial focus placement and return-focus behavior.

### Dialogs & Overlays
- [ ] Audit modal semantics (`role="dialog"`, `aria-modal`, labelled title linkage).
- [ ] Add/verify focus trapping in all open modal states.
- [ ] Ensure escape-to-close behavior is consistent and announced correctly.

### Editor-Specific Components
- [ ] Evaluate ARIA roles for tree and node selection views (NodeTree, highlight/selection affordances).
- [ ] Add status announcements for key editing actions where useful (insert/delete/move).

### Verification
- [ ] Add accessibility-focused tests for keyboard interaction flows (menu, tabs, modal).
- [ ] Run a lightweight manual screen reader pass (NVDA/VoiceOver) on key flows.
- [ ] Run automated checks (axe or equivalent) on core views.

## Notes
- Keep ARIA improvements incremental and low-risk.
- Favor semantic HTML first, ARIA attributes second.
