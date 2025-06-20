# Common Sidebar Component

A flexible, responsive sidebar component with PrimeNG PanelMenu integration and mobile hamburger menu support.

## Features

- 🎨 Modern, animated sidebar with custom styling
- 📱 **Mobile responsive with hamburger menu toggle**
- 🔄 Route-aware active states
- 🌳 Hierarchical menu items with nested children
- ⚡ Performance optimized with change detection strategies
- 🎯 TypeScript interfaces for type safety

## Installation

The component is already set up in your project. Make sure you have PrimeNG installed:

```bash
npm install primeng @primeng/themes
```

## Basic Usage

```typescript
import { CommonSidebarComponent, SidebarMenuItem } from './common-sidebar.component';
import { CommonHeaderComponent } from '../common-header/common-header.component';

@Component({
  selector: 'app-layout',
  template: `
    <app-common-header 
      [title]="'My Application'"
      [showMobileMenu]="isMobileMenuOpen"
      (mobileMenuToggle)="toggleMobileMenu()">
    </app-common-header>
    
    <app-common-sidebar 
      [menuItems]="sidebarMenuItems"
      [mobileMenuOpen]="isMobileMenuOpen"
      (mobileMenuClose)="closeMobileMenu()">
    </app-common-sidebar>
  `
})
export class LayoutComponent {
  isMobileMenuOpen = false;
  
  sidebarMenuItems: SidebarMenuItem[] = [
    {
      icon: 'pi pi-home',
      name: 'Dashboard',
      route: '/dashboard'
    },
    {
      icon: 'pi pi-users',
      name: 'Users',
      children: [
        { icon: 'pi pi-user-plus', name: 'Add User', route: '/users/add' },
        { icon: 'pi pi-list', name: 'List Users', route: '/users/list' }
      ]
    }
  ];
  
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  
  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}
```

## Mobile Hamburger Menu

The sidebar now includes mobile responsiveness with a hamburger menu:

### Features:
- 🍔 Hamburger icon in header (shows on mobile devices only)
- 📱 Slide-in animation for mobile menu
- 🌚 Dark backdrop overlay
- 👆 Touch-friendly controls
- 🔄 Auto-close on navigation

### Implementation:
1. Header emits `mobileMenuToggle` event when hamburger is clicked
2. Parent component manages `isMobileMenuOpen` state
3. Sidebar receives `mobileMenuOpen` input to show/hide on mobile
4. Sidebar emits `mobileMenuClose` when backdrop is clicked

## Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `menuItems` | `SidebarMenuItem[]` | `[]` | Array of menu items to display |
| `visible` | `boolean` | `true` | Whether sidebar is visible |
| `position` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'` | Sidebar position |
| `showHeader` | `boolean` | `true` | Whether to show sidebar header |
| `headerTitle` | `string` | `'WefabTeam Portal'` | Header title text |
| `width` | `string` | `'280px'` | Sidebar width |
| `mobileMenuOpen` | `boolean` | `false` | **NEW:** Controls mobile menu visibility |

## Output Events

| Event | Type | Description |
|-------|------|-------------|
| `mobileMenuClose` | `void` | **NEW:** Emitted when mobile menu should close |

## SidebarMenuItem Interface

```typescript
export interface SidebarMenuItem {
  icon: string;        // PrimeNG icon class (e.g., 'pi pi-home')
  name: string;        // Display name
  route?: string;      // Optional route for navigation
  children?: SidebarMenuItem[];  // Optional nested menu items
  command?: () => void; // Optional custom command function
}
```

## Responsive Breakpoints

- **Desktop**: Full sidebar always visible
- **Tablet (≤768px)**: Hamburger menu appears, sidebar slides in/out
- **Mobile (≤480px)**: Compact header with prominent hamburger menu
- **Small Mobile (≤360px)**: Minimal layout with essential elements only

## Styling

The component includes comprehensive SCSS with:
- CSS custom properties for theming
- Smooth animations and transitions
- Dark theme optimized for technical applications
- Mobile-first responsive design
- Accessibility-friendly focus states

