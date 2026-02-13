---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Performance

## Optimization Guidelines
- Use React.memo for expensive components
- Avoid inline function definitions in render
- Use useMemo/useCallback for expensive computations
- Consider virtualization for long lists

## Current Performance Considerations
- Large component tree can slow editing
- CSS editor re-renders on every change
- Quill editor has own performance characteristics
- Zustand migration will improve selection performance
