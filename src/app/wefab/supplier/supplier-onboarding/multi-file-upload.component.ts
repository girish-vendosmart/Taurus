import { Component, ElementRef, ViewChild, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface FileWithPreview extends File {
  preview?: string;
  id?: string;
}

@Component({
  selector: 'app-multi-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-3">
      <h6 class="form-label mb-1">{{ label }}</h6>
      <div 
        class="file-upload-container" 
        (click)="triggerFileInput()"
        (dragover)="onDragOver($event)"
        (drop)="onDrop($event)"
      >
        <div class="upload-inner">
          <div class="upload-icon-wrapper">
            <i class="pi pi-upload"></i>
          </div>
          <div class="upload-text mt-2">
            <div>Click to upload or drag and drop</div>
            <div class="text-muted small">All file types supported (max 100MB)</div>
          </div>
        </div>
      </div>
      <div class="small text-muted mt-1">Upload brochures, certifications, or other relevant documents</div>
      
      <!-- Uploaded files preview -->
      <div class="uploaded-files" *ngIf="files.length > 0">
        <h6 class="mb-2 mt-3">Uploaded Documents</h6>
        <div class="list-group">
          <div *ngFor="let file of files; let i = index" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <i class="pi" [ngClass]="getFileIcon(file)"></i>
              <span class="ms-2">{{ file.name }} ({{ formatFileSize(file.size) }})</span>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger" (click)="removeFile(i, $event)">
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>
      </div>
      
      <input 
        type="file" 
        #fileInput
        multiple
        style="display: none;" 
        (change)="onFileSelected($event)"
      />
    </div>
  `,
  styles: [`
    .file-upload-container {
      border: 2px dashed #d0d0d0;
      border-radius: 4px;
      padding: 2rem 1rem;
      text-align: center;
      transition: all 0.2s ease;
      background-color: #fff;
      cursor: pointer;
      min-height: 150px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .file-upload-container:hover {
      border-color: #1A3A5F;
      background-color: rgba(26, 58, 95, 0.02);
    }
    
    .upload-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .upload-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: #f5f7f9;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .upload-icon-wrapper i {
      font-size: 1.5rem;
      color: #1A3A5F;
    }
    
    .upload-text {
      margin-top: 0.5rem;
    }
    
    .upload-text div {
      margin-bottom: 0.25rem;
    }

    .uploaded-files {
      margin-top: 1rem;
    }

    .list-group-item {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      border: 1px solid #dee2e6;
    }

    .list-group-item i {
      font-size: 1.2rem;
      color: #1A3A5F;
    }
    
    .btn-outline-danger {
      border-color: #dc3545;
      color: #dc3545;
      padding: 0.2rem 0.5rem;
    }
    
    .btn-outline-danger:hover {
      background-color: #dc3545;
      color: white;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiFileUploadComponent),
      multi: true
    }
  ]
})
export class MultiFileUploadComponent implements ControlValueAccessor {
  @Input() label: string = 'Company Documents';
  
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  files: FileWithPreview[] = [];
  
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  
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
      this.addFiles(event.dataTransfer.files);
    }
  }
  
  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length) {
      this.addFiles(inputElement.files);
    }
  }
  
  addFiles(fileList: FileList): void {
    const newFiles = Array.from(fileList).map(file => {
      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.id = this.generateUniqueId();
      return fileWithPreview;
    });
    
    this.files = [...this.files, ...newFiles];
    this.updateValue();
    this.onTouched();
  }
  
  removeFile(index: number, event: MouseEvent): void {
    event.stopPropagation(); // Prevent triggering file input click
    
    this.files.splice(index, 1);
    this.files = [...this.files]; // Create new array for change detection
    this.updateValue();
    this.onTouched();
  }
  
  updateValue(): void {
    const fileList = this.createFileList(this.files);
    this.onChange(fileList);
  }
  
  getFileIcon(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
      return 'pi-image';
    } else if (['pdf'].includes(extension || '')) {
      return 'pi-file-pdf';
    } else if (['doc', 'docx'].includes(extension || '')) {
      return 'pi-file-word';
    } else if (['xls', 'xlsx', 'csv'].includes(extension || '')) {
      return 'pi-file-excel';
    } else if (['ppt', 'pptx'].includes(extension || '')) {
      return 'pi-file-powerpoint';
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return 'pi-file-zip';
    } else {
      return 'pi-file';
    }
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  // Helper to convert array to FileList-like object
  createFileList(files: File[]): any {
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    return dataTransfer.files;
  }
  
  // ControlValueAccessor methods
  writeValue(value: any): void {
    // Handle initial value
    if (value instanceof FileList) {
      this.files = Array.from(value).map(file => {
        const fileWithPreview = file as FileWithPreview;
        fileWithPreview.id = this.generateUniqueId();
        return fileWithPreview;
      });
    } else {
      this.files = [];
    }
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.disabled = isDisabled;
    }
  }
} 