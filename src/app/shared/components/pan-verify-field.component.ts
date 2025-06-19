import { Component, forwardRef, Input, Output, EventEmitter, Inject, PLATFORM_ID, OnInit, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-pan-verify-field',
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
      useExisting: forwardRef(() => PanVerifyFieldComponent),
      multi: true
    }
  ],
  template: `
    <div class="pan-field-wrapper">
      <label *ngIf="label" class="form-label">
        {{ label }}
        <span class="text-danger" *ngIf="required">*</span>
      </label>
      <div class="pan-input-container">
        <div class="pan-field">
          <input 
            type="text" 
            [formControl]="panControl"
            class="form-control pan-input" 
            [placeholder]="placeholder"
            [readonly]="_isVerified"
            (blur)="markAsTouched()">
        </div>
        
        <!-- Verify PAN Button -->
        <div class="verify-button-container">
          <button 
            type="button" 
            class="btn verify-pan-button"
            [ngClass]="{'verified': _isVerified, 'error': verificationError}" 
            [disabled]="!panControl.value || panControl.invalid || _isVerified || isLoading"
            [style.backgroundColor]="_isVerified ? '#28a745' : (verificationError ? '#f59e0b' : '#1a3a60')"
            (click)="verifyPAN()">
            <span *ngIf="isLoading">
                <i class="pi pi-spin pi-spinner" style="margin-right: 0.5rem"></i>
                Verifying...
            </span>
            <span *ngIf="!isLoading">
                {{ _isVerified ? 'Verified' : (verificationError ? 'Re-verify' : 'VERIFY') }}
            </span>
          </button>
        </div>
      </div>
      
      <div class="invalid-feedback d-block pan-error" *ngIf="panControl.invalid && panControl.touched">
        <i class="pi pi-exclamation-triangle" style="margin-right: 0.4rem;"></i>
        Invalid PAN Number
      </div>
      
      <small *ngIf="description && !panControl.invalid" class="form-text text-muted mt-1">
        {{ description }}
      </small>
    </div>

    <!-- Custom PAN Verification Dialog -->
    <div class="custom-modal-overlay" *ngIf="showVerificationDialog" (click)="closeOnBackdrop($event)" [style.display]="showVerificationDialog ? 'flex' : 'none'">
      <div class="custom-modal">
        <div class="custom-modal-header">
          <h4>PAN Verification Details</h4>
        </div>
        <div class="custom-modal-body">
          <div class="verification-content">
            <div class="company-info-header">
              <i class="pi pi-building"></i>
              <h3>{{ companyDetails.legalName }}</h3>
            </div>

            <div class="company-details">
              <table class="details-table">
                <tr>
                  <td class="label">PAN Number:</td>
                  <td class="value">{{ companyDetails.panNumber }}</td>
                </tr>
                <tr>
                  <td class="label">Status:</td>
                  <td class="value"><span class="status-badge">{{ companyDetails.status }}</span></td>
                </tr>
                <tr>
                  <td class="label">Legal Name:</td>
                  <td class="value">{{ companyDetails.legalName }}</td>
                </tr>
                <tr>
                  <td class="label">Category:</td>
                  <td class="value">{{ companyDetails.category }}</td>
                </tr>
              </table>
            </div>

            <div class="verification-note">
              <i class="pi pi-info-circle"></i>
              <p>Please verify that these details match your company information before proceeding.</p>
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
    .form-label {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .pan-field-wrapper {
      .pan-input-container {
        display: flex;
        gap: 10px;
        align-items: stretch;
      }
      
      .pan-field {
        flex-grow: 1;
      }
      
      .verify-button-container {
        flex-shrink: 0;
      }
      
      .pan-input {
        width: 100%;
        height: 40px;
        border: 1px solid #ced4da;
        border-radius: 4px;
        padding: 0.5rem 0.75rem;
        
        &:focus {
          box-shadow: none;
          border-color: #80bdff;
        }
        
        &[readonly] {
          background-color: #f8f9fa;
          cursor: not-allowed;
        }
      }
      
      .verify-pan-button {
        border-radius: 4px;
        white-space: nowrap;
        background-color: #1a3a60;
        color: white;
        border: none;
        font-weight: 500;
        padding: 0.5rem 1.5rem;
        font-size: 0.875rem;
        min-width: 120px;
        height: 40px;
        
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
      
      .pan-error {
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
            width: 35%;
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
            background-color: #28a745;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
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
export class PanVerifyFieldComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = 'PAN';
  @Input() placeholder: string = 'ABCDE1234F';
  @Input() required: boolean = false;
  @Input() errorMessage: string = 'Please enter a valid PAN number';
  @Input() description: string = 'Enter 10-character PAN (e.g., ABCDE1234F)';
  companyPanDetails: any;
  companyName: any;
  
  @Input() set isVerified(value: boolean) {
    if (value === true) {
      this._isVerified = true;
      this.verified.emit(true);
      
      // If we have a FormControl and it's not already disabled, disable it
      if (this.panControl && !this.panControl.disabled) {
        this.panControl.disable({ emitEvent: false });
      }
    }
  }
  
  @Output() verified = new EventEmitter<boolean>();
  @Output() verifiedDetails = new EventEmitter<any>();
  @Output() companyDetailsVerified = new EventEmitter<any>();
  @Output() companyNameChanged = new EventEmitter<string>();
  
  panControl = new FormControl('');
  _isVerified = false;
  verificationError = false;
  isLoading = false;
  
  // Dialog control
  showVerificationDialog = false;
  
  // Company details
  companyDetails: any = {
    legalName: '',
    panNumber: '',
    status: '',
    category: ''
  };
  
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
    // Initialize dialog visibility to ensure it's properly bound
    this.showVerificationDialog = false;
    console.log('PanVerifyFieldComponent initialized');
    
    // Add PAN validation on input changes
    this.panControl.valueChanges.subscribe(value => {
      if (value) {
        // Validate PAN number format
        const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panPattern.test(value)) {
          this.panControl.setErrors({ 'panFormat': true });
        }
      }
    });
  }
  
  verifyPAN() {
    // Reset verification error state when starting a new verification
    this.verificationError = false;
    this.isLoading = true;
    
    if (!this.panControl.value) {
      this.isLoading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a PAN number first',
        life: 3000
      });
      return;
    }
    
    let endPoint = `/api/method/wefab.wefab.api.supplier.onboarding.pan.pan_verify?pan_number=${this.panControl.value}`;

    this.commonService.getData(endPoint).subscribe((res: any) => {
      this.isLoading = false;
      
      // Add debugging to check response structure
      console.log('PAN API Response:', res);
      
      // Check if the data exists in the expected format
      if (res && res.message && res.message.data) {
        this.companyPanDetails = res.message.data;
        this.patchCompanyDetails();
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
      console.error('PAN API Error:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to verify PAN details. Please try again.',
        life: 3000
      });
      this.verificationError = true;
      
      setTimeout(() => {
        this.verificationError = false;
      }, 3000);
    });
  }

  patchCompanyDetails() {
    console.log('Patching PAN company details:', this.companyPanDetails);
    
    try {
      // Map response data to companyDetails based on the provided API response format
      this.companyDetails = {
        legalName: this.companyPanDetails.full_name || 'Company Name Not Available',
        panNumber: this.companyPanDetails.pan || this.panControl.value || '',
        status: this.companyPanDetails.status || 'Unknown',
        category: this.companyPanDetails.category || 'Not Available'
      };

      this.companyName = this.companyDetails.legalName;
      
      console.log('Mapped PAN company details:', this.companyDetails);
      
      // Force update of the dialog state in the next cycle
      setTimeout(() => {
        this.showVerificationDialog = true;
        this.cdr.detectChanges();
        console.log('PAN Dialog visibility after CD:', this.showVerificationDialog);
        
        // Add no-scroll class to body when modal is open
        if (this.isBrowser) {
          this.renderer.addClass(document.body, 'modal-open');
        }
      }, 0);
    } catch (e) {
      console.error('Error mapping PAN data:', e);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error processing PAN data',
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
    
    // Emit the company name to parent component
    if (this.companyDetails && this.companyDetails.legalName) {
      console.log('Emitting PAN company name:', this.companyDetails.legalName);
      this.companyNameChanged.emit(this.companyDetails.legalName);
    }
    
    // Disable the control after verification
    this.panControl.disable({ emitEvent: false });
    
    // Show success toast
    this.messageService.add({
      severity: 'success',
      summary: 'Verification Successful',
      detail: 'PAN details have been verified successfully',
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
      detail: 'Please verify your PAN number and try again',
      life: 3000,
      styleClass: 'custom-toast-warn'
    });
    
    // Mark as error
    this.verificationError = true;
    
    // Don't reset error state automatically - keep the "ReVerify" button visible
    // The error state will be reset when the user tries to verify again or changes the PAN number
  }
  
  writeValue(value: any): void {
    if (value !== undefined && value !== null) {
      this.panControl.setValue(value, { emitEvent: false });
    }
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.panControl.valueChanges.subscribe(val => {
      this.onChange(val);
      // Reset verification if PAN number changes
      if (this._isVerified) {
        this._isVerified = false;
        this.verified.emit(false);
      }
    });
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.panControl.disable();
    } else if (!this._isVerified) { // Only enable if not verified
      this.panControl.enable();
    }
  }
  
  markAsTouched(): void {
    if (this.onTouched) {
      this.onTouched();
    }
  }
} 