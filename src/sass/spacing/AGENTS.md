# Spacing system instructions

- Use the existing `app-` spacing scale for application shell and editor UI; do not apply these utilities inside exported résumé content.
- Prefer semantic component styles when spacing expresses a component-specific relationship.
- Prefer utilities for routine spacing. Semantic relationships must use the same `--app-space-*` tokens and briefly explain why the component owns them.
- The closed scale is `0`, `1`, `1-5`, `2`, `3`, `4`, `5`, `6`, `8`, `12`, `16`, in root-relative units. Do not add another value or utility family without a shared need.
- Run `npm run spacing:check` from OSS or Pro. Legacy debt is counted per file, property, and value; adding another identical raw declaration also fails. Remove migrated debt entries rather than recording new ones to bypass enforcement.
- Keep responsive variants aligned with the existing small and medium breakpoints.
