# Common Badge System

A comprehensive badge system for the Taurus application that provides consistent styling and behavior for all badges across the application.

## Components

### 1. BadgeService (`src/app/shared/services/badge.service.ts`)
Central service that handles all badge logic including status classification, activity types, verification states, and message types.

### 2. Common Badge Styles (`src/assets/scss/badges.scss`)
Comprehensive SCSS file containing all badge styles, imported globally in `styles.scss`.

### 3. CommonBadgeComponent (`src/app/shared/components/common-badge/common-badge.component.ts`)
Reusable component for displaying badges with automatic type detection.

### 4. Badge Color Reference (`src/app/shared/components/common-badge/BADGE_COLORS.md`)
Comprehensive color reference document showing all unique colors assigned to each badge type.

## Usage

### Using the Badge Service

```typescript
import { BadgeService } from '../shared/services/badge.service';

constructor(private badgeService: BadgeService) {}

// Get status class for any status string
getStatusClass(status: string): string {
  return this.badgeService.getStatusClass(status);
}

// Get activity badge class
getActivityClass(activityType: string): string {
  return this.badgeService.getActivityBadgeClass(activityType);
}

// Get verification badge class
getVerificationClass(status: string): string {
  return this.badgeService.getVerificationBadgeClass(status);
}
```

### Using the Common Badge Component

#### Basic Usage
```html
<!-- Simple status badge -->
<app-common-badge status="approved" text="Approved"></app-common-badge>

<!-- Activity badge -->
<app-common-badge activityType="data-modified" text="Data Modified"></app-common-badge>

<!-- Verification badge -->
<app-common-badge verificationStatus="verified" text="Verified" icon="pi pi-check"></app-common-badge>
```

#### Advanced Usage
```html
<!-- Custom badge with all options -->
<app-common-badge 
  text="Custom Badge"
  type="status-pending"
  size="lg"
  shape="pill"
  icon="pi pi-clock"
  clickable="true"
  customClass="my-custom-class"
  tooltip="This is a custom badge">
</app-common-badge>

<!-- Auto-detection (component will automatically determine type and text) -->
<app-common-badge status="work-in-progress"></app-common-badge>
```

### Using CSS Classes Directly

```html
<!-- Status badges -->
<span class="status-badge status-approved">Approved</span>
<span class="status-badge status-pending">Pending</span>
<span class="status-badge status-rejected">Rejected</span>

<!-- Activity badges -->
<span class="activity-badge activity-state-change">State Change</span>
<span class="activity-badge activity-data-modified">Data Modified</span>

<!-- Verification badges -->
<span class="verification-badge verified">
  <i class="pi pi-check"></i>
  Verified
</span>

<!-- Size variants -->
<span class="status-badge status-open badge-xs">Small</span>
<span class="status-badge status-open badge-sm">Small</span>
<span class="status-badge status-open badge-md">Medium</span>
<span class="status-badge status-open badge-lg">Large</span>

<!-- Shape variants -->
<span class="status-badge status-open badge-pill">Pill</span>
<span class="status-badge status-open badge-rounded">Rounded</span>
<span class="status-badge status-open badge-square">Square</span>
```

## Available Badge Types

### Status Badges (Each with Unique Colors)
- `status-draft` - Draft items (Slate Gray `#64748B`)
- `status-open` - Open/available items (Sky Blue `#0EA5E9`)
- `status-progress` - Items in progress (Indigo Blue `#6366F1`)
- `status-closed` - Closed items (Zinc Gray `#71717A`)
- `status-awarded` - Awarded items (Teal Cyan `#14B8A6`)
- `status-approved` - Approved items (Emerald Green `#10B981`)
- `status-rejected` - Rejected items (Rose Red `#F43F5E`)
- `status-pending` - Pending items (Violet Purple `#8B5CF6`)
- `status-review` - Items under review (Amber Orange `#F59E0B`)
- `status-deactivate` - Deactivated items (Orange Red `#FF6B35`)
- `status-paused` - Paused items (Pink Magenta `#EC4899`)
- `status-default` - Default/unknown status (Gray Neutral `#6B7280`)

