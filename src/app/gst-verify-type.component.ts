import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { GstVerifyFieldComponent } from './wefab/supplier/supplier-onboarding/gst-verify-field.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'formly-field-gst-verify',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormlyModule,
    GstVerifyFieldComponent
  ],
  providers: [MessageService],
  template: `
    <div>
      <app-gst-verify-field
        [formControl]="formControl"
        [label]="props.label ?? 'GSTIN'"
        [required]="props.required ?? false"
        [placeholder]="props.placeholder ?? '22AAAAA0000A1Z5'"
        [description]="props.description ?? ''"
        [isVerified]="props['isVerified'] ?? false"
        (verified)="onGstVerified($event)"
        [class.is-invalid]="showError">
      </app-gst-verify-field>
      
      <div *ngIf="showError" class="invalid-feedback d-block gst-error">
        <i class="pi pi-exclamation-triangle" style="margin-right: 0.4rem;"></i>
        <formly-validation-message [field]="field"></formly-validation-message>
      </div>
    </div>
  `
})
export class FormlyFieldGstVerifyComponent extends FieldType<FieldTypeConfig> {
  onGstVerified(verified: boolean) {
    if (this.props['parentComponent'] && this.props['parentComponent'].onGstVerified) {
      this.props['parentComponent'].onGstVerified(verified);
    }
  }
} 