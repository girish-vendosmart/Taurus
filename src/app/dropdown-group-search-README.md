# PrimeNG Dropdown with Group Search Component

A powerful Angular component that extends PrimeNG's dropdown functionality with advanced group search capabilities. This component allows users to search both group names and individual options within groups, making it perfect for large datasets with hierarchical organization.

## Features

- ✅ **Group Search**: Search both group names and individual options
- ✅ **Highlight Matching Terms**: Visual highlighting of search results
- ✅ **Form Integration**: Full Angular Reactive Forms support
- ✅ **ControlValueAccessor**: Works seamlessly with form controls
- ✅ **Customizable**: Extensive configuration options
- ✅ **TypeScript Support**: Full type safety with interfaces
- ✅ **Responsive Design**: Mobile-friendly interface
- ✅ **Accessibility**: ARIA compliant and keyboard navigation
- ✅ **Debug Mode**: Optional debug information display

## Installation

This component requires PrimeNG to be installed in your Angular project:

```bash
npm install primeng @angular/animations
```

## Basic Usage

### 1. Import the Component

```typescript
import { PDropdownGroupSearchComponent, DropdownGroup } from './p-dropdown-group-search.component';

@Component({
  imports: [PDropdownGroupSearchComponent],
  // ... rest of component
})
```

### 2. Define Your Data

```typescript
export class MyComponent {
  options: DropdownGroup[] = [
    {
      label: 'Frontend Technologies',
      items: [
        { label: 'Angular', value: 'angular' },
        { label: 'React', value: 'react' },
        { label: 'Vue.js', value: 'vue' }
      ]
    },
    {
      label: 'Backend Technologies',
      items: [
        { label: 'Node.js', value: 'nodejs' },
        { label: 'Python', value: 'python' },
        { label: 'Java', value: 'java' }
      ]
    }
  ];
}
```

### 3. Use in Template

```html
<app-p-dropdown-group-search
  label="Select Technology"
  placeholder="Choose a technology..."
  [options]="options"
  (selectionChange)="onSelectionChange($event)">
</app-p-dropdown-group-search>
```

## Advanced Usage

### Form Integration

```typescript
// Component
export class MyFormComponent {
  form = this.fb.group({
    technology: ['', Validators.required]
  });

  constructor(private fb: FormBuilder) {}
}
```

```html
<!-- Template -->
<form [formGroup]="form">
  <app-p-dropdown-group-search
    label="Select Technology"
    formControlName="technology"
    [options]="options"
    [required]="true">
  </app-p-dropdown-group-search>
</form>
```

### Custom Property Names

```typescript
// Data with custom property names
productOptions: DropdownGroup[] = [
  {
    label: 'Electronics',
    items: [
      { name: 'Smartphone', id: 'phone-001', price: 699 },
      { name: 'Laptop', id: 'laptop-001', price: 1299 }
    ]
  }
];
```

```html
<!-- Template with custom property mapping -->
<app-p-dropdown-group-search
  [options]="productOptions"
  optionLabel="name"
  optionValue="id"
  placeholder="Search products...">
</app-p-dropdown-group-search>
```

## Component API

### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | `string` | `''` | Label text displayed above the dropdown |
| `placeholder` | `string` | `'Select an option'` | Placeholder text |
| `required` | `boolean` | `false` | Whether the field is required |
| `disabled` | `boolean` | `false` | Whether the dropdown is disabled |
| `description` | `string` | `''` | Help text displayed below the dropdown |
| `showClear` | `boolean` | `true` | Show clear button to reset selection |
| `appendTo` | `string` | `'body'` | Where to append the dropdown panel |
| `filterPlaceholder` | `string` | `'Search groups and options...'` | Search input placeholder |
| `showDebugInfo` | `boolean` | `false` | Show debug information (development only) |
| `options` | `DropdownGroup[]` | `[]` | Array of grouped options |
| `optionLabel` | `string` | `'label'` | Property name for option display text |
| `optionValue` | `string` | `'value'` | Property name for option value |
| `optionGroupLabel` | `string` | `'label'` | Property name for group display text |
| `optionGroupChildren` | `string` | `'items'` | Property name for group items array |

### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `selectionChange` | `EventEmitter<any>` | Emitted when selection changes |
| `filterChange` | `EventEmitter<string>` | Emitted when search filter changes |

### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `clearSelection()` | none | Clears the current selection |
| `selectOption(value)` | `value: any` | Programmatically select an option |
| `getSelectedOption()` | none | Returns the currently selected option |
| `refreshOptions(options)` | `options: DropdownGroup[]` | Updates the options data |

## Data Interfaces

### DropdownGroup

```typescript
interface DropdownGroup {
  label: string;           // Group display name
  items: DropdownGroupOption[]; // Array of options in this group
  disabled?: boolean;      // Whether the entire group is disabled
}
```

### DropdownGroupOption

```typescript
interface DropdownGroupOption {
  label: string;          // Option display text
  value: any;            // Option value
  disabled?: boolean;    // Whether this option is disabled
  [key: string]: any;   // Additional custom properties
}
```

## Search Functionality

The component provides intelligent search capabilities:

### Group Name Search
- Type a group name to filter and show all options within matching groups
- Example: Type "Frontend" to show all frontend technologies

### Option Search
- Type an option name to filter and show only matching options
- Example: Type "Angular" to show only Angular-related options

### Combined Search
- The search works across both group names and option names simultaneously
- Groups are shown if either the group name matches OR any option within the group matches

### Search Highlighting
- Matching text is highlighted with a yellow background
- Both group names and option names show highlighting

## Styling

The component includes built-in styles but can be customized:

```scss
// Custom styles
:host ::ng-deep {
  .dropdown-group-header {
    background-color: #your-color;
    color: #your-text-color;
  }
  
  .highlight {
    background-color: #your-highlight-color;
    font-weight: bold;
  }
  
  .p-dropdown-panel {
    max-height: 400px; // Custom max height
  }
}
```

## Examples

### Example 1: Technology Stack Selector

```typescript
technologyOptions: DropdownGroup[] = [
  {
    label: 'Frontend',
    items: [
      { label: 'Angular', value: 'angular' },
      { label: 'React', value: 'react' },
      { label: 'Vue.js', value: 'vue' }
    ]
  },
  {
    label: 'Backend',
    items: [
      { label: 'Node.js', value: 'nodejs' },
      { label: 'Python', value: 'python' }
    ]
  }
];
```

### Example 2: Country Selector

```typescript
countryOptions: DropdownGroup[] = [
  {
    label: 'North America',
    items: [
      { label: 'United States', value: 'US' },
      { label: 'Canada', value: 'CA' }
    ]
  },
  {
    label: 'Europe',
    items: [
      { label: 'Germany', value: 'DE' },
      { label: 'France', value: 'FR' }
    ]
  }
];
```

### Example 3: Product Catalog

```typescript
productOptions: DropdownGroup[] = [
  {
    label: 'Electronics',
    items: [
      { name: 'iPhone 15', id: 'iphone15', price: 999 },
      { name: 'MacBook Pro', id: 'macbook', price: 1999 }
    ]
  }
];
```

```html
<app-p-dropdown-group-search
  [options]="productOptions"
  optionLabel="name"
  optionValue="id"
  label="Select Product">
</app-p-dropdown-group-search>
```

## Best Practices

1. **Data Structure**: Keep group sizes reasonable (10-20 items per group) for optimal performance
2. **Search Terms**: Use descriptive labels that users are likely to search for
3. **Loading**: For large datasets, consider implementing lazy loading
4. **Accessibility**: Always provide meaningful labels and descriptions
5. **Validation**: Use Angular validators for form validation
6. **Performance**: Use `OnPush` change detection strategy in parent components when possible

## Troubleshooting

### Common Issues

1. **Options not showing**: Ensure your data follows the `DropdownGroup` interface
2. **Search not working**: Check that `optionLabel` matches your data property names
3. **Form validation**: Make sure to use Angular validators and form controls properly
4. **Styling issues**: Use `::ng-deep` for deep style penetration

### Debug Mode

Enable debug mode to see internal component state:

```html
<app-p-dropdown-group-search
  [showDebugInfo]="true"
  [options]="options">
</app-p-dropdown-group-search>
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Dependencies

- Angular 17+
- PrimeNG 17+
- @angular/animations

## License

This component is part of your project and follows your project's license terms. 