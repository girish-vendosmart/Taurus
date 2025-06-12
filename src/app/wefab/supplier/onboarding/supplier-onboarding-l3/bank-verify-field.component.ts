import { Component, forwardRef, Input, Output, EventEmitter, Inject, PLATFORM_ID, OnInit, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CommonService } from '../../../../shared/services/common.service';

@Component({
  selector: 'app-bank-verify-field',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    TableModule
  ],
  providers: [
    MessageService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BankVerifyFieldComponent),
      multi: true
    }
  ],
  template: `
    <div class="bank-verify-wrapper">
      <div class="bank-details-container">
        <!-- Bank Details Fields -->
        <div class="row">
          <div class="col-md-4 mb-3">
            <label class="form-label">
              Account Number <span class="text-danger">*</span>
            </label>
            <input 
              type="text" 
              [formControl]="accountNumberControl"
              class="form-control" 
              placeholder="Enter account number"
              [readonly]="_isVerified">
          </div>
          <div class="col-md-4 mb-3">
            <label class="form-label">
              ReVerify Account Number <span class="text-danger">*</span>
            </label>
            <input 
              type="text" 
              [formControl]="reverifyAccountNumberControl"
              class="form-control" 
              placeholder="Re-enter account number"
              [readonly]="_isVerified"
              onpaste="return false;"
              oncopy="return false;"
              oncut="return false;">
            <div class="invalid-feedback d-block" *ngIf="reverifyAccountNumberControl.touched && reverifyAccountNumberControl.errors?.['accountMismatch']">
              <i class="pi pi-exclamation-triangle" style="margin-right: 0.4rem;"></i>
              Account numbers do not match
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <label class="form-label">
              IFSC Code <span class="text-danger">*</span>
            </label>
            <input 
              type="text" 
              [formControl]="ifscCodeControl"
              class="form-control" 
              placeholder="Enter IFSC code"
              [readonly]="_isVerified"
              (input)="onIfscInput($event)">
          </div>
        </div>
        
        <!-- Verify Bank Button -->
        <div class="verify-button-container mb-3">
          <button 
            type="button" 
            class="btn verify-bank-button"
            [ngClass]="{'verified': _isVerified, 'error': verificationError}" 
            [disabled]="!canVerify() || _isVerified || isLoading"
            [style.backgroundColor]="_isVerified ? '#28a745' : (verificationError ? '#f59e0b' : '#1a3a60')"
            (click)="verifyBank()">
            <span *ngIf="isLoading">
                <i class="pi pi-spin pi-spinner" style="margin-right: 0.5rem"></i>
                Verifying...
            </span>
            <span *ngIf="!isLoading">
                {{ _isVerified ? 'Verified' : (verificationError ? 'Re-verify' : 'Verify Bank Details') }}
            </span>
          </button>
        </div>
        
        <div class="invalid-feedback d-block bank-error" *ngIf="hasErrors()">
          <i class="pi pi-exclamation-triangle" style="margin-right: 0.4rem;"></i>
          Please fill in valid account number and IFSC code
        </div>
      </div>
    </div>

    <!-- Custom Bank Verification Dialog -->
    <div class="custom-modal-overlay" *ngIf="showVerificationDialog" (click)="closeOnBackdrop($event)" [style.display]="showVerificationDialog ? 'flex' : 'none'">
      <div class="custom-modal">
        <div class="custom-modal-header">
          <h4>Bank Account Verification Details</h4>
        </div>
        <div class="custom-modal-body">
          <div class="verification-content">
            <div class="company-info-header">
              <i class="pi pi-university"></i>
              <h3>{{ bankDetails.nameAtBank }}</h3>
            </div>

            <div class="company-details">
              <table class="details-table">
                <tr>
                  <td class="label">Account Number:</td>
                  <td class="value">{{ bankDetails.accountNumber }}</td>
                </tr>
                <tr>
                  <td class="label">IFSC Code:</td>
                  <td class="value">{{ bankDetails.ifscCode }}</td>
                </tr>
                <tr>
                  <td class="label">Account Exists:</td>
                  <td class="value">
                    <span class="status-badge" [ngClass]="bankDetails.accountExists ? 'success' : 'error'">
                      {{ bankDetails.accountExists ? 'Yes' : 'No' }}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class="label">Name at Bank:</td>
                  <td class="value">{{ bankDetails.nameAtBank }}</td>
                </tr>
                <tr *ngIf="bankDetails.utr">
                  <td class="label">UTR:</td>
                  <td class="value">{{ bankDetails.utr }}</td>
                </tr>
              </table>
            </div>

            <div class="verification-note">
              <i class="pi pi-info-circle"></i>
              <p>Please verify that these bank account details match your company information before proceeding.</p>
            </div>
          </div>
        </div>
        <div class="custom-modal-footer">
          <button 
            type="button" 
            class="btn btn-outline-secondary" 
            (click)="rejectDetails()">
            <i class="pi pi-times"></i>
            Reject Details
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            (click)="acceptDetails()">
            <i class="pi pi-check"></i>
            Accept Details
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bank-verify-wrapper {
      .bank-details-container {
        padding: 1rem;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        background-color: #f8f9fa;
      }
      
      .form-label {
        display: flex;
        align-items: center;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }
      
      .form-control {
        border: 1px solid #ced4da;
        border-radius: 4px;
        
        &:focus {
          box-shadow: none;
          border-color: #80bdff;
        }
        
        &[readonly] {
          background-color: #fff;
          cursor: not-allowed;
          opacity: 0.8;
        }
      }
      
      .verify-bank-button {
        border-radius: 4px;
        white-space: nowrap;
        background-color: #1a3a60;
        color: white;
        border: none;
        font-weight: 500;
        padding: 0.75rem 2rem;
        font-size: 0.875rem;
        min-width: 180px;
        height: 45px;
        
        &:hover:not(:disabled) {
          background-color: #15304f;
        }
        
        &:disabled {
          opacity: 0.7;
        }
        
        &.verified {
          background-color: #28a745;
        }
        
        &.error {
          background-color: #f59e0b;
        }
      }
      
      .bank-error {
        color: #ff6b6b !important;
        font-size: 0.8rem;
        margin-top: 0.3rem;
        display: flex !important;
        align-items: center;
      }
    }

    /* Custom Modal Styles */
    .custom-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    
    .custom-modal {
      background-color: white;
      border-radius: 6px;
      width: 500px;
      max-width: 95%;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      max-height: 90vh;
    }
    
    .custom-modal-header {
      padding: 1rem 1.5rem;
      background-color: #1a3a60;
      color: white;
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
      
      h4 {
        margin: 0;
        font-weight: 600;
      }
    }
    
    .custom-modal-body {
      padding: 1.5rem;
      overflow-y: auto;
    }
    
    .custom-modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e9ecef;
      background-color: #f8f9fa;
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
    
    .verification-content {
      .company-info-header {
        display: flex;
        align-items: center;
        margin-bottom: 1.5rem;
        
        i {
          font-size: 1.5rem;
          color: #1a3a60;
          margin-right: 0.75rem;
        }
        
        h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a3a60;
        }
      }
      
      .company-details {
        margin-bottom: 1.5rem;
        
        .details-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 0.5rem;
          
          tr {
            margin-bottom: 0.5rem;
          }
          
          .label {
            width: 40%;
            font-weight: 500;
            color: #495057;
            vertical-align: top;
            padding: 0.25rem 0;
          }
          
          .value {
            color: #212529;
            padding: 0.25rem 0;
          }
          
          .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
            
            &.success {
              background-color: #28a745;
              color: white;
            }
            
            &.error {
              background-color: #dc3545;
              color: white;
            }
          }
        }
      }
      
      .verification-note {
        display: flex;
        align-items: flex-start;
        background-color: #e9f5fe;
        border-radius: 6px;
        padding: 1rem;
        
        i {
          color: #0288d1;
          font-size: 1.25rem;
          margin-right: 0.75rem;
          margin-top: 0.1rem;
        }
        
        p {
          margin: 0;
          color: #0277bd;
          font-size: 0.9rem;
          line-height: 1.4;
        }
      }
    }
    
    .btn {
      display: flex;
      align-items: center;
      font-weight: 500;
      
      i {
        margin-right: 0.5rem;
      }
    }
    
    .btn-outline-secondary {
      color: #6c757d;
      border: 1px solid #6c757d;
      background-color: transparent;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      
      &:hover {
        background-color: #6c757d;
        color: white;
      }
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #1a3a60, #0d2b4d);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      
      &:hover {
        background: linear-gradient(135deg, #0d2b4d, #051e3a);
      }
    }
  `]
})
export class BankVerifyFieldComponent implements ControlValueAccessor, OnInit {
  @Input() accountNumber: string = '';
  @Input() ifscCode: string = '';
  @Input() reverifyAccountNumber: string = '';
  
