# Component Architecture

This document provides a detailed map of the component structure and relationships in Experiencer.

## Schema Registry: Source of Truth

**Location**: `src/resume/schema/`

The `src/resume/schema/` directory is the **single source of truth** for all resume node type definitions. Every node type (Grid, Row, Column, Entry, Header, etc.) is registered here with its complete metadata.

### Key Files

- **`index.ts`**: Central registration point - registers all 13 node types
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
- **isDefaultChildType** (optional): Whether this is default when adding children

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
- **RichText**: Rich text content via Quill
- **Icon**: Social media and contact icons
- **Divider**: Visual separator

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

### Utility Components
Located in `src/components/utility/`:

- **NodeTree**: Tree data structure for resume nodes
- **ObservableResumeNodeTree**: Observable wrapper for state changes
- **NodeTreeVisualizer**: Visual tree view of resume structure
- **CssTree**: CSS rule management
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
  ↓ uses Zustand selectors
Component renders with selection state
```

### Store Interaction

Components interact with the store through:

1. **Selectors**: For read-only access
   ```typescript
   const isSelected = useIsNodeSelected(uuid);
   const isEditing = useIsNodeEditing(uuid);
   ```

2. **Actions**: Via store methods
   ```typescript
   const selectNode = useEditorStore((state) => state.selectNode);
   selectNode(uuid);
   ```

3. **Direct state**: If needed
   ```typescript
   const state = useEditorStore.getState();
   ```

### Event Flow

1. User interacts with component (click, keyboard, etc.)
2. Component calls store action (e.g., `selectNode(uuid)`)
3. Zustand updates state and notifies subscribers
4. All components subscribed to that state re-render
5. UI updates to reflect new selection state

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

### Component-Specific Styles
Most components use:
- Inline styles for dynamic values
- CSS classes for static styling
- SCSS files in `src/scss/` for complex styles

### Editing Mode Styles
Components often render differently when editing:

**Function components** use hooks:
```typescript
import { useIsNodeEditing } from "../stores/editorStore";

const isEditing = useIsNodeEditing(props.uuid);

if (isEditing) {
    return <QuillEditor {...props} />;
} else {
    return <div dangerouslySetInnerHTML={{ __html: props.value }} />;
}
```

**Class components** use direct store access:
```typescript
import { useEditorStore } from "../stores/editorStore";

render() {
    const { selectedNodeId, isEditingSelected } = useEditorStore.getState();
    const isEditing = isEditingSelected && selectedNodeId === this.props.uuid;
    
    // ... rest of render
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

### Zustand Store (src/shared/stores/editorStore.ts)

**Location**: `src/shared/stores/editorStore.ts`

The editor state is managed with Zustand. The store maintains:
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

## Why Zustand for Selection State?

**Problem**: Context API causes full tree re-renders on selection changes because every component checks `selectedUuid`.

**Solution**: Zustand allows selective subscriptions:
- Function components subscribe only to the state they need via hooks
- Class components read state directly without subscribing
- Only components that actually use the selected state re-render

**Performance improvement**: Instead of re-rendering 50+ components on selection, only the selected/unselected components update.

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
1. **Use Zustand for high-frequency state**: Selection, editing mode, UI toggles
2. **Use Context for low-frequency state**: Print mode, global callbacks, theme
3. **Avoid putting frequent state in Context**: Causes unnecessary re-renders
4. **Use selector hooks**: Subscribe only to the state slices you need

### Current Performance Optimizations
1. **Zustand for selection**: Only selected/unselected components re-render
2. **React.PureComponent for class components**: Shallow prop comparison
3. **Selective subscriptions**: Function components use specific hooks

### Remaining Performance Considerations
1. **CSS Editor re-renders**: Updates on every keystroke
2. **Large node trees**: Deep nesting can slow selection
3. **Quill editor**: Heavy library, consider lazy loading

## Component Testing Approach

### Unit Tests
Focus on:
- Pure utility functions (Helpers.tsx)
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
