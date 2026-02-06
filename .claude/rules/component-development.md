# Component Development

## Prefer Function Components
New components should use function components with hooks:
```typescript
import React, { useContext } from 'react';

function MyComponent(props: MyComponentProps) {
    const context = useContext(ResumeContext);
    // ... component logic
}

MyComponent.type = 'My Component'; // Required for schema
export default MyComponent;
```

**Existing components use class-based style:**
- RichText, Entry, Section, Header, etc. are class-based
- These work fine but are legacy pattern
- Only refactor to functions if making significant changes

## Component Interface Pattern
Most components have Basic and full Props interfaces:
```typescript
interface BasicIconProps extends IconBase, BasicResumeNode {}
interface IconProps extends IconBase, ResumeComponentProps {}
```

## Component File Structure
- One component per file
- Co-locate related utilities
- Keep files under 300 lines when possible
- Use descriptive file names matching component names

## Composition Rules

**DO compose with:**
- ✅ Primitive HTML elements (`<input>`, `<span>`, `<div>`, `<a>`)
- ✅ Utility components that don't participate in the ResumeNode tree (`Container`, `Placeholder`)
- ✅ Third-party UI libraries (Quill, form controls, icons)
- ✅ Helper functions and processors

**DON'T compose with:**
- ❌ Other Resume node types (`TextField`, `RichText`, `Entry`, `Section`, etc.)

**Why?** Resume node types manage their own selection, editing state, and tree operations. Nesting them creates conflicting edit states and confusing UX (e.g., requiring multiple clicks to enter edit mode, unclear selection boundaries, doubled tree entries).

**Example - Bad:**
```typescript
// DON'T: Composing Resume node types
function Link(props: LinkProps) {
    return <Container {...props}>
        <TextField value={props.value} />  // ❌ TextField is a Resume node type
    </Container>;
}
```

**Example - Good:**
```typescript
// DO: Use primitive elements
function Link(props: LinkProps) {
    return <Container {...props}>
        <input value={props.value} />  // ✅ Plain HTML element
    </Container>;
}
```
