# Design Patterns & Best Practices

This document outlines key design patterns used throughout the Experiencer codebase.

## Presentation Component + Store-Aware Wrapper (Recommended)

This is the **preferred pattern** for any component that uses Zustand stores.

### Quick Example

```typescript
// ✅ GOOD: Presentation + Connected Wrapper Pattern
// File: MyComponent.tsx

// 1. Presentational component (testable, no stores)
export interface MyComponentPresentationProps {
    isSelected: boolean;
    onSelect: () => void;
}

export function MyComponentPresentation(props: MyComponentPresentationProps) {
    return (
        <div onClick={props.onSelect}>
            {props.isSelected && <span>Selected!</span>}
        </div>
    );
}

// 2. Connected wrapper (hooks + prop passing)
export default function MyComponent() {
    const isSelected = useIsNodeSelected();
    const selectNode = useEditorStore((state) => state.selectNode);

    return (
        <MyComponentPresentation
            isSelected={isSelected}
            onSelect={() => selectNode("id")}
        />
    );
}
```

### Testing

```typescript
// Tests use the presentation component directly
describe("MyComponentPresentation", () => {
    test("renders selected state", () => {
        const { getByText } = render(
            <MyComponentPresentation isSelected={true} onSelect={jest.fn()} />
        );
        expect(getByText("Selected!")).toBeTruthy();
    });
});
```

### Why This Pattern?

| Aspect | Benefit |
|--------|---------|
| **Testing** | No store mocks needed. Pass props, verify output. |
| **Maintainability** | Store changes don't require component logic changes. |
| **Readability** | Props show all dependencies upfront. |
| **Reusability** | Component isn't locked to Zustand implementation. |
| **Performance** | Easier to optimize re-renders with memo. |

### Why NOT Store Mocks?

❌ **Store mocks are brittle:**
- Require updating mocks when store structure changes
- Mock setup code is complex and error-prone
- Tests become tightly coupled to store implementation
- Hard to maintain across multiple test files

✅ **Props are stable:**
- Props define a clear contract
- Component logic tested in isolation
- Store integration tested separately if needed
- Much faster to write and maintain

## When NOT to Use This Pattern

- Simple leaf components with no store interaction
- One-off utilities or helper components
- Components that only display data (no events)
- Wrapper components with no logic

## Other Patterns

### Registry Pattern (ComponentTypes)

Used for managing node type metadata:

```typescript
class ComponentTypes {
    private static readonly registry = new Map<string, NodeDefinition>();

    static registerNodeType(type: string, definition: NodeDefinition) {
        this.registry.set(type, definition);
    }

    static get instance() {
        return this;
    }

    get childTypes() {
        return this.registry.get('childTypes') || [];
    }
}
```

**Used for:**
- Centralizing node metadata
- Avoiding scattered switch statements
- Supporting dynamic node types

### Zustand Store Hooks

Keep store interaction at the wrapper level:

```typescript
// ✅ GOOD: Use hooks in connected wrapper
export default function Component() {
    const state = useEditorStore((state) => state.selection);
    // ...
}

// ❌ AVOID: Using hooks directly in presentation
export function ComponentPresentation(props) {
    const state = useEditorStore(); // Don't do this
    // ...
}
```

## File Organization

Follow this structure for store-connected components:

```
src/
├── components/
│   ├── MyComponent/
│   │   ├── index.tsx          # Default export (connected wrapper)
│   │   ├── MyComponent.tsx    # Named export (presentation)
│   │   └── __tests__/
│   │       └── MyComponent.test.tsx  # Test presentation only
```

Or as a single file if simple:

```
src/
├── components/
│   ├── MyComponent.tsx  # Contains both presentation + wrapper
```

## Testing Strategy

### Component Tests (Presentation)

Test the component logic in isolation:

```typescript
import { MyComponentPresentation } from "@/components/MyComponent";

describe("MyComponentPresentation", () => {
    test("handles click correctly", () => {
        const onSelect = jest.fn();
        const { getByRole } = render(
            <MyComponentPresentation 
                isSelected={false}
                onSelect={onSelect}
            />
        );
        fireEvent.click(getByRole("button"));
        expect(onSelect).toHaveBeenCalled();
    });
});
```

### Integration Tests (Store)

Test the wrapper with real/mocked store if needed:

```typescript
// Rarely needed - usually presentation tests are sufficient
describe("MyComponent", () => {
    it("integrates with store", () => {
        // Test happens at higher level (Resume component tests)
    });
});
```

## Summary

| Pattern | Use When | Benefits |
|---------|----------|----------|
| **Presentation + Wrapper** | Component uses Zustand stores | Easy to test, flexible, clear props |
| **Registry** | Managing node types/metadata | Centralized, avoids switch statements |
| **Zustand Hooks** | Reading/writing store state | Simple, performant subscriptions |
