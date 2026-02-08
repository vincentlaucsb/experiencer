# src/resume/ Component Patterns & Pitfalls

This document describes common patterns, gotchas, and best practices specific to resume component development.

## Container onClick Propagation

**The Pitfall:**
The `Container` component wraps all resume elements and has a built-in `onClick` handler that calls `value.updateClicked(props.id)` to manage selection state. This handler is attached to every resume component.

If you add clickable elements (buttons, links, etc.) inside a Container without stopping propagation, the click bubbles up to the Container's handler, which interferes with your element's behavior.

**Example of the Problem:**
```tsx
// ❌ BROKEN - Button click bubbles to Container
<Container {...props}>
    <button onClick={handleSave}>Save</button>
</Container>
```

When clicked, the flow is:
1. Button's onClick fires → calls handleSave()
2. Event bubbles → Container's onClick fires → calls updateClicked()
3. State changes can conflict/cancel out

**The Solution:**
Always call `stopPropagation()` on buttons and clickable elements inside Container:

```tsx
// ✅ CORRECT - Stop propagation prevents Container interference
<Container {...props}>
    <button onClick={(e) => {
        e.stopPropagation();
        handleSave();
    }}>
        Save
    </button>
</Container>
```

**When to Apply:**
- Any `<button>` with an onClick handler
- Any `<a>` or link with onClick behavior
- Form inputs with custom handlers (unless they're just for data entry)
- Any element where you DON'T want Container selection to trigger

**When NOT to Apply:**
- Text inputs/textareas used purely for editing (Container click should not trigger selection during edit)
- Elements inside edit mode that shouldn't exit editing on click

## Editing State Management

**Pattern:**
Resume components use the `isEditingSelected` state from `editorStore` to determine rendering mode:

```tsx
const isEditing = useIsNodeEditing(props.uuid);
```

This checks TWO conditions:
- `selectedNodeId === props.uuid` (node is selected)
- `isEditingSelected === true` (edit mode is active)

**Important:** A node cannot be in edit mode without being selected. The node must pass both checks.

## Edit/View Toggle Pattern

**Keyboard Shortcut Approach:**
For edit mode exits, use keyboard handlers (Ctrl+Enter, Escape) which naturally have focus context:

```tsx
const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        toggleEdit();
    }
};
```

**Button Approach:**
If using a button to exit editing, remember:
1. Stop propagation (so Container click doesn't interfere)
2. Button may need to call both select AND toggle if node isn't already selected

```tsx
const handleSave = () => {
    e.stopPropagation(); // Critical!
    toggleEdit();
};
```

## useIsNodeEditing Hook Details

Located in `editorStore.ts`:

```typescript
export const useIsNodeEditing = (nodeId: string) => 
    useEditorStore((state) => 
        state.selectedNodeId === nodeId && state.isEditingSelected
    );
```

This is a selector hook that prevents unnecessary re-renders by only triggering when both conditions change.

## Component File Structure

Standard resume component template:

```tsx
import Container from "./Container";
import ResumeComponentProps from "@/types";
import { useIsNodeEditing, useEditorStore } from "@/shared/stores/editorStore";

export default function YourComponent(props: ResumeComponentProps) {
    const isEditing = useIsNodeEditing(props.uuid);
    const toggleEdit = useEditorStore((state) => state.toggleEdit);
    const textValue = props.value || "";

    if (isEditing) {
        return (
            <Container className="editor" {...props}>
                {/* Edit mode JSX */}
            </Container>
        );
    }

    return (
        <Container {...props}>
            {/* View mode JSX */}
        </Container>
    );
}

YourComponent.type = 'ComponentName';
```

## Common Gotchas

### Gotcha 1: Markdown with rehype-raw
HTML rendering works, but data URIs don't render (react-markdown limitation). Workaround documented in TODO.md - create dedicated Image component for base64 images.

### Gotcha 2: SCSS Imports with Vite
Use static imports, not dynamic:
```tsx
// ✅ Correct
import "./Header.scss"

// ❌ Broken in Jest (and unnecessary)
await import("./Header.scss")
```

### Gotcha 3: Prop Spreading in Container
The Container spreads `props.attributes` and adds event handlers. Don't duplicate onClick or other handlers in attributes - pass them separately or use stopPropagation.

### Gotcha 4: Testing Resume Components
- Mock react-markdown in jest.config.js (ESM issues)
- Mock SCSS/CSS imports with styleStubber
- Remember to call `configure_notebook` before running/installing packages in notebooks
