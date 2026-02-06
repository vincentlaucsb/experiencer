# Build & Development

## Webpack & Asset Handling
- SVGs: Loaded as resources (not inlined) for `<img src>`
- Icons: Store in `src/icons/feather/`
- Fonts: Use CSS imports from `src/fonts/`

## Development Commands
```bash
npm start    # Dev server with HMR on port 3000
npm build    # Production build to /build
npm test     # Run Jest tests
```

## Hot Module Replacement
- React Refresh enabled in development
- Automatic reload on file changes
- Preserves component state when possible

## Code Splitting
- Vendors chunk automatically created for node_modules
- Runtime chunk separated for better caching
- CSS extracted in production builds
