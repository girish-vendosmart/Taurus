# Common Table Component

A highly configurable and reusable table component built with Angular and PrimeNG, designed for the WE-FAB application.

## Features

- ✅ **Configurable Columns**: Dynamic column configuration with various types
- ✅ **Sorting**: Click-to-sort functionality with visual indicators
- ✅ **Filtering**: Per-column search functionality
- ✅ **Pagination**: Clean, functional pagination with customizable page sizes
- ✅ **Action Buttons**: Configurable action buttons with icons and tooltips
- ✅ **Router Links**: Clickable cells that navigate to different routes (column-based or data-specific)
- ✅ **Status Badges**: Styled status indicators
- ✅ **Responsive Design**: Mobile-friendly layout
- ✅ **Loading States**: Built-in loading and empty state handling

## Installation

```typescript
import { CommonTableComponent } from './path/to/common-table/common-table.component';

@Component({
  imports: [CommonTableComponent]
})
export class YourComponent {}
```

## Basic Usage

```html
<app-common-table 
  [config]="tableConfig" 
  [data]="tableData"
  [loading]="isLoading"
  (rowClick)="onRowClick($event)"
  (linkClick)="onLinkClick($event)"
  (actionClick)="onActionClick($event)">
</app-common-table>
```

## Configuration

### TableConfig Interface

```typescript
interface TableConfig {
  columns: TableColumn[];
  enableSearch?: boolean;
  enableSort?: boolean;
  enableFilter?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  showActions?: boolean;
  actionButtons?: ActionButton[];
}
```

### TableColumn Interface

```typescript
interface TableColumn {
  field: string;                    // Data field name
  header: string;                   // Column header text
  sortable?: boolean;               // Enable sorting
  filterable?: boolean;             // Enable filtering
  isLink?: boolean;                 // Make cell clickable
  routerLink?: string;              // Router link path (column-based)
  routerLinkField?: string;         // Field to append to router link
  isStatus?: boolean;               // Render as status badge
  isAction?: boolean;               // Action column
  customTemplate?: boolean;         // Custom template support
  width?: string;                   // Fixed column width
}
```

### ActionButton Interface

```typescript
interface ActionButton {
  label?: string;                   // Button text
  action: string;                   // Action identifier
  class?: string;                   // Custom CSS class
  icon?: string;                    // PrimeIcons class
  iconOnly?: boolean;               // Show only icon
  tooltip?: string;                 // Tooltip text
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
}
```

## Examples

### Basic Table Configuration

```typescript
export class ExampleComponent {
  tableConfig: TableConfig = {
    columns: [
      {
        field: 'name',
        header: 'Name',
        sortable: true,
        filterable: true
      },
      {
        field: 'email',
        header: 'Email',
        sortable: true,
        filterable: true
      },
      {
        field: 'status',
        header: 'Status',
        isStatus: true,
        sortable: true
      }
    ],
    enablePagination: true,
    pageSize: 10
  };

  tableData = [
    { name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' }
  ];
}
```

### Advanced Configuration with Actions and Links

```typescript
export class AdvancedExampleComponent {
  tableConfig: TableConfig = {
    columns: [
      {
        field: 'company',
        header: 'Company',
        sortable: true,
        filterable: true,
        isLink: true,
        routerLink: '/company-details',
        routerLinkField: 'companyId'
      },
      {
        field: 'contact',
        header: 'Contact',
        sortable: true,
        filterable: true
      },
      {
        field: 'status',
        header: 'Status',
        isStatus: true,
        sortable: true
      },
      {
        field: 'actions',
        header: 'Actions',
        isAction: true,
        width: '200px'
      }
    ],
    enableSearch: true,
    enableSort: true,
    enableFilter: true,
    enablePagination: true,
    pageSize: 5,
    actionButtons: [
      {
        label: 'View',
        action: 'view',
        icon: 'pi pi-eye',
        severity: 'secondary'
      },
      {
        label: 'Edit',
        action: 'edit',
        icon: 'pi pi-pencil',
        severity: 'primary'
      },
      {
        action: 'delete',
        icon: 'pi pi-trash',
        iconOnly: true,
        tooltip: 'Delete Record',
        severity: 'danger'
      }
    ]
  };

  // Sample data with direct router links
  tableData = [
    {
      company: 'TATA CONSULTANCY SERVICES LIMITED',
      companyId: 'SUP-007293',
      contact: 'michael.doe@mailinator.com',
      status: 'Approved',
      routerLink: '/company-details/SUP-007293'  // Direct router link
    },
    {
      company: 'INDIAMART INTERMESH LIMITED',
      companyId: 'SUP-007282',
      contact: 'girish.kadli@mailinator.com',
      status: 'Under Review',
      routerLink: '/supplier-profile/SUP-007282'  // Different route type
    }
  ];
}
```

