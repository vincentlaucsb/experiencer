# Component Architecture

This document provides a detailed map of the component structure and relationships in Experiencer.

## Schema Registry: Source of Truth

**Location**: `src/resume/schema/`

The `src/resume/schema/` directory is the **single source of truth** for all resume node type definitions. Every node type (Grid, Row, Column, Entry, Header, etc.) is registered here with its complete metadata.

### Key Files

- **`index.ts`**: Central registration point - registers all node types (14 as of mar-5-2026)
- **`ComponentTypes.ts`**: `ComponentTypes` singleton class that stores and retrieves node metadata
- **`ResumeNodeDefinition.ts`**: TypeScript interface defining node registration schema

### What Gets Registered

Each node type registration includes:
- **type**: Unique identifier (e.g., 'grid', 'row', 'column')
- **text**: Display name (e.g., 'Grid', 'Row', 'Column')
- **icon**: Icon identifier for UI
- **childTypes**: Array of valid child node types
- **defaultValue**: Default node structure when created
- **toolbarOptions**: Available editing options (imported from individual node folders)
- **cssName** (optional): Override for the CSS tree path (e.g., `'Page Break'`). Defaults to `[type]`.
- **isDefaultChildType** (optional): Whether this is default when adding children

> **Important**: `ComponentTypes.childTypes()` and `ComponentTypes.cssName()` return defensive copies so callers cannot mutate the stored arrays.

### Example Registration

```typescript
schema.registerNodeType({
    type: Grid.type,
    text: 'Grid',
    icon: 'table',
    childTypes: [Row.type, Column.type, Section.type, Entry.type, ...],
    defaultValue: {},
    toolbarOptions: getGridToolbarOptions
});
```

### How It's Used

- **Retrieval**: `ComponentTypes.instance.childTypes.get(nodeType)` gets valid child types
- **Defaults**: `ComponentTypes.instance.defaultValue.get(nodeType)` gets default structure
- **UI**: Toolbar, menus, and editors query the registry for available options
- **Validation**: Create/edit operations check registry to validate child types

### Node-Specific Configurations

Each component folder contains its own `toolbarOptions.ts`:
- `src/resume/Entry/toolbarOptions.ts`
- `src/resume/Header/toolbarOptions.ts`
- `src/resume/Grid/toolbarOptions.ts`
- etc.

These are imported into `src/resume/schema/index.ts` and registered with their node types.

## Component Hierarchy

```
Resume (Main App)
├── Landing (Welcome screen)
├── Help (Help system)
└── ResumeEditor
    ├── TopNavBar (File operations, layouts)
    ├── TopEditingBar (Conditional - when editing)
    ├── ResumeHotKeys (Keyboard shortcuts)
    ├── ResumeContextMenu (Right-click menu)
    └── ResumeContent
        └── [Template Component] (Assured, RandyMarsh, etc.)
            └── [Resume Components] (Header, Section, Entry, etc.)
                └── Container (wraps all components)
```

## Core Component Types

### Layout Components
- **Container**: Generic wrapper that can render as any HTML element
- **Row**: Horizontal layout container
- **Column**: Vertical layout container  
- **Grid**: CSS Grid-based layout
- **Section**: Content section with title

### Content Components
- **Header**: Resume header with name/title
- **Entry**: Job/education entry (title, date, location, description)
- **List**: Unordered or ordered lists
- **Markdown**: Markdown text editor (replaced RichText/Quill)
- **Icon**: Social media and contact icons
- **Divider**: Visual separator
- **PageBreak**: Explicit page break marker — shows a labelled divider in editor mode, invisible in print; forces a CSS `page-break-before` at that point; registered with `cssName: 'Page Break'`

### Control Components
Located in `src/components/controls/`:

#### Top-Level Controls
- **TopNavBar**: File operations (new, save, load, export)
- **TopEditingBar**: Editing tools (appears when component selected)
- **ResumeHotKeys**: Keyboard shortcut handler
- **ResumeContextMenu**: Right-click context menu
- **Modal**: Generic modal dialog

#### Buttons & Actions
- **Buttons**: Various button styles (Button, DangerButton, Confirm)
- **ButtonGroup**: Group of related buttons
- **ToolbarButton**: Icon button for toolbars
- **SelectedNodeActions**: Actions for selected component (move, delete, etc.)