  @Input() set isVerified(value: boolean) {
    if (value === true) {
      this._isVerified = true;
      this.verified.emit(true);
      
      // Disable the controls after verification
      if (this.accountNumberControl && !this.accountNumberControl.disabled) {
        this.accountNumberControl.disable({ emitEvent: false });
      }
      if (this.reverifyAccountNumberControl && !this.reverifyAccountNumberControl.disabled) {
        this.reverifyAccountNumberControl.disable({ emitEvent: false });
      }
      if (this.ifscCodeControl && !this.ifscCodeControl.disabled) {
        this.ifscCodeControl.disable({ emitEvent: false });
      }
    }
  }
  
  @Output() verified = new EventEmitter<boolean>();
  @Output() bankDetailsVerified = new EventEmitter<any>();
  
  accountNumberControl = new FormControl('');
  reverifyAccountNumberControl = new FormControl({ value: '', disabled: true });
  ifscCodeControl = new FormControl('');
  _isVerified = false;
  verificationError = false;
  isLoading = false;
  
  // Dialog control
  showVerificationDialog = false;
  
  // Bank details
  bankDetails: any = {
    accountNumber: '',
    ifscCode: '',
    accountExists: false,
    nameAtBank: '',
    utr: '',
    amountDeposited: 0
  };
  
