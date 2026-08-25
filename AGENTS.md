# AGENTS.md

## Product Scope

- Treat Experiencer OSS as a complete local-first résumé editor. Bug fixes, security, accessibility, compatibility, performance, templates, and regressions are in scope.
- Keep this repository Pro-agnostic. Do not add cloud accounts, billing, entitlements, hosted revision history, custom-template persistence, or Pro terminology.
- Generic extension points are welcome when independently useful to the public editor; private product policy belongs in the consuming Pro repository.

## Architecture

- Treat React components as view adapters. Keep workflows, persistence, cross-store coordination, observer policy, and other reusable behavior in framework-neutral stores, services, coordinators, or utilities under `src/shared`.
- Do not introduce React Context for business state. Keep hooks small: subscribe, bind events, invoke commands, or bridge a platform lifecycle. Effects must remain mechanical.
- Treat `src/app/Resume.tsx` as the application composition and mode-routing boundary. Do not add feature workflows, persistence, browser APIs, modal implementations, menus, or asynchronous orchestration there.
- Keep handwritten classes and non-obvious invariants concisely documented, especially lifecycle, stale-request, persistence, and rendering boundaries.

## Resume Components

- Follow `src/resume/AGENTS.md` for component-specific editing and event rules.
- Register résumé node capabilities through the canonical schema rather than creating parallel type knowledge.
- Preserve semantic node structure, extraction order, and read-only behavior across editor, preview, print, and export surfaces.

## Canonical Resume Document Rendering

- Follow `docs/RESUME-DOCUMENT-PIPELINE.md` for the current rendering contract.
- Treat `createResumeDocumentSource` → `prepareResumeDocument` → a rendering adapter as the only canonical document pipeline. Do not scrape the live editor DOM or reconstruct résumé markup and CSS independently.
- Authored CSS must remain standalone and must not contain `#resume`. Only the editor adapter scopes selectors to its private `#resume` host. The server-owned public-review shell is an infrastructure exception, not authored or persisted CSS.
- Standalone targets receive only résumé-owned CSS and requested font stylesheets. Never copy application styles, host theme attributes, editor state, or application DOM into a résumé document.
- Extend the canonical target/root types for every new rendering surface and add contract coverage for markup, stylesheet isolation, page size, fonts, and editor-only element removal.

## State and Browser Persistence

- Own durable UI preferences and onboarding state in framework-neutral stores with injected persistence adapters. React components may subscribe and issue commands but must not access browser storage directly for these concerns.
- Use stable namespaced keys, validate stored data, tolerate unavailable or malformed storage, and synchronize storage events when cross-tab consistency is expected.
- Keep document persistence in the document repository. Do not turn a presentation-preference store into a second document store.

## Testing

- Mock only external or process boundaries. Exercise deterministic in-process code directly and keep at least one real-path integration or contract test for hermetic dependencies that are mocked elsewhere.
- Prefer observable behavior over implementation interactions.
- A regression observed through navigation, an iframe, popup, print/export output, browser storage, responsive resizing, or another browser boundary must have at least one regression test at that same boundary. Unit or store-state assertions alone are insufficient.
- Run `npm test` for Jest coverage, `npm run test:e2e` for browser behavior, `npm run schema:check` for schema changes, and `npm run build` before handing off a completed cross-cutting change.

## Styling

- Use the shared button and palette systems instead of feature-local action colors.
- Follow `src/sass/colors/AGENTS.md` and `src/sass/spacing/AGENTS.md` for app styling. Do not apply app utility classes inside exported résumé content.
- Use modern Sass modules and functions; do not reintroduce deprecated `@import`, slash division, or legacy color helpers.

## Documentation

- Keep architecture documentation current and timeless. Put subjective ratings, transient test counts, recent-update lists, and temporary implementation status in dated audits or changelogs instead.
- Delete superseded documentation and update inbound links. Historical documents must be clearly labeled as historical and must point to current guidance.
- Treat this file as the canonical agent guide. `CLAUDE.md` and `.claude/` exist only as compatibility pointers and must not define independent rules.

## Tooling

- The current application uses React, TypeScript, Vite, Jest, Playwright, Popright, and modern Sass. Read `package.json` rather than copying version claims into documentation.
- Use `npm run dev`, `npm run build`, `npm test`, and `npm run test:e2e`; do not restore obsolete Webpack, Create React App, or legacy-peer-dependency workflows.

## Git Workflow

- Continue on the current branch unless the user explicitly requests another branch.
- Do not commit or push unless explicitly requested. If the user requests an acceptance-testing checkpoint, wait for acceptance before submission.