#### Input Components (`controls/inputs/`)
- **QuillEditor**: Rich text editor
- **TextField**: Single text input with validation
- **MappedTextFields**: Multiple text fields
- **DateRange**: Start/end date input
- **IconPicker**: Icon selection dropdown
- **LayoutPicker**: Layout selection UI

#### Utility Controls
- **FileLoader**: Load resume from JSON
- **FileSaver**: Save resume as JSON
- **HtmlIdAdder**: Add HTML ID and CSS classes
- **Layouts**: Layout switcher (resizable sidebar, static, default)
- **Tabs**: Tab navigation component

### Core Data Structures

Located in dedicated folders reflecting their architectural importance:

- **`src/shared/NodeTree/`**: Tree data structure for resume nodes with UUID indexing and hierarchical navigation
- **`src/shared/CssTree/`**: CSS rule management with stylesheet generation and tree operations

These foundational data structures are placed at the root of `/shared` rather than in `/shared/utils/` because they:
- Form the core of the application's data model
- Are used across multiple stores and utilities
- Deserve dedicated test suites (`__tests__/` subdirectories)
- Represent foundational architecture rather than utility functions

### Utility Modules (`src/shared/utils/`)

`Helpers.tsx` was removed. Each function is now a single-export module for clean imports and independent testing:

| File | Exports | Purpose |
|---|---|---|
| `assignIds.ts` | `assignIds(node)` | Assign `uuid` fields to a node tree |
| `createContainer.ts` | `createContainer(id)` | Find or create a DOM container by ID |
| `deepCopy.ts` | `deepCopy(obj)` | JSON round-trip deep clone |
| `isNullOrUndefined.ts` | `isNullOrUndefined(v)` | Type guard for `null \| undefined` |
| `processText.ts` | `process(text)` | Replace `--`/`---` with en/em dash |
| `stripNodeProperties.ts` | `stripNodeProperties(nodes, keys)` | Recursively remove keys from a node tree (non-mutating); returns `BasicResumeNode[]` |
| `getResumeMinHeight.ts` | `getResumeMinHeight(nodes, pageSize)` | Compute `#resume` min-height from page-break count |
| `PrintHelpers.ts` | `exportResumeAsHtml`, `printResume` | HTML export and print utilities |

### Store Utilities (`src/shared/stores/`)

Beyond the main Zustand/ClassStore stores, there are action modules for complex mutations:

- **`ensureCssNodeForType.ts`**: Checks if a CSS node for a given component type exists in the live CSS tree; if not, copies a skeleton from the default template. Called when adding a new component type (e.g., `PageBreak`) to guarantee the CSS editor has a node for it.
- **`addHtmlId.ts`**: Sets the `htmlId` on the selected node and manages the corresponding CSS subtree — renames the existing `#old-id` node if present, creates a skeleton copy, or deletes the CSS node when the ID is cleared.
- **`saveResume.ts`** (`dump`): Exported function that serialises the current resume to `ResumeSaveData`; strips runtime `uuid` fields via `stripNodeProperties` so saved JSON is clean.

### Editor & Visualization Components
- **NodeTreeVisualizer**: Visual tree view of resume structure
- **CssEditor**: Visual CSS editor
- **CssEditorToolbar**: Toolbar for CSS editor
- **GenerateHtml**: Export resume as standalone HTML
- **HighlightBox**: Visual highlight overlay for editing

## Template Components

Located in `src/components/templates/`:

### Available Templates
- **Assured**: Clean, modern template
- **AssuredCoveredLetter**: Cover letter variant
- **RandyMarsh**: Alternative template style

### Template Helper
- **TemplateHelper**: Utilities for template creation
- **CssTemplates**: CSS definitions for templates

## Component Communication Patterns

### Selection and Editing

All resume components are wrapped by `Container` which handles:
- **Selection**: Click to select a node
- **Editing**: Double-click to enter edit mode
- **Context Menu**: Right-click to open context menu
- **Context Menu Suppression**: Menu disabled while editing

The `Container` component uses the presentation + wrapper pattern:

