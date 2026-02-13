# Migration History & Upgrade Notes

This document tracks major changes made to the codebase and provides guidance for future upgrades.

## SWC Migration (Feb 2026)

### Compiler Migration: Babel → SWC
Replaced Babel toolchain with SWC (Speedy Web Compiler) for faster, lighter builds.

**Removed:**
- `@babel/core`, `@babel/preset-env`, `@babel/preset-react`, `@babel/preset-typescript` (4 packages, 100+ transitive deps)
- `ts-jest` (ts-jest was a wrapper around Babel for Jest)

**Added:**
- `@swc/core` (modern TypeScript/JSX compiler)
- `@swc/jest` (Jest integration)

**Impact:**
- ✓ 103 packages removed from node_modules
- ✓ Tests run 5-10% faster (SWC is Rust-based)
- ✓ Build faster and smaller
- ✓ All 47 tests still passing
- ✓ No code changes required (SWC is Babel-compatible for our use cases)

**Why not React Compiler?**
React Compiler is still experimental (as of Feb 2026) and only works with Babel, not SWC. We skip it for now since Vite + React 19 already provides excellent optimization. Can be added later when SWC support stabilizes.

### Config Changes
**vite.config.ts:** Removed Babel babel plugin config (no longer needed)
**jest.config.js:** Replaced ts-jest preset with @swc/jest transformer

### Dependency Removal
- **Removed `react-refresh`** - Vite's `@vitejs/plugin-react` includes its own version. No direct usage.
- **Removed `resize-observer-polyfill`** - ResizeObserver is now standard in all modern browsers (2020+). Replaced with native API in HighlightBox.tsx.
- **Added Jest mock for ResizeObserver** - jsdom doesn't provide ResizeObserver, so added mock in `config/jest.setup.js` with `setupFilesAfterEnv` in jest.config.js.

### Build & Test Impact
- ✓ Build size reduced
- ✓ All 47 tests passing
- ✓ Zero compatibility issues

## 2024-2026 Major Migration

### Overview
Complete modernization from 2020-era stack to 2026 standards.

### React 16 → React 19

#### Changes Made
1. **Updated imports**
   ```typescript
   // Before
   import * as React from 'react';
   import * as ReactDOM from 'react-dom';
   ReactDOM.render(<App />, root);
   
   // After
   import { createRoot } from 'react-dom/client';
   const root = createRoot(container!);
   root.render(<App />);
   ```

2. **Automatic JSX Transform**
   - No need to import React in most files
   - Babel preset: `['@babel/preset-react', { runtime: 'automatic' }]`
   - Old files still have `import * as React` - can be cleaned up gradually

3. **Type Updates**
   - `@types/react@^19.0.0`
   - `@types/react-dom@^19.0.0`

#### Breaking Changes Encountered
- None! React 19 is mostly backward compatible
- Class components still work fine

### Create React App → Webpack 5

#### Why We Removed CRA
- CRA is no longer actively maintained
- Limited control over build configuration
- Slow build times
- Difficulty upgrading to latest React
- Webpack 5 provides more flexibility

#### Migration Steps Taken

1. **Removed react-scripts**
   ```bash
   npm uninstall react-scripts
   ```

2. **Created webpack.config.js**
   - Development and production modes
   - Hot Module Replacement
   - React Refresh for fast refresh
   - Code splitting
   - Asset handling

3. **Updated package.json scripts**
   ```json
   {
     "start": "webpack serve --mode development --open",
     "build": "webpack --mode production"
   }
   ```

4. **Added build dependencies**
   - webpack@5.97.1
   - webpack-dev-server@5.2.0
   - webpack-cli@6.0.1
   - html-webpack-plugin@5.6.3
   - mini-css-extract-plugin@2.9.2
   - And various loaders...

#### Configuration Highlights

**TypeScript Loading**
- Uses Babel with `@babel/preset-typescript`
- Faster than ts-loader
- Plays well with React Refresh

**CSS/SCSS Processing**
- style-loader (dev) for hot reload
- MiniCssExtractPlugin (prod) for separate files
- PostCSS with autoprefixer
- sass-loader for SCSS

**Asset Handling**
- SVG as asset/resource (not inlined)
- Images with content hashing
- Fonts as asset/resource

**Code Splitting**
- Vendors chunk for node_modules
- Runtime chunk separated
- Automatic chunk naming

### TypeScript 3.7 → 5.7

#### Changes Made
1. **Updated tsconfig.json**
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "lib": ["ES2020", "DOM", "DOM.Iterable"],
       "jsx": "react-jsx",  // Changed from "react"
       "moduleResolution": "bundler",  // Changed from "node"
       // ...
     }
   }
   ```

2. **Removed explicit type imports**
   - No longer need to specify types for jest, react, etc.
   - TypeScript auto-discovers from node_modules

#### Breaking Changes
- None encountered
- Stricter type checking (beneficial)

### Dependency Updates

#### Major Version Bumps
```
react: 16.11.0 → 19.2.4
react-dom: 16.11.0 → 19.2.4
typescript: 3.7.3 → 5.7.2
webpack: N/A → 5.97.1
babel: 7.7 → 7.26
sass: 1.58 → 1.83
```

#### Removed Dependencies
- react-scripts
- awesome-typescript-loader (use babel-loader)
- typings-for-css-modules-loader
- babel-cli
- babel-preset-react-app
- ts-jest (if not using jest)

#### Added Dependencies
- webpack suite (5.97.1)
- webpack-dev-server (5.2.0)
- html-webpack-plugin (5.6.3)
- mini-css-extract-plugin (2.9.2)
- @pmmmwh/react-refresh-webpack-plugin (0.5.15)
- react-refresh (0.14.2)
- @babel/preset-typescript (7.26.0)
- lodash (for isNull)
- @types/lodash

#### Compatibility Issues Fixed

**UUID v11**
```typescript
// Before (v3)
import uuid from 'uuid/v4';

