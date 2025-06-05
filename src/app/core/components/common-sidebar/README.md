# Common Sidebar Component

A highly configurable, reusable sidebar component built with Angular and PrimeNG that follows the WE-FAB style guide.

## Features

- ✅ **Fully Configurable**: Pass JSON configuration to define menu items
- ✅ **PrimeNG Integration**: Built using PrimeNG components for consistency
- ✅ **Nested Menu Support**: Support for multi-level menu hierarchies
- ✅ **Routing Integration**: Built-in Angular Router support
- ✅ **Responsive Design**: Mobile-friendly with responsive breakpoints
- ✅ **Style Guide Compliant**: Follows WE-FAB brand colors and typography
- ✅ **Smooth Animations**: Elegant hover effects and transitions
- ✅ **Accessibility**: ARIA compliant and keyboard navigation support

## Installation

The component is already set up in your project. Make sure you have PrimeNG installed:

```bash
npm install primeng @primeng/themes
```

## Basic Usage

### 1. Import the Component

```typescript
import { CommonSidebarComponent, SidebarMenuItem } from './common-core-component/common-sidebar/common-sidebar.component';

@Component({
  // ...
  imports: [CommonSidebarComponent]
})
```

### 2. Define Menu Items

```typescript
export class YourComponent {
  sidebarMenuItems: SidebarMenuItem[] = [
    {
      icon: 'pi pi-users',
      name: 'Manage Suppliers',
      route: '/suppliers'
    },
    {
      icon: 'pi pi-search',
      name: 'Supplier Finder',
      route: '/supplier-finder'
    },
    {
      icon: 'pi pi-chart-bar',
      name: 'Analytics',
      children: [
        {
          icon: 'pi pi-chart-line',
          name: 'Performance',
          route: '/analytics/performance'
        },
        {
          icon: 'pi pi-chart-pie',
          name: 'Reports',
          route: '/analytics/reports'
        }
      ]
    }
  ];
}
```

### 3. Use in Template

```html
<app-common-sidebar 
  [menuItems]="sidebarMenuItems"
  [visible]="true"
  [showHeader]="true"
  headerTitle="WefabTeam Portal"
  width="280px">
</app-common-sidebar>

<!-- Your main content with margin to accommodate sidebar -->
<div class="main-content" style="margin-left: 280px;">
  <!-- Your content here -->
</div>
```

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