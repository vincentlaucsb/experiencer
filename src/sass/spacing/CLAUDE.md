# Spacing Utilities (`app-`)

This folder contains app-level spacing utilities for layout and UI chrome.

## Purpose
- Provide a consistent spacing system similar to Tailwind-style utilities.
- Keep spacing classes explicit and scoped to app UI with the `app-` prefix.
- Avoid mixing app utilities with resume-content styling.

## Scale
- Base unit: `0.25em` (assuming app root typography baseline of 11pt).
- Utility steps: `0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16`.
- Value formula: `step × 0.25em`.

## Utility Families
- Margin: `app-m-4`, `app-mx-2`, `app-mt-6`, etc.
- Padding: `app-p-4`, `app-py-2`, `app-pl-3`, etc.
- Gap: `app-gap-4`, `app-gap-x-2`, `app-gap-y-3`.
- Auto margin helpers: `app-m-auto`, `app-mx-auto`, `app-my-auto`.

## Responsive Variants
- `app-sm-*` applies at `min-width: $screen-small`.
- `app-md-*` applies at `min-width: $screen-medium`.

## Usage Rules
- Use these utilities for app shell/editor UI only.
- Do not apply `app-` spacing utilities inside resume content rendering.
- Prefer existing semantic component styles when spacing is component-specific.
