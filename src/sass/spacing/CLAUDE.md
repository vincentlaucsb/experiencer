# Spacing Utilities (`app-`)

This folder contains app-level spacing utilities for layout and UI chrome.

## Purpose
- Provide a consistent spacing system similar to Tailwind-style utilities.
- Keep spacing classes explicit and scoped to app UI with the `app-` prefix.
- Avoid mixing app utilities with resume-content styling.

## Scale
- Base unit: `0.25em` (assuming app root typography baseline of 11pt).
- Utility steps are generated (not hardcoded) from parameters.
- Value formula: `step × 0.25em`.
- Half-step naming uses hyphen form (for example `1-5` means `1.5`).

### Generator Parameters
Defined in `spacing/index.scss` and applied by `spacing/scale.scss`:
- `start`: first whole-number step (default `0`)
- `stop`: final whole-number step (default `16`)
- `half-step-stop`: add `n-5` utilities through this whole step (default `3`)
- `skip-odd-from`: threshold for sparse whole-step mode (default `8`); odd steps are skipped from the nearest odd at/below this threshold (for example `8` skips `7, 9, 11, ...`)

## Utility Families
- Margin: `app-m-4`, `app-mx-2`, `app-mt-6`, etc.
- Padding: `app-p-4`, `app-py-2`, `app-py-1-5`, `app-pl-3`, etc.
- Gap: `app-gap-4`, `app-gap-x-2`, `app-gap-y-3`.
- Auto margin helpers: `app-m-auto`, `app-mx-auto`, `app-my-auto`.

## Responsive Variants
- `app-sm-*` applies at `min-width: $screen-small`.
- `app-md-*` applies at `min-width: $screen-medium`.

## Usage Rules
- Use these utilities for app shell/editor UI only.
- Do not apply `app-` spacing utilities inside resume content rendering.
- Prefer existing semantic component styles when spacing is component-specific.
