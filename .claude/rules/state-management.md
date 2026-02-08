---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# State Management

## Architecture

### Zustand Store (High-Frequency State)
Located in `src/stores/editorStore.ts` for frequently-changing state:
- `selectedNodeId`: Currently selected component UUID  
- `isEditingSelected`: Whether selected component is in edit mode
- Actions: `selectNode()`, `editNode()`, `unselectNode()`, `toggleEdit()`

**Why Zustand?** Context API caused full tree re-renders on every selection change. Zustand allows selective subscriptions so only affected components update.

### React Context (Low-Frequency State)
Located in `src/components/ResumeContext.tsx` for infrequent state:
- `isPrinting`: Print mode indicator
- `updateComponent()`: Update component data callback
- `updateSelectedRef()`, `updateClicked()`: UI callbacks

### Local Component State
Use `useState` for component-specific state:
- Form input values
- UI toggle states
- Temporary data

## Usage Patterns

### Function Components with Zustand

**Check if node is editing:**
```typescript
import { useIsNodeEditing } from "../stores/editorStore";

function MyComponent(props: MyProps) {
    const isEditing = useIsNodeEditing(props.uuid);
    
    return isEditing ? <Editor /> : <Display />;
}
```

**Check if node is selected:**
```typescript
import { useIsNodeSelected } from "../stores/editorStore";

function MyComponent(props: MyProps) {
    const isSelected = useIsNodeSelected(props.uuid);
    
    return <div className={isSelected ? 'selected' : ''}>{...}</div>;
}
```

**Access store actions:**
```typescript
import { useEditorStore } from "../stores/editorStore";

function MyComponent(props: MyProps) {
    const selectNode = useEditorStore(state => state.selectNode);
    
    return <div onClick={() => selectNode(props.uuid)}>Click me</div>;
}
```

### Class Components with Zustand

**Access store state:**
```typescript
import { useEditorStore } from "../stores/editorStore";

class MyComponent extends React.Component {
    render() {
        const { selectedNodeId, isEditingSelected } = useEditorStore.getState();
        const isEditing = isEditingSelected && selectedNodeId === this.props.uuid;
        
        return isEditing ? <Editor /> : <Display />;
    }
}
```

**IMPORTANT**: Class components use `getState()` which does NOT subscribe to updates. This is intentional for class components that already extend `React.PureComponent` for optimization.

### Using Context

**Function components:**
```typescript
import { useContext } from "react";
import ResumeContext from "./ResumeContext";

function MyComponent() {
    const context = useContext(ResumeContext);
    
    if (context.isPrinting) {
        return <PrintView />;
    }
    return <NormalView />;
}
```

**Class components:**
```typescript
import ResumeContext from "./ResumeContext";

class MyComponent extends React.Component {
    static contextType = ResumeContext;
    
    render() {
        if (this.context.isPrinting) {
            return <PrintView />;
        }
        return <NormalView />;
    }
}
```

## Adding New State

### When to use Zustand Store
- State changes frequently (>10 times per session)
- Many components need to read the state
- Updates should not trigger full tree re-renders
- Examples: selection, UI mode toggles, active panel

### When to use Context
- State changes infrequently (<10 times per session)
- Needs to be available to most/all components
- Re-renders are acceptable
- Examples: theme, print mode, global callbacks

### When to use Local State
- Only one component needs the state
- State is transient (doesn't need persistence)
- Examples: form inputs, modals, dropdowns

## Common Patterns

### Conditional Rendering Based on Edit Mode
```typescript
const isEditing = useIsNodeEditing(props.uuid);

return isEditing ? (
    <QuillEditor value={props.value} onChange={handleChange} />
) : (
    <div dangerouslySetInnerHTML={{ __html: props.value }} />
);
```

### Handling Selection
```typescript
import { useEditorStore } from "../stores/editorStore";

function MyComponent(props: MyProps) {
    const selectNode = useEditorStore(state => state.selectNode);
    const isSelected = useIsNodeSelected(props.uuid);
    
    return (
        <Container
            isSelected={isSelected}
            onClick={(e) => {
                e.stopPropagation();
                selectNode(props.uuid);
            }}
        >
            {props.children}
        </Container>
    );
}
```

### Performance: Selective Subscriptions
```typescript
// ❌ BAD: Re-renders on ANY store change
const store = useEditorStore();

// ✅ GOOD: Only re-renders when selectedNodeId changes
const selectedNodeId = useEditorStore(state => state.selectedNodeId);

// ✅ BETTER: Use provided selector hooks
const isEditing = useIsNodeEditing(props.uuid);
```

## Store Devtools

The Zustand store is configured with Redux DevTools:
1. Install Redux DevTools browser extension
2. Open DevTools → Redux tab
3. See all store actions and state changes
4. Time-travel debugging available

