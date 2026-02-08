---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Coding Standards

## TypeScript
- Use explicit types for props interfaces
- Avoid `any` except when absolutely necessary
- Use `unknown` for truly unknown types
- Prefer interfaces over type aliases for objects

## File Organization
- One component per file
- Co-locate related utilities
- Keep files under 300 lines when possible
- Use descriptive file names matching component names

## Naming Conventions
- Components: PascalCase (e.g., `ResumeComponent.tsx`)
- Utilities: camelCase (e.g., `generateHtml.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_ENTRIES`)
- CSS classes: kebab-case (e.g., `link-editing`)
