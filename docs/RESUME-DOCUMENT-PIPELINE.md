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
- `#resume-document-pagination` for adapter-owned physical page geometry;
- `#resume-document-builtin-fonts` for requested bundled fonts;
- `#resume-document-google-fonts` for the validated Google Fonts request.

The iframe or dedicated document body is the résumé canvas. It receives page-size metadata, width, minimum height, centered margins, and read-only pointer behavior. Application stylesheets and application `data-theme` attributes are not document dependencies.

`ResumePreviewFrame` uses an empty `srcdoc` document and portals `ResumeRenderer` directly into its body. `StandaloneResumePreview` uses the dedicated route's body. `mountResumeDocument` creates an off-screen isolated iframe for capture and owns its complete cleanup lifecycle.

## Markup and output

`renderResumeMarkup` renders an isolated `ResumeRenderer` instance from a prepared document.

- Document-body targets return the renderer descendants without an outer `#resume` wrapper.
- The public-review target returns its server-owned containment shell.
- Read-only targets omit editing controls and page-break labels while preserving semantic page-break elements.

Explicit page breaks may occur at the root or directly inside a column. The contextual
“Page break before” action inserts a sibling of the selected section in its owning flow.
Editor filler measurements are independent for sibling columns; a break in one column
does not advance the other. Minimum canvas height uses the longest parallel column flow
and includes subsequent sequential rows. Print/export retain the authored break rules
and let the browser paginate rather than persisting editor filler heights.

For sparse column continuations, built-in layouts stretch their owning normal-flow row
through the minimum page canvas. Direct body-grid rails paint their repeating panel on
the root canvas, so native fragmentation cannot truncate its background after the last
line of text. Native PDF, browser print and HTML export share `resumePrintGeometry`:
cloned root insets reduce the retained logical continuation extent, preventing a blank
extra page. Ordinary documents and direct body grids retain content-driven pagination.
Print and saved-PDF adapters install a zero-specificity body-margin fallback before
measuring root insets, so browser defaults cannot become authored page padding.
Authored résumé margins still take precedence.


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


## Private document addendum

The optional `ResumeSaveData.notes` object retains Markdown and inherited template guidance through JSON import/export and repository persistence. It is document metadata, not a resume node. `createResumeDocumentSource` deliberately omits it: adapters must never render notes or copy them into output markup, stylesheets, public review data, or PDF metadata.

Entry nodes may carry private `notes` Markdown alongside their fields. Tree persistence retains it; `prepareResumeDocument` strips it recursively for every non-editor target. Host-owned node actions expose note indicators and access points only in the editing UI. General note edits are capped at 8,000 characters; importing legacy guidance does not truncate it.


## Text overflow diagnostics

The shared `measureResumeTextOverflow` utility reads painted text ranges against page bounds,
column content boxes, and clipping ancestors. It reports bounded numeric geometry and runtime node
IDs, never resume text, contact strings, authored IDs, or complete DOM measurements. The editor's
transient notice stays outside the document root, and the print command offers return/continue
review before opening the print window. Standalone render-service consumers reuse the utility;
neither path changes authored CSS or reflows saved documents. Print, export, and public review do
not contain the editor notice. The observer coalesces layout mutations and asset/style changes and
releases its observers and pending animation frame when the editor unbinds.

## Physical page insets

Paged read-only adapters use `resumePagination` and `getResumePrintGeometry` to share one measured geometry snapshot with PNG capture, saved PDFs, and print-pagination measurement. Print popups and HTML export measure the same authored geometry for every document, including documents with no explicit page break.

Authored vertical body margins join body padding as repeated fragment insets. Padded parallel columns retain their own insets through `box-decoration-break: clone`; adding a second body inset would change their first page. A document without either arrangement receives continuation insets from `--resume-page-inset`, then `--edge-margin`, then a half-inch default. An explicit `--resume-page-inset: 0` permits deliberate zero insets. First/last flow compensation retains existing full-bleed first-page design rather than moving a header or adding padding twice. These rules are adapter infrastructure and never mutate saved CSS.

Chromium 145 and later can display physical pages as vertically wrapped native CSS columns. PNG/render-service and read-only previews use that fragmentation rather than cutting an unbroken flow into paper-height images. Unsupported screen engines retain continuous preview; native print still uses the shared fragment insets. The editing canvas remains continuous, with its existing page guides, and is not treated as the source of physical print geometry.

The pagination stylesheet and inline adapter geometry have an explicit cleanup lifecycle. A portal-only application mount is excluded before measuring direct-body grid children. Host chrome rules must stop matching once the body becomes a résumé document; a saved-PDF host reset must not erase authored padding before measurement.
