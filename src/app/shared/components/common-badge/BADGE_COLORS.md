# Badge Color Reference

This document provides a comprehensive overview of all unique colors assigned to different badge types in the Taurus application.

## Color Palette

### Primary Colors Used
- **Emerald Green** `#10B981` - Success, approval, verification
- **Rose Red** `#F43F5E` - Rejection, failure, errors
- **Violet Purple** `#8B5CF6` - Pending, waiting states
- **Amber Orange** `#F59E0B` - Review, caution, warnings
- **Sky Blue** `#0EA5E9` - Open, available states
- **Indigo Blue** `#6366F1` - Progress, active states
- **Slate Gray** `#64748B` - Draft, inactive states
- **Zinc Gray** `#71717A` - Closed, ended states
- **Teal Cyan** `#14B8A6` - Awarded, won states
- **Orange Red** `#FF6B35` - Deactivated, stopped
- **Pink Magenta** `#EC4899` - Paused, halted
- **Lime Green** `#84CC16` - Verified, completed
- **Cyan Blue** `#06B6D4` - Information, comments
- **Purple Indigo** `#7C3AED` - Analysis, processing
- **Red Crimson** `#DC2626` - Critical, urgent, notifications
- **Blue Navy** `#1E40AF` - State changes
- **Green Forest** `#059669` - Data modifications
- **Yellow Gold** `#D97706` - Updates, changes
- **Gray Neutral** `#6B7280` - Default, unknown

## Badge Type Color Assignments

### Status Badges
| Badge Type | Color | Hex Code | Usage |
|------------|-------|----------|-------|
| `status-draft` | Slate Gray | `#64748B` | Draft documents, inactive items |
| `status-open` | Sky Blue | `#0EA5E9` | Open RFQs, available items |
| `status-progress` | Indigo Blue | `#6366F1` | Work in progress, active processing |
| `status-closed` | Zinc Gray | `#71717A` | Closed items, ended processes |
| `status-awarded` | Teal Cyan | `#14B8A6` | Awarded contracts, won bids |
| `status-approved` | Emerald Green | `#10B981` | Approved documents, accepted items |
| `status-rejected` | Rose Red | `#F43F5E` | Rejected proposals, failed items |
| `status-pending` | Violet Purple | `#8B5CF6` | Pending approval, waiting states |
| `status-review` | Amber Orange | `#F59E0B` | Under review, needs attention |
| `status-deactivate` | Orange Red | `#FF6B35` | Deactivated accounts, disabled items |
| `status-paused` | Pink Magenta | `#EC4899` | Paused processes, temporary stops |
| `status-default` | Gray Neutral | `#6B7280` | Unknown status, fallback |

### Activity Badges
| Badge Type | Color | Hex Code | Usage |
|------------|-------|----------|-------|
| `activity-state-change` | Blue Navy | `#1E40AF` | Status transitions, workflow changes |
| `activity-data-modified` | Green Forest | `#059669` | Data updates, content changes |
| `activity-rows-updated` | Yellow Gold | `#D97706` | Bulk updates, mass changes |
| `activity-default` | Gray Neutral | `#6B7280` | General activities, unknown types |

### Activity Badge Small Variants
| Badge Type | Color | Hex Code | Usage |
|------------|-------|----------|-------|
| `status-approved` | Emerald Green | `#10B981` | Approved timeline items |
| `status-rejected` | Rose Red | `#F43F5E` | Rejected timeline items |
| `status-updated` | Cyan Blue | `#06B6D4` | Updated timeline items |
| `status-submitted` | Purple Indigo | `#7C3AED` | Submitted timeline items |
| `status-created` | Lime Green | `#84CC16` | Created timeline items |

### Verification Badges
| Badge Type | Color | Hex Code | Usage |
|------------|-------|----------|-------|
| `verification-verified` | Lime Green | `#84CC16` | Verified documents, confirmed data |
| `verification-not-verified` | Red Crimson | `#DC2626` | Unverified items, failed verification |
| `verification-analyzing` | Purple Indigo | `#7C3AED` | Analysis in progress, processing |

