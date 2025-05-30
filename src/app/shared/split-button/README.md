# Split Button Component

A customizable split button component with dropdown functionality, built with PrimeNG and following WE-FAB brand guidelines.

## Features

- ✅ **Split button design** - Main action button + dropdown toggle
- ✅ **Dropdown menu** - Configurable options with icons and separators
- ✅ **Brand styling** - Follows WE-FAB color scheme and typography
- ✅ **Multiple severities** - Primary, secondary, success, danger, warning, info
- ✅ **Form integration** - Implements ControlValueAccessor for reactive forms
- ✅ **Accessibility** - ARIA labels and keyboard navigation
- ✅ **Disabled states** - Component and individual option disabling
- ✅ **Icon support** - PrimeIcons for options and main button
- ✅ **Separators** - Visual grouping of menu items
- ✅ **Responsive design** - Mobile-friendly layouts

## Installation

The component is already set up as a standalone component. Import it directly:

```typescript
import { SplitButtonComponent } from '../shared/split-button/split-button.component';

@Component({
  imports: [SplitButtonComponent]
})
```

## Basic Usage

```html
<app-split-button
  [options]="buttonOptions"
  placeholder="Select Action"
  severity="primary"
  (optionSelected)="onOptionSelected($event)"
  (mainButtonClicked)="onMainButtonClicked($event)">
</app-split-button>
```

```typescript
buttonOptions: SplitButtonOption[] = [
  { label: 'Create', value: 'create', icon: 'pi pi-plus' },
  { label: 'Edit', value: 'edit', icon: 'pi pi-pencil' },
  { label: 'Delete', value: 'delete', icon: 'pi pi-trash' }
];

onOptionSelected(option: SplitButtonOption) {
  console.log('Selected:', option);
}

onMainButtonClicked(option: SplitButtonOption | null) {
  console.log('Main button clicked with:', option);
}
```

## Component Interface

### SplitButtonOption Interface

```typescript
interface SplitButtonOption {
  label: string;        // Display text
  value: any;          // Option value
  icon?: string;       // PrimeIcon class (optional)
  disabled?: boolean;  // Disable this option (optional)
  separator?: boolean; // Show as separator (optional)
}
```

### Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `options` | `SplitButtonOption[]` | `[]` | Array of dropdown options |
| `placeholder` | `string` | `'Select option'` | Text shown when no option selected |
| `disabled` | `boolean` | `false` | Disable the entire component |
| `severity` | `string` | `'primary'` | Button color variant |
| `allowMainButtonAction` | `boolean` | `true` | Allow main button clicks |

### Output Events

| Event | Type | Description |
|-------|------|-------------|
| `optionSelected` | `EventEmitter<SplitButtonOption>` | Fired when dropdown option selected |
| `mainButtonClicked` | `EventEmitter<SplitButtonOption \| null>` | Fired when main button clicked |

### Severity Options

- `primary` - Blueprint Blue (#1A3A5F)
- `secondary` - Machine Gray (#545A64) 
- `success` - Process Green (#12856E)
- `danger` - Safety Orange (#FF5722)
- `warning` - Warning Orange (#FFA726)
- `info` / `help` - Material Finish Silver (#D1D5DB)

## Advanced Examples

### With Icons and Separators

```typescript
options: SplitButtonOption[] = [
  { label: 'View Profile', value: 'profile', icon: 'pi pi-user' },
  { label: 'Edit Profile', value: 'edit', icon: 'pi pi-user-edit' },
  { label: '', value: '', separator: true },
  { label: 'Settings', value: 'settings', icon: 'pi pi-cog' },
  { label: 'Logout', value: 'logout', icon: 'pi pi-sign-out' }
];
```

### Form Integration

```html
<form [formGroup]="myForm">
  <app-split-button
    [options]="priorityOptions"
    placeholder="Select Priority"
    formControlName="priority">
  </app-split-button>
</form>
```

```typescript
myForm = this.fb.group({
  priority: ['']
});

priorityOptions: SplitButtonOption[] = [
  { label: 'Low', value: 'low', icon: 'pi pi-arrow-down' },
  { label: 'Medium', value: 'medium', icon: 'pi pi-minus' },
  { label: 'High', value: 'high', icon: 'pi pi-arrow-up' }
];
```

### Disabled Options

```typescript
options: SplitButtonOption[] = [
  { label: 'Available', value: 'available', icon: 'pi pi-check' },
  { label: 'Disabled', value: 'disabled', icon: 'pi pi-ban', disabled: true },
  { label: 'Also Available', value: 'available2', icon: 'pi pi-star' }
];
```

## Styling

The component automatically uses WE-FAB brand colors and typography. Custom styling can be applied:

```scss
app-split-button {
  // Custom overrides here
  
  ::ng-deep .split-button-container {
    // Style the container
  }
  
  ::ng-deep .split-button-menu {
    // Style the dropdown menu
  }
}
```

## Accessibility

- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Disabled state indication

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Demo

Visit `/split-button-demo` to see all component features and examples in action.

## Dependencies

- Angular 17+
- PrimeNG 17+
- PrimeIcons
- Bootstrap (for spacing utilities)

## License

This component is part of the WE-FAB application and follows the project's licensing terms. 