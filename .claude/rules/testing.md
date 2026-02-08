---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
---

# Testing

## Test Files
- Name: `ComponentName.tsx` or `utility.ts` (no `.test` suffix)
- Location: In `__tests__/` directory next to the code being tested
- Use Jest + React Testing Library

## Directory Structure
```
src/
├── __tests__/
│   └── Resume.tsx
├── components/
│   ├── __tests__/
│   │   ├── Entry.tsx
│   │   ├── Helpers.ts
│   │   └── Link.tsx
│   └── utility/
│       └── __tests__/
│           ├── CssTree.tsx
│           ├── NodeTree.tsx
│           └── ObservableResumeNodeTree.tsx
```

## What to Test
- Component rendering with different props
- User interactions and state changes
- Edge cases and error handling
- Utility function outputs

## Running Tests
```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
```
