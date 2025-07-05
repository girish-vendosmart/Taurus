import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprovalWorkflowComponent, WorkflowStep, WorkflowCompletionData } from '../approval-workflow.component';

@Component({
  selector: 'app-approval-workflow-demo',
  standalone: true,
  imports: [CommonModule, ApprovalWorkflowComponent],
  template: `
    <div class="demo-container">
      <h2>Approval Workflow Demo</h2>
      
      <div class="demo-section">
        <h3>Default Order Tracking</h3>
        <app-approval-workflow
          title="Order Tracking"
          [steps]="defaultSteps"
          (stepCompleted)="onStepCompleted($event)"
          (stepClicked)="onStepClicked($event)"
        ></app-approval-workflow>
      </div>

      <div class="demo-section">
        <h3>Custom Workflow</h3>
        <app-approval-workflow
          title="Manufacturing Process"
          [steps]="customSteps"
          (stepCompleted)="onStepCompleted($event)"
          (stepClicked)="onStepClicked($event)"
        ></app-approval-workflow>
      </div>

      <div class="demo-logs" *ngIf="logs.length > 0">
        <h3>Event Logs</h3>
        <div class="log-entry" *ngFor="let log of logs">
          <span class="log-time">{{ log.time | date:'HH:mm:ss' }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .demo-section {
      margin-bottom: 40px;
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }

    .demo-section h3 {
      margin-top: 0;
      color: #1f2937;
    }

    .demo-logs {
      background-color: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }

    .log-entry {
      display: flex;
      gap: 12px;
      margin-bottom: 8px;
    }

    .log-time {
      color: #6b7280;
      font-weight: bold;
    }

    .log-message {
      color: #374151;
    }
  `]
})
export class ApprovalWorkflowDemoComponent {
  logs: { time: Date; message: string }[] = [];

  defaultSteps: WorkflowStep[] = [
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
    },
    {
      id: 'inspection',
      title: 'Inspection',
      status: 'waiting',
      description: 'Waiting for Previous Step',
      allowCompletion: true,
      requiresComments: false
    },
    {
      id: 'dispatch',
      title: 'Dispatch In Progress',
      status: 'waiting',
      description: 'Waiting for Previous Step',
      allowCompletion: true,
      requiresComments: false
    }
  ];

  customSteps: WorkflowStep[] = [
    {
      id: 'design',
      title: 'Design Review',
      status: 'complete',
      description: 'Design approved',
      allowCompletion: false
    },
    {
      id: 'prototyping',
      title: 'Prototyping',
      status: 'in-progress',
      description: 'Creating prototype',
      allowCompletion: true,
      requiresPhotos: true,
      requiresComments: true
    },
    {
      id: 'testing',
      title: 'Quality Testing',
      status: 'waiting',
      description: 'Waiting for prototype',
      allowCompletion: true,
      requiresComments: true
    },
    {
      id: 'production',
      title: 'Mass Production',
      status: 'waiting',
      description: 'Waiting for testing',
      allowCompletion: true,
      requiresComments: false
    }
  ];

  onStepCompleted(data: WorkflowCompletionData): void {
    this.addLog(`Step "${data.stepId}" completed with ${data.photos?.length || 0} photos and comments: "${data.comments}"`);
    
    // Update step status
    this.updateStepStatus(data.stepId);
  }

  onStepClicked(step: WorkflowStep): void {
    this.addLog(`Step "${step.title}" clicked`);
  }

  private updateStepStatus(stepId: string): void {
    // Update in default steps
    const defaultStep = this.defaultSteps.find(s => s.id === stepId);
    if (defaultStep) {
      defaultStep.status = 'complete';
      defaultStep.description = 'Complete';
      
      // Enable next step
      const currentIndex = this.defaultSteps.findIndex(s => s.id === stepId);
      if (currentIndex >= 0 && currentIndex < this.defaultSteps.length - 1) {
        const nextStep = this.defaultSteps[currentIndex + 1];
        if (nextStep.status === 'waiting') {
          nextStep.status = 'ready';
          nextStep.description = 'Ready to Complete';
        }
      }
    }

    // Update in custom steps
    const customStep = this.customSteps.find(s => s.id === stepId);
    if (customStep) {
      customStep.status = 'complete';
      customStep.description = 'Complete';
      
      // Enable next step
      const currentIndex = this.customSteps.findIndex(s => s.id === stepId);
      if (currentIndex >= 0 && currentIndex < this.customSteps.length - 1) {
        const nextStep = this.customSteps[currentIndex + 1];
        if (nextStep.status === 'waiting') {
          nextStep.status = 'ready';
          nextStep.description = 'Ready to Complete';
        }
      }
    }
  }

  private addLog(message: string): void {
    this.logs.unshift({
      time: new Date(),
      message
    });
    
    // Keep only last 10 logs
    if (this.logs.length > 10) {
      this.logs = this.logs.slice(0, 10);
    }
  }
} 