```typescript
// Presentation component - pure and testable
export function ContainerPresentation(props: ContainerPresentationProps) {
    const handleClick = () => {
        if (props.isSelected) {
            props.onEdit(props.uuid);
        } else {
            props.onSelect(props.uuid);
        }
    };
    // ...
}

// Connected wrapper - uses store hooks
export default function Container(props: ContainerProps) {
    const isSelected = useIsNodeSelected(props.uuid);
    const isEditing = useIsNodeEditing(props.uuid);
    const selectNode = useEditorStore((state) => state.selectNode);
    const editNode = useEditorStore((state) => state.editNode);
    
    return (
        <ContainerPresentation
            {...props}
            isSelected={isSelected}
            isEditing={isEditing}
            onSelect={selectNode}
            onEdit={editNode}
            onContextMenuOpen={selectNode}
        />
    );
}
```

### Props Flow

```
Resume (main component)
  ↓ passes resume data
[Template Component] (Assured, RandyMarsh, etc.)
  ↓ renders resume nodes recursively
Specific Node Component (Header, Entry, Section, etc.)
  ↓ wrapped by Container
Container (handles selection/editing)
  ↓ uses useSyncExternalStore hooks for tree and Zustand for editor state
Component renders with selection state
```

### Store Interaction

Components interact with the stores through:

1. **Tree State** (via useSyncExternalStore hooks):
   ```typescript
   const tree = useResumeTree();           // Full resume tree
   const unsaved = useHasUnsavedChanges(); // Can disable save button
   ```

2. **Editor State** (via Zustand selectors):
   ```typescript
   const isSelected = useIsNodeSelected(uuid);
   const isEditing = useIsNodeEditing(uuid);
   const selectNode = useEditorStore((state) => state.selectNode);
   ```

3. **Action Dispatch**:
   ```typescript
   import { useResumeActions } from "../stores/resumeNodeStore";
   const { moveNodeUp, moveNodeDown } = useResumeActions();
   moveNodeUp(uuid); // Returns new UUID
   ```

### Event Flow

1. User interacts with component (click, keyboard, etc.)
2. Component calls store action (e.g., `selectNode(uuid)` or `moveNodeUp(uuid)`)
3. For tree mutations: Updates tree via `withMutation()`, notifies useSyncExternalStore subscribers
4. For editor state: Zustand updates state and notifies subscribers
5. Components subscribed to relevant state re-render
6. UI updates to reflect new selection state

## Component Discovery & Registration

Instead of a hard-coded factory, components are registered in the schema registry:

**Location**: `src/resume/schema/index.ts`

```typescript
// Each component is registered by its type
schema.registerNodeType({
    type: Entry.type,
    text: 'Entry',
    icon: 'calendar',
    childTypes: [MarkdownText.type, Link.type],
    defaultValue: { /* ... */ },
    toolbarOptions: getEntryToolbarOptions
});
```

**Benefits:**
- Declarative node configuration
- Single source of truth for all metadata
- Easy to query available options
- Dynamic component type validation
- Consistent toolbar/menu generation

## ResumeNode Structure

Every component has a corresponding node:

```typescript
interface ResumeNode {
    uuid: string;           // Unique identifier
    type: string;           // Component type
    cssClasses?: string;    // CSS classes
    htmlId?: string;        // HTML ID attribute
    value?: string;         // Primary content
    children?: ResumeNode[]; // Child nodes
    // ... component-specific props
}
```

## Adding a New Component Type

### Step 1: Create the Component

Create the component file (e.g., `src/resume/MyComponent/index.tsx`):

```typescript
export interface MyComponentProps {
    uuid: string;
    value?: string;
    // ... other props
}

export default function MyComponent(props: MyComponentProps) {
    const isEditing = useIsNodeEditing(props.uuid);
    
    return <div>Component content</div>;
}

// Unique identifier for this type
MyComponent.type = 'myComponent';
```

### Step 2: Create Toolbar Options (if applicable)

Create `src/resume/MyComponent/toolbarOptions.ts`:

```typescript
import { ToolbarOption } from "@/types";

export default function getMyComponentToolbarOptions(): ToolbarOption[] {
    return [
        {
            key: 'myProperty',
            text: 'My Property',
            type: 'text'
        },
        // ... other options
    ];
}
```

### Step 3: Register in Schema

Update `src/resume/schema/index.ts`:

