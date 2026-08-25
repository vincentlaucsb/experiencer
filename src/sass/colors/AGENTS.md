# Color system instructions

- Keep raw palette values in this directory and consume canonical semantic tokens from `semantic.scss`.
- Use shared semantic button variants and palette-driven states instead of feature-local action colors.
- Use the `app-text-*`, `app-bg-*`, and `app-border-*` utilities for application chrome only. Do not apply app utilities inside exported résumé content.
- When adding a reusable visual role such as a badge, centralize contrast handling in the shared system rather than creating feature-specific foreground/background pairs.
