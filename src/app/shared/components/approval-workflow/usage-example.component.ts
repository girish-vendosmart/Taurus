import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprovalWorkflowComponent, WorkflowStep, WorkflowCompletionData } from './approval-workflow.component';

@Component({
  selector: 'app-approval-workflow-usage',
  standalone: true,
  imports: [CommonModule, ApprovalWorkflowComponent],
  template: `
    <div class="container">
      <div class="row">
        <div class="col-md-8">
          <app-approval-workflow
            title="Order Tracking"
            [steps]="orderSteps"
            [loading]="isLoading"
            (stepCompleted)="onStepCompleted($event)"
            (stepClicked)="onStepClicked($event)"
          ></app-approval-workflow>
        </div>
        
        <div class="col-md-4">
          <div class="info-panel">
            <h4>Order Information</h4>
            <p><strong>Order ID:</strong> #ORD-2024-001</p>
            <p><strong>Customer:</strong> ABC Manufacturing</p>
            <p><strong>Product:</strong> Custom Metal Parts</p>
            <p><strong>Quantity:</strong> 500 units</p>
            <p><strong>Due Date:</strong> {{ dueDate | date:'mediumDate' }}</p>
            
            <div class="progress-summary">
              <h5>Progress Summary</h5>
              <div class="progress-stats">
                <div class="stat">
                  <span class="stat-number">{{ completedSteps }}</span>
                  <span class="stat-label">Completed</span>
                </div>
                <div class="stat">
                  <span class="stat-number">{{ totalSteps - completedSteps }}</span>
                  <span class="stat-label">Remaining</span>
                </div>
                <div class="stat">
                  <span class="stat-number">{{ progressPercentage }}%</span>
                  <span class="stat-label">Progress</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="activity-log" *ngIf="activityLog.length > 0">
            <h5>Recent Activity</h5>
            <div class="activity-item" *ngFor="let activity of activityLog">
              <div class="activity-time">{{ activity.timestamp | date:'short' }}</div>
              <div class="activity-message">{{ activity.message }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .info-panel {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }
    
    .info-panel h4 {
      margin-top: 0;
      color: #1f2937;
    }
    
    .info-panel p {
      margin: 8px 0;
      color: #6b7280;
    }
    
    .progress-summary {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
    }
    
    .progress-stats {
      display: flex;
      gap: 20px;
      margin-top: 12px;
    }
    
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .stat-number {
      font-size: 1.5rem;
      font-weight: bold;
      color: #3b82f6;
    }
    
    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
    }
    
    .activity-log {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .activity-log h5 {
      margin-top: 0;
      color: #1f2937;
    }
    
    .activity-item {
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .activity-item:last-child {
      border-bottom: none;
    }
    
    .activity-time {
      font-size: 0.75rem;
      color: #9ca3af;
    }
    
    .activity-message {
      font-size: 0.875rem;
      color: #374151;
      margin-top: 2px;
    }
    
    @media (max-width: 768px) {
      .row {
        flex-direction: column;
      }
      
      .progress-stats {
        justify-content: space-around;
      }
    }
  `]
})
export class ApprovalWorkflowUsageComponent {
  isLoading = false;
  dueDate = new Date(2024, 2, 15); // March 15, 2024
  
  activityLog: { timestamp: Date; message: string }[] = [];

  orderSteps: WorkflowStep[] = [
    {
      id: 'confirmation',
      title: 'Confirmation',
      status: 'complete',
      description: 'Complete',
      allowCompletion: false,
      completedDate: new Date(2024, 1, 1),
      completedBy: 'System'
    },
    {
      id: 'preparation',
      title: 'Preparation',
      status: 'complete',
      description: 'Complete',
      allowCompletion: false,
      completedDate: new Date(2024, 1, 2),
      completedBy: 'Production Team'
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

  get completedSteps(): number {
    return this.orderSteps.filter(step => step.status === 'complete').length;
  }

  get totalSteps(): number {
    return this.orderSteps.length;
  }

  get progressPercentage(): number {
    return Math.round((this.completedSteps / this.totalSteps) * 100);
  }

  onStepCompleted(data: WorkflowCompletionData): void {
    console.log('Step completed:', data);
    
    // Update the step status
    const step = this.orderSteps.find(s => s.id === data.stepId);
    if (step) {
      step.status = 'complete';
      step.description = 'Complete';
      step.completedDate = new Date();
      step.completedBy = 'Current User';
      step.comments = data.comments;
      
      // Add to activity log
      this.addToActivityLog(`Completed step: ${step.title}`);
      
      // Move to next step if available
      const currentIndex = this.orderSteps.findIndex(s => s.id === data.stepId);
      if (currentIndex >= 0 && currentIndex < this.orderSteps.length - 1) {
        const nextStep = this.orderSteps[currentIndex + 1];
        if (nextStep.status === 'waiting') {
          nextStep.status = 'ready';
          nextStep.description = 'Ready to Complete';
          this.addToActivityLog(`Step ${nextStep.title} is now ready`);
        }
      }
      
      // Simulate API call
      this.simulateApiCall(data);
    }
  }

  onStepClicked(step: WorkflowStep): void {
    console.log('Step clicked:', step);
    this.addToActivityLog(`Clicked on step: ${step.title}`);
  }

  private simulateApiCall(data: WorkflowCompletionData): void {
    this.isLoading = true;
    
    // Simulate file upload if photos are present
    if (data.photos && data.photos.length > 0) {
      this.addToActivityLog(`Uploading ${data.photos.length} photo(s)...`);
    }
    
    // Simulate API delay
    setTimeout(() => {
      this.isLoading = false;
      this.addToActivityLog('Step saved successfully');
    }, 2000);
  }

  private addToActivityLog(message: string): void {
    this.activityLog.unshift({
      timestamp: new Date(),
      message
    });
    
    // Keep only last 10 entries
    if (this.activityLog.length > 10) {
      this.activityLog = this.activityLog.slice(0, 10);
    }
  }
} 