```typescript
import MyComponent from "@/resume/MyComponent";
import getMyComponentToolbarOptions from "../MyComponent/toolbarOptions";

export default function registerNodes() {
    const schema = ComponentTypes.instance;
    
    schema.registerNodeType({
        type: MyComponent.type,
        text: 'My Component',
        icon: 'icon-name',
        childTypes: [Grid.type, Section.type],
        defaultValue: {
            // Default structure when created
            value: ''
        },
        toolbarOptions: getMyComponentToolbarOptions
    });
    
    // ... other registrations
}
```

### Key Points

- **Always register in schema**: Don't hardcode component mappings elsewhere
- **Toolbar options are part of schema**: Query `ComponentTypes.instance` for available options
- **Use presentation + wrapper pattern**: If component uses Zustand stores, split accordingly
- **Test via presentations**: Test component logic via the presentation component, not store mocking

## Styling Patterns

### SCSS Architecture

All global and shared styles live in **`src/sass/`** (top-level, not `src/shared/scss/` which is deleted).

```
src/sass/
├── index.scss              # Barrel — imports everything
├── variables.scss          # CSS custom properties
├── forms.scss              # Form element styles
├── inputs.scss             # Input field styles
├── modals.scss             # Modal dialog styles
├── context-menu.scss       # Context menu styles
├── hl-box.scss             # Highlight box overlay
├── overlay-editing.scss    # Overlay editing affordances
├── resume-hover.scss       # Hover highlights on resume nodes
├── landing.scss            # Landing page styles
├── zindex.scss             # z-index scale
├── colors/
│   ├── index.scss          # Barrel
│   ├── palette.scss        # Raw color tokens (background hues, etc.)
│   ├── semantic.scss       # Named semantic tokens (--color-text-primary, etc.)
│   └── utilities.scss      # app-text-* utility classes
└── spacing/
    ├── index.scss          # Utility classes (app-mb-*, app-gap-*, app-p-*)
    └── scale.scss          # Spacing scale values
```

**Usage**: `Resume.tsx` imports `@/sass/index.scss`. Component-specific styles remain in `.scss` files co-located with the component (e.g., `TopEditingBar.scss`, `Markdown.scss`).

**Spacing utilities** follow an `app-` prefix to avoid collisions with PureCSS and resume content styles:
- `app-mb-1` through `app-mb-4` — margin-bottom
- `app-gap-1` through `app-gap-4` — flex/grid gap
- `app-p-4` — padding
- `app-text-light-accent` — muted label text

### Component-Specific Styles
Most components use:
- Inline styles for dynamic values
- CSS classes for static styling
- SCSS files co-located with the component for complex styles

### Editing Mode Styles
Components often render differently when editing:

**Function components** use hooks:
```typescript
import { useIsNodeEditing } from "../stores/editorStore";

const isEditing = useIsNodeEditing(props.uuid);

if (isEditing) {
    return <textarea {...props} />;
} else {
    return <ReactMarkdown>{props.value}</ReactMarkdown>;
}
```

### No-Print Classes
Use `no-print` class for elements that shouldn't appear in exports:
```typescript
<div className="no-print">
    {/* Editing controls */}
</div>
```

## State Management Details

### Tree State Management: ClassStore + useSyncExternalStore Pattern

**Location**: `src/shared/ClassStore/` (base), `src/shared/stores/NodeStore/` (resume tree), `src/shared/stores/CssStore/` (CSS tree)

The resume and CSS tree states are managed using React 18's native `useSyncExternalStore` hook with a custom `ClassStore<T>` base class.

**Architecture**:
- **ClassStore<T>**: Abstract base class providing:
  - `useSyncExternalStore`-compatible `subscribe()` and `getSnapshot()` methods
  - Version counter for change detection
  - Cached snapshot pattern to prevent infinite loops
  - Mutation tracking with `withMutation()` helper
  - `_initialLoad` flag to prevent first mutation from marking as unsaved
  - Unsaved changes tracking via `hasUnsavedChanges()`

- **NodeStore**: Extends ClassStore<ResumeNodeTree>
  - Methods accept both UUID (string) and hierarchical ID (number[])
  - All mutations go through `withMutation()` for proper change tracking
  - Type overloads document that `moveNodeUp(uuid: string): string` and `moveNodeUp(id: IdType): IdType`

