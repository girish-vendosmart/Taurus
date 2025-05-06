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
      
      <div class="file-upload">
        <input
          type="file"
          [id]="id"
          [formControl]="formControl"
          [formlyAttributes]="field"
          class="form-control"
          [class.is-invalid]="showError"
        />
        
        <small *ngIf="props.description" class="form-text text-muted">
          {{ props.description }}
        </small>
      </div>
      
      <div *ngIf="showError" class="invalid-feedback d-block">
        <formly-validation-message [field]="field"></formly-validation-message>
      </div>
    </div>
  `,
})
export class FormlyFieldFileComponent extends FieldType<FieldTypeConfig> {} 