  companyBankDetails: any;
  
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  
  private isBrowser: boolean;

  constructor(
    private messageService: MessageService,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private commonService: CommonService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  
  ngOnInit() {
    this.showVerificationDialog = false;
    console.log('BankVerifyFieldComponent initialized');
    
    // Watch for changes in account number and IFSC code
    this.accountNumberControl.valueChanges.subscribe(value => {
      this.accountNumber = value || '';
      this.onChange({ 
        accountNumber: value || '', 
        reverifyAccountNumber: this.reverifyAccountNumber,
        ifscCode: this.ifscCode 
      });
      this.resetVerification();
      
      // Enable/disable reverify field based on account number
      if (value && value.length >= 9) {
        this.reverifyAccountNumberControl.enable({ emitEvent: false });
      } else {
        this.reverifyAccountNumberControl.disable({ emitEvent: false });
        this.reverifyAccountNumberControl.setValue('', { emitEvent: false });
        this.reverifyAccountNumber = '';
      }
    });
    
    this.reverifyAccountNumberControl.valueChanges.subscribe(value => {
      this.reverifyAccountNumber = value || '';
      this.onChange({ 
        accountNumber: this.accountNumber, 
        reverifyAccountNumber: value || '',
        ifscCode: this.ifscCode 
      });
      this.resetVerification();
      
      // Validate that account numbers match
      if (value && this.accountNumber && value !== this.accountNumber) {
        this.reverifyAccountNumberControl.setErrors({ accountMismatch: true });
      } else {
        // Remove accountMismatch error if they match (but keep other errors)
        if (this.reverifyAccountNumberControl.errors) {
          delete this.reverifyAccountNumberControl.errors['accountMismatch'];
          if (Object.keys(this.reverifyAccountNumberControl.errors).length === 0) {
            this.reverifyAccountNumberControl.setErrors(null);
          }
        }
      }
    });
    
    this.ifscCodeControl.valueChanges.subscribe(value => {
      this.ifscCode = value || '';
      this.onChange({ 
        accountNumber: this.accountNumber, 
        reverifyAccountNumber: this.reverifyAccountNumber,
        ifscCode: value || '' 
      });
      this.resetVerification();
    });
    
    // Set initial values if provided
    if (this.accountNumber) {
      this.accountNumberControl.setValue(this.accountNumber, { emitEvent: false });
    }
    if (this.reverifyAccountNumber) {
      this.reverifyAccountNumberControl.setValue(this.reverifyAccountNumber, { emitEvent: false });
    }
    if (this.ifscCode) {
      this.ifscCodeControl.setValue(this.ifscCode, { emitEvent: false });
    }
  }
  
  onIfscInput(event: any) {
    // Convert IFSC to uppercase
    const value = event.target.value.toUpperCase();
    this.ifscCodeControl.setValue(value, { emitEvent: false });
    this.ifscCode = value;
    this.onChange({ accountNumber: this.accountNumber, ifscCode: value });
  }
  
  canVerify(): boolean {
    return !!(this.accountNumberControl.value && 
              this.reverifyAccountNumberControl.value &&
              this.ifscCodeControl.value &&
              this.accountNumberControl.value.length >= 9 &&
              this.reverifyAccountNumberControl.value === this.accountNumberControl.value &&
              this.ifscCodeControl.value.length === 11);
  }
  
  hasErrors(): boolean {
    return (this.accountNumberControl.touched && this.accountNumberControl.invalid) ||
           (this.reverifyAccountNumberControl.touched && this.reverifyAccountNumberControl.invalid) ||
           (this.ifscCodeControl.touched && this.ifscCodeControl.invalid);
  }
  
  resetVerification(): void {
    if (this._isVerified) {
      this._isVerified = false;
      this.verified.emit(false);
      this.verificationError = false;
    }
  }
  
  verifyBank() {
    this.verificationError = false;
    this.isLoading = true;
    
    if (!this.canVerify()) {
      this.isLoading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter valid account number and IFSC code',
        life: 3000
      });
      return;
    }
    
