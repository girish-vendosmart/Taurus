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
          <div class="file-icon" [ngClass]="getFileIconClass(file.type || getFileTypeFromUrl(file.url))">
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
              <small class="text-muted">Uploading...</small>
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
            url: file
          };
        }
        // If the value is a file object
        return file;
      });
    } else if (typeof value === 'string') {
      // Handle string value (URL for single file upload)
      this.uploadedFiles = [{
        name: this.getFileNameFromUrl(value),
        size: 0,
        type: this.getFileTypeFromUrl(value),
        url: value
      }];
    } else {
      // Handle object value (file object for single file upload)
      this.uploadedFiles = [value];
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
    // Convert FileList to array
    const newFiles = Array.from(fileList).map(file => ({
      ...file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploading: true,
      progress: 0
    }));
    
    // Update uploadedFiles based on multiple/single mode
    if (this.props['multiple'] === true) {
      // For multiple file upload, add to existing files
      this.uploadedFiles = [...this.uploadedFiles, ...newFiles];
    } else {
      // For single file upload, replace existing file
      this.uploadedFiles = [...newFiles];
    }
    
    // Update form control immediately with current value (URLs will be updated later)
    this.updateFormControlValue();
    
    // Upload each file to get the URL from the server
    Array.from(fileList).forEach((file, index) => {
      const fileIndex = this.props['multiple'] === true 
        ? this.uploadedFiles.findIndex(f => f.name === file.name && f.size === file.size)
        : 0;
      
      if (fileIndex !== -1) {
        this.commonService.uploadFile(file).subscribe(
          (event) => {
            // Track progress events
            if (event.type === HttpEventType.UploadProgress && event.total) {
              // Calculate progress percentage
              const progress = Math.round(100 * event.loaded / event.total);
              this.uploadedFiles[fileIndex].progress = progress;
            }
            
            // Check if it's a HttpResponse final event
            if (event.type === HttpEventType.Response) {
              const response = event.body;
              console.log("File uploaded successfully:", response);
              
              if (response && response.message && response.message.file_url) {
                // Update file object with URL and mark as complete
                this.uploadedFiles[fileIndex].url = response.message.file_url;
                this.uploadedFiles[fileIndex].uploading = false;
                this.uploadedFiles[fileIndex].progress = 100;
                
                // Update form control value with updated URLs
                this.updateFormControlValue();
              }
            }
          },
          (error) => {
            console.error("Error uploading file:", error);
            // Mark file as failed
            if (fileIndex !== -1) {
              this.uploadedFiles[fileIndex].uploading = false;
              this.uploadedFiles[fileIndex].uploadFailed = true;
              this.uploadedFiles[fileIndex].errorMessage = 'Upload failed';
            }
          }
        );
      }
    });
    
    this.formControl.markAsTouched();
  }
  
  // Helper method to check if a file is currently uploading
  isFileUploading(file: any): boolean {
    return file.uploading === true;
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