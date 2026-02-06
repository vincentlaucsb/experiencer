# AI Agent Guide - Experiencer

## Project Overview
**Experiencer** is an interactive HTML/CSS resume builder that allows users to create, edit, and export professional resumes directly in the browser. Built with React, it provides a WYSIWYG editing experience with real-time CSS customization.

## Quick Reference

For detailed project rules and conventions, see [.claude/rules/](.claude/rules/).
For planned work and improvements, see [docs/TODO.md](docs/TODO.md).
For architecture details, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
For migration history, see [docs/MIGRATION.md](docs/MIGRATION.md).

## Recent Major Updates (2024-2026)
- **Migrated from React 16 → React 18** (pragmatic choice, React 19 blocked by react-quill)
- **Removed Create React App** → Custom Webpack 5 configuration
- **Upgraded TypeScript** 3.7 → 5.7
- **Modern build tooling** with HMR, React Refresh, and code splitting
- **Modern SCSS** syntax (@use, math.div, color.adjust)
- **Added Link component** for external links with proper href export

## Tech Stack
- **React 18.3.1** with TypeScript
- **Webpack 5** with custom configuration
- **SCSS** (Dart Sass 1.83.0) for styling
- **react-quill** for rich text editing
- **react-contextmenu** for right-click menus (uses legacy peer deps)
- **uuid** v11 for ID generation
- **file-saver** for export functionality

## Architecture

### Core Concepts
1. **ResumeNode Tree**: Hierarchical data structure representing resume components
2. **Observable Pattern**: `ObservableResumeNodeTree` manages state changes
3. **Context API**: `ResumeContext` provides editing state throughout the app
4. **Component Factory**: `ResumeComponentFactory` maps node types to React components

### Key Directories
```
src/
├── components/
│   ├── controls/          # UI controls, buttons, toolbars, modals
│   │   └── inputs/        # Form inputs and editors
│   ├── schema/            # Component types and configurations
│   ├── templates/         # Resume templates (Assured, RandyMarsh, etc.)
│   ├── utility/           # Tree structures, CSS editor, HTML generation
│   └── help/              # Help pages and landing page
├── scss/                  # Global styles and theme variables
├── icons/                 # SVG and PNG icons
└── fonts/                 # Icon fonts (icofont)
```

### Component Patterns
- **Container.tsx**: Flexible wrapper that renders as any HTML element
- **ResumeComponent.tsx**: Base wrapper for all resume components
- **Entry.tsx**: Represents a job/education entry with title, date, location
- **Section.tsx**: Groups related entries (Experience, Education, etc.)

### State Management
- Main state in `Resume.tsx` (class component)
- Uses `setState` for local state management
- Context API for global editing state
- No Redux/external state library

## Important Files

### Build Configuration
- **webpack.config.js**: Modern Webpack 5 setup with dev/prod modes
- **tsconfig.json**: TypeScript config with modern module resolution
- **package.json**: All dependencies (uses `--legacy-peer-deps`)

### Documentation
- **.claude/rules**: Project coding standards and conventions
- **docs/TODO.md**: Planned features and improvements
- **docs/ARCHITECTURE.md**: System design and component patterns
- **docs/MIGRATION.md**: Upgrade history and breaking changes

### Core Components
- **Resume.tsx**: Main app component (650 lines) - orchestrates everything
- **Helpers.tsx**: Utility functions, includes `isNullOrUndefined` helper
- **ResumeContext.tsx**: Context for isPrinting state
- **NodeTree.tsx**: Tree data structure for resume hierarchy

### Critical Utilities
- **GenerateHtml.tsx**: Exports resume as standalone HTML
- **CssTree.tsx**: CSS rule management and editing
- **ObservableResumeNodeTree.tsx**: Observable wrapper for state updates

## Common Patterns & Conventions

See [.claude/rules](.claude/rules) for comprehensive coding standards.

### Quick Import Reference
```typescript
// React 18 - automatic JSX transform
import { useState, useContext } from 'react';

// UUID generation
import { v4 as uuid } from 'uuid';

// Common libraries
import { Popover } from 'react-tiny-popover';
import { createPortal } from 'react-dom';

// Local helpers
import { isNullOrUndefined } from './Helpers';
```

## Known Issues & Quirks

### Dependencies
- **react-contextmenu** doesn't officially support React 19 - works with `--legacy-peer-deps`
- **react-quill** compatible with React 18 (not 19) - reason we stayed on React 18
- **react-tiny-popover** v8 uses named export `{ Popover }`, not default
- **lodash** added for `isNull` utility (replaces deprecated Node util)

