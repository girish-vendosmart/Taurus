import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChanges, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../../services/common.service';
import { SweetAlertService } from '../../services/sweet-alert.service';
import { forkJoin, Observable } from 'rxjs';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'nl2br',
  standalone: true
})
export class Nl2BrPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';
    return this.sanitizer.bypassSecurityTrustHtml(value.replace(/\n/g, '<br>'));
  }
}

export interface WorkflowStep {
  id: string;  // This should be the PO number (e.g., "PO-0000217")
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
  po_number?: string;  // Additional field for PO number if id is different
  isDocumentOptional?: boolean;  // New field for optional documents
  isCommentOptional?: boolean;   // New field for optional comments
}

export interface WorkflowCompletionData {
  stepId: string;
  photos?: File[];
  fileUrls?: string[];
  comments?: string;
}

export interface WorkflowStepCompletionData {
  stepId: string;  // PO number
  comments: string;
  files: File[];
  fileUrls: string[];
  action: string;
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
    FormsModule,
    Nl2BrPipe
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
  @Input() useCustomSteps: boolean = false;

  @Output() stepCompleted = new EventEmitter<WorkflowStepCompletionData>();
  @Output() stepClicked = new EventEmitter<WorkflowStep>();
  @Output() filesUploaded = new EventEmitter<File[]>();

  // Modal states
  showCompletionModal: boolean = false;
  currentStep: WorkflowStep | null = null;
  completionComments: string = '';
  selectedFiles: File[] = [];
  uploadProgress: { [key: string]: number } = {};
  uploadError: string = '';
  commentError: string = '';
  validationErrors: string[] = [];

  // Default workflow steps - starting from preparation
  workflowSteps: any[] = [];

  uploadedFileUrls: string[] = [];

