# ResumeContextMenu → Container Migration

**Quick Win Completed**: ✅ Moved editability from static list to schema registry

## What Changed

### 1. Schema Now Tracks Editability

**ResumeNodeDefinition** now has optional `isEditable?: boolean` field.

**ComponentTypes** now tracks editable nodes:
- Added `_editableTypes: Set<string>`
- Added `isEditable(type: string): boolean` getter
- Populates set during `registerNodeType()`

**Node Registrations** mark which nodes are editable:
- MarkdownText: `isEditable: true`
- Link: `isEditable: true`
- All others: not set (defaults to false)

### 2. Why This Matters

**Before**: ResumeContextMenu had a hard-coded static list
```typescript
static Editable = new Set<string>([
    MarkdownText.type,
    Link.type
]);
```

**Now**: This information comes from the schema registry (single source of truth)

## Next Steps: Integrate with Container

Container should now:

1. Query schema for editability: `ComponentTypes.instance.isEditable(node.type)`
2. Pass `isEditable` to ContainerPresentation as a prop
3. ContainerPresentation can use it to:
   - Show "Edit" option in context menu
   - Enable/disable edit mode
   - Conditionally render edit triggers

### Container Changes Needed

```typescript
// In Container.tsx connected wrapper
export default function Container(props: ContainerProps) {
    const isSelected = useIsNodeSelected(props.uuid);
    const isEditingNode = useIsNodeEditing(props.uuid);
    const selectNode = useEditorStore((state) => state.selectNode);
    const editNode = useEditorStore((state) => state.editNode);
    
    // NEW: Check if node is editable via schema
    const isEditable = ComponentTypes.instance.isEditable(props.uuid);

    return (
        <ContainerPresentation
            {...props}
            isSelected={isSelected}
            isEditing={isEditingNode}
            isEditable={isEditable}  // NEW
            onSelect={selectNode}
            onEdit={editNode}
            onContextMenuOpen={selectNode}
        />
    );
}
```

### ContainerPresentation Changes Needed

```typescript
export interface ContainerPresentationProps extends ContainerProps {
    isSelected: boolean;
    isEditing: boolean;
    isEditable: boolean;  // NEW
    
    onSelect: (uuid: string) => void;
    onEdit: (uuid: string) => void;
    onContextMenuOpen: (uuid: string) => void;
}

export function ContainerPresentation(props: ContainerPresentationProps) {
    // Can now conditionally render based on props.isEditable
    // Example: Show "Edit" option in context menu only if isEditable
}
```

### ResumeContextMenu Simplification

ResumeContextMenu can then be simplified:
1. Remove `static Editable = new Set<string>([...])`
2. Query Container for `isEditable` prop instead
3. Eventually, move all context menu logic into Container

## Benefits

✅ Single source of truth (schema registry)
✅ Eliminates static lists scattered in UI code
✅ Container becomes the interaction hub
✅ Easier to add new node properties later
✅ Schema defines behavior, UI implements it

## Files Modified

- `src/resume/schema/ResumeNodeDefinition.ts` - Added `isEditable?: boolean`
- `src/resume/schema/ComponentTypes.ts` - Added `_editableTypes` tracking and `isEditable()` getter
- `src/resume/schema/index.ts` - Registered MarkdownText and Link as `isEditable: true`

## Test Status

✅ All 54 tests passing
✅ No regressions from schema changes
