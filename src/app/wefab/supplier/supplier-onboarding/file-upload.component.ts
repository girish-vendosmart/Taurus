import { Component, ElementRef, ViewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-3">
      <label class="form-label">Company Documents</label>
      <div 
        class="file-upload-container" 
        (click)="triggerFileInput()"
        (dragover)="onDragOver($event)"
        (drop)="onDrop($event)"
      >
        <span class="upload-icon">
          <i class="pi pi-upload"></i>
        </span>
        <div class="upload-text">
          <p>Click to upload or drag and drop</p>
          <p class="text-muted small">All file types supported (max 100MB)</p>
        </div>
      </div>
      <div class="small text-muted mt-1">Upload brochures, certifications, or other relevant documents</div>
      <input 
        type="file" 
        #fileInput
        multiple
        style="display: none;" 
        (change)="onFileSelected($event)"
      />
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    }
  ]
})
export class FileUploadComponent implements ControlValueAccessor {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  
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
      this.fileInputRef.nativeElement.files = event.dataTransfer.files;
      this.onChange(this.fileInputRef.nativeElement.files);
      this.onTouched();
    }
  }
  
  onFileSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    this.onChange(files);
    this.onTouched();
  }
  
  // ControlValueAccessor methods
  writeValue(value: any): void {
    // Not applicable for file inputs
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