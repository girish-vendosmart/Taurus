# Enhanced Activity Trail Component

A comprehensive Angular component for displaying activity trails with advanced timeline visualization, search functionality, filtering, and interactive features. This component processes raw activity log data and presents it in a clean, organized timeline format with enhanced status indicators, responsive design, and accessibility features.

## ✨ Features

### Core Features
- **Timeline Visualization**: Clean timeline layout with status-specific icons and colors
- **Enhanced Status Detection**: Automatically categorizes activities into Approved, Rejected, Submitted, Created, State Change, Data Modified, and Rows Updated
- **Responsive Design**: Mobile-friendly layout that adapts to different screen sizes
- **Loading States**: Built-in loading spinner and empty state handling
- **Performance Optimized**: Uses OnPush change detection and trackBy functions

### New Enhanced Features
- **🔍 Search Functionality**: Real-time search across activity descriptions, users, and action types
- **🔧 Advanced Filtering**: Filter activities by type (Approved, Rejected, State Changes, etc.)
- **📱 Virtual Scrolling**: Improved performance for large datasets with pagination
- **🎨 Enhanced Animations**: Smooth entry animations and hover effects
- **♿ Accessibility Improvements**: Enhanced ARIA labels, keyboard navigation, and screen reader support
- **🎯 Interactive Events**: Click events for activities and user interactions
- **🎨 Priority Indicators**: Visual priority indicators for critical and important activities
- **📊 Activity Statistics**: Real-time count of filtered results

## 📊 Data Format

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

interface ActivityItem {
  id: string;
  date: Date;
  action: 'State Change' | 'Data Modified' | 'Rows Updated' | 'Created' | 'Approved' | 'Rejected' | 'Submitted';
  title: string;
  description: string;
  user: string;
  level?: 'critical' | 'important' | 'normal' | 'minor';
  section?: string;
  time_since: string;
  changes?: string[];
  priority?: number;
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
        "Company Profile updated with new contact information"
      ]
    }
  }
];
```

## 🚀 Usage

### Basic Usage

```typescript
import { ActivityTrailComponent, ActivityLogData } from '../shared/components/activity-trail';

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

### Advanced Usage with All Features

```typescript
<app-activity-trail 
  [activityData]="activityData"
  [loading]="isLoading"
  [title]="'Project Activity Trail'"
  [showHeader]="true"
  [showSearch]="true"
  [showFilter]="true"
  [maxHeight]="'500px'"
  [pageSize]="20"
  [enableVirtualScroll]="true"
  [animateEntries]="true"
  [emptyMessage]="'No activities found for this project.'"
  (activityClick)="onActivityClick($event)"
  (userClick)="onUserClick($event)"
  (refreshRequested)="onRefreshRequested()">
</app-activity-trail>
```

### Event Handling

```typescript
export class MyComponent {
  onActivityClick(activity: ActivityItem): void {
    console.log('Activity clicked:', activity);
    // Handle activity selection
  }

  onUserClick(userName: string): void {
    console.log('User clicked:', userName);
    // Show user profile or filter by user
  }

  onRefreshRequested(): void {
    console.log('Refresh requested');
    // Reload activity data
    this.loadActivityData();
  }
}
```

## 📋 Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `activityData` | `ActivityLogData[]` | `[]` | Array of activity log data to display |
| `loading` | `boolean` | `false` | Shows loading spinner when true |
| `title` | `string` | `'Activity Trail'` | Title displayed in the header |
| `showHeader` | `boolean` | `true` | Whether to show the component header |
| `maxHeight` | `string` | `'400px'` | Maximum height of the scrollable content area |
| `emptyMessage` | `string` | `'No activity found'` | Message shown when no data is available |
| `showSearch` | `boolean` | `false` | Enable search functionality |
| `showFilter` | `boolean` | `false` | Enable filtering by activity type |
| `pageSize` | `number` | `20` | Number of items per page (virtual scrolling) |
| `enableVirtualScroll` | `boolean` | `false` | Enable virtual scrolling for large datasets |
| `animateEntries` | `boolean` | `true` | Enable entry animations for new activities |

## 📤 Output Events

| Event | Type | Description |
|-------|------|-------------|
| `activityClick` | `EventEmitter<ActivityItem>` | Emitted when an activity item is clicked |
| `userClick` | `EventEmitter<string>` | Emitted when a user name/avatar is clicked |
| `refreshRequested` | `EventEmitter<void>` | Emitted when the refresh button is clicked |

## 🎨 Status Types

The component automatically detects and styles the following activity types:

- **✅ Approved** (Green): Status changes to "Approved"
- **❌ Rejected** (Red): Status changes to "Rejected"  
- **📤 Submitted** (Purple): Document submissions or form submissions
- **🔄 State Change** (Blue): Workflow or status transitions
- **📝 Data Modified** (Green): Profile or data updates
- **📊 Rows Updated** (Orange): Database record modifications
- **➕ Created** (Blue): Initial record creation

### Priority Levels

Activities are automatically assigned priority levels:

- **🔴 Critical**: Approved/Rejected activities
- **🟠 Important**: State changes and submissions
- **🟡 Normal**: Data modifications
- **⚪ Minor**: Row updates and creation

## 🎨 Styling and Customization

### CSS Classes

Key CSS classes for customization:

