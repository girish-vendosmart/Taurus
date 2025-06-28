import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';

export interface WorkflowStep {
  id: string;
  title: string;
  status: 'complete' | 'in-progress' | 'waiting' | 'ready';
  description?: string;
  completedDate?: Date;
  completedBy?: string;
  photos?: string[];
  comments?: string;
  allowCompletion?: boolean;
  requiresPhotos?: boolean;
  requiresComments?: boolean;
  isOpenDialog?: boolean;
}

export interface WorkflowCompletionData {
  stepId: string;
  photos?: File[];
  comments?: string;
}

@Component({
  selector: 'app-approval-workflow',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    InputTextareaModule,
    RippleModule,
    TooltipModule,
    FormsModule
  ],
  templateUrl: './approval-workflow.component.html',
  styleUrls: ['./approval-workflow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApprovalWorkflowComponent implements OnInit {
  @Input() title: string = 'Order Tracking';
  @Input() steps: WorkflowStep[] = [];
  @Input() loading: boolean = false;
  @Input() allowInteraction: boolean = true;
  @Input() useCustomSteps: boolean = false; // New property to control step behavior

  @Output() stepCompleted = new EventEmitter<WorkflowCompletionData>();
  @Output() stepClicked = new EventEmitter<WorkflowStep>();

  // Modal states
  showCompletionModal: boolean = false;
  currentStep: WorkflowStep | null = null;
  completionComments: string = '';
  selectedFiles: File[] = [];
  uploadError: string = '';

  // Default workflow steps - starting from preparation
  workflowSteps: any[] = [];

  isDocumentRequired(): boolean {
    if (!this.currentStep) return false;
    
    const mandatorySteps = [
      'finishing',
      'quality-inspection',
      'dispatch',
      'order-complete'
    ];
    
    return mandatorySteps.includes(this.currentStep.id);
  }

  isCommentRequired(): boolean {
    if (!this.currentStep) return false;
    
    const mandatorySteps = [
      'finishing',
      'quality-inspection',
      'dispatch',
      'order-complete'
    ];
    
    return mandatorySteps.includes(this.currentStep.id);
  }

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: any): void {
    if(changes.steps && changes.steps.currentValue.length > 0) {
      this.steps = changes.steps.currentValue;
    }
  }

  getStepIcon(step: WorkflowStep): string {
    switch (step.status) {
      case 'complete':
        return 'pi pi-check';
      case 'ready':
        return 'pi pi-play';
      case 'in-progress':
        return 'pi pi-sync';
      default:
        return 'pi pi-clock';
    }
  }

  getStepIconClass(step: WorkflowStep): string {
    switch (step.status) {
      case 'complete':
        return 'step-icon-complete';
      case 'ready':
        return 'step-icon-active';
      case 'in-progress':
        return 'step-icon-under-review';
      default:
        return 'step-icon-waiting';
    }
  }

  getStepButtonText(step: WorkflowStep): string {
    switch (step.status) {
      case 'complete':
        return 'Completed';
      case 'ready':
        return 'Start';
      case 'in-progress':
        return 'In Progress';
      default:
        return 'Waiting';
    }
  }

  getStepButtonClass(step: WorkflowStep): string {
    switch (step.status) {
      case 'complete':
        return 'p-button-success p-button-sm';
      case 'in-progress':
      case 'ready':
        return 'p-button-primary p-button-sm';
      default:
        return 'p-button-secondary p-button-sm p-button-outlined';
    }
  }

  canCompleteStep(step: WorkflowStep): boolean {
    // A step can be completed if:
    // 1. Interaction is allowed
    // 2. The step is ready or in-progress
    // 3. All previous steps are complete
    if (!this.allowInteraction) return false;
    
    const stepIndex = this.steps.findIndex(s => s.id === step.id);
    if (stepIndex === -1) return false;
    
    // Check if all previous steps are complete
    const allPreviousComplete = this.steps
      .slice(0, stepIndex)
      .every(s => s.status === 'complete');
    
    return (step.status === 'ready' || step.status === 'in-progress') && allPreviousComplete;
  }

  onStepClick(step: WorkflowStep): void {
    // First emit the click event
    this.stepClicked.emit(step);
    
    // Check if the step can be completed
    if (!this.canCompleteStep(step)) {
      return;
    }
    
    if (step.isOpenDialog) {
      // Open the completion modal for steps that require it
      this.openCompletionModal(step);
    } else {
      // For steps that don't require a dialog (like Supplier Confirmation)
      // emit the completion event directly
      this.stepCompleted.emit({
        stepId: step.id,
        photos: [],
        comments: ''
      });
    }
  }

  openCompletionModal(step: WorkflowStep): void {
    this.currentStep = step;
    this.completionComments = step.comments || '';
    this.selectedFiles = [];
    this.uploadError = '';
    this.showCompletionModal = true;
    this.cdr.detectChanges();
  }

  closeCompletionModal(): void {
    this.showCompletionModal = false;
    this.currentStep = null;
    this.completionComments = '';
    this.selectedFiles = [];
    this.uploadError = '';
    this.cdr.detectChanges();
  }

  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    const files = element.files;
    this.uploadError = '';

    if (files && files.length > 0) {
      this.selectedFiles = Array.from(files);
      this.validateFiles();
    }
    this.cdr.detectChanges();
  }

  private validateFiles(): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
      // Videos
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm',
      // Documents
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'text/csv'
    ];

    for (const file of this.selectedFiles) {
      if (file.size > maxSize) {
        this.uploadError = `File "${file.name}" is too large. Maximum size is 10MB.`;
        this.selectedFiles = [];
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        this.uploadError = `File "${file.name}" is not a supported file type. Supported types: images, videos, PDF, Word, Excel, PowerPoint, and text files.`;
        this.selectedFiles = [];
        return;
      }
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.cdr.detectChanges();
  }

  canSubmitCompletion(): boolean {
    if (!this.currentStep) return false;

    // For Finishing, Quality Inspection, Dispatch, and Order Complete steps
    const mandatorySteps = [
      'finishing',
      'quality-inspection',
      'dispatch',
      'order-complete'
    ];

    if (mandatorySteps.includes(this.currentStep.id)) {
      // Both photos and comments are mandatory
      if (this.selectedFiles.length === 0) {
        this.uploadError = 'Please attach at least one document';
        return false;
      }
      if (!this.completionComments.trim()) {
        this.uploadError = 'Please add comments';
        return false;
      }
    }

    // For other steps (Preparation, Work In Progress)
    // Photos and comments are optional, but validate if provided
    if (this.selectedFiles.length > 0) {
      this.validateFiles();
      if (this.uploadError) return false;
    }

    return true;
  }

  onCompleteStep(): void {
    if (!this.currentStep || !this.canSubmitCompletion()) {
      return;
    }

    const completionData: WorkflowCompletionData = {
      stepId: this.currentStep.id,
      photos: this.selectedFiles,
      comments: this.completionComments.trim()
    };

    this.stepCompleted.emit(completionData);
    this.closeCompletionModal();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  trackByStepId(index: number, step: WorkflowStep): string {
    return step.id;
  }

  getStepStatusText(step: WorkflowStep): string {
    switch (step.status) {
      case 'complete':
        return 'Completed';
      case 'ready':
        return 'In Progress';
      case 'waiting':
        return 'Yet to Start';
      default:
        return '';
    }
  }
} 