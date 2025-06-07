# Workflow Progress Component

A reusable, configurable workflow progress (stepper) component for Angular apps, using modern Angular control flow and PrimeNG styling.

## Features
- Vertical stepper UI for workflow/status progress
- Accepts any number of steps via `@Input()`
- Shows Approve/Reject action buttons for the current step (optional)
- Emits events for Approve/Reject actions
- Uses your app's ConfigurableButtonComponent for consistent buttons
- Fully standalone and easy to integrate

## Usage

### 1. Import the Component
```typescript
import { WorkflowProgressComponent } from 'src/app/shared/components/workflow-progress/workflow-progress.component';
```

### 2. Add to Your Template
```html
<app-workflow-progress
  [steps]="steps"
  [showActions]="true"
  (approve)="onApprove()"
  (reject)="onReject()"
></app-workflow-progress>
```

### 3. Provide Steps Data
Each step is an object with at least:
- `label`: string (step name)
- `description`: string (step description)
- `status`: 'done' | 'current' | 'pending'

Example:
```typescript
steps = [
  { label: 'Draft', description: 'Initial document creation', status: 'done' },
  { label: 'Submitted', description: 'Document submitted for review', status: 'done' },
  { label: 'L1 Verification', description: 'Level 1 verification by procurement team', status: 'done' },
  { label: 'L2 Verification', description: 'Level 2 verification by senior procurement', status: 'current' },
  { label: 'Approved', description: 'Supplier approved and active', status: 'pending' },
  { label: 'Quality Check', description: 'Quality assurance verification', status: 'pending' },
  { label: 'Onboarded', description: 'Supplier fully onboarded and active', status: 'pending' }
];
```

### 4. Show Action Buttons (Optional)
Set `[showActions]="true"` to show Approve/Reject buttons for the current step. Handle events:
```html
<app-workflow-progress
  [steps]="steps"
  [showActions]="true"
  (approve)="onApprove()"
  (reject)="onReject()"
></app-workflow-progress>
```

### 5. Customize Button Actions
The component emits `(approve)` and `(reject)` events. Handle them in your parent component:
```typescript
onApprove() {
  // handle approve logic
}
onReject() {
  // handle reject logic
}
```

## Inputs
| Input         | Type     | Description                                      |
|---------------|----------|--------------------------------------------------|
| `steps`       | `any[]`  | Array of step objects (see above)                |
| `showActions` | `boolean`| Show Approve/Reject for current step (default: false) |

## Outputs
| Output     | Type         | Description                        |
|------------|--------------|------------------------------------|
| `approve`  | `EventEmitter<void>` | Fired when Approve is clicked   |
| `reject`   | `EventEmitter<void>` | Fired when Reject is clicked    |

## Customization
- You can style the component via its SCSS file.
- You can pass any number of steps and control which is current by setting `status: 'current'`.
- The action buttons use your app's ConfigurableButtonComponent for full consistency.

## Example (Full)
```typescript
steps = [
  { label: 'Draft', description: 'Initial document creation', status: 'done' },
  { label: 'Submitted', description: 'Document submitted for review', status: 'done' },
  { label: 'L1 Verification', description: 'Level 1 verification by procurement team', status: 'done' },
  { label: 'L2 Verification', description: 'Level 2 verification by senior procurement', status: 'current' },
  { label: 'Approved', description: 'Supplier approved and active', status: 'pending' },
  { label: 'Quality Check', description: 'Quality assurance verification', status: 'pending' },
  { label: 'Onboarded', description: 'Supplier fully onboarded and active', status: 'pending' }
];
```

```html
<app-workflow-progress
  [steps]="steps"
  [showActions]="true"
  (approve)="onApprove()"
  (reject)="onReject()"
></app-workflow-progress>
```

---

**For more customization, edit `workflow-progress.component.scss` or extend the component as needed.** 