# Activity Trail Component

A reusable Angular component for displaying activity trails with timeline visualization. This component processes raw activity log data and presents it in a clean, organized timeline format with proper status indicators and responsive design.

## Features

- **Timeline Visualization**: Clean timeline layout with status-specific icons and colors
- **Status-based Styling**: Different colors and icons for Approved, Rejected, Under Review, Updated, Submitted, and Created statuses
- **Responsive Design**: Mobile-friendly layout that adapts to different screen sizes
- **Loading States**: Built-in loading spinner and empty state handling
- **Customizable**: Configurable title, height, and messages
- **Performance Optimized**: Uses OnPush change detection and trackBy functions

## Data Format

The component expects data in the following format:

```typescript
interface ActivityLogData {
  name: number;
  user: string;
  creation: string;
  time_since: string;
  data: {
    changed: string[];
  };
}
```

### Example Data

```typescript
const sampleData: ActivityLogData[] = [
  {
    "name": 874,
    "user": "Buyer",
    "creation": "2025-05-18 23:48:31.654880",
    "time_since": "9 days ago",
    "data": {
      "changed": [
        "Onboarding Status changed from \"Under Review\" to \"Approved\""
      ]
    }
  },
  {
    "name": 873,
    "user": "ProqSmart Supplier",
    "creation": "2025-05-18 23:00:03.294732",
    "time_since": "9 days ago",
    "data": {
      "changed": [
        "Company Profile changed from {...} to {...}"
      ]
    }
  }
];
```

## Usage

### Basic Usage

```typescript
import { ActivityTrailComponent, ActivityLogData } from '../common-core-component/activity-trail';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [ActivityTrailComponent],
  template: `
    <app-activity-trail 
      [activityData]="myActivityData"
      [loading]="isLoading">
    </app-activity-trail>
  `
})
export class MyComponent {
  myActivityData: ActivityLogData[] = [];
  isLoading: boolean = false;
}
```

### Advanced Usage

```typescript
<app-activity-trail 
  [activityData]="activityData"
  [loading]="isLoading"
  [title]="'Custom Activity Trail'"
  [showHeader]="true"
  [maxHeight]="'500px'"
  [emptyMessage]="'No activities found for this item.'">
</app-activity-trail>
```

## Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `activityData` | `ActivityLogData[]` | `[]` | Array of activity log data to display |
| `loading` | `boolean` | `false` | Shows loading spinner when true |
| `title` | `string` | `'Activity Trail'` | Title displayed in the header |
| `showHeader` | `boolean` | `true` | Whether to show the component header |
| `maxHeight` | `string` | `'400px'` | Maximum height of the scrollable content area |
| `emptyMessage` | `string` | `'No activity found'` | Message shown when no data is available |

## Status Types

The component automatically detects and styles the following activity types:

- **Approved** (Green): Status changes to "Approved"
- **Rejected** (Red): Status changes to "Rejected"  
- **Under Review** (Orange): Status changes to "Under Review"
- **Updated** (Blue): Profile or data updates
- **Submitted** (Purple): Initial submissions or resubmissions
- **Created** (Gray): Initial record creation

## Styling

The component uses a comprehensive SCSS stylesheet with:

- Status-specific color schemes
- Responsive breakpoints for mobile devices
- Custom scrollbar styling
- Smooth transitions and hover effects
- Timeline connector lines and dots

### CSS Classes

Key CSS classes for customization:

- `.activity-trail-container`: Main container
- `.status-approved`, `.status-rejected`, etc.: Status-specific styling
- `.timeline-dot`: Timeline indicator dots
- `.activity-content`: Individual activity cards

## Methods

### Public Methods

- `refresh()`: Manually trigger data reprocessing
- `trackByActivityId(index, activity)`: TrackBy function for performance

## Integration Example

Here's how it's integrated in the Supplier Profile Review component:

```typescript
// Component
import { ActivityTrailComponent, ActivityLogData } from '../../../common-core-component/activity-trail';

@Component({
  imports: [
    // ... other imports
    ActivityTrailComponent
  ]
})
export class SupplierProfileReviewComponent {
  activityTrail: ActivityLogData[] = [];
  activityTrailLoading: boolean = false;

  private loadActivityTrail(): void {
    this.activityTrailLoading = true;
    
    this.commonservice.getData(endpoint).subscribe({
      next: (response: any) => {
        this.activityTrail = response.data || [];
        this.activityTrailLoading = false;
      },
      error: (error) => {
        this.activityTrail = [];
        this.activityTrailLoading = false;
      }
    });
  }
}
```

```html
<!-- Template -->
<app-activity-trail 
  [activityData]="activityTrail"
  [loading]="activityTrailLoading"
  [showHeader]="false"
  [emptyMessage]="'No activity records found for this supplier profile.'">
</app-activity-trail>
```

## Demo Component

A demo component is available for testing:

```typescript
import { ActivityTrailDemoComponent } from '../common-core-component/activity-trail';
```

The demo includes sample data and interactive buttons to test loading states and data manipulation.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- Angular 17+
- PrimeNG (ButtonModule, TooltipModule, ProgressSpinnerModule)
- RxJS (for reactive data handling in parent components)

## Performance Considerations

- Uses `OnPush` change detection strategy
- Implements `trackBy` functions for efficient list rendering
- Caches processed data to avoid unnecessary recalculations
- Lazy loads and processes data only when needed

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly content structure
- High contrast color schemes for status indicators 