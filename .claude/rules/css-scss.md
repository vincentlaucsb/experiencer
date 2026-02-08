---
paths:
  - "**/*.scss"
---

# CSS/SCSS

## Modern SCSS Syntax
Use modern Sass modules:
```scss
@use 'sass:math';
@use 'sass:color';
@use 'variables';

.my-class {
    margin: math.div(variables.$spacing, 2);
    background: color.adjust($primary, $lightness: 10%);
}
```

## Avoid Deprecated Syntax
```scss
// DON'T USE:
// @import 'file';
// $value / 2;                    // Use calc() or math.div() instead
// lighten($color, 10%);
// darken($color, 10%);
// transparentize($color, 0.5);
```

## Division Operators

SASS deprecated the `/` operator for division (as of Dart Sass 1.33.0). Use one of these:

1. **Use `calc()` for CSS output** (recommended for most cases):
   ```scss
   margin: calc(variables.$spacing / 4);
   ```
   Produces native CSS `calc()` which works at runtime.

2. **Use `math.div()` for pure SASS math** (when you need computed values in SASS):
   ```scss
   @use "sass:math";
   $computed: math.div(variables.$spacing, 4);
   ```

**When to use each:**
- `calc()` → When value is used directly in CSS properties (most common)
- `math.div()` → When you need the computed value for SASS logic or conditionals

**Reference:** https://sass-lang.com/d/slash-div

## Naming Conventions
- Use kebab-case for class names: `link-editing`
- Prefix component-specific classes: `.resume-component`
- Use BEM for complex components when appropriate