## Performance Notes

- Menu items are cached to prevent unnecessary re-renders
- Uses OnPush change detection strategy when possible
- TrackBy functions for efficient list rendering
- Automatic cleanup of subscriptions

## Dependencies

- PrimeNG (PanelMenuModule, ButtonModule, etc.)
- Angular Router
- Angular Common

## Configuration Options

### Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `menuItems` | `SidebarMenuItem[]` | `[]` | Array of menu items to display |
| `visible` | `boolean` | `true` | Controls sidebar visibility |
| `position` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'` | Sidebar position |
| `showHeader` | `boolean` | `true` | Show/hide the header section |
| `headerTitle` | `string` | `'WefabTeam Portal'` | Header title text |
| `width` | `string` | `'280px'` | Sidebar width (CSS value) |

### SidebarMenuItem Interface

```typescript
interface SidebarMenuItem {
  icon: string;          // PrimeNG icon class (e.g., 'pi pi-users')
  name: string;          // Display name
  route?: string;        // Angular route path
  children?: SidebarMenuItem[]; // Nested menu items
  command?: () => void;  // Custom click handler
}
```

## Advanced Examples

### Nested Menu with Custom Actions

```typescript
sidebarMenuItems: SidebarMenuItem[] = [
  {
    icon: 'pi pi-cog',
    name: 'Settings',
    children: [
      {
        icon: 'pi pi-user',
        name: 'Profile',
        route: '/settings/profile'
      },
      {
        icon: 'pi pi-shield',
        name: 'Security',
        route: '/settings/security'
      },
      {
        icon: 'pi pi-sign-out',
        name: 'Logout',
        command: () => this.logout()
      }
    ]
  }
];

logout() {
  // Custom logout logic
  console.log('Logging out...');
}
```

### Dynamic Menu Items

```typescript
export class YourComponent {
  sidebarMenuItems: SidebarMenuItem[] = [];

  ngOnInit() {
    // Load menu items based on user permissions
    this.loadMenuItems();
  }

  loadMenuItems() {
    const userRole = this.getUserRole();
    
    this.sidebarMenuItems = [
      {
        icon: 'pi pi-home',
        name: 'Dashboard',
        route: '/dashboard'
      }
    ];

    if (userRole === 'admin') {
      this.sidebarMenuItems.push({
        icon: 'pi pi-users',
        name: 'User Management',
        route: '/admin/users'
      });
    }
  }
}
```

### Responsive Sidebar

```typescript
export class YourComponent {
  isMobile = false;
  sidebarVisible = true;

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    this.sidebarVisible = !this.isMobile;
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
}
```

```html
<app-common-sidebar 
  [menuItems]="sidebarMenuItems"
  [visible]="sidebarVisible"
  [width]="isMobile ? '100%' : '280px'">
</app-common-sidebar>

<button *ngIf="isMobile" (click)="toggleSidebar()" class="btn btn-primary">
  <i class="pi pi-bars"></i>
</button>
```

## Styling

The component uses the WE-FAB style guide variables. You can customize colors by modifying the variables in `src/assets/scss/variables.scss`:

```scss
// Primary sidebar color
$blueprint-blue: #1A3A5F;

// Text colors
$technical-white: #F6F7F9;
$precision-black: #1A1D21;

// Accent colors
$safety-orange: #FF5722;
$process-green: #12856E;
```

## Icons

The component uses PrimeNG icons. Available icons include:

- `pi pi-home` - Home
- `pi pi-users` - Users
- `pi pi-search` - Search
- `pi pi-chart-bar` - Analytics
- `pi pi-cog` - Settings
- `pi pi-question-circle` - Help
- `pi pi-file` - Files
- `pi pi-calendar` - Calendar

[View all PrimeNG icons](https://primeng.org/icons)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

When contributing to this component:

1. Follow the WE-FAB style guide
2. Ensure accessibility compliance
3. Test on mobile devices
4. Update this README for new features

## License

This component is part of the WE-FAB application and follows the project's licensing terms. 