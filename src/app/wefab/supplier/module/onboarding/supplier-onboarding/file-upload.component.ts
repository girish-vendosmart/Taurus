import { Component, ElementRef, ViewChild, forwardRef, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-3">
      <label class="form-label">{{ props.label || 'Company Documents' }}</label>
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
          <p class="text-muted small">{{ props.accept ? 'Accepted: ' + props.accept : 'All file types supported' }} (max 100MB)</p>
        </div>
      </div>
      <div *ngIf="props.description" class="small text-muted mt-1">{{ props.description }}</div>
      <input 
        type="file" 
        #fileInput
        multiple
        style="display: none;" 
        (change)="onFileSelected($event)"
        [accept]="props.accept"
      />
      <div *ngIf="fileTypeError" class="text-danger small mt-1">
        {{ fileTypeError }}
      </div>
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
export class FileUploadComponent implements ControlValueAccessor, OnInit {
  @ViewChild('fileInputRef') fileInputRef!: ElementRef<HTMLInputElement>;
  
  @Input() props: any = {};
  field!: FormlyFieldConfig;

  fileTypeError: string = '';

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  
  ngOnInit(): void {
    console.log('FileUploadComponent props:', this.props);
    if (this.props && this.props.accept) {
      console.log('FileUploadComponent accept value:', this.props.accept);
    } else {
      console.log('FileUploadComponent did not receive accept prop or props is undefined.');
    }
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
    this.fileTypeError = '';
    
    if (event.dataTransfer && event.dataTransfer.files.length) {
      const files = event.dataTransfer.files;
      if (this.isValidFiles(files)) {
        this.fileInputRef.nativeElement.files = files;
        this.onChange(files);
        this.onTouched();
      } else {
        this.fileInputRef.nativeElement.value = '';
        this.onChange(null);
        this.onTouched();
      }
    }
  }
  
  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    const files = element.files;
    this.fileTypeError = '';

    if (files && files.length > 0) {
      if (this.isValidFiles(files)) {
        this.onChange(files);
      } else {
        element.value = '';
        this.onChange(null);
      }
    } else {
      this.onChange(null);
    }
    this.onTouched();
  }

  private isValidFiles(files: FileList): boolean {
    if (!this.props.accept) {
      return true;
    }

    const acceptedTypes = this.props.accept.split(',').map((type: string) => type.trim().toLowerCase());
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();

      const extensionMatch = acceptedTypes.some((type: string) => type.startsWith('.') && fileName.endsWith(type));
      const mimeTypeMatch = acceptedTypes.some((type: string) => !type.startsWith('.') && (fileType === type || (type.endsWith('/*') && fileType.startsWith(type.slice(0, -2)) )  ));
      
      if (!extensionMatch && !mimeTypeMatch) {
        this.fileTypeError = `Invalid file type: ${file.name}. Please upload ${this.props.accept} files.`;
        return false;
      }
    }
    return true;
  }
  
  writeValue(value: any): void {
    if (!value && this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.disabled = isDisabled;
    }
  }
} 