import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PanVerifyFieldComponent } from '../../wefab/supplier/onboarding/supplier-onboarding/pan-verify-field.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'formly-field-pan-verify',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormlyModule,
    PanVerifyFieldComponent
  ],
  providers: [MessageService],
  template: `
    <div>
      <app-pan-verify-field
        [formControl]="formControl"
        [label]="props.label ?? 'PAN'"
        [required]="props.required ?? false"
        [placeholder]="props.placeholder ?? 'ABCDE1234F'"
        [description]="props.description ?? ''"
        [isVerified]="props['isVerified'] ?? false"
        (verified)="onPanVerified($event)"
        (companyNameChanged)="onCompanyNameChanged($event)"
        [class.is-invalid]="showError">
      </app-pan-verify-field>
    </div>
  `
})
export class FormlyFieldPanVerifyComponent extends FieldType<FieldTypeConfig> {
  onPanVerified(verified: boolean) {
    if (this.props['parentComponent'] && this.props['parentComponent'].onPanVerified) {
      this.props['parentComponent'].onPanVerified(verified);
    }
  }

  onCompanyNameChanged(companyName: string) {
    if (this.props['parentComponent'] && this.props['parentComponent'].onCompanyNameChanged) {
      this.props['parentComponent'].onCompanyNameChanged(companyName);
    }
  }
} 