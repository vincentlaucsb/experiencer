# Resume component instructions

- Keep one résumé node implementation per component file or component folder. Use a folder when a component owns colocated styles, toolbar options, or non-trivial helpers; do not keep both `Component.tsx` and `Component/index.tsx`.
- Do not compose one registered résumé node component inside another. Compose primitive HTML and non-node infrastructure such as `Container`; registered nodes own selection, editing, persistence, and tree identity.
- Render editable inline text through the shared inline Markdown path unless a component explicitly requires plain text. Keep editing controls as ordinary inputs or textareas.
- Interactive controls inside a selectable `Container` must stop propagation when their action must not select or toggle the containing node. Preserve keyboard and accessible-menu equivalents.
- A node can be edited only while selected. Derive that state through the shared editor-store selectors rather than maintaining a second component-local editing model.
- Preserve `readOnly` behavior in every rendering root. Editor-only controls, hints, labels, and selection behavior must not appear in previews, print, export, PNG, or render-service output.
- Register node capabilities and labels through the canonical schema. Do not attach parallel static type knowledge to components.
