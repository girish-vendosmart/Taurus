import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { GstVerifyFieldComponent } from './wefab/supplier/supplier-onboarding/gst-verify-field.component';
import { MessageService } from 'primeng/api';
import { CommonService } from '../app/wefab/shared/common.service';

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
        (companyNameChanged)="onCompanyNameChanged($event)"
        [class.is-invalid]="showError">
      </app-gst-verify-field>
    </div>
  `
})
export class FormlyFieldGstVerifyComponent extends FieldType<FieldTypeConfig> {
  onGstVerified(verified: boolean) {
    if (this.props['parentComponent'] && this.props['parentComponent'].onGstVerified) {
      this.props['parentComponent'].onGstVerified(verified);
    }
  }

  onCompanyNameChanged(companyName: string) {
    if (this.props['parentComponent'] && this.props['parentComponent'].onCompanyNameChanged) {
      this.props['parentComponent'].onCompanyNameChanged(companyName);
    }
  }
} 