# Context Menu Implementation Fix

## Problem
ResumeContextMenu was removed from Resume.tsx, but the context menu functionality was not migrated. Container was triggering the context menu with `id="resume-menu"`, but nothing was rendering the menu content.

## Solution
Created a new connected context menu component `ResumeContextMenuConnected` that:

1. **Connects to Zustand stores** to automatically track the selected node
2. **Queries the schema registry** for editability (using the recent refactoring)
3. **Renders dynamically** without requiring prop passing through Resume

## How It Works

### Before (Old ResumeContextMenu)
```tsx
// In Resume.tsx - had to manually pass props from stores
<ResumeContextMenu
    getNode={(uuid) => useResumeStore.getState().getNodeByUuid(uuid)}
    getParentUuids={(uuid) => useResumeStore.getState().getParentUuids(uuid)}
    currentId={useEditorStore.getState().selectedNodeId}
    editSelected={() => { ... }}
    updateSelected={this.updateSelected}
    selectNode={(uuid) => useEditorStore.getState().selectNode(uuid)}
/>
```

### Now (New ResumeContextMenuConnected)
```tsx
// In Resume.tsx - just render the connected component
<ResumeContextMenuConnected />

// Component internally queries stores
export function ResumeContextMenuConnected() {
    const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
    const editNode = useEditorStore((state) => state.editNode);
    // ... rest of store subscriptions
    
    // Queries schema for editability
    const isEditable = ComponentTypes.instance.isEditable(currentNode.type);
}
```

## Benefits

✅ **Cleaner Resume component** - No need to pass store data manually
✅ **Uses schema registry** - Editability is now a registration concern
✅ **Automatic updates** - Menu updates when selectedNodeId changes (store subscriptions)
✅ **Consistent with new patterns** - Follows the presentation/wrapper pattern like Container
✅ **Container remains clean** - Just triggers menu, doesn't provide content

## Context Menu Features

The menu now provides:

1. **Node Type Header** - Shows the type of selected node
2. **Parent Selection** - Navigate up the tree via parent nodes
3. **Edit Option** - Only if node is editable (from schema registry)
4. **Custom Options** - Node-specific actions from schema
5. **Separator** - HR between edit option and custom options (only if editable)

## Container Integration

Container provides the trigger:
```tsx
<ContextMenuTrigger
    id="resume-menu"
    renderTag={displayAs}
    attributes={newProps}
    onContextMenu={handleContextMenu}
    disabled={props.isEditing}
>
    {children}
</ContextMenuTrigger>
```

ResumeContextMenuConnected provides the content:
```tsx
<ContextMenu id="resume-menu">
    {header}
    {menu}
    {hrule}
    {additionalOptions}
</ContextMenu>
```

They connect via the matching `id="resume-menu"`.

## Files Modified

- `src/controls/ResumeContextMenuConnected.tsx` (new)
- `src/app/Resume.tsx` (import and render new component)

## Test Results

✅ All 54 tests pass
✅ Build succeeds with no errors
✅ Context menu now appears on right-click with full functionality
