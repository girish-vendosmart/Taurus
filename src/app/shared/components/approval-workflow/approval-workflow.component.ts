import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChanges, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../../services/common.service';
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
  fileUrls?: string[];
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

  @Output() stepCompleted = new EventEmitter<WorkflowCompletionData>();
  @Output() stepClicked = new EventEmitter<WorkflowStep>();

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

  constructor(
    private cdr: ChangeDetectorRef,
    private commonService: CommonService
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

    // Validate files if required
    if (this.isDocumentRequired() && this.selectedFiles.length === 0) {
      this.validationErrors.push('Please attach at least one document');
    }

    // Validate comments if required
    if (this.isCommentRequired() && !this.completionComments?.trim()) {
      this.commentError = 'Please add comments for this step';
      this.validationErrors.push(this.commentError);
    }

    // Validate existing files
    this.validateFiles();

    return this.validationErrors.length === 0;
  }

  canSubmitCompletion(): boolean {
    return this.validateCompletionRequirements();
  }

  onCompleteStep(): void {
    if (!this.currentStep || !this.validateCompletionRequirements()) {
      return;
    }

    // If there are files to upload, handle them first
    if (this.selectedFiles.length > 0) {
      this.uploadFiles().subscribe({
        next: (fileUrls) => {
          this.emitCompletionWithFiles(fileUrls);
        },
        error: (error) => {
          console.error('Error uploading files:', error);
          this.uploadError = 'Failed to upload files. Please try again.';
          this.cdr.detectChanges();
        }
      });
    } else {
      // If no files, just emit completion
      this.emitCompletionWithFiles([]);
    }
  }

  private uploadFiles(): Observable<string[]> {
    // Create an array of observables for each file upload
    const uploadObservables = this.selectedFiles.map(file => {
      return new Observable<string>(observer => {
        this.uploadProgress[file.name] = 0;
        
        this.commonService.uploadFile(file).subscribe({
          next: (event: HttpEvent<any>) => {
            if (event.type === HttpEventType.UploadProgress && event.total) {
              // Calculate and update progress
              this.uploadProgress[file.name] = Math.round(100 * event.loaded / event.total);
              this.cdr.detectChanges();
            } else if (event.type === HttpEventType.Response) {
              // Get the file URL from the response
              const fileUrl = event.body?.message?.file_url;
              if (fileUrl) {
                observer.next(fileUrl);
                observer.complete();
              } else {
                observer.error('No file URL in response');
              }
            }
          },
          error: (error) => {
            console.error(`Error uploading file ${file.name}:`, error);
            observer.error(error);
          }
        });
      });
    });

    // Use forkJoin to wait for all uploads to complete
    return forkJoin(uploadObservables);
  }

  private emitCompletionWithFiles(fileUrls: string[]): void {
    const completionData: WorkflowCompletionData = {
      stepId: this.currentStep!.id,
      photos: this.selectedFiles,
      fileUrls: fileUrls,
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

  isDocumentRequired(): boolean {
    if (!this.currentStep) return false;
    return this.currentStep.requiresPhotos === true;
  }

  isCommentRequired(): boolean {
    if (!this.currentStep) return false;
    return this.currentStep.requiresComments === true;
  }
} 