    const accountNumber = this.accountNumberControl.value;
    const ifscCode = this.ifscCodeControl.value;
    
    let endPoint = `/api/method/wefab.wefab.api.supplier.onboarding.bank_verify.bank_account_verification?account_number=${accountNumber}&ifsc=${ifscCode}`;

    this.commonService.getData(endPoint).subscribe((res: any) => {
      this.isLoading = false;
      
      console.log('Bank API Response:', res);
      
      // Check if the data exists in the expected format
      if (res && res.message && res.message.data) {
        this.companyBankDetails = res.message.data;
        this.patchBankDetails();
        this.showVerificationDialog = true;
        this.cdr.detectChanges();
      } else {
        console.error('Invalid API response format:', res);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Invalid response format from server',
          life: 3000
        });
      }
    }, (err) => {
      this.isLoading = false;
      console.error('Bank API Error:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to verify bank details. Please try again.',
        life: 3000
      });
      this.verificationError = true;
      
      setTimeout(() => {
        this.verificationError = false;
      }, 3000);
    });
  }

  patchBankDetails() {
    console.log('Patching bank details:', this.companyBankDetails);
    
    try {
      // Map response data to bankDetails based on the provided API response format
      this.bankDetails = {
        accountNumber: this.accountNumberControl.value,
        ifscCode: this.ifscCodeControl.value,
        accountExists: this.companyBankDetails.account_exists || false,
        nameAtBank: this.companyBankDetails.name_at_bank || 'Name not available',
        utr: this.companyBankDetails.utr || '',
        amountDeposited: this.companyBankDetails.amount_deposited || 0
      };
      
      console.log('Mapped bank details:', this.bankDetails);
      
      // Force update of the dialog state in the next cycle
      setTimeout(() => {
        this.showVerificationDialog = true;
        this.cdr.detectChanges();
        console.log('Bank Dialog visibility after CD:', this.showVerificationDialog);
        
        // Add no-scroll class to body when modal is open
        if (this.isBrowser) {
          this.renderer.addClass(document.body, 'modal-open');
        }
      }, 0);
    } catch (e) {
      console.error('Error mapping bank data:', e);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error processing bank data',
        life: 3000
      });
    }
  }
  
  closeOnBackdrop(event: Event) {
    // Only close if clicked directly on the overlay, not on the modal itself
    if ((event.target as HTMLElement).classList.contains('custom-modal-overlay')) {
      // Don't close on backdrop click - we require explicit accept/reject
    }
  }
  
  acceptDetails() {
    // Close dialog
    this.showVerificationDialog = false;
    
    // Remove no-scroll class
    if (this.isBrowser) {
      this.renderer.removeClass(document.body, 'modal-open');
    }
    
    // Mark as verified
    this._isVerified = true;
    this.verified.emit(true);
    
    // Emit bank details to parent component
    this.bankDetailsVerified.emit({
      ...this.bankDetails,
      verified: true
    });
    
    // Disable the controls after verification
    this.accountNumberControl.disable({ emitEvent: false });
    this.ifscCodeControl.disable({ emitEvent: false });
    
    // Show success toast
    this.messageService.add({
      severity: 'success',
      summary: 'Verification Successful',
      detail: 'Bank account details have been verified successfully',
      life: 3000,
      styleClass: 'custom-toast-success'
    });
  }
  
  rejectDetails() {
    // Close dialog
    this.showVerificationDialog = false;
    
    // Remove no-scroll class
    if (this.isBrowser) {
      this.renderer.removeClass(document.body, 'modal-open');
    }
    
    // Show toast message
    this.messageService.add({
      severity: 'warn',
      summary: 'Verification Rejected',
      detail: 'Please verify your bank details and try again',
      life: 3000,
      styleClass: 'custom-toast-warn'
    });
    
    // Mark as error
    this.verificationError = true;
    
    // Don't reset error state automatically - keep the "ReVerify" button visible
  }
  
  writeValue(value: any): void {
    if (value && typeof value === 'object') {
      if (value.accountNumber !== undefined) {
        this.accountNumber = value.accountNumber;
        this.accountNumberControl.setValue(value.accountNumber, { emitEvent: false });
      }
      if (value.reverifyAccountNumber !== undefined) {
        this.reverifyAccountNumber = value.reverifyAccountNumber;
        this.reverifyAccountNumberControl.setValue(value.reverifyAccountNumber, { emitEvent: false });
      }
      if (value.ifscCode !== undefined) {
        this.ifscCode = value.ifscCode;
        this.ifscCodeControl.setValue(value.ifscCode, { emitEvent: false });
      }
    }
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.accountNumberControl.disable();
      this.reverifyAccountNumberControl.disable();
      this.ifscCodeControl.disable();
    } else if (!this._isVerified) {
      this.accountNumberControl.enable();
      // reverifyAccountNumberControl will be enabled based on account number validation
      this.ifscCodeControl.enable();
    }
  }
  
  markAsTouched(): void {
    this.accountNumberControl.markAsTouched();
    this.reverifyAccountNumberControl.markAsTouched();
    this.ifscCodeControl.markAsTouched();
    if (this.onTouched) {
      this.onTouched();
    }
  }
} 