- **CssStore**: Extends ClassStore<CssNode>
  - Manages CSS rules for resume styling
  - Same subscription and unsaved tracking pattern as NodeStore

**Unsaved Changes Pattern**:
```typescript
// First mutation doesn't set unsaved (initial load)
// Subsequent mutations set unsaved flag
const unsaved = resumeNodeStore.hasUnsavedChanges();
if (!unsaved) {
    // Can disable save button
}
```

**Dual API Pattern**:
```typescript
// Both accept UUID or hierarchical ID, return same type
resumeNodeStore.moveNodeUp(uuid);          // returns string
resumeNodeStore.moveNodeUp([0, 1, 2]);     // returns [0, 1, 1]
```

### Editor State: Zustand Store (src/shared/stores/editorStore.ts)

**Location**: `src/shared/stores/editorStore.ts`

The editor state (selection and edit mode) is managed with Zustand. The store maintains:
- **selectedNodeId**: UUID of currently selected node (undefined if nothing selected)
- **isEditingSelected**: Boolean indicating if selected node is in edit mode

**Actions:**
- `selectNode(uuid)`: Select a node
- `editNode(uuid)`: Select and enter edit mode
- `unselectNode()`: Clear selection
- `toggleEdit()`: Toggle between normal/edit mode

**Hooks for component usage:**
- `useEditorStore()`: Full store access (use selectors for performance)
- `useIsNodeSelected(uuid)`: Boolean if node is selected
- `useIsNodeEditing(uuid)`: Boolean if node is being edited

**Example:**
```typescript
const isSelected = useIsNodeSelected(props.uuid);
const isEditing = useIsNodeEditing(props.uuid);
const selectNode = useEditorStore((state) => state.selectNode);

const handleClick = () => {
    if (isSelected) {
        useEditorStore.setState({ isEditingSelected: true });
    } else {
        selectNode(props.uuid);
    }
};
```

### Presentation Components + Store-Aware Wrappers

**Recommended Pattern**: For any component using Zustand stores, split into two:

1. **Presentation Component**: Pure component receiving state/callbacks as props
2. **Connected Wrapper**: Uses store hooks, passes props to presentation

**Benefits**: Easy to test, explicit contracts, store-independent

See **"Presentation Component + Store-Aware Wrapper Pattern"** section below for details and examples.
High-frequency state that changes on every selection or edit:
```typescript
interface EditorState {
    selectedNodeId: string | undefined;  // Selected component UUID
    isEditingSelected: boolean;          // Edit mode active
    selectNode: (uuid: string) => void;
    editNode: (uuid: string) => void;
    unselectNode: () => void;
    toggleEdit: () => void;
}
```

**Usage in function components**:
```typescript
import { useIsNodeEditing, useIsNodeSelected } from "../stores/editorStore";

const isEditing = useIsNodeEditing(props.uuid);
const isSelected = useIsNodeSelected(props.uuid);
```

**Usage in class components**:
```typescript
import { useEditorStore } from "../stores/editorStore";

render() {
    const { selectedNodeId, isEditingSelected } = useEditorStore.getState();
    const isEditing = isEditingSelected && selectedNodeId === this.props.uuid;
}
```

### Resume.tsx State
```typescript
state = {
    nodes: ResumeNode[];              // Resume tree
    selectedNode: IdType;             // Selected node path (for tree nav)
    editMode: EditorMode;             // 'editing' | 'viewing'
    layoutMode: LayoutMode;           // Layout type
    cssTree: CssNode;                 // CSS rules
    // ... more state
}
```

### Context Values
```typescript
{
    isPrinting: boolean;
    updateComponent: (uuid: string, updates: Partial<ResumeNode>) => void;
    updateSelectedRef: (ref: HTMLElement | null) => void;
    updateClicked: (clicked: boolean) => void;
}
```

## Why Two State Management Patterns?

**Problem with Context API**: Context causes full tree re-renders on state changes.

**Solution - Two-Tier Approach**:

1. **useSyncExternalStore (ClassStore) for Tree State**:
   - Manages large, mutable data structures (ResumeNodeTree, CssNode)
   - Used by few components (node adding, CSS editing)
   - Lower frequency mutations (not on every selection)
   - Cached snapshots prevent infinite loops
   - Proper version tracking for change detection

