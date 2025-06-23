# Approval Workflow Component

A flexible Angular component for displaying and managing approval workflows, order tracking, and step-by-step processes.

## Features

- **Visual Timeline**: Clean, modern timeline interface with step indicators
- **Multiple Status Types**: Support for complete, in-progress, waiting, and ready states
- **Interactive Completion**: Modal dialogs for step completion with photo upload and comments
- **Customizable Steps**: Fully configurable workflow steps
- **File Upload**: Built-in image upload with validation
- **Responsive Design**: Mobile-friendly responsive layout
- **Event-Driven**: Emits events for step completion and interactions

## Screenshots Match

This component recreates the exact design from your screenshots:
- Order tracking timeline with circular step indicators
- Green checkmarks for completed steps
- Blue action buttons for active steps
- Modal dialog for step completion
- File upload with "Choose Photos" functionality
- Comments textarea
- Proper spacing and visual hierarchy

## Usage

### Basic Implementation

```typescript
import { ApprovalWorkflowComponent, WorkflowStep, WorkflowCompletionData } from './shared/components/approval-workflow';

@Component({
  template: `
    <app-approval-workflow
      title="Order Tracking"
      [steps]="workflowSteps"
      [loading]="isLoading"
      (stepCompleted)="onStepCompleted($event)"
      (stepClicked)="onStepClicked($event)"
    ></app-approval-workflow>
  `
})
export class MyComponent {
  workflowSteps: WorkflowStep[] = [
    {
      id: 'confirmation',
      title: 'Confirmation',
      status: 'complete',
      description: 'Complete',
      allowCompletion: false
    },
    {
      id: 'preparation',
      title: 'Preparation',
      status: 'complete',
      description: 'Complete',
      allowCompletion: false
    },
    {
      id: 'work-in-progress',
      title: 'Work In Progress',
      status: 'ready',
      description: 'Ready to Start',
      allowCompletion: true,
      requiresComments: false
    },
    {
      id: 'finishing',
      title: 'Finishing',
      status: 'waiting',
      description: 'Waiting for Previous Step',
      allowCompletion: true,
      requiresPhotos: true,
      requiresComments: true
    }
  ];

  onStepCompleted(data: WorkflowCompletionData): void {
    console.log('Step completed:', data);
    // Handle step completion
    // Update backend, move to next step, etc.
  }

  onStepClicked(step: WorkflowStep): void {
    console.log('Step clicked:', step);
    // Handle step interaction
  }
}
```

### WorkflowStep Interface

```typescript
interface WorkflowStep {
  id: string;                    // Unique identifier
  title: string;                 // Display name
  status: 'complete' | 'in-progress' | 'waiting' | 'ready';
  description?: string;          // Status description
  completedDate?: Date;          // Completion timestamp
  completedBy?: string;          // User who completed
  photos?: string[];             // Uploaded photo URLs
  comments?: string;             // Step comments
  allowCompletion?: boolean;     // Can user complete this step
  requiresPhotos?: boolean;      // Photos required for completion
  requiresComments?: boolean;    // Comments required for completion
}
```

### WorkflowCompletionData Interface

```typescript
interface WorkflowCompletionData {
  stepId: string;                // Step that was completed
  photos?: File[];               // Uploaded files
  comments?: string;             // User comments
}
```

## Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | string | 'Order Tracking' | Workflow title |
| `steps` | WorkflowStep[] | [] | Array of workflow steps |
| `loading` | boolean | false | Loading state |
| `allowInteraction` | boolean | true | Enable/disable user interactions |

## Output Events

| Event | Type | Description |
|-------|------|-------------|
| `stepCompleted` | WorkflowCompletionData | Emitted when a step is completed |
| `stepClicked` | WorkflowStep | Emitted when a step is clicked |

## Styling

The component comes with predefined styles that match your screenshots:
- Green (#10b981) for completed steps
- Blue (#3b82f6) for active/ready steps
- Gray (#e5e7eb) for waiting steps
- Proper spacing and typography
- Responsive design for mobile devices

## File Upload Features

- **Image Support**: JPEG, JPG, PNG, GIF
- **Size Validation**: 10MB maximum per file
- **Multiple Files**: Support for multiple image uploads
- **Preview**: File name and size display
- **Validation**: Real-time validation with error messages

## Dependencies

- Angular 15+
- PrimeNG (Button, Dialog, InputTextarea, Ripple, Tooltip modules)
- Angular Forms (FormsModule)

## Installation Notes

Make sure to import the required PrimeNG modules in your app:

```typescript
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
// ... other modules
```

This component is standalone and can be used directly without module imports. 