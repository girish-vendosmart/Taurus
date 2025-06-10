import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BankVerifyFieldComponent } from '../../wefab/supplier/onboarding/supplier-onboarding-l3/bank-verify-field.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'formly-field-bank-verify',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormlyModule,
    BankVerifyFieldComponent
  ],
  providers: [MessageService],
  template: `
    <div>
      <app-bank-verify-field
        [formControl]="formControl"
        [accountNumber]="props['accountNumber'] ?? ''"
        [ifscCode]="props['ifscCode'] ?? ''"
        [isVerified]="props['isVerified'] ?? false"
        (verified)="onBankVerified($event)"
        (bankDetailsVerified)="onBankDetailsVerified($event)"
        [class.is-invalid]="showError">
      </app-bank-verify-field>
    </div>
  `
})
export class FormlyFieldBankVerifyComponent extends FieldType<FieldTypeConfig> {
  onBankVerified(verified: boolean) {
    if (this.props['parentComponent'] && this.props['parentComponent'].onBankVerified) {
      this.props['parentComponent'].onBankVerified(verified);
    }
  }

  onBankDetailsVerified(bankDetails: any) {
    if (this.props['parentComponent'] && this.props['parentComponent'].onBankDetailsVerified) {
      this.props['parentComponent'].onBankDetailsVerified(bankDetails);
    }
  }
} 