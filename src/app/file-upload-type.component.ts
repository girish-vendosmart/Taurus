import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FileUploadComponent } from './wefab/supplier/supplier-onboarding/file-upload.component';
import { CommonService } from './wefab/shared/common.service';
import { HttpEventType } from '@angular/common/http';
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
          <div class="file-actions">
            <button type="button" class="btn-view" *ngIf="file.url" (click)="viewFile(file.url, $event)">
              <i class="pi pi-eye"></i>
            </button>
            <button type="button" class="btn-remove" (click)="removeFile(i, $event)">
              <i class="pi pi-times"></i>
            </button>
          </div>
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
      flex: 1;
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
    
    .file-actions {
      display: flex;
      align-items: center;
    }
    
    .btn-view, .btn-remove {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      margin-left: 5px;
    }
    
    .btn-view {
      color: #0d6efd;
    }
    
    .btn-view:hover {
      background-color: rgba(13, 110, 253, 0.1);
    }
    
    .btn-remove {
      color: #dc3545;
    }
    
    .btn-remove:hover {
      background-color: rgba(220, 53, 69, 0.1);
    }
  `]
})
export class FormlyFieldFileUploadComponent extends FieldType<FieldTypeConfig> implements OnInit {
  constructor (private commonService: CommonService) {
    super();
  }
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  uploadedFiles: any[] = []; // Changed from File[] to any[] to accommodate url property
  
  ngOnInit() {
    // Initialize uploadedFiles if there's a value already
    if (this.formControl.value) {
      if (Array.isArray(this.formControl.value)) {
        // Handle array of files
        this.uploadedFiles = this.formControl.value.map(file => {
          // If the file is just a URL string
          if (typeof file === 'string') {
            return {
              name: this.getFileNameFromUrl(file),
              size: 0,
              type: this.getFileTypeFromUrl(file),
              url: file
            };
          }
          // If it's already a file object with url
          return file;
        });
      } else if (typeof this.formControl.value === 'string') {
        // Handle single string URL
        this.uploadedFiles = [{
          name: this.getFileNameFromUrl(this.formControl.value),
          size: 0,
          type: this.getFileTypeFromUrl(this.formControl.value),
          url: this.formControl.value
        }];
      } else {
        // Handle single file object
        this.uploadedFiles = [this.formControl.value];
      }
    }
  }
  
  // Helper methods to extract filename and type from URL
  getFileNameFromUrl(url: string): string {
    // Extract filename from URL path
    const urlParts = url.split('/');
    let fileName = urlParts[urlParts.length - 1];
    
    // Remove query parameters if any
    if (fileName.includes('?')) {
      fileName = fileName.split('?')[0];
    }
    
    // Decode URI components
    try {
      return decodeURIComponent(fileName) || 'File';
    } catch (e) {
      return 'File';
    }
  }
  
  getFileTypeFromUrl(url: string): string {
    const fileName = this.getFileNameFromUrl(url);
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    // Map common extensions to MIME types
    const mimeTypes: {[key: string]: string} = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg', 
      'png': 'image/png',
      'gif': 'image/gif',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }
  
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
    const files = (event.target as HTMLInputElement).files;
    
    if (files && files.length > 0) {
      // Add files to UI and upload them to get URLs
      this.updateFiles(files);
    }
  }
  
  updateFiles(fileList: FileList): void {
    // Convert FileList to array and update the form
    if (this.props['multiple']) {
      // For multiple file upload, add to existing files
      const newFiles = Array.from(fileList).map(file => ({
        ...file,
        name: file.name,
        size: file.size,
        type: file.type
      }));
      this.uploadedFiles = [...this.uploadedFiles, ...newFiles];
    } else {
      // For single file upload, replace existing file
      const newFiles = Array.from(fileList).map(file => ({
        ...file,
        name: file.name,
        size: file.size,
        type: file.type
      }));
      this.uploadedFiles = newFiles;
    }
    
    // Upload each file to get the actual URL from the server
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      this.commonService.uploadFile(file).subscribe(
        (event) => {
          // Check if it's a HttpResponse final event (response complete)
          if (event.type === HttpEventType.Response) {
            const response = event.body;
            console.log("File uploaded successfully in updateFiles", response);
            const index = this.uploadedFiles.findIndex(f => f.name === file.name);
            if (index !== -1 && response && response.message && response.message.file_url) {
              // Update URL based on server response
              this.uploadedFiles[index].url = response.message.file_url;
              
              // Update form control value - this is the key change
              if (this.props['multiple']) {
                // For multiple files, we store either the URLs or the file objects with URLs
                const urlsOnly = this.formControl.value === 'filesOnly' ? false : true;
                if (urlsOnly) {
                  // Store just the URLs in an array
                  const urls = this.uploadedFiles
                    .filter(f => f.url)
                    .map(f => f.url);
                  this.formControl.setValue(urls);
                } else {
                  // Store the full file objects
                  this.formControl.setValue(this.uploadedFiles);
                }
              } else {
                // For single file, decide whether to store just the URL or the file object
                const urlOnly = this.formControl.value === 'fileOnly' ? false : true;
                if (urlOnly) {
                  this.formControl.setValue(response.message.file_url);
                } else {
                  this.formControl.setValue(this.uploadedFiles[0]);
                }
              }
              
              // Force change detection to ensure view button appears
              this.formControl.markAsDirty();
            }
          }
        },
        (error) => {
          console.error("Error uploading file in updateFiles:", error);
        }
      );
    }
    
    // Update form control value immediately with files (URLs will be updated later)
    if (this.props['multiple']) {
      // Store either URLs or file objects based on what was used before
      if (Array.isArray(this.formControl.value) && 
          this.formControl.value.length > 0 && 
          typeof this.formControl.value[0] === 'string') {
        // Previously stored just URLs, continue with that approach
        const urls = this.uploadedFiles
          .filter(f => f.url)
          .map(f => f.url);
        this.formControl.setValue(urls);
      } else {
        // Store the file objects
        this.formControl.setValue(this.uploadedFiles);
      }
    } else {
      // For single file, determine format based on previous value
      if (typeof this.formControl.value === 'string') {
        const url = this.uploadedFiles.length > 0 && this.uploadedFiles[0].url 
          ? this.uploadedFiles[0].url 
          : null;
        this.formControl.setValue(url);
      } else {
        // Store the file object
        this.formControl.setValue(this.uploadedFiles.length > 0 ? this.uploadedFiles[0] : null);
      }
    }
    
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
  
  viewFile(url: string, event: Event): void {
    event.stopPropagation(); // Prevent triggering fileInput click
    
    // Check if URL exists before opening
    if (url && url.trim() !== '') {
      window.open(url, '_blank');
    } else {
      console.warn('Cannot open file: URL is empty or undefined');
    }
  }
}