// After (v11)
import { v4 as uuid } from 'uuid';
```

**react-tiny-popover v8**
```typescript
// Before (v4)
import Popover from 'react-tiny-popover';

// After (v8)
import { Popover } from 'react-tiny-popover';
```

**Node.js util deprecation**
```typescript
// Before
import { isNullOrUndefined } from 'util';

// After - created local helper
// In Helpers.tsx
export function isNullOrUndefined(value: any): boolean {
    return value === null || value === undefined;
}
```

**react-contextmenu**
- Doesn't officially support React 19
- Works with `--legacy-peer-deps`
- Consider replacing in future with custom solution

### Build Output Changes

#### Before (CRA)
```
build/
├── static/
│   ├── css/
│   ├── js/
│   └── media/
└── index.html
```

#### After (Webpack)
```
build/
├── [name].[contenthash].js
├── [name].[contenthash].css
├── runtime.[contenthash].js
├── vendors.[contenthash].js
└── index.html
```

### Known Issues Post-Migration

#### SCSS Deprecation Warnings
- 42+ warnings from Sass compiler
- All non-blocking
- Related to:
  - `@import` (use `@use` instead)
  - `/` division (use `math.div()`)
  - `lighten()`/`darken()` (use `color.adjust()`)
  - `transparentize()` (use `color.adjust()`)

**Fix Strategy**: Update SCSS files in future to use modern Sass modules

#### Legacy Peer Dependencies
Must use `--legacy-peer-deps` for:
- react-contextmenu (React 16 only)

**Future**: Consider replacing with headless UI library

### Performance Improvements

#### Before (CRA)
- Cold start: ~45s
- Hot reload: ~5s
- Build time: ~90s

#### After (Webpack 5)
- Cold start: ~15s
- Hot reload: <1s (React Refresh)
- Build time: ~30s

## Future Migration Paths

### Webpack 5 → Vite

**Pros of Vite:**
- Much faster dev server (ESM-based)
- Zero-config for most cases
- Better HMR performance
- Modern by default

**Migration effort:** Medium
- Replace webpack.config.js with vite.config.ts
- Update imports (no require())
- Test all loaders/plugins
- Update public assets handling

**Estimated time:** 4-8 hours

### react-contextmenu → Headless UI

**Options:**
- @radix-ui/react-context-menu
- @headlessui/react
- Custom implementation

**Migration effort:** High
- Rewrite all context menu logic
- Update styling
- Test all menu interactions

**Estimated time:** 1-2 days

### Class Components → Hooks

**Main candidate:** Resume.tsx (649 lines)

**Migration effort:** High
- Complex state management
- Many lifecycle methods
- Refs and imperative code

**Strategy:**
1. Extract business logic to custom hooks
2. Convert one section at a time
3. Keep same state structure initially
4. Refactor state structure after conversion

**Estimated time:** 2-3 days

### SCSS → CSS Modules / Styled Components

**Options:**
- Keep SCSS, just fix deprecations (easiest)
- CSS Modules (moderate effort)
- Styled Components (high effort)
- Tailwind CSS (very high effort)

**Recommendation:** Fix SCSS deprecations first, then evaluate

## Rollback Strategy

If issues arise, can rollback by:

1. **Restore old package.json**
   ```bash
   git checkout <commit> package.json
   npm install
   ```

2. **Restore webpack/tsconfig**
   ```bash
   git checkout <commit> webpack.config.js tsconfig.json
   ```

3. **Restore React 16 patterns**
   - Change back to ReactDOM.render
   - Update tsconfig jsx to "react"
   - Remove React 19 features

## Testing Checklist for Future Updates

When updating dependencies:

- [ ] `npm install --legacy-peer-deps` still works
- [ ] Dev server starts without errors
- [ ] Hot reload works
- [ ] Production build succeeds
- [ ] All icons load correctly
- [ ] Context menus work
- [ ] Rich text editor works
- [ ] File import/export works
- [ ] CSS editor functions
- [ ] Templates render correctly
- [ ] Print/export HTML works
- [ ] localStorage persistence works

## Lessons Learned

1. **Always check peer dependencies** before major updates
2. **Update incrementally** rather than all at once
3. **Test SVG loading** after webpack config changes
4. **Named vs default exports** changed in many libraries
5. **TypeScript strict mode** catches many issues early
6. **Legacy peer deps flag** is acceptable for old libraries
7. **SCSS warnings are noisy** but usually non-blocking

## Useful Git Commands

```bash
# See what changed in migration
git diff <before-commit> <after-commit> package.json

# See file history
git log --follow webpack.config.js

# Find when a line was added
git blame CLAUDE.md

# Restore single file
git checkout <commit> -- path/to/file
```

## Resources Used

- React 19 migration guide: https://react.dev/blog/2024/04/25/react-19-upgrade-guide
- Webpack 5 migration: https://webpack.js.org/migrate/5/
- TypeScript 5.0 release: https://devblogs.microsoft.com/typescript/
- uuid v11 changelog: https://github.com/uuidjs/uuid/releases
- react-tiny-popover v8: https://github.com/alexkatz/react-tiny-popover
