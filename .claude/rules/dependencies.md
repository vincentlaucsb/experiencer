# Dependencies

## Current Environment
- **React 19** - Uses automatic JSX transform (`react-jsx`)
- **TypeScript** - No JSX.Element type annotations needed
- **SWC** - Modern Rust-based compiler (replaces Babel)
  - Used by Vite internally for builds
  - Used by Jest via `@swc/jest` for tests

## Installation
1. Check compatibility with React 18
2. Test thoroughly after updates
3. Always use --legacy-peer-deps flag
4. Update docs/MIGRATION.md with breaking changes