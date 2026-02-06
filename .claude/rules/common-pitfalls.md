# Common Pitfalls to Avoid

## Import Mistakes
1. ❌ Don't import from 'util' - use local `./Helpers`
2. ❌ Don't use default import for UUID - use `{ v4 as uuid }`
3. ❌ Don't use default import for Popover - use `{ Popover }`

## SCSS Mistakes
4. ❌ Don't use deprecated SCSS functions (lighten, darken, etc.)
5. ❌ Don't use @import - use @use
6. ❌ Don't use direct division - use math.div()

## Dependency Mistakes
7. ❌ Don't forget --legacy-peer-deps flag when installing
8. ❌ Don't assume React 19 compatibility - we're on React 18

## Code Quality Mistakes
9. ❌ Don't use class components for new code
10. ❌ Don't mutate state directly - use setState or hooks
11. ❌ Don't forget to test in print/export mode (isPrinting)
12. ❌ Don't skip adding .type property to new components
13. ❌ Don't compose Resume node types within other Resume node types (use primitives instead)

## Questions to Ask Before Changes

1. Does this affect the ResumeNode tree structure?
2. Will this impact export/import functionality?
3. Is this component used in multiple templates?
4. Does this need to work in both editing and preview modes?
5. Should this be persisted to localStorage?
6. Does this affect the CSS editor or style generation?
7. Are there performance implications?
8. Do tests need updating?