- `.activity-trail-container`: Main container
- `.activity-controls`: Search and filter area
- `.activity-timeline`: Timeline container
- `.activity-item`: Individual activity items
- `.activity-content-box`: Activity content area
- `.timeline-dot`: Timeline indicator dots
- `.activity-badge`: Status badges
- `.level-critical`, `.level-important`, etc.: Priority level styling

### Responsive Breakpoints

- **Desktop**: > 768px - Full layout with all features
- **Tablet**: 481px - 768px - Adjusted spacing and layout
- **Mobile**: ≤ 480px - Compact layout with stacked elements

## 🔧 Advanced Features

### Search Functionality

```typescript
// Enable search
<app-activity-trail [showSearch]="true">

// Search across:
// - Activity descriptions
// - User names
// - Activity types
```

### Filtering

```typescript
// Enable filtering
<app-activity-trail [showFilter]="true">

// Available filters:
// - All Activities
// - State Changes
// - Data Modified
// - Rows Updated
// - Approved
// - Rejected
// - Submitted
// - Created
```

### Virtual Scrolling

```typescript
// Enable for large datasets
<app-activity-trail 
  [enableVirtualScroll]="true"
  [pageSize]="25">
```

### Accessibility Features

- **Keyboard Navigation**: Full keyboard support with focus management
- **Screen Reader Support**: Comprehensive ARIA labels and live regions
- **High Contrast**: Colors meet WCAG AA standards
- **Focus Management**: Clear focus indicators and logical tab order

## 📖 Methods

### Public Methods

- `refresh()`: Manually trigger data reprocessing
- `trackByActivityId(index, activity)`: TrackBy function for performance
- `onSearchChange(event)`: Handle search input changes
- `onFilterChange(filter)`: Handle filter selection
- `clearSearch()`: Clear current search term
- `loadMore()`: Load more items (virtual scrolling)

### Helper Methods

- `getActivityBadgeClass(action)`: Get CSS class for activity badge
- `getActivityIcon(action)`: Get icon class for activity type
- `getUserInitials(userName)`: Generate user initials
- `getActivityAriaLabel(activity)`: Generate accessibility label

## 🔗 Integration Example

Here's a complete integration example:

```typescript
// Component
import { ActivityTrailComponent, ActivityLogData, ActivityItem } from '../shared/components/activity-trail';

@Component({
  imports: [
    // ... other imports
    ActivityTrailComponent
  ]
})
export class ProjectDetailsComponent {
  activityTrail: ActivityLogData[] = [];
  activityTrailLoading: boolean = false;

  ngOnInit(): void {
    this.loadActivityTrail();
  }

  private loadActivityTrail(): void {
    this.activityTrailLoading = true;
    
    this.projectService.getActivityTrail(this.projectId).subscribe({
      next: (response: any) => {
        this.activityTrail = response.data || [];
        this.activityTrailLoading = false;
      },
      error: (error) => {
        this.activityTrail = [];
        this.activityTrailLoading = false;
        this.showErrorMessage('Failed to load activity trail');
      }
    });
  }

  onActivitySelected(activity: ActivityItem): void {
    // Handle activity selection
    this.router.navigate(['/activity', activity.id]);
  }

  onUserSelected(userName: string): void {
    // Filter activities by user or show user profile
    this.showUserProfile(userName);
  }

  onRefreshActivities(): void {
    this.loadActivityTrail();
  }
}
```

```html
<!-- Template -->
<div class="project-activity-section">
  <app-activity-trail 
    [activityData]="activityTrail"
    [loading]="activityTrailLoading"
    [title]="'Project Activity Timeline'"
    [showHeader]="true"
    [showSearch]="true"
    [showFilter]="true"
    [maxHeight]="'600px'"
    [enableVirtualScroll]="activityTrail.length > 50"
    [emptyMessage]="'No activity records found for this project.'"
    (activityClick)="onActivitySelected($event)"
    (userClick)="onUserSelected($event)"
    (refreshRequested)="onRefreshActivities()">
  </app-activity-trail>
</div>
```

## 🧪 Demo Component

A comprehensive demo component is available for testing all features:

```typescript
import { ActivityTrailDemoComponent } from '../shared/components/activity-trail';
```

The demo includes:
- Sample data generation
- Interactive feature toggles
- Event logging
- Toast notifications
- Real-time statistics

## 🌐 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🏃‍♂️ Performance Considerations

- **Virtual Scrolling**: Use for datasets > 50 items
- **Search Debouncing**: Built-in 300ms debounce for search
- **Change Detection**: OnPush strategy for optimal performance
- **TrackBy Functions**: Efficient list rendering
- **Lazy Loading**: Components loaded only when needed

## 🆕 Migration from Previous Version

If upgrading from the previous version:

1. **New Properties**: `showSearch`, `showFilter`, `enableVirtualScroll`, `animateEntries`
2. **New Events**: `activityClick`, `userClick`, `refreshRequested`
3. **Enhanced Interfaces**: `ActivityItem` now includes `level` and `priority`
4. **New Dependencies**: FormsModule required for search/filter functionality

## 🤝 Contributing

When contributing to this component:

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure accessibility compliance
5. Test across different browsers and devices

## 📝 License

This component is part of the Taurus Angular application and follows the project's licensing terms. 