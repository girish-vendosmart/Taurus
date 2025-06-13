import { Component, forwardRef, Input, Output, EventEmitter, Inject, PLATFORM_ID, OnInit, OnChanges, SimpleChanges, ElementRef, Renderer2, ChangeDetectorRef, AfterViewInit } from '@angular/core';
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
            [ngClass]="{
              'btn-success': _isVerified, 
              'btn-warning': verificationError,
              'btn-primary': !_isVerified && !verificationError
            }" 
            [disabled]="!canVerify() || _isVerified || isLoading"
            (click)="verifyBank()">
            <span *ngIf="isLoading">
                <i class="pi pi-spin pi-spinner" style="margin-right: 0.5rem"></i>
                Verifying...
            </span>
            <span *ngIf="!isLoading && !_isVerified && !verificationError">
                <i class="pi pi-check-circle" style="margin-right: 0.5rem"></i>
                VERIFY BANK DETAILS
            </span>
            <span *ngIf="!isLoading && _isVerified">
                VERIFIED
            </span>
            <span *ngIf="!isLoading && verificationError">
                <i class="pi pi-exclamation-triangle" style="margin-right: 0.5rem"></i>
                RE-VERIFY
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
        border-radius: 6px;
        white-space: nowrap;
        border: none;
        font-weight: 500;
        padding: 0.75rem 1.5rem;
        font-size: 0.875rem;
        min-width: 120px;
        height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        
        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        &.btn-primary {
          background: #1a45df;
          color: white;
          border: 1px solid #1a45df;
          
          &:hover:not(:disabled) {
            background: #1539c7;
            border-color: #1539c7;
          }
        }
        
        &.btn-success {
          background: #28a745 !important;
          color: white !important;
          border: 1px solid #28a745 !important;
          font-weight: 600 !important;
          
          &:hover:not(:disabled) {
            background: #218838 !important;
            border-color: #218838 !important;
            color: white !important;
          }
          
          /* Override disabled styling for verified state */
          &:disabled {
            opacity: 1 !important;
            cursor: default !important;
            background: #28a745 !important;
            border-color: #28a745 !important;
            color: white !important;
            box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3) !important;
          }
          
          /* Ensure icon and text are white */
          i, span {
            color: white !important;
          }
        }
        
        &.btn-warning {
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          color: white;
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #d97706, #f59e0b);
          }
        }
      }
      
      .re-verify-button {
        border-radius: 6px;
        font-weight: 500;
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      }
      
      .verify-button-container {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
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
      background: #1a45df;
      color: white;
      border: 1px solid #1a45df;
      
      &:hover:not(:disabled) {
        background: #1539c7;
        border-color: #1539c7;
      }
    }
  `]
})
export class BankVerifyFieldComponent implements ControlValueAccessor, OnInit, OnChanges, AfterViewInit {
  @Input() accountNumber: string = '';
  @Input() ifscCode: string = '';
  @Input() reverifyAccountNumber: string = '';
  @Input() isVerified: boolean = false;
  
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
    console.log('BankVerifyFieldComponent initialized with isVerified:', this.isVerified);
    console.log('🔍 Initial input values:', {
      accountNumber: this.accountNumber,
      reverifyAccountNumber: this.reverifyAccountNumber,
      ifscCode: this.ifscCode
    });
    
    // Initialize _isVerified based on input
    this._isVerified = this.isVerified;
    
    // Check if we have values from templateOptions (from parent component)
    const templateOptions = (this as any).to;
    if (templateOptions) {
      console.log('📋 Template options found:', {
        accountNumber: templateOptions.accountNumber,
        reverifyAccountNumber: templateOptions.reverifyAccountNumber,
        ifscCode: templateOptions.ifscCode,
        isVerified: templateOptions.isVerified
      });
      
      // Use template options if available and input properties are empty
      if (templateOptions.accountNumber && !this.accountNumber) {
        this.accountNumber = templateOptions.accountNumber;
      }
      if (templateOptions.reverifyAccountNumber && !this.reverifyAccountNumber) {
        this.reverifyAccountNumber = templateOptions.reverifyAccountNumber;
      }
      if (templateOptions.ifscCode && !this.ifscCode) {
        this.ifscCode = templateOptions.ifscCode;
      }
      if (templateOptions.isVerified !== undefined) {
        this._isVerified = templateOptions.isVerified;
      }
    }
    
    // Set initial form control values
    if (this.accountNumber) {
      this.accountNumberControl.setValue(this.accountNumber, { emitEvent: false });
      console.log('📝 Set initial account number:', this.accountNumber);
    }
    
    if (this.ifscCode) {
      this.ifscCodeControl.setValue(this.ifscCode, { emitEvent: false });
      console.log('📝 Set initial IFSC code:', this.ifscCode);
    }
    
    if (this.reverifyAccountNumber) {
      this.reverifyAccountNumberControl.setValue(this.reverifyAccountNumber, { emitEvent: false });
      console.log('📝 Set initial reverify account number:', this.reverifyAccountNumber);
    }
    
    // Enable reverify field if account number is valid
    if (this.accountNumber && this.accountNumber.length >= 9) {
      this.reverifyAccountNumberControl.enable({ emitEvent: false });
      console.log('✅ Enabled reverify account number field on init');
    }
    
    // Update bank details object with the initial values
    if (this.accountNumber || this.ifscCode) {
      this.bankDetails = {
        ...this.bankDetails,
        accountNumber: this.accountNumber || '',
        ifscCode: this.ifscCode || '',
        nameAtBank: this.bankDetails.nameAtBank || 'Example Company Private Limited'
      };
      console.log('🏦 Updated bank details object on init:', this.bankDetails);
    }
    
    // Set up verified state if we have bank details AND isVerified is true
    if (this._isVerified && (this.hasBankDetails() || (this.accountNumber && this.ifscCode))) {
      console.log('🔄 Setting up verified state on init');
      this.setupVerifiedState();
    } else if (this._isVerified && this.accountNumber && this.ifscCode) {
      // Even if hasBankDetails() returns false, if we have account and IFSC, set up as verified
      console.log('🔄 Setting up verified state with basic details on init');
      this.setupVerifiedStateWithBasicDetails();
    }
    
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
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['isVerified'] && !changes['isVerified'].firstChange) {
      console.log('isVerified changed to:', changes['isVerified'].currentValue);
      this._isVerified = changes['isVerified'].currentValue;
      
      if (this._isVerified && (this.hasBankDetails() || (this.accountNumber && this.ifscCode))) {
        this.setupVerifiedState();
      } else if (this._isVerified && this.accountNumber && this.ifscCode) {
        this.setupVerifiedStateWithBasicDetails();
      } else {
        // Reset verification state if no valid bank details or not verified
        this._isVerified = false;
        this.resetVerifiedState();
      }
      
      this.cdr.detectChanges();
    }
    
    // Handle template options changes (from parent component)
    const templateOptions = (this as any).to;
    if (templateOptions) {
      let shouldUpdate = false;
      
      if (templateOptions.accountNumber && templateOptions.accountNumber !== this.accountNumber) {
        this.accountNumber = templateOptions.accountNumber;
        this.accountNumberControl.setValue(templateOptions.accountNumber, { emitEvent: false });
        shouldUpdate = true;
      }
      
      if (templateOptions.reverifyAccountNumber && templateOptions.reverifyAccountNumber !== this.reverifyAccountNumber) {
        this.reverifyAccountNumber = templateOptions.reverifyAccountNumber;
        this.reverifyAccountNumberControl.setValue(templateOptions.reverifyAccountNumber, { emitEvent: false });
        shouldUpdate = true;
      }
      
      if (templateOptions.ifscCode && templateOptions.ifscCode !== this.ifscCode) {
        this.ifscCode = templateOptions.ifscCode;
        this.ifscCodeControl.setValue(templateOptions.ifscCode, { emitEvent: false });
        shouldUpdate = true;
      }
      
      // Update bank details if any field changed
      if (shouldUpdate) {
        this.bankDetails = {
          ...this.bankDetails,
          accountNumber: this.accountNumber,
          ifscCode: this.ifscCode,
          nameAtBank: this.bankDetails.nameAtBank || 'Example Company Private Limited'
        };
        
        // Re-setup verified state if verified and we have the data
        if (this._isVerified && (this.accountNumber && this.ifscCode)) {
          this.setupVerifiedStateWithBasicDetails();
        }
      }
    }
  }
  
  ngAfterViewInit() {
    // Additional initialization after view is fully rendered
    // This ensures all templateOptions are properly available
    setTimeout(() => {
      console.log('🔍 ngAfterViewInit - checking template options');
      const templateOptions = (this as any).to;
      
      if (templateOptions && (templateOptions.accountNumber || templateOptions.ifscCode)) {
        console.log('📋 Found template options in AfterViewInit:', {
          accountNumber: templateOptions.accountNumber,
          reverifyAccountNumber: templateOptions.reverifyAccountNumber,
          ifscCode: templateOptions.ifscCode,
          isVerified: templateOptions.isVerified
        });
        
        // Update fields if we have data
        let shouldUpdate = false;
        
        if (templateOptions.accountNumber && !this.accountNumberControl.value) {
          this.accountNumber = templateOptions.accountNumber;
          this.accountNumberControl.setValue(templateOptions.accountNumber, { emitEvent: false });
          shouldUpdate = true;
        }
        
        if (templateOptions.reverifyAccountNumber && !this.reverifyAccountNumberControl.value) {
          this.reverifyAccountNumber = templateOptions.reverifyAccountNumber;
          this.reverifyAccountNumberControl.setValue(templateOptions.reverifyAccountNumber, { emitEvent: false });
          // Enable the field if we have a value
          if (templateOptions.reverifyAccountNumber) {
            this.reverifyAccountNumberControl.enable({ emitEvent: false });
          }
          shouldUpdate = true;
        }
        
        if (templateOptions.ifscCode && !this.ifscCodeControl.value) {
          this.ifscCode = templateOptions.ifscCode;
          this.ifscCodeControl.setValue(templateOptions.ifscCode, { emitEvent: false });
          shouldUpdate = true;
        }
        
        // Update verification status
        if (templateOptions.isVerified !== undefined) {
          this._isVerified = templateOptions.isVerified;
        }
        
        if (shouldUpdate) {
          this.bankDetails = {
            ...this.bankDetails,
            accountNumber: this.accountNumber || '',
            ifscCode: this.ifscCode || '',
            nameAtBank: this.bankDetails.nameAtBank || 'Example Company Private Limited'
          };
          
          // Set up verified state if verified and we have data
          if (this._isVerified && this.accountNumber && this.ifscCode) {
            console.log('🔄 Setting up verified state in AfterViewInit');
            this.setupVerifiedStateWithBasicDetails();
          }
          
          this.cdr.detectChanges();
          console.log('✅ Bank verification fields updated in AfterViewInit');
        }
      }
    }, 100);
  }
  
  private setupVerifiedState() {
    console.log('Setting up verified state');
    
    // Only set up verified state if we have actual bank details
    // Remove the static test data that was causing the issue
    if (!this.bankDetails.accountNumber || this.bankDetails.accountNumber === '') {
      // Don't auto-populate with test data - let the verification process handle this
      console.log('No bank details available for verified state');
      return;
    }
    
    // Set form values only if we have actual verified data
    if (this.bankDetails.accountNumber && this.accountNumberControl.value !== this.bankDetails.accountNumber) {
      this.accountNumberControl.setValue(this.bankDetails.accountNumber, { emitEvent: false });
      this.accountNumber = this.bankDetails.accountNumber;
    }
    
    if (this.bankDetails.ifscCode && this.ifscCodeControl.value !== this.bankDetails.ifscCode) {
      this.ifscCodeControl.setValue(this.bankDetails.ifscCode, { emitEvent: false });
      this.ifscCode = this.bankDetails.ifscCode;
    }
    
    if (this.bankDetails.accountNumber && this.reverifyAccountNumberControl.value !== this.bankDetails.accountNumber) {
      this.reverifyAccountNumberControl.setValue(this.bankDetails.accountNumber, { emitEvent: false });
      this.reverifyAccountNumber = this.bankDetails.accountNumber;
    }
    
    // Disable controls when verified
    this.accountNumberControl.disable({ emitEvent: false });
    this.reverifyAccountNumberControl.disable({ emitEvent: false });
    this.ifscCodeControl.disable({ emitEvent: false });
    
    // Emit the verified state
    this.verified.emit(true);
    this.bankDetailsVerified.emit({
      ...this.bankDetails,
      verified: true
    });
  }
  
  private setupVerifiedStateWithBasicDetails() {
    console.log('Setting up verified state with basic details');
    
    // Set form values if we have account number and IFSC
    if (this.accountNumber) {
      this.accountNumberControl.setValue(this.accountNumber, { emitEvent: false });
    }
    
    if (this.ifscCode) {
      this.ifscCodeControl.setValue(this.ifscCode, { emitEvent: false });
    }
    
    if (this.accountNumber) {
      this.reverifyAccountNumberControl.setValue(this.accountNumber, { emitEvent: false });
      this.reverifyAccountNumber = this.accountNumber;
    }
    
    // Enable reverify field since we have account number
    if (this.accountNumber && this.accountNumber.length >= 9) {
      this.reverifyAccountNumberControl.enable({ emitEvent: false });
    }
    
    // Disable controls when verified
    this.accountNumberControl.disable({ emitEvent: false });
    this.reverifyAccountNumberControl.disable({ emitEvent: false });
    this.ifscCodeControl.disable({ emitEvent: false });
    
    // Emit the verified state
    this.verified.emit(true);
    this.bankDetailsVerified.emit({
      accountNumber: this.accountNumber,
      ifscCode: this.ifscCode,
      verified: true
    });
  }
  
  private resetVerifiedState() {
    console.log('Resetting verified state');
    
    // Enable controls
    this.accountNumberControl.enable({ emitEvent: false });
    this.ifscCodeControl.enable({ emitEvent: false });
    
    // Enable reverify only if account number is valid
    if (this.accountNumberControl.value && this.accountNumberControl.value.length >= 9) {
      this.reverifyAccountNumberControl.enable({ emitEvent: false });
    }
    
    this.verificationError = false;
  }
  
  private hasBankDetails(): boolean {
    // Check if we have actual bank details (not empty or default values)
    return !!(
      this.bankDetails.accountNumber && 
      this.bankDetails.accountNumber !== '' &&
      this.bankDetails.ifscCode && 
      this.bankDetails.ifscCode !== '' &&
      this.bankDetails.nameAtBank && 
      this.bankDetails.nameAtBank !== ''
    );
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
  
  // Add enableReverify method
  enableReverify() {
    this._isVerified = false;
    this.verificationError = false;
    this.accountNumberControl.enable({ emitEvent: false });
    this.ifscCodeControl.enable({ emitEvent: false });
    // Enable reverify only if account number is valid
    if (this.accountNumberControl.value && this.accountNumberControl.value.length >= 9) {
      this.reverifyAccountNumberControl.enable({ emitEvent: false });
    } else {
      this.reverifyAccountNumberControl.disable({ emitEvent: false });
    }
  }
  
  writeValue(value: any): void {
    console.log('🔍 writeValue called with:', value);
    
    if (value && typeof value === 'object') {
      let shouldUpdate = false;
      let shouldEnableReverify = false;
      
      if (value.accountNumber !== undefined) {
        this.accountNumber = value.accountNumber;
        this.accountNumberControl.setValue(value.accountNumber, { emitEvent: false });
        shouldUpdate = true;
        shouldEnableReverify = value.accountNumber && value.accountNumber.length >= 9;
        console.log('📝 Set account number:', value.accountNumber);
      }
      
      if (value.reverifyAccountNumber !== undefined) {
        this.reverifyAccountNumber = value.reverifyAccountNumber;
        this.reverifyAccountNumberControl.setValue(value.reverifyAccountNumber, { emitEvent: false });
        shouldUpdate = true;
        console.log('📝 Set reverify account number:', value.reverifyAccountNumber);
      }
      
      if (value.ifscCode !== undefined) {
        this.ifscCode = value.ifscCode;
        this.ifscCodeControl.setValue(value.ifscCode, { emitEvent: false });
        shouldUpdate = true;
        console.log('📝 Set IFSC code:', value.ifscCode);
      }
      
      // Enable reverify field if account number is valid
      if (shouldEnableReverify) {
        this.reverifyAccountNumberControl.enable({ emitEvent: false });
        console.log('✅ Enabled reverify account number field');
      }
      
      // Update bank details object if any field changed
      if (shouldUpdate) {
        this.bankDetails = {
          ...this.bankDetails,
          accountNumber: this.accountNumber || '',
          ifscCode: this.ifscCode || '',
          nameAtBank: this.bankDetails.nameAtBank || 'Example Company Private Limited'
        };
        
        console.log('🏦 Updated bank details object:', this.bankDetails);
        
        // If we're verified and have the data, set up verified state
        if (this._isVerified && this.accountNumber && this.ifscCode) {
          console.log('🔄 Setting up verified state after writeValue');
          this.setupVerifiedStateWithBasicDetails();
        }
        
        // Trigger change detection
        this.cdr.detectChanges();
        console.log('✅ Bank verification fields updated via writeValue');
      }
    } else if (value === null || value === undefined) {
      // Clear all fields if null/undefined is passed
      this.accountNumber = '';
      this.reverifyAccountNumber = '';
      this.ifscCode = '';
      this.accountNumberControl.setValue('', { emitEvent: false });
      this.reverifyAccountNumberControl.setValue('', { emitEvent: false });
      this.ifscCodeControl.setValue('', { emitEvent: false });
      this.reverifyAccountNumberControl.disable({ emitEvent: false });
      console.log('🧹 Cleared all bank verification fields');
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