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
// $value / 2;
// lighten($color, 10%);
// darken($color, 10%);
// transparentize($color, 0.5);
```

## Naming Conventions
- Use kebab-case for class names: `link-editing`
- Prefix component-specific classes: `.resume-component`
- Use BEM for complex components when appropriate
