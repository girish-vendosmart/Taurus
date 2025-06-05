import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'formly-field-file',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule],
  template: `
    <div>
      <label *ngIf="props.label" [for]="id" class="form-label">
        {{ props.label }}
        <span *ngIf="props.required" class="text-danger">*</span>
      </label>
      
      <div class="file-upload-container">
        <div class="file-upload">
          <input
            type="file"
            [id]="id"
            [formControl]="formControl"
            [formlyAttributes]="field"
            class="form-control file-input"
            [class.is-invalid]="showError"
          />
          <div class="file-upload-content">
            <i class="pi pi-upload"></i>
            <span class="upload-text">Choose File or Drop Here</span>
          </div>
        </div>
        
        <small *ngIf="props.description" class="form-text text-muted">
          {{ props.description }}
        </small>
      </div>
      
      <div *ngIf="showError" class="invalid-feedback d-block">
        <formly-validation-message [field]="field"></formly-validation-message>
      </div>
    </div>
  `,
  styles: [`
    .file-upload-container {
      margin-bottom: 1rem;
    }

    .file-upload {
      border: 2px dashed rgba(26, 58, 95, 0.3);
      border-radius: 8px;
      position: relative;
      transition: all 0.3s ease;
      background-color: rgba(26, 58, 95, 0.02);
      cursor: pointer;
      overflow: hidden;
    }

    .file-upload:hover {
      border-color: #1A3A5F;
      background-color: rgba(26, 58, 95, 0.05);
    }

    .file-input {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      z-index: 10;
    }

    .file-upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      text-align: center;
    }

    .pi-upload {
      font-size: 1.5rem;
      color: #1A3A5F;
      margin-bottom: 0.5rem;
    }

    .upload-text {
      color: #545A64;
      font-size: 0.9rem;
    }

    .is-invalid + .file-upload-content {
      border-color: #dc3545;
    }
  `]
})
export class FormlyFieldFileComponent extends FieldType<FieldTypeConfig> {} 