### Activity Badges (Each with Unique Colors)
- `activity-state-change` - Status/state changes (Blue Navy `#1E40AF`)
- `activity-data-modified` - Data modifications (Green Forest `#059669`)
- `activity-rows-updated` - Bulk updates (Yellow Gold `#D97706`)
- `activity-default` - Default activity (Gray Neutral `#6B7280`)

### Verification Badges (Each with Unique Colors)
- `verification-verified` - Verified items (Lime Green `#84CC16`)
- `verification-not-verified` - Not verified items (Red Crimson `#DC2626`)
- `verification-analyzing` - Items being analyzed (Purple Indigo `#7C3AED`)

### Message Type Badges (Each with Unique Colors)
- `message-comment` - Comment messages (Cyan Blue `#06B6D4`)
- `message-action-update` - Action/status updates (Purple Indigo `#7C3AED`)

### Special Badges (Each with Unique Colors)
- `level-badge` - Skill/certification levels (Info Blue `#3B82F6`)
- `notification-badge` - Notification indicators (Red Crimson `#DC2626`)

## Status Mapping

The badge service automatically maps various status strings to appropriate badge types:

### Order Statuses
- `order-complete`, `order-completed` → `status-approved`
- `dispatch`, `finishing`, `preparation`, `work-in-progress`, `quality-inspection` → `status-progress`
- `supplier-confirmation`, `not-opened`, `invited`, `opened`, `open` → `status-open`

### General Statuses
- `published`, `approved` → `status-approved`
- `deactivated`, `deactivate` → `status-deactivate`
- `paused` → `status-paused`
- `not-started`, `draft` → `status-draft`
- `under-review`, `review` → `status-review`
- `rejected`, `cancelled` → `status-rejected`
- `closed` → `status-closed`
- `awarded`, `quoted`, `submitted` → `status-awarded`
- `pending` → `status-pending`

## Customization

### Adding New Badge Types

1. Add the new type to the `BadgeType` union in `badge.service.ts`
2. Add the corresponding CSS class in `badges.scss`
3. Update the service methods to handle the new type

### Custom Styling

You can override badge styles in component-specific SCSS files:

```scss
:host ::ng-deep {
  .status-badge {
    &.my-custom-status {
      background-color: #custom-color;
      color: white;
      border: 1px solid #custom-border;
    }
  }
}
```

## Migration from Old Badge System

### Replace getStatusClass methods
```typescript
// Old way
getStatusClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'approved': return 'status-approved';
    // ... many more cases
  }
}

// New way
getStatusClass(status: string): string {
  return this.badgeService.getStatusClass(status);
}
```

### Remove component-specific badge CSS
Remove duplicate badge styles from component SCSS files and rely on the global badge system.

### Update imports
```typescript
// Add this import
import { BadgeService } from '../../services/badge.service';

// Inject in constructor
constructor(private badgeService: BadgeService) {}
```

## Best Practices

1. **Use the service**: Always use `BadgeService` instead of implementing custom badge logic
2. **Consistent naming**: Use consistent status names across the application
3. **Semantic types**: Choose appropriate badge types (status, activity, verification, etc.)
4. **Accessibility**: Always provide meaningful text and consider using tooltips
5. **Performance**: The badge service methods are lightweight and can be called frequently
6. **Responsive**: Badge styles are responsive by default

## Examples in Existing Components

### Common Table Component
```typescript
getStatusClass(status: string): string {
  return this.badgeService.getStatusClass(status);
}
```

### Conversation Trail Component
```html
<span class="status-badge" [ngClass]="getStatusClass(msg.message_current_state)">
  {{ msg.message_current_state }}
</span>
```

### Activity Trail Component
```html
<div class="activity-badge" [ngClass]="badgeService.getActivityBadgeClass(activity.type)">
  {{ activity.type }}
</div>
```

This badge system ensures consistency, reduces code duplication, and makes it easy to maintain and extend badge functionality across the entire application. 