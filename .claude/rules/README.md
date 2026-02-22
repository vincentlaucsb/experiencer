# Experiencer Project Rules

This directory contains coding standards, conventions, and best practices for the Experiencer project.

## Quick Links

- [Component Development](./component-development.md) - How to write components
- [Imports](./imports.md) - Import patterns and rules
- [Coding Standards](./coding-standards.md) - TypeScript, naming, file organization
- [State Management](./state-management.md) - Current patterns, planned changes, and store utilities vs hooks
- [Testing](./testing.md) - How to write and run tests
- [Performance](./performance.md) - Optimization guidelines
- [CSS/SCSS](./css-scss.md) - Modern SCSS syntax and conventions
- [Dependencies](./dependencies.md) - Installation and compatibility
- [Build](./build.md) - Webpack, development, and asset handling
- [Git & Documentation](./git-and-docs.md) - Commits, branches, and docs
- [Security](./security.md) - Client-side security practices
- [Common Pitfalls](./common-pitfalls.md) - What to avoid

## Getting Started

New to the project? Start here:
1. Read [Component Development](./component-development.md)
2. Review [Imports](./imports.md)
3. Check [Common Pitfalls](./common-pitfalls.md)
4. Refer to other files as needed

## For AI Agents

These rules help maintain consistency and quality. When making changes:
1. Check relevant rule files first
2. Follow established patterns
3. Update rules if new patterns emerge
4. Keep rules in sync with actual codebase

## Rule File Format

Rule files use standard Markdown with optional YAML front matter for scoping:

```yaml
---
paths:
  - "**/*.scss"
  - "**/*.css"
---

# Rule Title
...
```

**YAML Front Matter:**
- `paths`: Array of glob patterns to scope the rule to specific files
- **Specify paths whenever possible** for more targeted rules
- Only omit if the rule truly applies project-wide (rare)
- Use standard glob syntax: `**/*.ext` for file patterns

**Examples:**
- `css-scss.md` scopes to `.scss` files: `paths: ["**/*.scss"]`
- `state-management.md` scopes to TypeScript: `paths: ["**/*.ts", "**/*.tsx"]`
- `git-and-docs.md` applies everywhere (no paths)
