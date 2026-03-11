# Color System

## Goals
- Keep raw palette values scoped to this folder.
- Keep token naming aligned with the existing project vocabulary.
- Provide app-prefixed utility classes for fast UI styling.

## Naming Notes
- `dark-accent` means an accent used in dark contexts (toolbar/nav hovers and active states), not necessarily a color darker than `main`.
- `main` is the primary dark brand surface.
- `dark-shade` is the deepest/darkest anchor color.
- `light-accent` is the muted secondary accent for labels/icons/dividers.

## Files
- `palette.scss`: raw brand + neutral colors.
- `semantic.scss`: canonical project tokens (`main`, `light-accent`, etc.).
- `utilities.scss`: generated utility classes.

## Usage
```scss
@use "colors/semantic" as colors;

.component {
  background: colors.$main;
  color: colors.$light-shade;
  border-color: colors.$light-accent;
}
```

## Utility Classes
- `app-text-*`
- `app-bg-*`
- `app-border-*`

Examples:
- `app-text-light-shade`
- `app-bg-main`
- `app-border-light-accent`
