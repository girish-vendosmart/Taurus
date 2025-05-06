import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FileUploadComponent } from './wefab/supplier/supplier-onboarding/file-upload.component';

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
  `]
})
export class FormlyFieldFileUploadComponent extends FieldType<FieldTypeConfig> {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  
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
      this.formControl.setValue(fileList);
      this.formControl.markAsTouched();
    }
  }
  
  onFileSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      this.formControl.setValue(files);
      this.formControl.markAsTouched();
    }
  }
} 