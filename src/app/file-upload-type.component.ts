import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FileUploadComponent } from './wefab/supplier/supplier-onboarding/file-upload.component';
import { CommonService } from './wefab/shared/common.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';

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
          <p class="text-muted small">
            {{ props['acceptedTypes'] || props['accept'] ? 'Accepted file types: ' + (props['acceptedTypes'] || props['accept']) : 'All file types supported' }} (max 100MB)
          </p>
        </div>
      </div>
      
      <input 
        type="file" 
        #fileInput
        style="display: none;" 
        (change)="onFileSelected($event)"
        [multiple]="props['multiple'] === true"
        [accept]="props['acceptedTypes'] || props['accept'] || ''"
      />
      
      <!-- File type error message -->
      <div *ngIf="fileTypeError" class="text-danger small mt-1">
        {{ fileTypeError }}
      </div>
      
      <!-- Display uploaded files in a horizontal grid -->
      <div *ngIf="uploadedFiles.length > 0" class="uploaded-files-grid mt-3">
        <div *ngFor="let file of uploadedFiles; let i = index" class="file-card" (click)="handleFileCardClick(file, $event)">
          <!-- Remove button at top right corner -->
          <button type="button" class="btn-action btn-remove" 
                  (click)="removeFile(i, $event)" title="Remove">
            <i class="pi pi-times"></i>
          </button>
          
          <!-- File type icon or thumbnail for images -->
          <div class="file-icon" 
               [ngClass]="[
                 getFileIconClass(file.type || getFileTypeFromUrl(file.url)),
                 isFileUploading(file) ? 'uploading' : '',
                 isFileUploaded(file) ? 'uploaded' : '',
                 isFileUploadFailed(file) ? 'error' : ''
               ]">
            <img *ngIf="isImageFile(file.type || getFileTypeFromUrl(file.url)) && file.url" 
                 [src]="file.url" 
                 alt="Thumbnail" 
                 class="file-thumbnail">
            <i *ngIf="!isImageFile(file.type || getFileTypeFromUrl(file.url)) || !file.url" 
               [class]="getFileIconClass(file.type || getFileTypeFromUrl(file.url))"></i>
          </div>
          
          <!-- File info -->
          <div class="file-details">
            <div class="file-name" [title]="file.name">{{ file.name }}</div>
            <div class="file-size">{{ formatFileSize(file.size) }}</div>
            
            <!-- Loading indicator -->
            <div *ngIf="isFileUploading(file)" class="file-upload-progress">
              <div class="progress">
                <div class="progress-bar progress-bar-striped progress-bar-animated" 
                     role="progressbar" 
                     [style.width]="(file.progress || 0) + '%'"
                     [attr.aria-valuenow]="file.progress || 0" 
                     aria-valuemin="0" 
                     aria-valuemax="100">
                  {{ file.progress }}%
                </div>
              </div>
              <small class="upload-status uploading">
                <i class="pi pi-spinner pi-spin mr-1"></i> Uploading...
              </small>
            </div>
            
            <!-- Success indicator -->
            <div *ngIf="isFileUploaded(file)" class="file-upload-success">
              <small class="upload-status success">
                <i class="pi pi-check-circle mr-1"></i> Upload complete
              </small>
            </div>
            
            <!-- Error indicator -->
            <div *ngIf="isFileUploadFailed(file)" class="file-upload-error">
              <small class="upload-status error">
                <i class="pi pi-exclamation-circle mr-1"></i> 
                {{ file.errorMessage || 'Upload failed' }}
              </small>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Image Preview Modal -->
      <div *ngIf="previewImage" class="file-preview-modal" (click)="closePreview($event)">
        <div class="modal-content" (click)="preventClose($event)">
          <button class="modal-close" (click)="closePreview($event)">
            <i class="pi pi-times"></i>
          </button>
          <img [src]="previewImage" alt="File preview" />
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
    
    /* New horizontal grid layout */
    .uploaded-files-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px;
      width: 100%;
    }
    
    .file-card {
      display: flex;
      flex-direction: column;
      background-color: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #eee;
      overflow: hidden;
      transition: all 0.2s ease;
      height: 100%;
      position: relative;
      cursor: pointer;
    }
    
    .file-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
    
    .file-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 80px;
      background-color: #f1f5f9;
      overflow: hidden;
    }
    
    .file-icon i {
      font-size: 2rem;
    }
    
    .file-thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .file-details {
      padding: 10px;
      flex-grow: 1;
    }
    
    .file-name {
      font-weight: 500;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 4px;
    }
    
    .file-size {
      font-size: 0.75rem;
      color: #6c757d;
    }
    
    .file-actions {
      display: flex;
      padding: 8px;
      border-top: 1px solid #eee;
      background-color: #fff;
    }
    
    .btn-action {
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      margin-right: 6px;
      flex: 1;
      transition: all 0.2s ease;
    }
    
    .btn-download {
      color: #198754;
    }
    
    .btn-download:hover {
      background-color: rgba(25, 135, 84, 0.1);
    }
    
    .btn-view {
      color: #0d6efd;
    }
    
    .btn-view:hover {
      background-color: rgba(13, 110, 253, 0.1);
    }
    
    .btn-remove {
      color: #dc3545;
      position: absolute;
      top: 5px;
      right: 5px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      width: 24px;
      height: 24px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      margin: 0;
    }
    
    .btn-remove:hover {
      background-color: rgba(220, 53, 69, 0.2);
    }
    
    /* File type icon colors */
    .file-icon-pdf {
      color: #e74c3c;
    }
    
    .file-icon-doc, .file-icon-docx {
      color: #4285f4;
    }
    
    .file-icon-xls, .file-icon-xlsx {
      color: #0f9d58;
    }
    
    .file-icon-image {
      color: #ff9800;
    }
    
    .file-icon-default {
      color: #7f8c8d;
    }

    /* Image preview modal */
    .file-preview-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .modal-content {
      max-width: 90%;
      max-height: 90%;
      position: relative;
    }

    .modal-content img {
      max-width: 100%;
      max-height: 90vh;
      object-fit: contain;
    }

    .modal-close {
      position: absolute;
      top: -30px;
      right: -30px;
      color: white;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
    }
    
    /* File upload progress styles */
    .file-upload-progress {
      margin-top: 8px;
    }
    
    .progress {
      height: 6px;
      border-radius: 3px;
      overflow: hidden;
      background-color: #e9ecef;
      margin-bottom: 4px;
    }
    
    .progress-bar {
      background-color: #2563eb;
      transition: width 0.2s ease;
    }
    
    .progress-bar-striped {
      background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
      background-size: 1rem 1rem;
    }
    
    .progress-bar-animated {
      animation: progress-bar-stripes 1s linear infinite;
    }
    
    @keyframes progress-bar-stripes {
      from { background-position: 1rem 0; }
      to { background-position: 0 0; }
    }
    
    /* Upload status styles */
    .upload-status {
      display: flex;
      align-items: center;
      font-size: 0.75rem;
      padding: 2px 0;
    }
    
    .upload-status i {
      margin-right: 4px;
    }
    
    .upload-status.uploading {
      color: #2563eb;
    }
    
    .upload-status.success {
      color: #10b981;
    }
    
    .upload-status.error {
      color: #ef4444;
    }
    
    .file-upload-success, .file-upload-error {
      margin-top: 8px;
    }
    
    .file-icon {
      position: relative;
    }
    
    /* Status indicators on file icon */
    .file-icon::after {
      content: '';
      position: absolute;
      bottom: -5px;
      right: -5px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #fff;
      border: 2px solid #fff;
      display: none;
    }
    
    .file-icon.uploading::after {
      display: block;
      background-color: #2563eb;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18px" height="18px"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>');
      background-size: 12px;
      background-position: center;
      background-repeat: no-repeat;
      animation: spin 1.5s linear infinite;
    }
    
    .file-icon.uploaded::after {
      display: block;
      background-color: #10b981;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18px" height="18px"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>');
      background-size: 12px;
      background-position: center;
      background-repeat: no-repeat;
    }
    
    .file-icon.error::after {
      display: block;
      background-color: #ef4444;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="18px" height="18px"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>');
      background-size: 12px;
      background-position: center;
      background-repeat: no-repeat;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class FormlyFieldFileUploadComponent extends FieldType<FieldTypeConfig> implements OnInit {
  constructor(private commonService: CommonService) {
    super();
  }
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  uploadedFiles: any[] = []; // Store file objects with url property
  fileTypeError: string = '';
  previewImage: string | null = null;
  
  ngOnInit(): void {
    // Initialize uploadedFiles from form control value
    this.initializeUploadedFiles(this.formControl?.value);
    
    // Listen for further changes to form control
    this.formControl?.valueChanges.subscribe(value => {
      if (value !== this.uploadedFiles) {
        this.initializeUploadedFiles(value);
      }
    });
  }
  
  initializeUploadedFiles(value: any): void {
    if (!value) {
      this.uploadedFiles = [];
      return;
    }
    
    if (Array.isArray(value)) {
      // Handle array values (for multiple file upload)
      this.uploadedFiles = value.map(file => {
        if (typeof file === 'string') {
          // If the value is a URL string
          return {
            name: this.getFileNameFromUrl(file),
            size: 0,
            type: this.getFileTypeFromUrl(file),
            url: file,
            uploading: false,
            uploaded: true,
            error: false,
            progress: 100
          };
        }
        // If the value is a file object
        return {
          ...file,
          uploading: file.uploading || false,
          uploaded: file.uploaded !== undefined ? file.uploaded : (file.url ? true : false),
          error: file.error || false,
          progress: file.progress || (file.url ? 100 : 0)
        };
      });
    } else if (typeof value === 'string') {
      // Handle string value (URL for single file upload)
      this.uploadedFiles = [{
        name: this.getFileNameFromUrl(value),
        size: 0,
        type: this.getFileTypeFromUrl(value),
        url: value,
        uploading: false,
        uploaded: true,
        error: false,
        progress: 100
      }];
    } else {
      // Handle object value (file object for single file upload)
      const file = value;
      this.uploadedFiles = [{
        ...file,
        uploading: file.uploading || false,
        uploaded: file.uploaded !== undefined ? file.uploaded : (file.url ? true : false),
        error: file.error || false,
        progress: file.progress || (file.url ? 100 : 0)
      }];
    }
  }
  
  // Helper methods to extract filename and type from URL
  getFileNameFromUrl(url: string): string {
    if (!url) return 'File';
    
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
    if (!url) return 'application/octet-stream';
    
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
  
  // Get appropriate icon class based on file type
  getFileIconClass(mimeType: string): string {
    if (!mimeType) return 'pi pi-file file-icon-default';
    
    // Image files
    if (mimeType.startsWith('image/')) {
      return 'pi pi-image file-icon-image';
    }
    
    // PDF files
    if (mimeType === 'application/pdf') {
      return 'pi pi-file-pdf file-icon-pdf';
    }
    
    // Word documents
    if (mimeType === 'application/msword' || 
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return 'pi pi-file-word file-icon-doc';
    }
    
    // Excel files
    if (mimeType === 'application/vnd.ms-excel' || 
        mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return 'pi pi-file-excel file-icon-xls';
    }
    
    // Default file icon
    return 'pi pi-file file-icon-default';
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
    
    if (event.dataTransfer?.files.length) {
      this.fileTypeError = ''; // Reset any previous error
      
      // Check file types if accept or acceptedTypes is specified
      if ((this.props['accept'] || this.props['acceptedTypes']) && !this.validateFileTypes(event.dataTransfer.files)) {
        return; // Stop if validation fails
      }
      
      this.updateFiles(event.dataTransfer.files);
    }
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.fileTypeError = ''; // Reset any previous error
      
      // Check file types if accept or acceptedTypes is specified
      if ((this.props['accept'] || this.props['acceptedTypes']) && !this.validateFileTypes(input.files)) {
        input.value = ''; // Clear the input
        return; // Stop if validation fails
      }
      
      this.updateFiles(input.files);
    }
  }
  
  // Validate file types
  validateFileTypes(files: FileList): boolean {
    if (!this.props['accept'] && !this.props['acceptedTypes']) {
      return true; // No restrictions
    }
    
    // Use acceptedTypes if available, otherwise fall back to accept
    const acceptAttribute = this.props['acceptedTypes'] || this.props['accept'];
    if (!acceptAttribute) {
      return true;
    }
    
    const acceptedTypes = acceptAttribute.split(',').map((type: string) => type.trim().toLowerCase());
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();
      
      // Check for extension match (e.g., .zip)
      const extensionMatch = acceptedTypes.some((type: string) => 
        type.startsWith('.') && fileName.endsWith(type)
      );
      
      // Check for MIME type match (e.g., application/zip)
      const mimeTypeMatch = acceptedTypes.some((type: string) => {
        if (!type.startsWith('.')) {
          if (type.endsWith('/*')) {
            // Handle wildcard MIME types (e.g., image/*)
            const baseType = type.substring(0, type.length - 1);
            return fileType.startsWith(baseType);
          }
          return fileType === type;
        }
        return false;
      });
      
      if (!extensionMatch && !mimeTypeMatch) {
        // Use custom error message if provided
        if (this.props['fileTypeErrorMessage']) {
          this.fileTypeError = this.props['fileTypeErrorMessage'];
        } else {
          this.fileTypeError = `File type not allowed: ${file.name}. Please upload only ${acceptAttribute} files.`;
        }
        return false;
      }
    }
    
    return true;
  }
  
  updateFiles(fileList: FileList): void {
    if (this.props['multiple'] === true) {
      // For multiple file upload
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const fileObj = {
          name: file.name,
          size: file.size,
          type: file.type,
          uploading: true,  // Mark as uploading
          uploaded: false,  // Not yet uploaded
          error: false,     // No error yet
          progress: 0       // Initialize progress at 0
        };
        
        // Add to array immediately with uploading state
        this.uploadedFiles.push(fileObj);
        
        // Start the upload
        this.uploadFile(file, this.uploadedFiles.length - 1);
      }
    } else {
      // For single file upload
      const file = fileList[0];
      const fileObj = {
        name: file.name,
        size: file.size,
        type: file.type,
        uploading: true,  // Mark as uploading
        uploaded: false,  // Not yet uploaded
        error: false,     // No error yet
        progress: 0       // Initialize progress at 0
      };
      
      // Replace existing files with new one in uploading state
      this.uploadedFiles = [fileObj];
      
      // Start the upload
      this.uploadFile(file, 0);
    }
    
    // Update form control value
    this.updateFormControlValue();
  }
  
  // New method to handle file upload with progress tracking
  uploadFile(file: File, fileIndex: number): void {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_name', file.name);
    
    // Debug logging
    console.log('Starting file upload:', file.name);
    
    this.commonService.uploadFileWithProgress(formData).subscribe({
      next: (event: any) => {
        console.log('Upload event type:', event.type, 'Event:', event);
        
        switch (event.type) {
          case HttpEventType.Sent:
            console.log('Request sent to server');
            break;
            
          case HttpEventType.UploadProgress:
            if (event.total) {
              const percentDone = Math.round(100 * event.loaded / event.total);
              console.log(`Upload progress: ${percentDone}%`);
              this.uploadedFiles[fileIndex].progress = percentDone;
              this.uploadedFiles[fileIndex].uploading = true;
              this.uploadedFiles[fileIndex].uploaded = false;
              
              // Force change detection
              this.uploadedFiles = [...this.uploadedFiles];
              this.updateFormControlValue();
            }
            break;
            
          case HttpEventType.ResponseHeader:
            // Got response headers, check if successful
            if (event.status === 200 || event.status === 201) {
              console.log('Upload successful (from headers):', event.status);
              this.uploadedFiles[fileIndex].uploading = false;
              this.uploadedFiles[fileIndex].uploaded = true;
              this.uploadedFiles[fileIndex].progress = 100;
              
              // Force change detection
              this.uploadedFiles = [...this.uploadedFiles];
              this.updateFormControlValue();
            }
            break;
            
          case HttpEventType.DownloadProgress:
            // Not typically used for uploads
            console.log('Download progress event during upload');
            break;
            
          case HttpEventType.Response:
            console.log('Full response received:', event.body);
            
            // Always mark as complete when we get a full response
            this.uploadedFiles[fileIndex].uploading = false;
            this.uploadedFiles[fileIndex].uploaded = true;
            this.uploadedFiles[fileIndex].progress = 100;
            
            // Set URL if available in response
            if (event.body) {
              if (event.body.url) {
                this.uploadedFiles[fileIndex].url = event.body.url;
              } else if (typeof event.body === 'string') {
                // Try to parse if string
                try {
                  const parsed = JSON.parse(event.body);
                  if (parsed && parsed.url) {
                    this.uploadedFiles[fileIndex].url = parsed.url;
                  }
                } catch (e) {
                  // If not JSON, treat as direct URL
                  this.uploadedFiles[fileIndex].url = event.body;
                }
              } else if (event.body.message && typeof event.body.message === 'string') {
                // Some APIs return message with URL
                this.uploadedFiles[fileIndex].url = event.body.message;
              } else if (event.body.file_url) {
                // Some APIs use file_url
                this.uploadedFiles[fileIndex].url = event.body.file_url;
              }
            }
            
            // Force change detection
            this.uploadedFiles = [...this.uploadedFiles];
            this.updateFormControlValue();
            break;
            
          default:
            console.log('Unknown event type:', event.type);
            // For safety, mark as complete if it's not a progress event
            if (event.type !== HttpEventType.UploadProgress) {
              this.uploadedFiles[fileIndex].uploading = false;
              this.uploadedFiles[fileIndex].uploaded = true;
              this.uploadedFiles[fileIndex].progress = 100;
              
              // Force change detection
              this.uploadedFiles = [...this.uploadedFiles];
              this.updateFormControlValue();
            }
        }
      },
      error: (error: any) => {
        console.error('Upload error:', error);
        // Mark as failed
        this.uploadedFiles[fileIndex].uploading = false;
        this.uploadedFiles[fileIndex].uploaded = false;
        this.uploadedFiles[fileIndex].error = true;
        this.uploadedFiles[fileIndex].errorMessage = 'Failed to upload: ' + (error.message || 'Unknown error');
        
        // Force change detection
        this.uploadedFiles = [...this.uploadedFiles];
        this.updateFormControlValue();
      },
      complete: () => {
        console.log('Upload subscription complete for file:', file.name);
        // Ensure upload is marked as complete if the complete callback fires
        if (this.uploadedFiles[fileIndex].uploading) {
          this.uploadedFiles[fileIndex].uploading = false;
          this.uploadedFiles[fileIndex].uploaded = true;
          this.uploadedFiles[fileIndex].progress = 100;
          
          // Force change detection
          this.uploadedFiles = [...this.uploadedFiles];
          this.updateFormControlValue();
        }
      }
    });
  }

  // Helper to check if a file is currently uploading
  isFileUploading(file: any): boolean {
    // Explicit check for uploading flag
    return file && file.uploading === true;
  }
  
  // Helper to check if a file has been uploaded successfully
  isFileUploaded(file: any): boolean {
    // Check for explicit uploaded flag
    if (file && file.uploaded === true) return true;
    
    // Fallback: if file has URL but no explicit status, consider it uploaded
    if (file && file.url && file.uploading !== true && file.error !== true) return true;
    
    return false;
  }
  
  // Helper to check if a file upload has failed
  isFileUploadFailed(file: any): boolean {
    return file && file.error === true;
  }
  
  // Helper method to update form control value consistently
  updateFormControlValue(): void {
    if (!this.formControl) return;
    
    if (this.props['multiple'] === true) {
      // Determine whether to store URLs or file objects
      const storeUrlsOnly = 
        // Explicit option
        this.props['storeUrlsOnly'] === true ||
        // Infer from existing value type
        (Array.isArray(this.formControl.value) && 
         this.formControl.value.length > 0 && 
         typeof this.formControl.value[0] === 'string');
      
      if (storeUrlsOnly) {
        // Store just the URLs in an array
        const urls = this.uploadedFiles
          .filter(f => f.url)
          .map(f => f.url);
        this.formControl.setValue(urls);
      } else {
        // Store the full file objects
        this.formControl.setValue([...this.uploadedFiles]);
      }
    } else {
      // Single file upload
      const storeUrlOnly = 
        // Explicit option
        this.props['storeUrlOnly'] === true ||
        // Infer from existing value type
        typeof this.formControl.value === 'string';
      
      if (this.uploadedFiles.length === 0) {
        this.formControl.setValue(null);
      } else if (storeUrlOnly) {
        // Store just the URL string
        this.formControl.setValue(this.uploadedFiles[0].url || null);
      } else {
        // Store the file object
        this.formControl.setValue(this.uploadedFiles[0]);
      }
    }
    
    this.formControl.markAsDirty();
  }
  
  removeFile(index: number, event: Event): void {
    event.stopPropagation(); // Prevent triggering fileInput click
    
    // Remove file from array
    this.uploadedFiles.splice(index, 1);
    
    // Update form control value
    this.updateFormControlValue();
    
    // Reset file input if all files removed
    if (this.uploadedFiles.length === 0) {
      this.fileInputRef.nativeElement.value = '';
    }
  }
  
  formatFileSize(size: number): string {
    if (size === 0) return '';  // Handle unknown size for existing files
    
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
  
  // New method to download files
  downloadFile(url: string, fileName: string, event: Event): void {
    event.stopPropagation(); // Prevent triggering fileInput click
    
    if (!url || url.trim() === '') {
      console.warn('Cannot download file: URL is empty or undefined');
      return;
    }
    
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download';
    link.target = '_blank';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Handle click on file card
  handleFileCardClick(file: any, event: Event): void {
    // Don't do anything if clicking on buttons
    const target = event.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    
    // Only open preview for image files
    const fileType = file.type || this.getFileTypeFromUrl(file.url);
    if (fileType.startsWith('image/') && file.url) {
      this.previewImage = file.url;
      event.stopPropagation();
    }
  }
  
  // Close preview when clicking outside the image
  closePreview(event: Event): void {
    this.previewImage = null;
  }
  
  // Prevent closing when clicking on the image itself
  preventClose(event: Event): void {
    event.stopPropagation();
  }

  // Check if file is an image
  isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }
}