import { Component, ViewChild, ElementRef, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
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
            <div *ngIf="isFileUploading(file) && !isFileProcessing(file)" class="file-upload-progress">
              <div class="progress">
                <div class="progress-bar progress-bar-striped progress-bar-animated" 
                     role="progressbar" 
                     [style.width]="(file.progress || 0) + '%'"
                     [attr.aria-valuenow]="file.progress || 0" 
                     aria-valuemin="0" 
                     aria-valuemax="100">
                  <span class="sr-only">{{ file.progress }}%</span>
                </div>
              </div>
              <small class="upload-status uploading">
                <i class="pi pi-spinner pi-spin mr-1"></i> Uploading... {{ file.progress }}%
              </small>
            </div>
            
            <!-- Processing indicator - shows when progress is 100% but not yet marked as uploaded -->
            <div *ngIf="isFileProcessing(file)" class="file-upload-progress">
              <div class="progress">
                <div class="progress-bar" 
                     role="progressbar" 
                     style="width: 100%"
                     aria-valuenow="100" 
                     aria-valuemin="0" 
                     aria-valuemax="100">
                </div>
              </div>
              <small class="upload-status uploading">
                <i class="pi pi-spinner pi-spin mr-1"></i> Processing...
              </small>
            </div>
            
            <!-- Success indicator -->
            <div *ngIf="isFileUploaded(file)" class="file-upload-success">
              <div class="progress">
                <div class="progress-bar bg-success" 
                     role="progressbar" 
                     style="width: 100%"
                     aria-valuenow="100" 
                     aria-valuemin="0" 
                     aria-valuemax="100">
                </div>
              </div>
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
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
      width: 100%;
      overflow-x: hidden; /* Prevent horizontal scrolling */
    }
    
    .file-card {
      display: flex;
      flex-direction: column;
      background-color: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #eee;
      overflow: hidden;
      transition: all 0.2s ease;
      height: 100%;
      position: relative;
      cursor: pointer;
      max-width: 150px; /* Limit max width */
      margin: 0 auto; /* Center card if smaller than container */
    }
    
    .file-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
    
    .file-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 60px; /* Smaller height for icons/thumbnails */
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
      object-position: center;
    }
    
    .file-details {
      padding: 8px;
      flex-grow: 1;
    }
    
    .file-name {
      font-weight: 500;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 2px;
      font-size: 0.8rem; /* Smaller font */
    }
    
    .file-size {
      font-size: 0.7rem; /* Smaller font */
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
    
    /* Smaller remove button */
    .btn-remove {
      color: #dc3545;
      position: absolute;
      top: 3px;
      right: 3px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      width: 20px;
      height: 20px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      margin: 0;
      font-size: 0.8rem;
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
      transition: width 0.3s ease;
    }
    
    .progress-bar.bg-success {
      background-color: #10b981;
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
      transition: all 0.3s ease;
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
  constructor(private commonService: CommonService, private cdr: ChangeDetectorRef, private ngZone: NgZone) {
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
        // If the value is a file object - preserve both fileId and file_id
        const fileId = file.fileId || file.file_id || '';
        return {
          ...file,
          uploading: file.uploading || false,
          uploaded: file.uploaded !== undefined ? file.uploaded : (file.url ? true : false),
          error: file.error || false,
          progress: file.progress || (file.url ? 100 : 0),
          fileId: fileId,  // Ensure fileId is preserved
          file_id: fileId  // Ensure file_id is preserved for backward compatibility
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
      // Handle object value (file object for single file upload) - preserve both fileId and file_id
      const file = value;
      const fileId = file.fileId || file.file_id || '';
      this.uploadedFiles = [{
        ...file,
        uploading: file.uploading || false,
        uploaded: file.uploaded !== undefined ? file.uploaded : (file.url ? true : false),
        error: file.error || false,
        progress: file.progress || (file.url ? 100 : 0),
        fileId: fileId,  // Ensure fileId is preserved
        file_id: fileId  // Ensure file_id is preserved for backward compatibility
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
  
  // Helper function to consistently finalize the upload process with proper change detection
  private finalizeUpload(fileIndex: number, fileUrl?: string, fileId?: string): void {
    // Ensure we run in NgZone to trigger change detection
    this.ngZone.run(() => {
      if (!this.uploadedFiles[fileIndex]) return;
      
      // Mark as complete and update URL
      this.uploadedFiles[fileIndex].progress = 100;
      this.uploadedFiles[fileIndex].uploading = false;
      this.uploadedFiles[fileIndex].uploaded = true;
      
      if (fileUrl) {
        this.uploadedFiles[fileIndex].url = fileUrl;
      }
      if (fileId) {
        this.uploadedFiles[fileIndex].fileId = fileId;  // Store as fileId for consistency
        this.uploadedFiles[fileIndex].file_id = fileId; // Also store as file_id for backward compatibility
      }

      console.log('this.uploadedFiles', this.uploadedFiles)
      // Force change detection by creating a new array reference
      this.uploadedFiles = [...this.uploadedFiles];
      this.updateFormControlValue();
      
      // Explicitly trigger change detection
      this.cdr.detectChanges();
      
      console.log(`Upload complete for file (${fileIndex}):`, this.uploadedFiles[fileIndex]);
    });
  }
  
  uploadFile(file: File, fileIndex: number): void {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_name', file.name);
    
    // Make sure the file object has all required properties
    if (!this.uploadedFiles[fileIndex]) {
      console.error('File object at index', fileIndex, 'not found');
      return;
    }
    
    // Set initial state to ensure progress starts at 0
    this.uploadedFiles[fileIndex].progress = 0;
    this.uploadedFiles[fileIndex].uploading = true;
    this.uploadedFiles[fileIndex].uploaded = false;
    this.uploadedFiles[fileIndex].error = false;
    
    // Force change detection for initial state
    this.uploadedFiles = [...this.uploadedFiles];
    this.updateFormControlValue();
    this.cdr.detectChanges(); // Force immediate UI update
    
    // Debug logging
    console.log('Starting file upload:', file.name, 'size:', file.size, 'index:', fileIndex);
    
    // Immediately start a deterministic progress animation
    let simulatedProgress = 0;
    const progressInterval = setInterval(() => {
      this.ngZone.run(() => {
        simulatedProgress += 5;
        
        // Cap at 95% until we know the upload is complete
        if (simulatedProgress > 95) {
          simulatedProgress = 95;
        }
        
        // Update the UI with the simulated progress
        if (this.uploadedFiles[fileIndex]) {
          this.uploadedFiles[fileIndex].progress = simulatedProgress;
          this.uploadedFiles = [...this.uploadedFiles]; // Create new array reference for change detection
          this.updateFormControlValue();
          this.cdr.detectChanges(); // Force immediate UI update
        } else {
          // File was removed during upload, stop the interval
          clearInterval(progressInterval);
        }
      });
    }, 100);
    
    // Create a timeout to simulate a minimum upload time
    const minUploadTime = setTimeout(() => {
      // Do nothing - this just ensures there's a minimum time
      // before the upload is marked as complete
    }, 1000);
    
    // Now actually perform the upload
    this.commonService.uploadFileWithProgress(formData).subscribe({
      next: (event: any) => {
        
        console.log('event', event)
        // We're mostly ignoring server progress events since they're unreliable
        // Just log for debugging
        if (event && event.type) {
          console.log(`Upload event (${fileIndex}):`, event.type);
        }
        
        // Only handle the final response event
        if (event && event.type === HttpEventType.Response) {
          // Clear the interval immediately
          clearInterval(progressInterval);
          
          // Extract file URL from response
          let fileUrl = null;
          let fileId = null;
          try {
            if (event.body) {
              console.log(`Upload response (${fileIndex}):`, event.body);
              
              if (event.body.message && event.body.message.file_url) {
                fileUrl = event.body.message.file_url;
              } else if (event.body.url) {
                fileUrl = event.body.url;
              } else if (event.body.file_url) {
                fileUrl = event.body.file_url;
              } else if (typeof event.body === 'string') {
                fileUrl = event.body;
              } else if (event.body.message && typeof event.body.message === 'string') {
                fileUrl = event.body.message;
              }

              if(event.body.message && event.body.message.file_id) {
                fileId = event.body.message.file_id;
              }
            }
          } catch (err) {
            console.error('Error parsing response:', err);
          }
          
          // Don't use the finalizeUpload immediately to force UI to update correctly
          // Set a very short timeout to allow the UI thread to complete any pending work
          setTimeout(() => {
            this.finalizeUpload(fileIndex, fileUrl, fileId);
          }, 0);
        }
      },
      error: (error) => {
        clearInterval(progressInterval);
        clearTimeout(minUploadTime);
        console.error(`Upload error (${fileIndex}):`, error);
        
        // Skip if file was removed during upload
        if (!this.uploadedFiles[fileIndex]) return;
        
        // Use NgZone to ensure change detection is triggered
        this.ngZone.run(() => {
          // Mark as failed
          this.uploadedFiles[fileIndex].progress = 0;
          this.uploadedFiles[fileIndex].uploading = false;
          this.uploadedFiles[fileIndex].uploaded = false;
          this.uploadedFiles[fileIndex].error = true;
          this.uploadedFiles[fileIndex].errorMessage = 'Upload failed: ' + (error.message || 'Unknown error');
          
          // Force change detection
          this.uploadedFiles = [...this.uploadedFiles];
          this.updateFormControlValue();
          this.cdr.detectChanges();
        });
      },
      complete: () => {
        // This might not be called in some cases, so we don't rely on it
        console.log(`Upload stream completed for file (${fileIndex})`);
        
        // Let's do a final check to make sure the file upload is properly completed
        setTimeout(() => {
          clearInterval(progressInterval);
          clearTimeout(minUploadTime);
          
          // Skip if file was removed or already marked as complete/error
          if (!this.uploadedFiles[fileIndex] || 
              this.uploadedFiles[fileIndex].uploaded || 
              this.uploadedFiles[fileIndex].error) {
            return;
          }
          
          // If we somehow get here and the file isn't marked as uploaded yet,
          // force it to completed state as a fallback
          console.log(`Force completing upload for file (${fileIndex})`);
          this.finalizeUpload(fileIndex);
        }, 500); // Reduced from 1 second to 500ms for faster fallback
      }
    });
  }

  // Helper to check if a file is currently uploading
  isFileUploading(file: any): boolean {
    // File is uploading if it has the uploading flag and is not marked as uploaded
    return file && file.uploading === true && file.uploaded !== true;
  }
  
  // Helper to check if a file has been uploaded successfully
  isFileUploaded(file: any): boolean {
    // Check for explicit uploaded flag first
    if (file && file.uploaded === true && file.uploading !== true) return true;
    
    // Fallback: if file has URL but no explicit status, consider it uploaded
    if (file && file.url && file.uploading !== true && file.error !== true) return true;
    
    return false;
  }
  
  // Helper to check if a file upload has failed
  isFileUploadFailed(file: any): boolean {
    return file && file.error === true;
  }
  
  // Helper to check if a file is in "processing" state (100% uploaded but waiting for server response)
  isFileProcessing(file: any): boolean {
    return file && 
           file.progress >= 100 && 
           file.uploading === true && 
           file.uploaded !== true && 
           file.error !== true;
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