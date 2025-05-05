# WE-FAB Style Guide

This document outlines the implementation of the WE-FAB brand style guide in the application.

## Implementation Details

The style guide has been implemented through the following changes:

1. **Created a Variables File**
   - Location: `src/assets/scss/variables.scss`
   - Contains all brand colors, typography settings, and spacing variables

2. **Updated Global Styles**
   - Location: `src/styles.scss`
   - Imports the variables first, then Bootstrap
   - Adds global typography classes and utility color classes

3. **Added Font**
   - Imported Inter font family from Google Fonts
   - Applied font weights: Regular (400), Medium (500), Semibold (600), Bold (700)

4. **Created Style Guide Documentation**
   - Location: `src/assets/style-guide.html`
   - Visual documentation of all brand elements
   - Access at `/assets/style-guide.html` in the browser

5. **Updated Component Styles**
   - Updated all component SCSS files to use the new variables
   - Consistent use of brand colors and typography

## Brand Colors

### Primary Colors
- Blueprint Blue: #1A3A5F - Primary brand color
- Technical White: #F6F7F9 - Background color
- Precision Black: #1A1D21 - Text color

### Secondary/Accent Colors
- Machine Gray: #545A64 - Secondary elements
- Material Finish Silver: #D1D5DB - Borders, backgrounds
- Safety Orange: #FF5722 - CTAs, highlights, error states
- Process Green: #12856E - Success states, progress

## Typography

- **Font Family:** Inter
- **Weights:** Regular (400), Medium (500), Semibold (600), Bold (700)

### Type Scale
- Display: 48px / Bold
- Heading 1: 36px / Bold
- Heading 2: 30px / Semibold
- Heading 3: 24px / Semibold
- Heading 4: 20px / Medium

### Body Text Styles
- Body Large: 16px / Regular / Line height: 1.6
- Body Default: 16px / Regular / Line height: 1.5
- Body Small: 14px / Regular / Line height: 1.4
- Caption: 12px / Regular / Line height: 1.3

## Usage

### Utility Classes

Color classes are available for both background and text:
```html
<div class="bg-blueprint-blue">Blue background</div>
<p class="text-safety-orange">Orange text</p>
```

Typography classes:
```html
<p class="body-large">Larger body text</p>
<p class="body-default">Default body text</p>
<p class="body-small">Smaller body text</p>
<p class="caption">Caption text</p>
```

### Variables in SCSS

In component SCSS files, use the variables directly:
```scss
.my-component {
  color: $blueprint-blue;
  background-color: $technical-white;
  border: 1px solid $material-finish-silver;
}
``` 