import { Component } from '@angular/core';
import { WorkflowProgressComponent } from './workflow-progress.component';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-workflow-progress-test-page',
  standalone: true,
  imports: [WorkflowProgressComponent, CardModule],
  template: `
    <p-card header="Workflow Progress">
      <app-workflow-progress [steps]="steps" [showActions]="true" (approve)="onApprove()" (reject)="onReject()"></app-workflow-progress>
    </p-card>
  `
})
export class WorkflowProgressTestPageComponent {
  steps = [
    {
      label: 'Draft',
      description: 'Initial document creation',
      status: 'done'
    },
    {
      label: 'Submitted',
      description: 'Document submitted for review',
      status: 'done'
    },
    {
      label: 'L1 Verification',
      description: 'Level 1 verification by procurement team',
      status: 'done'
    },
    {
      label: 'L2 Verification',
      description: 'Level 2 verification by senior procurement',
      status: 'current'
    },
    {
      label: 'Approved',
      description: 'Supplier approved and active',
      status: 'pending'
    },
    {
      label: 'Quality Check',
      description: 'Quality assurance verification',
      status: 'pending'
    },
    {
      label: 'Onboarded',
      description: 'Supplier fully onboarded and active',
      status: 'pending'
    }
  ];

  onApprove() {
    alert('Approved!');
  }
  onReject() {
    alert('Rejected!');
  }
} 