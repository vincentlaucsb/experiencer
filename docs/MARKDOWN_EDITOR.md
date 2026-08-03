# Markdown editor integration

Experiencer stores Markdown text as the canonical value for `Markdown` resume
nodes. Rendering, printing, export, undo/redo, and persistence do not depend on
the editing library.

## Current choice

The bundled editing surface is `@uiw/react-md-editor` version `4.1.1`.

It provides a formatting toolbar while preserving the original Markdown string.
The editor defaults to compact source edit mode so it does not consume resume
screen space; the resume canvas remains the visual preview. It is intentionally
described as **visual Markdown** rather than full WYSIWYG: the Markdown source
remains visible and is never converted through an HTML round-trip.

The editor is adapted in `src/resume/markdownEditor/UiwMarkdownEditor.tsx`.
The resume node only depends on the `MarkdownEditorProps` contract in
`src/resume/markdownEditor/types.ts`.

## Replacing the editor

Implement a React component with the `MarkdownEditorProps` contract and
register it during application startup:

```tsx
import {
    configureMarkdownEditor,
    type MarkdownEditorComponent,
} from "@/resume/markdownEditor";

const MyMarkdownEditor: MarkdownEditorComponent = ({
    value,
    onChange,
    id,
    ariaLabel,
    autoFocus,
    placeholder,
}) => (
    <textarea
        id={id}
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoFocus={autoFocus}
        placeholder={placeholder}
    />
);

configureMarkdownEditor(MyMarkdownEditor);
```

The adapter must call `onChange` with Markdown text, not rendered HTML. Do not
change the `Markdown` node schema or persistence format when replacing the UI.
`TextareaMarkdownEditor` is retained as a dependency-free fallback/reference
implementation.

## Compatibility checklist

Before changing the adapter, verify:

- Existing Markdown syntax is preserved exactly when untouched.
- Headings, lists, emphasis, links, blockquotes, code, and horizontal rules
  render in the resume and in print/export.
- Escape restores the original value; Save and Ctrl/Cmd+Enter retain their
  current behavior.
- The editor is keyboard accessible and exposes the supplied `ariaLabel`.
- The editor stays inside the resume overlay at narrow viewport widths.