  // Add new property for tracking API call status
  private isSubmitting: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private commonService: CommonService,
    private sweetAlertService: SweetAlertService
  ) {}

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
      // Show confirmation dialog first
      this.sweetAlertService.confirm(
        'Complete Step',
        `Are you sure you want to complete the "${step.title}" step?`,
        'question',
        'Yes, Complete',
        'Cancel'
      ).then((result) => {
        if (result.isConfirmed) {
          // Emit the completion event directly
          this.stepCompleted.emit({
            stepId: step.id,
            comments: '',
            files: [],
            fileUrls: [],
            action: 'Approve'
          });
        }
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
    this.validationErrors = [];

    if (files && files.length > 0) {
      // Add new files to existing selection
      const newFiles = Array.from(files);
      this.selectedFiles = [...this.selectedFiles, ...newFiles];
      this.validateFiles();
    }
    
    // Reset input value to allow selecting the same file again
    element.value = '';
    this.cdr.detectChanges();
  }

  private validateFiles(): void {
    this.validationErrors = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
      // Videos
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm',
      // Documents
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 
      'text/csv'
    ];

    // Check if any files exceed size limit
    const oversizedFiles = this.selectedFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      this.validationErrors.push(
        `Files exceeding 10MB size limit: ${oversizedFiles.map(f => f.name).join(', ')}`
      );
    }

    // Check for invalid file types
    const invalidFiles = this.selectedFiles.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      this.validationErrors.push(
        `Unsupported file types: ${invalidFiles.map(f => f.name).join(', ')}`
      );
    }

    // If there are validation errors, clear the invalid files
    if (this.validationErrors.length > 0) {
      this.selectedFiles = this.selectedFiles.filter(file => 
        file.size <= maxSize && allowedTypes.includes(file.type)
      );
    }

    this.uploadError = this.validationErrors.join('\n');
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.validateCompletionRequirements();
    this.cdr.detectChanges();
  }

  validateCompletionRequirements(): boolean {
    this.validationErrors = [];
    this.commentError = '';

    let isValid = true;

    // Validate files if required (not optional)
    if (this.isDocumentRequired() && (!this.selectedFiles || this.selectedFiles.length === 0)) {
      this.validationErrors.push('Please attach at least one document');
      isValid = false;
    }

    // Validate comments if required (not optional)
    if (this.isCommentRequired() && (!this.completionComments || !this.completionComments.trim())) {
      this.commentError = ' ';
      this.validationErrors.push('Comments are required for this step');
      isValid = false;
    }

    // Validate existing files
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      this.validateFiles();
      // If there are file validation errors, mark as invalid
      if (this.validationErrors.length > 0) {
        isValid = false;
      }
    }

    return isValid;
  }

  canSubmitCompletion(): boolean {
    // For steps with required fields, validate them
    if ((this.currentStep?.requiresPhotos && !this.isDocumentOptional()) || 
        (this.currentStep?.requiresComments && !this.isCommentOptional())) {
      const isValid = this.validateCompletionRequirements();
      console.log('Validation state for required fields:', {
        hasFiles: this.selectedFiles?.length > 0,
        hasComments: !!this.completionComments?.trim(),
        validationErrors: this.validationErrors,
        isValid: isValid,
        isDocumentRequired: this.isDocumentRequired(),
        isCommentRequired: this.isCommentRequired(),
        isDocumentOptional: this.isDocumentOptional(),
        isCommentOptional: this.isCommentOptional()
      });
      return isValid;
    }
    
    // For steps with only optional fields, always allow submission
    // but still validate file formats if files are provided
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      this.validateFiles();
      if (this.validationErrors.length > 0) {
        return false; // Invalid file formats
      }
    }
    
    console.log('Optional fields step - allowing submission');
    return true;
  }

  onCompleteStep(): void {
    console.log('🔥 Complete step clicked');
    console.log('🔥 Current step:', this.currentStep);
    console.log('🔥 Is submitting:', this.isSubmitting);
    
    if (!this.currentStep || this.isSubmitting) {
      console.log('❌ No current step or already submitting');
      return;
    }

    // For steps with required fields, validate first
    console.log('🔍 Checking validation requirements:', {
      requiresPhotos: this.currentStep.requiresPhotos,
      requiresComments: this.currentStep.requiresComments,
      isDocumentOptional: this.isDocumentOptional(),
      isCommentOptional: this.isCommentOptional()
    });
    
    if ((this.currentStep.requiresPhotos && !this.isDocumentOptional()) || 
        (this.currentStep.requiresComments && !this.isCommentOptional())) {
      console.log('🔍 Validating required fields...');
      if (!this.validateCompletionRequirements()) {
        console.log('❌ Validation failed for required fields');
        return;
      }
      console.log('✅ Validation passed for required fields');
    } else {
      console.log('ℹ️ No required fields to validate');
    }

    // Store current values
    const currentStepData = {
      step: this.currentStep,
      files: [...this.selectedFiles],
      comments: this.completionComments?.trim() || ''
    };

    // Close the completion modal first
    this.closeCompletionModal();

    // Always show confirmation dialog before completing any step
    this.sweetAlertService.confirm(
      'Complete Step',
      `Are you sure you want to complete the "${currentStepData.step.title}" step?`,
      'question',
      'Yes, Complete',
      'Cancel'
    ).then((result) => {
      if (result.isConfirmed) {
        console.log('✅ User confirmed step completion');
        console.log('🚀 Setting isSubmitting to true');
        this.isSubmitting = true;

        // Handle file uploads first
        if (currentStepData.files.length > 0) {
          const uploadObservables = currentStepData.files.map(file => 
            this.commonService.uploadFile(file)
          );

          forkJoin(uploadObservables).subscribe({
            next: (responses) => {
              // Extract file URLs from responses
              const fileUrls = responses.map(response => response.message?.file_url).filter(url => url);
              console.log('Files uploaded successfully:', fileUrls);

              // Format comments with HTML paragraph tags if needed
              const formattedComments = currentStepData.comments.startsWith('<p>') ? 
                currentStepData.comments : 
                `<p>${currentStepData.comments}</p>`;

              // Emit completion data to parent with file URLs
              const completionData: WorkflowStepCompletionData = {
                stepId: currentStepData.step.id,
                comments: formattedComments,
                files: [],  // Clear files array since we now have URLs
                fileUrls: fileUrls,
                action: 'Approve'
              };

                        console.log('🎯 Emitting completion data with files:', completionData);
          this.stepCompleted.emit(completionData);
          this.isSubmitting = false;
            },
            error: (error) => {
              console.error('Error uploading files:', error);
              this.sweetAlertService.error('Failed to upload files. Please try again.');
              this.isSubmitting = false;
            }
          });
        } else {
          // No files to upload, emit completion data directly
          const formattedComments = currentStepData.comments.startsWith('<p>') ? 
            currentStepData.comments : 
            `<p>${currentStepData.comments}</p>`;

          const completionData: WorkflowStepCompletionData = {
            stepId: currentStepData.step.id,
            comments: formattedComments,
            files: [],
            fileUrls: [],
            action: 'Approve'
          };

          console.log('🎯 Emitting completion data (no files):', completionData);
          this.stepCompleted.emit(completionData);
          this.isSubmitting = false;
        }
      } else {
        console.log('User cancelled step completion');
        // If user cancels, reopen the modal with previous data
        this.currentStep = currentStepData.step;
        this.selectedFiles = currentStepData.files;
        this.completionComments = currentStepData.comments;
        this.showCompletionModal = true;
        this.cdr.detectChanges();
      }
    });
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

  isDocumentRequired(): boolean {
    return this.currentStep?.requiresPhotos === true && !this.isDocumentOptional();
  }

  isCommentRequired(): boolean {
    return this.currentStep?.requiresComments === true && !this.isCommentOptional();
  }

  isDocumentOptional(): boolean {
    return this.currentStep?.isDocumentOptional === true;
  }

  isCommentOptional(): boolean {
    return this.currentStep?.isCommentOptional === true;
  }
} 