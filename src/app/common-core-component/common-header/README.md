# Common Header Component

A reusable header component that provides a consistent navigation header across the application.

## Features

- **Responsive Design**: Adapts to different screen sizes
- **Consistent Styling**: Uses the project's design system and color variables
- **Logout Functionality**: Built-in logout handling with customizable behavior
- **Event Emission**: Emits logout events for parent components to handle
- **Accessibility**: Proper focus management and keyboard navigation

## Usage

### Basic Implementation

```typescript
// In your component.ts file
import { CommonHeaderComponent } from '../common-core-component/common-header/common-header.component';

@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [CommonHeaderComponent],
  templateUrl: './your-component.component.html',
  styleUrl: './your-component.component.scss'
})
export class YourComponent {
  onHeaderLogout(): void {
    // Handle logout event from header
    console.log('User logged out');
    // Add your custom logout logic here
  }
}
```

```html
<!-- In your component.html file -->
<app-common-header (logoutEvent)="onHeaderLogout()"></app-common-header>

<!-- Your page content -->
<div class="page-content">
  <!-- Your content here -->
</div>
```

### Advanced Usage

#### Custom Logout Handling

```typescript
export class YourComponent {
  onHeaderLogout(): void {
    // Custom logout logic
    this.clearUserData();
    this.redirectToLogin();
    this.showLogoutMessage();
  }

  private clearUserData(): void {
    // Clear user-specific data
    localStorage.removeItem('userPreferences');
    localStorage.clear();
  }

  private redirectToLogin(): void {
    // Custom redirect logic
    this.router.navigate(['/custom-login']);
  }

  private showLogoutMessage(): void {
    // Show custom logout message
    this.toastr.success('You have been logged out successfully');
  }
}
```

#### Integration with Layout Components

```html
<!-- Full page layout example -->
<div class="app-layout">
  <app-common-header (logoutEvent)="onLogout()"></app-common-header>
  
  <div class="layout-body">
    <app-sidebar></app-sidebar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  </div>
</div>
```

## Styling

The component uses the project's design system variables:

- **Background**: `$blueprint-blue` (#1A3A5F)
- **Text Color**: `$technical-white` (#F6F7F9)
- **Font**: Inter font family
- **Responsive**: Adapts to mobile, tablet, and desktop screens

### Custom Styling

If you need to override styles, you can do so in your component's SCSS file:

```scss
::ng-deep .common-header {
  // Custom header styles
  .header-title {
    font-size: 1.5rem; // Override title size
  }
  
  .btn-logout {
    background-color: $safety-orange; // Use different color
    border-color: $safety-orange;
  }
}
```

## API

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `logoutEvent` | `EventEmitter<void>` | Emitted when the logout button is clicked |

### Methods

| Method | Description |
|--------|-------------|
| `onLogout()` | Handles logout button click and emits logout event |

## Responsive Behavior

- **Desktop (>768px)**: Full padding and font sizes
- **Tablet (≤768px)**: Reduced padding and slightly smaller fonts
- **Mobile (≤480px)**: Minimal padding and compact layout

## Accessibility Features

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- High contrast support
- Screen reader friendly

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- Angular 17+
- Bootstrap 5+ (for responsive utilities)
- Project SCSS variables

## Testing

The component is included in the test-components for demonstration and testing purposes:

```bash
# Navigate to test components to see the header in action
/test-component/test-components
```

## Troubleshooting

### Common Issues

1. **Styles not applying**: Ensure SCSS variables are properly imported
2. **Router navigation failing**: Check if Router is properly injected
3. **Logout event not firing**: Verify event binding in template

### Debug Mode

Add console logging to track component behavior:

```typescript
onLogout(): void {
  console.log('Header logout triggered');
  this.logoutEvent.emit();
}
``` 