2. **Zustand for Editor Selection State**:
   - Manages high-frequency selection changes
   - Used by many components (every node checks if selected)
   - Selective subscriptions via hooks
   - Only components using the state re-render
   - Lightweight and optimized for frequently-accessed state

**Performance Benefits**:
- Tree mutations only notify components that subscribe to tree state
- Selection changes only notify components using Zustand hooks
- Avoids full tree re-renders on selection changes
- Selected/unselected components update independently

## Performance Optimization Tips

### When to use React.memo
- Components that render frequently
- Components with expensive render logic
- Leaf components with stable props

### When to use useCallback/useMemo
- Callbacks passed to child components
- Expensive computations
- Dependency arrays in effects

### State Management Best Practices
1. **Use useSyncExternalStore (ClassStore) for large data structures**: Resume tree, CSS tree, file data
2. **Use Zustand for high-frequency UI state**: Selection, editing mode, UI toggles
3. **Use Context for theming/global configuration**: Rarely changes, affects whole app
4. **Use selector hooks**: Subscribe only to the state slices you need
5. **Avoid Context for frequently-changing state**: Causes unnecessary re-renders

### Current Performance Optimizations
1. **Dual-pattern stores**: Tree state (useSyncExternalStore) and UI state (Zustand) are independent
2. **Store subscriptions isolated**: ResumeContainer only subscribes to mode/selection state; ResumeCssEditor subscribes to CSS state independently
3. **Unsaved changes tracking**: ClassStore tracks mutations for save button state
4. **Cached snapshots**: Prevents infinite loops when reading tree state
5. **Selective subscriptions**: Function components use specific hooks only for needed state
6. **React.PureComponent for class components**: Shallow prop comparison

### Remaining Performance Considerations
1. **Index rebuild on tree mutations**: O(n) operation for every move/delete, could batch operations
2. **Large node trees**: Deep nesting can slow performance with many mutations

## Component Testing Approach

### Unit Tests
Focus on:
- Pure utility functions (individual modules in `src/shared/utils/`)
- Data structures (NodeTree, CssTree)
- Isolated components

### Integration Tests
Focus on:
- Component interactions
- Context provider behavior
- Export functionality

### E2E Tests
Focus on:
- Complete user workflows
- Template rendering
- File operations

## Presentation Component + Store-Aware Wrapper Pattern

### Overview

For any component that interacts with Zustand stores, we use a two-layer pattern:

1. **Presentation Component**: Pure, dumb component that receives all state and callbacks as explicit props
2. **Connected Wrapper**: Smart component that uses Zustand hooks and passes props to the presentation component

### Why This Pattern?

#### Problem with Direct Store Hooks
- **Hard to test**: Requires mocking the entire store
- **Implicit dependencies**: Store structure hidden behind hooks
- **Coupling**: Component tightly bound to store implementation
- **Prop contract unclear**: Readers must understand store to understand component

#### Advantages of This Pattern
1. **Testability without mocks**: Pass props directly, verify behavior. No `jest.mock` setup needed.
2. **Explicit contracts**: Props clearly show what component needs
3. **Implementation independence**: Store can change without touching presentation component
4. **Reusability**: Component could work with different state management
5. **Clarity**: Future developers see props and instantly understand dependencies
6. **Fast tests**: No mock setup overhead, tests run quickly

### Implementation Pattern

```typescript
// 1. Define props interface for the presentational component
export interface ComponentPresentationProps extends ComponentProps {
    // State as props
    isSelected: boolean;
    isEditing: boolean;
    
    // Callbacks as props
    onSelect: (id: string) => void;
    onEdit: (id: string) => void;
}

// 2. Create the presentational component
export function ComponentPresentation(props: ComponentPresentationProps) {
    // All logic uses props, no store hooks
    const handleClick = () => {
        if (props.isSelected) {
            props.onEdit(props.id);
        } else {
            props.onSelect(props.id);
        }
    };
    
    return <div onClick={handleClick}>{props.children}</div>;
}

// 3. Create the connected wrapper (keep as default export for backward compatibility)
export default function Component(props: ComponentProps) {
    // Use store hooks here
    const isSelected = useIsNodeSelected(props.id);
    const isEditing = useIsNodeEditing(props.id);
    const selectNode = useEditorStore((state) => state.selectNode);
    const editNode = useEditorStore((state) => state.editNode);
    
    // Pass everything as props to presentation
    return (
        <ComponentPresentation
            {...props}
            isSelected={isSelected}
            isEditing={isEditing}
            onSelect={selectNode}
            onEdit={editNode}
        />
    );
}
```

