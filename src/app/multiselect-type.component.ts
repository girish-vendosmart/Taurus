import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { Observable, isObservable, of } from 'rxjs';

@Component({
  selector: 'formly-field-multiselect',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule, MultiSelectModule],
  template: `
    <div>
      <label *ngIf="props.label" [for]="id" class="form-label">
        {{ props.label }}
        <span *ngIf="props.required" class="text-danger">*</span>
      </label>
      
      <p-multiSelect
        [id]="id"
        [formControl]="formControl"
        [formlyAttributes]="field"
        [options]="getOptions()"
        [placeholder]="props.placeholder || 'Select items'"
        [showToggleAll]="false"
        [styleClass]="props['className'] || 'w-100'"
        optionLabel="label"
        optionValue="value"
        [showHeader]="true"
        [showClear]="true"
        [class.is-invalid]="showError"
      ></p-multiSelect>
      
      <small *ngIf="props.description" class="form-text text-muted">
        {{ props.description }}
      </small>
      
      <div *ngIf="showError" class="invalid-feedback d-block">
        <formly-validation-message [field]="field"></formly-validation-message>
      </div>
    </div>
  `,
})
export class FormlyFieldMultiSelectComponent extends FieldType<FieldTypeConfig> {
  getOptions(): any[] {
    return this.props.options && Array.isArray(this.props.options) ? this.props.options : [];
  }
} 