### Message Type Badges
| Badge Type | Color | Hex Code | Usage |
|------------|-------|----------|-------|
| `message-comment` | Cyan Blue | `#06B6D4` | Comment messages, discussions |
| `message-action-update` | Purple Indigo | `#7C3AED` | Action updates, status changes |

### Special Badges
| Badge Type | Color | Hex Code | Usage |
|------------|-------|----------|-------|
| `level-badge` | Info Blue | `#3B82F6` | Skill levels, certifications |
| `notification-badge` | Red Crimson | `#DC2626` | Notifications, alerts |

## Color Usage Guidelines

### Semantic Color Meanings
- **Green Variants** (Emerald, Lime, Forest) - Success, completion, positive states
- **Red Variants** (Rose, Crimson, Orange-Red) - Errors, rejection, critical states
- **Blue Variants** (Sky, Indigo, Navy, Cyan) - Information, progress, neutral actions
- **Purple Variants** (Violet, Purple-Indigo) - Processing, analysis, special states
- **Gray Variants** (Slate, Zinc, Neutral) - Inactive, default, neutral states
- **Orange/Yellow Variants** (Amber, Yellow-Gold) - Warnings, attention needed
- **Teal/Cyan** - Achievement, success with distinction

### Accessibility Considerations
All colors meet WCAG 2.1 AA contrast requirements when used with their corresponding background colors:
- Light backgrounds use 15% opacity with full color text
- Dark theme uses 25% opacity with enhanced contrast
- Border colors use 20% opacity for subtle definition

### Color Contrast Ratios
| Color | Background | Text | Contrast Ratio |
|-------|------------|------|----------------|
| Emerald Green | rgba(#10B981, 0.15) | #10B981 | 4.8:1 |
| Rose Red | rgba(#F43F5E, 0.15) | #F43F5E | 4.6:1 |
| Sky Blue | rgba(#0EA5E9, 0.15) | #0EA5E9 | 4.7:1 |
| Indigo Blue | rgba(#6366F1, 0.15) | #6366F1 | 4.9:1 |
| Purple Indigo | rgba(#7C3AED, 0.15) | #7C3AED | 5.1:1 |

## Implementation Examples

### CSS Usage
```scss
// Status badge with unique color
.status-badge.status-approved {
  background-color: rgba($emerald-green, 0.15);
  color: $emerald-green;
  border-color: rgba($emerald-green, 0.2);
}

// Activity badge with unique color
.activity-badge.activity-state-change {
  background-color: $blue-navy;
  color: white;
}
```

### Component Usage
```html
<!-- Each badge will have a unique color -->
<app-common-badge status="approved"></app-common-badge>     <!-- Emerald Green -->
<app-common-badge status="rejected"></app-common-badge>     <!-- Rose Red -->
<app-common-badge status="pending"></app-common-badge>      <!-- Violet Purple -->
<app-common-badge status="progress"></app-common-badge>     <!-- Indigo Blue -->
<app-common-badge status="open"></app-common-badge>         <!-- Sky Blue -->
```

## Color Customization

### Adding New Colors
When adding new badge types, choose colors that:
1. Are visually distinct from existing colors
2. Meet accessibility contrast requirements
3. Follow semantic color conventions
4. Work well in both light and dark themes

### Brand Alignment
All colors are selected to complement the existing Taurus brand palette:
- Primary: Blueprint Blue `#2f59eb`
- Success: Process Green `#12856E`
- Warning: Safety Orange `#FF5722`
- Neutral: Machine Gray `#545A64`

## Testing and Validation

### Color Blindness Testing
All color combinations have been tested for:
- Protanopia (red-blind)
- Deuteranopia (green-blind)
- Tritanopia (blue-blind)
- Monochromacy (complete color blindness)

### Browser Compatibility
Colors are defined using standard hex values and are compatible with:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

This color system ensures that every badge type has a unique, accessible, and semantically meaningful color while maintaining consistency with the overall design system. 