## Event Handling

### Row Click Event

```typescript
onRowClick(event: { event: Event, rowData: any }) {
  console.log('Row clicked:', event.rowData);
}
```

### Link Click Event

```typescript
onLinkClick(event: { rowData: any, column: TableColumn }) {
  console.log('Link clicked:', event.rowData, event.column);
  // Custom navigation logic if needed
}
```

### Action Click Event

```typescript
onActionClick(event: { action: string, rowData: any }) {
  switch (event.action) {
    case 'view':
      this.viewRecord(event.rowData);
      break;
    case 'edit':
      this.editRecord(event.rowData);
      break;
    case 'delete':
      this.deleteRecord(event.rowData);
      break;
  }
}
```

## Router Link Configuration

The component supports two methods for configuring router links:

### Method 1: Column-Based Router Links (Global Configuration)

Configure router links at the column level for consistent routing patterns:

```typescript
{
  field: 'company',
  header: 'Company',
  isLink: true,
  routerLink: '/company-details',      // Base route
  routerLinkField: 'companyId'         // Field to append: /company-details/SUP-007293
}
```

### Method 2: Data-Specific Router Links (Per Record)

Include `routerLink` directly in your data for maximum flexibility:

```typescript
tableData = [
  {
    company: 'TATA CONSULTANCY SERVICES LIMITED',
    companyId: 'SUP-007293',
    routerLink: '/company-details/SUP-007293'  // Direct link
  },
  {
    company: 'INDIAMART INTERMESH LIMITED',
    companyId: 'SUP-007282',
    routerLink: '/supplier-profile/SUP-007282'  // Different route type
  },
  {
    company: 'WIPRO LIMITED',
    companyId: 'SUP-007296',
    routerLink: '/vendor-details/SUP-007296?tab=contracts'  // With query params
  }
];
```

### Router Link Priority

The component uses the following priority order:

1. **Data-specific `routerLink`** (highest priority) - Uses the `routerLink` field from row data
2. **Column-based routing** - Uses `routerLink` + `routerLinkField` from column configuration
3. **Event emission only** - Just emits `linkClick` event for custom handling

### Router Link Examples

```typescript
// Simple routes
routerLink: '/company-details/SUP-007293'

// Routes with query parameters
routerLink: '/company-details/SUP-007293?tab=overview&section=contracts'

// Different routes per record type
routerLink: '/supplier-profile/SUP-007293'
routerLink: '/vendor-details/SUP-007282'
routerLink: '/partner-info/SUP-007288'

// Complex nested routes
routerLink: '/companies/SUP-007293/contracts/active'
routerLink: '/organizations/SUP-007282/reports/financial'

// External links (requires additional configuration)
routerLink: '/external-redirect?url=https://company-website.com'
```

### Mixed Routing Example

You can combine both methods in the same table:

```typescript
export class MixedRoutingExample {
  tableConfig: TableConfig = {
    columns: [
      {
        field: 'company',
        header: 'Company',
        isLink: true,
        routerLink: '/company-details',  // Fallback route
        routerLinkField: 'companyId'
      }
    ]
  };

  tableData = [
    {
      company: 'Standard Company',
      companyId: 'SUP-001'
      // Will use column config: /company-details/SUP-001
    },
    {
      company: 'Special Company',
      companyId: 'SUP-002',
      routerLink: '/special-company-profile/SUP-002'  // Override with specific route
    }
  ];
}
```

## Styling

### Action Button Severities

The component supports the following button severities:

- **primary**: Blue background (brand color)
- **secondary**: White background with border
- **success**: Green background
- **danger**: Red/Orange background
- **warning**: Yellow background
- **info**: Light blue background

### Custom Styling

You can override the default styles by targeting the component classes:

```scss
app-common-table {
  .action-btn.custom-btn {
    background: #custom-color;
    border-color: #custom-color;
  }
}
```

## Status Badge Configuration

Status badges automatically apply colors based on status values:

- **Approved**: Green background
- **Under Review**: Yellow background
- **Rejected**: Red background

## Accessibility

The component includes:

- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- Focus management

## Dependencies

- Angular 15+
- PrimeNG
- PrimeIcons
- Angular Router (for link functionality)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Submit a pull request

## License

This component is part of the WE-FAB application and follows the project's licensing terms. 