### SCSS
- All deprecation warnings fixed - using modern @use syntax
- Files use sass:math and sass:color modules
- Any lingering warnings are from cached webpack output

### File Loading
- SVGs loaded as asset resources (not inlined) for `<img src>` usage
- Icons in `src/icons/feather/` directory
- Fonts use CSS imports from `src/fonts/`

### Browser Compatibility
- Targets modern browsers (ES2020+)
- Uses native Promise, async/await
- No IE11 support

## Development Workflow

### Starting Development
```bash
npm start                 # Starts Webpack dev server on port 3000
```

### Building for Production
```bash
npm build                 # Creates optimized build in /build
```

### Common Tasks
- **Add new component**: Create in `src/components/`, add to `ComponentTypes.tsx`
- **Modify styles**: Edit SCSS files in `src/scss/`
- **Update templates**: Modify files in `src/components/templates/`
- **Change icons**: Update `Icon.tsx` and add to `src/icons/`

## Webpack Configuration Notes

### Hot Module Replacement
- React Refresh enabled in development
- Automatic reload on file changes
- Preserves component state when possible

### Code Splitting
- Vendors chunk automatically created for node_modules
- Runtime chunk separated for better caching
- CSS extracted in production builds

### Asset Handling
- **SVG/Images**: Loaded as resources with hashed filenames
- **Fonts**: Loaded as resources
- **CSS/SCSS**: Style-loader (dev) / MiniCssExtractPlugin (prod)

## Testing
- Jest configuration present in `jest.config.js`
- Test files: Located in `__tests__/` directories
- Limited test coverage currently

## Export Functionality
The app can export resumes as:
1. **Standalone HTML**: Single file with inlined CSS
2. **JSON**: Resume data structure for later loading
3. **Print**: Browser print functionality

## Migration Notes for Future Updates

### When updating dependencies:
- Always use `--legacy-peer-deps` due to react-contextmenu
- Check react-tiny-popover API (named vs default exports)
- Test icon loading after Webpack config changes

### Potential Future Migrations:
- **Vite**: Webpack config is now modern and clean, easier to port
- **React Context → Zustand/Jotai**: If state management becomes complex
- **Class components → Hooks**: Resume.tsx is the main class component remaining
- **SCSS deprecations**: Update to modern Sass syntax (color.adjust, math.div)

## Common Pitfalls

1. **Don't import from 'util'**: Use local `isNullOrUndefined` helper instead
2. **UUID imports**: Always `import { v4 as uuid }`, never `import uuid from 'uuid/v4'`
3. **Popover**: Always `{ Popover }` not `Popover` default import
4. **ReactDOM**: Import `createPortal` directly, not `ReactDOM.createPortal`
5. **Asset paths**: In HTML, paths are relative to build output, not source

## Environment Variables
Currently none required. All configuration in webpack.config.js.

## Browser Storage
Uses localStorage for:
- Auto-saving resume data
- User preferences
- Last edited state

## Performance Considerations
- Large component tree can slow down editing
- CSS editor re-renders on every change
- Consider React.memo for frequently updating components
- Quill editor has own performance characteristics

## Security Notes
- All user data stays client-side (no backend)
- XSS protection via React's built-in escaping
- `dangerouslySetInnerHTML` used intentionally for Quill content
- File export uses Blob URLs (automatically revoked)

## Useful Commands

```bash
# Install dependencies (always use this flag)
npm install --legacy-peer-deps

# Clean install
rm -rf node_modules package-lock.json && npm install --legacy-peer-deps

# Check for type errors
npx tsc --noEmit

# Run tests
npm test
```

## Getting Context

When working on a specific feature:
1. Check [.claude/rules](.claude/rules) for coding standards
2. Review [docs/TODO.md](docs/TODO.md) for planned work
3. Start with `Resume.tsx` to understand state flow
4. Check `ComponentTypes.tsx` for available component types
5. Look at existing templates in `templates/` for patterns
6. Review `Helpers.tsx` for utility functions
7. Check `ResumeContext.tsx` for available context values

## Additional Resources
- React 18 docs: https://react.dev
- Webpack 5 docs: https://webpack.js.org
- TypeScript handbook: https://www.typescriptlang.org/docs/
- Zustand (planned): https://github.com/pmndrs/zustand
