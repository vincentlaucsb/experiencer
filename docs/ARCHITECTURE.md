# Component Architecture

This document provides a detailed map of the component structure and relationships in Experiencer.

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

### Props Flow
```
Resume (state)
  ↓ props
ResumeComponent (wrapper)
  ↓ props + context
Specific Component (Header, Entry, etc.)
```

### State Management

**Zustand Store** (high-frequency state):
- `selectedNodeId`: Currently selected component UUID
- `isEditingSelected`: Boolean for edit mode
- `selectNode(uuid)`: Select a node
- `editNode(uuid)`: Select and enter edit mode
- `unselectNode()`: Clear selection
- `toggleEdit()`: Toggle edit mode

**Context** (low-frequency state):
- `isPrinting`: Print mode indicator
- `updateComponent`: Callback to update component data
- `updateSelectedRef`: Callback to update selected component ref
- `updateClicked`: Callback to track clicks

### Event Flow
1. User interacts with component
2. Component calls store action (e.g., `selectNode(uuid)`) or context method (e.g., `updateComponent`)
3. Store/context updates state
4. State change triggers re-render
5. Changes persisted to localStorage

## Component Factory Pattern

`ResumeComponentFactory` maps node types to React components:

```typescript
switch (node.type) {
    case 'Header': return <Header {...props} />;
    case 'Entry': return <Entry {...props} />;
    case 'Section': return <Section {...props} />;
    // etc.
}
```

Benefits:
- Dynamic component rendering from data
- Easy to add new component types
- Consistent wrapper logic

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

## Adding a New Component

1. **Create component file**: `src/components/MyComponent.tsx`
   ```typescript
   export interface MyComponentProps extends ResumeComponentProps {
       myProp?: string;
   }
   
   export default function MyComponent(props: MyComponentProps) {
       // Implementation
   }
   ```

2. **Add to ComponentTypes**: Update `src/components/schema/ComponentTypes.tsx`
   ```typescript
   export const MyComponentType = "MyComponent";
   ```

3. **Update factory**: Add case in `ResumeComponentFactory`
   ```typescript
   case MyComponentType:
       return <MyComponent {...props} />;
   ```

4. **Add to toolbar**: Update `ToolbarOptions.tsx` if needed

5. **Add to context menu**: Update `ContextMenuOptions.tsx` if needed

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

### Zustand Store (src/stores/editorStore.ts)
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
