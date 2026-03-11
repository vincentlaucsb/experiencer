# Overlay Editing Pattern

This document describes the overlay-based editing UX pattern used in resume components when inline inputs would significantly distort layout.

## Problem It Solves

Previously, editing components would replace their display content entirely. This caused significant layout shifts because:
- Edit controls (textarea, input) have different dimensions than display text
- Layout recalculation could confuse users
- Overlay-based editing prevents this by keeping display content visible

## Pattern

**Display Mode:**
```
Resume Content (clickable)
Click to edit
```

**Edit Mode:**
```
Resume Content (faded/visual indicator)
    ↓ Overlay appears on top of the content
[Edit Form]
```

The display content remains in the DOM with visual indicators (opacity, dashed border), while the edit UI appears as an overlay positioned relative to the content.

## Implementation

### Basic Structure

```tsx
import Container from "@/resume/infrastructure/Container";

export default function MyComponent(props: ResumeComponentProps) {
    const isEditing = useIsNodeEditing(props.uuid);
    
    const editContent = (
        <div className="my-editor-overlay">
            <input 
                value={props.value}
                onChange={...}
                autoFocus
            />
        </div>
    );

    const displayContent = (
        <span>{props.value || "Click to edit"}</span>
    );

    return (
        <Container 
            {...props} 
            className={isEditing ? 'editing' : ''}
            editContent={editContent}
        >
            {displayContent}
        </Container>
    );
}
```

### CSS Styling

Use shared overlay classes from `src/resume/OverlayEditing.scss`:

```scss
.resume-overlay-editor {
    // Shared shell: surface, spacing, border, and shadow
}

.resume-overlay-field {
    // Shared form layout
}

.resume-overlay-input,
.resume-overlay-textarea,
.resume-overlay-save-button {
    // Shared controls and focus states
}

.resume-overlay-editor--markdown {
    // Markdown-specific textarea sizing
}

.resume-overlay-editor--image {
    // Image-specific width and monospace source textarea
}

/* Visual indicator that component is being edited */
.my-component.editing {
    opacity: 0.7;
    border-bottom: 2px dashed variables.$main;
}
```

### Stop Propagation

Always use `stopPropagation()` in edit overlays to prevent Container click handlers from interfering:

```tsx
<div className="editor-overlay" onClick={(e) => e.stopPropagation()}>
    {/* edit inputs */}
</div>
```

## Used In

- [Markdown.tsx](../../src/resume/Markdown.tsx) - Markdown content editing (overlay)
- [Image.tsx](../../src/resume/Image.tsx) - Image src/alt editing (overlay)

## When to Use Overlay Editing

Use overlay editing only when inline input rendering would significantly distort layout or cause disruptive reflow. If inline inputs are visually stable, prefer inline editing instead.

## Keyboard Shortcuts

Edit components use `useEditingControls` hook:
- **Escape** - Cancel editing
- **Ctrl+Enter** - Save (for multi-line text)
- **Enter** - Save (for single-line text)

## Overlay Implementation

The overlay is rendered via a portal and positioned over the trigger element in:
- [src/resume/infrastructure/OverlayEditor.tsx](src/resume/infrastructure/OverlayEditor.tsx)

The overlay is mounted by `Container` when `editContent` is provided:
- [src/resume/infrastructure/Container.tsx](src/resume/infrastructure/Container.tsx)

## Benefits

✓ **Stable Layout** - Content doesn't shift during editing
✓ **Better UX** - Users see context of what they're editing
✓ **Less Disruptive** - Edit UI overlays rather than replaces
✓ **Mobile Friendly** - Compact popover takes less space
