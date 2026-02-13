# State Management Stores

This directory contains Zustand stores for global application state.

## Store Architecture

### 1. `editorStore.ts` - UI Selection State
Manages which resume node is currently selected and being edited.

**State:**
- `selectedNodeId` - ID of selected node
- `isEditingSelected` - Whether selected node is in edit mode

**Use for:** UI interactions, highlighting, showing/hiding editors

### 2. `resumeStore.ts` - Resume Data Structure
Manages the resume content tree using `ResumeNodeTree` class.

**State:**
- `tree` - Instance of ResumeNodeTree containing all resume data
- `unsavedChanges` - Flag indicating if there are unsaved modifications

**Actions:**
- `setNodes` - Replace entire tree (for loading)
- `addNode` - Add child node to parent
- `deleteNode` - Remove node by ID
- `updateNode` - Update node property
- `moveNodeUp/Down` - Reorder siblings

**Use for:** All resume content mutations

### 3. `historyStore.ts` - Undo/Redo State
Manages time-travel for resume edits.

**State:**
- `past` - Array of previous states (max 50)
- `future` - Array of future states (for redo)

**Actions:**
- `undo` - Restore previous state
- `redo` - Restore next state
- `clear` - Reset history
- `canUndo/canRedo` - Check availability

**Use with:** `useRecordHistory()` hook to snapshot state before mutations

## Usage Examples

### Basic Resume Editing

```typescript
import { useResumeStore, useRecordHistory } from '@/shared/stores/resumeStore';
import { useHistoryStore } from '@/shared/stores/historyStore';

function ResumeEditor() {
  const nodes = useResumeNodes();
  const addNode = useResumeStore(state => state.addNode);
  const recordHistory = useRecordHistory();
  
  const handleAddSection = () => {
    recordHistory(); // Snapshot BEFORE mutation
    addNode([0], { type: 'Section', title: 'New Section' });
  };
  
  return (
    <div>
      {/* Render resume */}
    </div>
  );
}
```

### Undo/Redo UI

```typescript
import { useHistoryStore, useCanUndo, useCanRedo } from '@/shared/stores/historyStore';

function UndoRedoButtons() {
  const { undo, redo } = useHistoryStore();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  
  return (
    <>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
    </>
  );
}
```

### Selection + Editing

```typescript
import { useEditorStore } from '@/shared/stores/editorStore';
import { useResumeNode } from '@/shared/stores/resumeStore';

function NodeComponent({ nodeId }) {
  const isSelected = useEditorStore(state => state.selectedNodeId === nodeId);
  const isEditing = useEditorStore(state => 
    state.selectedNodeId === nodeId && state.isEditingSelected
  );
  const node = useResumeNode(nodeId);
  
  return (
    <div className={isSelected ? 'selected' : ''}>
      {isEditing ? <Editor node={node} /> : <Display node={node} />}
    </div>
  );
}
```

## Migration from ObservableResumeNodeTree

The old `ObservableResumeNodeTree` class combined:
1. Tree data structure (now: `ResumeNodeTree` class)
2. Observable pattern (now: Zustand subscriptions)
3. Undo/redo (now: `historyStore`)

**Old way:**
```typescript
const tree = new ObservableResumeNodeTree();
tree.subscribe(callback);
tree.addNestedChild(id, node); // Mutates + notifies + saves history
tree.undo();
```

**New way:**
```typescript
// Separate concerns
const recordHistory = useRecordHistory();
const addNode = useResumeStore(state => state.addNode);
const { undo } = useHistoryStore();

// Explicit history recording
recordHistory();
addNode(id, node);

// Undo when needed
undo();
```

## Benefits

1. **Separation of Concerns**: Each store has one responsibility
2. **Performance**: Fine-grained subscriptions (only re-render what changed)
3. **DevTools**: Redux DevTools integration for debugging
4. **Testability**: Pure actions, easy to mock
5. **Scalability**: Easy to add features (persist, sync, middleware)
6. **Type Safety**: Full TypeScript support

## Design Principles

- **Immutability**: Use Immer middleware for safe mutations
- **Single Source of Truth**: One store per concern
- **Selective Subscriptions**: Components only subscribe to what they need
- **Action-based**: All mutations through explicit actions
- **History Limit**: Cap undo stack at 50 to prevent memory issues