### Testing the Pattern

```typescript
describe("ComponentPresentation", () => {
    test("calls onSelect when clicking unselected", () => {
        const onSelect = jest.fn();
        const onEdit = jest.fn();
        
        const { container } = render(
            <ComponentPresentation
                id="test-id"
                isSelected={false}
                isEditing={false}
                onSelect={onSelect}
                onEdit={onEdit}
            >
                Content
            </ComponentPresentation>
        );
        
        fireEvent.click(container.firstChild);
        expect(onSelect).toHaveBeenCalledWith("test-id");
    });
});
```

**Key points:**
- No `jest.mock` for stores needed
- Props are passed directly
- Test is readable and fast
- Logic is verified without store coupling

### When to Use This Pattern

✅ **Use for:**
- Components that interact with Zustand stores
- Components that should be easily testable
- Shared components used in multiple contexts
- Components with complex event handling

❌ **Not necessary for:**
- Purely presentational leaf components
- Components that don't use any stores
- Simple wrappers with no logic

### Real-World Example: Container Component

See [src/resume/infrastructure/Container.tsx](../../src/resume/infrastructure/Container.tsx) for a complete working example:
- `ContainerPresentation`: Handles click/context menu logic based on props
- `Container` (default export): Connects to editor store and passes props

## Architecture Rating: 9.0-9.2/10

### Strengths

✅ **Dual-Pattern State Management**
- Correct pattern: useSyncExternalStore for large data structures, Zustand for high-frequency UI state
- Prevents unnecessary full-tree re-renders on selection changes
- Well-documented rationale and trade-offs

✅ **Strong Type Safety**
- TypeScript throughout with proper type annotations
- Type overloads preserve input/output types in move operations
- IdType and UUID dual-API clearly documented
- No unsafe `any` types in core data structures

✅ **Clean Separation of Concerns**
- ClassStore base class handles subscription/mutation logic
- Tree operations isolated in ResumeNodeTree and CssTree
- Presentation components split from store-connected wrappers
- Clear responsibility boundaries

✅ **Comprehensive Documentation**
- ARCHITECTURE.md explains patterns and design decisions
- Event flow and store interaction clearly diagrammed
- Component hierarchy and responsibilities documented
- Patterns section provides copy-paste examples

✅ **Excellent Test Coverage**
- 200+ tests passing consistently
- Core patterns (unsaved changes, tree operations) well-covered
- Hook integration tested
- No regressions on refactoring

✅ **Version Counter + Cached Snapshots**
- Elegantly prevents infinite loops
- Proper change detection without equality checks
- _initialLoad flag solves "save button on initial load" problem

✅ **Optimized Store Subscriptions**
- ResumeCssEditor subscribes directly to CSS stores, not via ResumeContainer
- CSS Editor keystrokes don't trigger Resume component reconciliation
- Clear separation: components only subscribe to stores they actually use

### Areas for Improvement

⚠️ **Index Rebuild Performance** (Low-Medium Impact)
- O(n) per move/delete, but the editor performs single operations (no batch deletes/moves)
- Current approach is acceptable for typical resume sizes
- Optimization only matters if large trees or batch operations are introduced

⚠️ **Error Handling & Recovery** (Medium Impact)
- No error boundaries for component crashes
- No logging mechanism for debugging production issues
- Tree corruption could silently occur without visibility
- Missing try/catch in mutation handlers

⚠️ **Production Instrumentation** (Low Impact)
- No performance metrics or timing data
- No visibility into which mutations are expensive
- No warnings for potential performance issues (large batches)

### Recommended Next Steps

1. **Add error boundaries** around main components
2. **Implement operation timing** in ClassStore for performance monitoring
3. **Profile large resume trees** to identify bottlenecks
4. **Consider optimizing index rebuild** if batch operations are ever added
5. **Consider debouncing** for high-frequency mutations
