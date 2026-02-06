# State Management

## Current Pattern
- Main state in `Resume.tsx` via setState
- Context API for global editing state (isPrinting)
- No Redux or external state library (Zustand planned)

## Adding New State
1. Determine if state is global or local
2. For global state, consider adding to ResumeContext
3. For local state, use useState hook
4. For derived state, use useMemo

## Planned Migration
- Moving to Zustand for frequently-changing state (selectedNode, isEditingSelected)
- Keep ResumeContext for infrequent state (isPrinting)
- See docs/TODO.md for details
