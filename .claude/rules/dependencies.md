# Dependencies

## Installation
Always use legacy peer deps flag:
```bash
npm install <package> --legacy-peer-deps
```

## Known Compatibility Issues
- **react-contextmenu**: Doesn't support React 19, use --legacy-peer-deps
- **react-tiny-popover**: Uses named export `{ Popover }`
- **react-quill**: Compatible with React 18 (not 19) - reason we stayed on React 18

## Updating Dependencies
1. Check compatibility with React 18
2. Test thoroughly after updates
3. Always use --legacy-peer-deps flag
4. Update docs/MIGRATION.md with breaking changes
