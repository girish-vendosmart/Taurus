import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PhoneOtpVerificationComponent } from './wefab/wefab-shared-component/phone-otp-verification/phone-otp-verification.component';

@Component({
  selector: 'formly-field-phone-otp',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormlyModule,
    PhoneOtpVerificationComponent
  ],
  template: `
    <div>
      <app-phone-otp-verification
        [formControl]="formControl"
        [label]="props.label ?? 'Phone Number'"
        [required]="props.required ?? false"
        [placeholder]="props.placeholder ?? 'Enter phone number'"
        [countryCode]="props['countryCode'] ?? '91'"
        (verified)="onPhoneVerified($event)"
        [class.is-invalid]="showError">
      </app-phone-otp-verification>
      
      <div *ngIf="showError" class="invalid-feedback d-block">
        <formly-validation-message [field]="field"></formly-validation-message>
      </div>
    </div>
  `
})
export class FormlyFieldPhoneOtpComponent extends FieldType<FieldTypeConfig> {
  onPhoneVerified(verified: boolean) {
    debugger;
    console.log('onPhoneVerified', verified)
    if (this.props['parentComponent'] && this.props['parentComponent'].onPhoneVerified) {
      this.props['parentComponent'].onPhoneVerified(verified);
    }
  }
} 