import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FileUploadComponent } from './wefab/supplier/supplier-onboarding/file-upload.component';
import { CommonService } from './wefab/shared/common.service';

@Component({
  selector: 'formly-field-file-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule, FileUploadComponent],
  template: `
    <div class="mb-3">
      <label *ngIf="props.label" class="form-label d-flex align-items-center">
        {{ props.label }}
        <span class="text-danger" *ngIf="props.required">*</span>
      </label>
      <p *ngIf="props.description" class="form-text text-muted">{{ props.description }}</p>
      
      <div class="file-upload-container" 
           (click)="triggerFileInput()" 
           (dragover)="onDragOver($event)" 
           (drop)="onDrop($event)">
        <div class="upload-icon">
          <i class="pi pi-cloud-upload"></i>
        </div>
        <div class="upload-text">
          <p><strong>Click to upload</strong> or drag and drop</p>
          <p class="text-muted small">All file types supported (max 100MB)</p>
        </div>
      </div>
      
      <input 
        type="file" 
        #fileInput
        style="display: none;" 
        (change)="onFileSelected($event)"
        [multiple]="props['multiple'] || false"
      />
      
      <!-- Display uploaded files -->
      <div *ngIf="uploadedFiles.length > 0" class="uploaded-files mt-3">
        <div *ngFor="let file of uploadedFiles; let i = index" class="uploaded-file-item">
          <div class="file-info">
            <i class="pi pi-file me-2"></i>
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">({{ formatFileSize(file.size) }})</span>
          </div>
          <button type="button" class="btn-remove" (click)="removeFile(i, $event)">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>
      
      <div class="invalid-feedback d-block" *ngIf="showError">
        <formly-validation-message [field]="field"></formly-validation-message>
      </div>
    </div>
  `,
  styles: [`
    .file-upload-container {
      border: 1px dashed #ccc;
      border-radius: 6px;
      padding: 1.75rem 1.5rem;
      text-align: center;
      transition: all 0.3s ease;
      background-color: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin: 0.5rem 0;
      position: relative;
    }
    
    .file-upload-container:hover {
      border-color: #2563eb;
      background-color: rgba(37, 99, 235, 0.02);
    }
    
    .upload-icon {
      font-size: 1.75rem;
      color: #2563eb;
      margin-bottom: 0.75rem;
      height: 40px;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(37, 99, 235, 0.1);
      border-radius: 50%;
    }
    
    .upload-icon i {
      font-size: 1.25rem;
    }
    
    .upload-text p {
      margin-bottom: 0.25rem;
      color: #333;
    }
    
    .upload-text .small {
      font-size: 0.75rem;
      color: #6b7280;
    }
    
    .uploaded-files {
      margin-top: 1rem;
    }
    
    .uploaded-file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background-color: #f8f9fa;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      border: 1px solid #eee;
    }
    
    .file-info {
      display: flex;
      align-items: center;
      overflow: hidden;
    }
    
    .file-name {
      font-weight: 500;
      margin-right: 0.5rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .file-size {
      color: #6c757d;
      font-size: 0.85rem;
    }
    
    .btn-remove {
      background: none;
      border: none;
      color: #dc3545;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      width: 28px;
      height: 28px;
    }
    
    .btn-remove:hover {
      background-color: rgba(220, 53, 69, 0.1);
    }
  `]
})
export class FormlyFieldFileUploadComponent extends FieldType<FieldTypeConfig> {

  constructor (private commonService: CommonService) {
    super();
  }

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  uploadedFiles: File[] = [];
  
  triggerFileInput(): void {
    this.fileInputRef.nativeElement.click();
  }
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }
  
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer && event.dataTransfer.files.length) {
      const fileList = event.dataTransfer.files;
      this.updateFiles(fileList);
    }
  }
  
  onFileSelected(event: Event): void {
    const files:any = (event.target as HTMLInputElement).files;

    let selectedFiles:any = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      selectedFiles.push(file);
    }
    // if (selectedFiles) {
    //   selectedFiles.forEach((file:any) => {
    //     this.commonService.uploadFile(file).subscribe((response) => {
    //       console.log("File uploaded successfully", response)
    //     })
    //   })
    // }

    if (files && files.length > 0) {
      this.updateFiles(files);
    }
  }
  
  updateFiles(fileList: FileList): void {
    // Convert FileList to array and update the form
    if (this.props['multiple']) {
      // For multiple file upload, add to existing files
      const newFiles = Array.from(fileList);
      this.uploadedFiles = [...this.uploadedFiles, ...newFiles];
    } else {
      // For single file upload, replace existing file
      this.uploadedFiles = Array.from(fileList);
    }
    
    // Update form control value
    this.formControl.setValue(this.uploadedFiles.length > 0 ? 
      (this.props['multiple'] ? this.uploadedFiles : this.uploadedFiles[0]) : null);
    this.formControl.markAsTouched();
  }
  
  removeFile(index: number, event: Event): void {
    event.stopPropagation(); // Prevent triggering fileInput click
    
    // Remove file from array
    this.uploadedFiles.splice(index, 1);
    
    // Update form control value
    if (this.uploadedFiles.length === 0) {
      this.formControl.setValue(null);
    } else {
      this.formControl.setValue(this.props['multiple'] ? 
        this.uploadedFiles : this.uploadedFiles[0]);
    }
    
    // Reset file input if all files removed
    if (this.uploadedFiles.length === 0) {
      this.fileInputRef.nativeElement.value = '';
    }
  }
  
  formatFileSize(size: number): string {
    if (size < 1024) {
      return size + ' B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + ' KB';
    } else {
      return (size / (1024 * 1024)).toFixed(1) + ' MB';
    }
  }
} 