# Resume Document Pipeline

This document defines the canonical path from persisted résumé data to every rendered document. It is current architecture and applies to the editor, read-only previews, print, HTML export, PNG capture, render-service output, and public review snapshots.

## Core invariant

Persisted résumé data and authored CSS describe a standalone document. They do not know about the Experiencer application shell or its private editor host.

Every rendering consumer follows the same pipeline:

```text
ResumeSaveData
    → createResumeDocumentSource
    → prepareResumeDocument(target)
    → target-specific rendering adapter
```

Consumers must not scrape the live editor DOM, copy compiled application CSS, inherit the host application's theme, or recreate selector transformation independently.

## Source preparation

`src/shared/resumeDocument/prepareResumeDocument.ts` owns the target and root model.

`createResumeDocumentSource`:

- deep-copies saved nodes and assigns runtime UUIDs;
- serializes the authored root and built-in CSS trees;
- removes legacy editor-host selectors from old saved data through `normalizeResumeCssSelectors`;
- carries page size, requested fonts, and the accessible document label.

Legacy `#resume` selectors are normalized only while loading saved data. New selectors containing `#resume` are rejected before mutation so the private host cannot return to persisted CSS.

## Target preparation

`prepareResumeDocument` is the policy boundary. It decides the root shape, read-only state, stylesheet handling, width, and minimum page height.

| Target | Root | CSS behavior | Intended consumer |
| --- | --- | --- | --- |
| `editor` | `editor-host` | Scope every ordinary selector to private `#resume` | Interactive editor |
| `isolated-preview` | `document-body` | Validate authored standalone CSS | History and template iframe previews |
| `standalone-preview` | `document-body` | Validate authored standalone CSS | Dedicated preview routes |
| `print` | `document-body` | Validate authored standalone CSS | Popup print document |
| `export` | `document-body` | Validate authored standalone CSS | Downloadable HTML package |
| `png` | `document-body` | Validate authored standalone CSS | Browser image capture |
| `render-service` | `document-body` | Validate authored standalone CSS | Isolated rendering routes/services |
| `public-review` | `public-review-shell` | Validate authored CSS; server scopes its sanitized copy to its own shell | Temporary public review snapshot |

The public-review `#resume` element is a server-owned containment boundary. It is not the editor host, is not persisted, and does not permit authored CSS to target `#resume`.

## Selector rules

`src/shared/utils/transformResumeStylesheet.ts` uses `css-tree` for parsing and transformation.

- Selector lists are transformed member by member. For example, `.first, .second` becomes `#resume .first, #resume .second` in the editor.
- `:root`, `html`, and `body` map to the editor host when rendering the editor.
- Keyframe selectors are not scoped as document selectors.
- Authored stylesheets are parsed strictly and rejected when malformed or when an ordinary selector references `#resume`.
- Standalone outputs retain authored selectors exactly after validation.

Do not add string-based selector rewriting or another CSS parser.

## Browser document isolation

`src/shared/resumeDocument/browserResumeDocument.ts` owns browser-document setup.

The only retained or installed stylesheet resources are:

- `#resume-document-stylesheet` for authored résumé CSS;
- `#resume-document-builtin-fonts` for requested bundled fonts;
- `#resume-document-google-fonts` for the validated Google Fonts request.

The iframe or dedicated document body is the résumé canvas. It receives page-size metadata, width, minimum height, centered margins, and read-only pointer behavior. Application stylesheets and application `data-theme` attributes are not document dependencies.

`ResumePreviewFrame` uses an empty `srcdoc` document and portals `ResumeRenderer` directly into its body. `StandaloneResumePreview` uses the dedicated route's body. `mountResumeDocument` creates an off-screen isolated iframe for capture and owns its complete cleanup lifecycle.

## Markup and output

`renderResumeMarkup` renders an isolated `ResumeRenderer` instance from a prepared document.

- Document-body targets return the renderer descendants without an outer `#resume` wrapper.
- The public-review target returns its server-owned containment shell.
- Read-only targets omit editing controls and page-break labels while preserving semantic page-break elements.

`PrintHelpers` adds only print page-size rules, document CSS, markup, and font assets to a new popup or export package. PNG capture and render-service consumers use the same prepared-document contract rather than the editor DOM.

## Required coverage

Changes to this pipeline require focused unit/contract tests and browser coverage proportional to the affected targets. At minimum, preserve assertions that:

- only the editor target scopes CSS to `#resume`;
- selector lists and document-root selectors transform correctly;
- malformed or newly authored `#resume` selectors are rejected;
- legacy saved selectors normalize without weakening validation;
- standalone markup contains body descendants and no editor host;
- public-review markup alone contains its server-owned shell;
- iframe heads contain résumé CSS and font stylesheets but no application stylesheet;
- previews do not inherit application theme attributes;
- page size and minimum height reach the target document;
- print/export omit editor-only controls and labels;
- target teardown removes temporary roots, frames, and installed head resources.

When a defect is visible only in an iframe, popup, export, screenshot, or dedicated route, a state-only unit test is not sufficient. Add a test at the failing browser boundary.

## Template themes

Built-in theme catalogs own names, swatch fills, and pure stylesheet transforms. The shared
`applyTemplateTheme` service gives each transform fresh root and built-in CSS trees from the
selected template's default document. Transforms may change either tree; palette helpers
are conveniences, not a restriction to color substitution.

The template selector owns the current theme only while choosing a template. It previews the
transformed document through `ResumePreviewFrame` and passes that same document into the
creation port. Persisted documents contain the resulting CSS, never a theme identifier.
Subsequent catalog changes cannot restyle existing documents. Changing themes always starts
from the default document; it never layers transforms or infers a theme from arbitrary CSS.

Additional catalogs may supply their own transforms through the generic selector option.
Creation remains owned by that option's command. Options without themes retain their existing
preview and creation behavior. Swatches support any CSS background fill, including split colors,
and use named native radio controls so selection does not depend on perceiving color.
