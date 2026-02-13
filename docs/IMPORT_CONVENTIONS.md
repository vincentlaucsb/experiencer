# Import Conventions

## Purpose
Consistent import organization improves readability, maintainability, and makes it easier to locate dependencies at a glance.

## Import Order

All TypeScript/TSX files should organize imports in the following order:

### 1. External Libraries
Third-party packages from npm or Node.js internals
```typescript
import * as React from 'react';
import { saveAs } from 'file-saver';
import { createPortal } from 'react-dom';
```

### 2. Style Imports
Global styles, CSS, SCSS imports
```typescript
import 'purecss/build/pure-min.css';
import '@/shared/scss/index.scss';
import '@/assets/fonts/icofont.min.css';
```

### 3. Utilities & Helpers
Helper functions, constants, context
```typescript
import { assignIds, deepCopy, createContainer } from '@/shared/utils/Helpers';
import ResumeContext from '@/shared/utils/ResumeContext';
```

### 4. Components
React components organized by feature/location
```typescript
import ResumeComponentFactory from '@/resume/ResumeComponent';
import ResumeTemplates from '@/templates/ResumeTemplates';
import TopNavBar, { TopNavBarProps } from '@/controls/TopNavBar';
import CssEditor, { makeCssEditorProps } from '@/editor/CssEditor';
```

### 5. Stores (State Management)
Zustand stores or other state management
```typescript
import { useEditorStore } from '@/shared/stores/editorStore';
import { useResumeStore } from '@/shared/stores/resumeStore';
import { useHistoryStore, recordHistory } from '@/shared/stores/historyStore';
```

### 6. Types
TypeScript interfaces, types, type utilities
```typescript
import { IdType, NodeProperty, ResumeSaveData, ResumeNode } from '@/types';
import CssNode, { ReadonlyCssNode } from '@/shared/utils/CssTree';
```

### 7. Dynamic Imports (Always Last)
Lazy-loaded components using `React.lazy()` or dynamic `import()`
```typescript
const ResumeContextMenuConnected = React.lazy(
    () => import('@/controls/ResumeContextMenuConnected')
);
const SelectedNodeHighlightBox = React.lazy(
    () => import('@/editor/HighlightBox').then(m => ({ default: m.SelectedNodeHighlightBox }))
);
```

## Blank Lines Between Sections

Use blank lines to separate each section for visual clarity:

```typescript
import * as React from 'react';
import { saveAs } from 'file-saver';

import '@/shared/scss/index.scss';

import { assignIds, deepCopy } from '@/shared/utils/Helpers';

import TopNavBar from '@/controls/TopNavBar';
import CssEditor from '@/editor/CssEditor';

import { useEditorStore } from '@/shared/stores/editorStore';

import { IdType, ResumeNode } from '@/types';

const LazyComponent = React.lazy(() => import('@/components/Lazy'));
```

## Why This Order?

1. **External → Internal**: Dependency direction - external packages don't depend on your code
2. **Styles Early**: CSS/styles should load before any logic
3. **Utilities Before Components**: Utilities are building blocks for components
4. **Stores Before Types**: State management is more specific than general types
5. **Dynamic Last**: Lazy-loaded imports are deferred and conceptually "future" code

## Benefits

✅ **Consistent structure** across all files
✅ **Faster location** of dependencies
✅ **Clear dependencies** - high-level imports before low-level
✅ **Easier diffs** - changes organized logically
✅ **Follows conventions** - similar to many TypeScript/React projects

## Example: Complete File

```typescript
// External libraries
import * as React from 'react';
import { saveAs } from 'file-saver';

// Styles
import '@/shared/scss/index.scss';

// Utilities
import { createContainer } from '@/shared/utils/Helpers';
import MyContext from '@/shared/utils/Context';

// Components
import Header from '@/controls/Header';
import Main from '@/editor/Main';

// Stores
import { useEditorStore } from '@/shared/stores/editorStore';

// Types
import { ResumeNode } from '@/types';

// Dynamic imports (lazy-loaded)
const HeavyComponent = React.lazy(() => import('@/components/Heavy'));
```

## Enforcement

Consider using ESLint with `eslint-plugin-import` to enforce this convention:
- `import/order` rule can be configured to validate import grouping
- `sort-imports` rule can alphabetize imports within groups

## Exceptions

- **Test files**: May include mocks before utilities if it improves test clarity
- **Large components**: Consider splitting if import section exceeds 50 lines
- **Relative imports**: Only use for sibling files (e.g., `.scss`, `.test.tsx`)
