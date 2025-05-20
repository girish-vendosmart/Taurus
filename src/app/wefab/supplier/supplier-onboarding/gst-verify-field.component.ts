import { Component, forwardRef, Input, Output, EventEmitter, Inject, PLATFORM_ID, OnInit, ElementRef, Renderer2, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CommonService } from '../../shared/common.service';

@Component({
  selector: 'app-gst-verify-field',
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
      useExisting: forwardRef(() => GstVerifyFieldComponent),
      multi: true
    }
  ],
  template: `
    <div class="gst-field-wrapper">
      <label *ngIf="label" class="form-label">
        {{ label }}
        <span class="text-danger" *ngIf="required">*</span>
      </label>
      <div class="gst-input-container">
        <div class="gst-field">
          <input 
            type="text" 
            [formControl]="gstControl"
            class="form-control gst-input" 
            [placeholder]="placeholder"
            [readonly]="_isVerified"
            (blur)="markAsTouched()">
        </div>
        
        <!-- Verify GST Button -->
        <div class="verify-button-container">
          <button 
            type="button" 
            class="btn verify-gst-button"
            [ngClass]="{'verified': _isVerified, 'error': verificationError}" 
            [disabled]="!gstControl.value || gstControl.invalid || _isVerified || isLoading"
            [style.backgroundColor]="_isVerified ? '#28a745' : (verificationError ? '#f59e0b' : '#1a3a60')"
            (click)="verifyGST()">
            <span *ngIf="isLoading">
                <i class="pi pi-spin pi-spinner" style="margin-right: 0.5rem"></i>
                Verifying...
            </span>
            <span *ngIf="!isLoading">
                {{ _isVerified ? 'Verified' : (verificationError ? 'Re-verify' : 'Verify GST') }}
            </span>
          </button>
        </div>
      </div>
      
      <div class="invalid-feedback d-block gst-error" *ngIf="gstControl.invalid && gstControl.touched">
        <i class="pi pi-exclamation-triangle" style="margin-right: 0.4rem;"></i>
        {{ errorMessage }}
      </div>
      
      <small *ngIf="description && !gstControl.invalid" class="form-text text-muted mt-1">
        {{ description }}
      </small>
    </div>

    <!-- Custom GST Verification Dialog -->
    <div class="custom-modal-overlay" *ngIf="showVerificationDialog" (click)="closeOnBackdrop($event)" [style.display]="showVerificationDialog ? 'flex' : 'none'">
      <div class="custom-modal">
        <div class="custom-modal-header">
          <h4>GST Verification Details</h4>
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
                  <td class="label">GST Number:</td>
                  <td class="value">{{ companyDetails.gstNumber }}</td>
                </tr>
                <tr>
                  <td class="label">Status:</td>
                  <td class="value"><span class="status-badge">{{ companyDetails.status }}</span></td>
                </tr>
                <tr>
                  <td class="label">PAN Number:</td>
                  <td class="value">{{ companyDetails.panNumber }}</td>
                </tr>
                <tr>
                  <td class="label">Address:</td>
                  <td class="value">{{ companyDetails.address }}</td>
                </tr>
                <tr>
                  <td class="label">Business Type:</td>
                  <td class="value">{{ companyDetails.businessType }}</td>
                </tr>
                <tr>
                  <td class="label">Registration Date:</td>
                  <td class="value">{{ companyDetails.registrationDate }}</td>
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
    
    .gst-field-wrapper {
      .gst-input-container {
        display: flex;
        gap: 10px;
        align-items: stretch;
      }
      
      .gst-field {
        flex-grow: 1;
      }
      
      .verify-button-container {
        flex-shrink: 0;
      }
      
      .gst-input {
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
      
      .verify-gst-button {
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
      
      .gst-error {
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
export class GstVerifyFieldComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = 'GSTIN';
  @Input() placeholder: string = '22AAAAA0000A1Z5';
  @Input() required: boolean = false;
  @Input() errorMessage: string = 'Please enter a valid GST number';
  @Input() description: string = 'Format: 2 digits + 10-character PAN + 1 entity code + Z + 1 checksum';
  companyGstDetials: any;
  companyName: any;
  
  @Input() set isVerified(value: boolean) {
    if (value === true) {
      this._isVerified = true;
      this.verified.emit(true);
      
      // If we have a FormControl and it's not already disabled, disable it
      if (this.gstControl && !this.gstControl.disabled) {
        this.gstControl.disable({ emitEvent: false });
      }
    }
  }
  
  @Output() verified = new EventEmitter<boolean>();
  @Output() verifiedDetails = new EventEmitter<any>();
  @Output() companyDetailsVerified = new EventEmitter<any>();
  @Output() companyNameChanged = new EventEmitter<string>();
  
  gstControl = new FormControl('');
  _isVerified = false;
  verificationError = false;
  isLoading = false;
  
  // Dialog control
  showVerificationDialog = false;
  
  // Company details (dummy data)
  companyDetails:any = {
    legalName: 'Vendo Smart Technologies Pvt Ltd',
    gstNumber: '29AAGCV9503N1ZM',
    status: 'Active',
    panNumber: 'DAJPC4150P',
    address: 'JBR Tech Park, 1st Floor, 1st Main, 1st Cross, Koramangala, Bangalore, Karnataka, India',
    businessType: 'Private Limited',
    registrationDate: '2024-01-01'
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
    console.log('GstVerifyFieldComponent initialized');
  }
  
  verifyGST() {
    // Reset verification error state when starting a new verification
    this.verificationError = false;
    this.isLoading = true;
    
    if (!this.gstControl.value) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a GST number first',
        life: 3000
      });
      return;
    }
    
    // this.isLoading = true;
    // this.showVerificationDialog = false;
    // this.patchCompanyDetails();
    
    let endPoint = `/api/method/proq_buyer.api.supplier_onboarding.gst_verification.verify_gstin?gstin_number=${this.gstControl.value}`;

    this.commonService.getData(endPoint).subscribe((res: any) => {
      this.isLoading = false;
      this.showVerificationDialog = true;

      this.cdr.detectChanges();
      
      // Add debugging to check response structure
      console.log('API Response:', res);
      
      // Check if the data exists in the expected format
      if (res && res.message && res.message.data) {
        this.showVerificationDialog = true;
        this.companyGstDetials = res.message.data;
        this.patchCompanyDetails();
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
      console.error('API Error:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to verify GST details. Please try again.',
        life: 3000
      });
      this.verificationError = true;
      
      setTimeout(() => {
        this.verificationError = false;
      }, 3000);
    });
  }

  patchCompanyDetails() {
    console.log('Patching company details:', this.companyGstDetials);
    
    // if (this.companyGstDetials) {
      try {
        // Map response data to companyDetails
        this.companyDetails = {
          legalName: this.companyGstDetials.lgnm || this.companyGstDetials.legal_name || 'Vendo Smart Technologies Pvt Ltd',
          gstNumber: this.companyGstDetials.gstin || this.gstControl.value || '22AAAAA0000A1Z5',
          status: this.companyGstDetials.sts || this.companyGstDetials.status || 'Active',
          panNumber: this.companyGstDetials.pan || this.companyGstDetials.panNumber || 'DAJPC4150P',
          address: this.getFormattedAddress() || 'JBR Tech Park, 1st Floor, 1st Main, 1st Cross, Koramangala, Bangalore, Karnataka, India',
          businessType: this.companyGstDetials.dty || this.companyGstDetials.businessType || 'Private Limited',
          registrationDate: this.companyGstDetials.rgdt || this.companyGstDetials.registrationDate || '2024-01-01'
        };

        this.companyName = this.companyDetails.legalName;
        
        console.log('Mapped company details:', this.companyDetails);
        
        // Force update of the dialog state in the next cycle
        setTimeout(() => {
          this.showVerificationDialog = true;
          this.cdr.detectChanges(); // Force Angular to detect changes
          console.log('Dialog visibility after CD:', this.showVerificationDialog);
          
          // Add no-scroll class to body when modal is open
          if (this.isBrowser) {
            this.renderer.addClass(document.body, 'modal-open');
          }
        }, 0);
      } catch (e) {
        console.error('Error mapping data:', e);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error processing GST data',
          life: 3000
        });
      }
    // } else {
    //   console.error('No GST details available');
    //   this.messageService.add({
    //     severity: 'error',
    //     summary: 'Error',
    //     detail: 'No GST details available',
    //     life: 3000
    //   });
    // }
  }
  
  // Helper method to handle different address formats in the API response
  private getFormattedAddress(): string {
    if (this.companyGstDetials.pradr && this.companyGstDetials.pradr.addr) {
        const addr = this.companyGstDetials.pradr.addr;
        return [
            addr.bno, addr.flno, addr.st, addr.loc, 
            addr.dst, addr.stcd, addr.pncd
        ].filter(Boolean).join(', ');
    }
    
    if (this.companyGstDetials.address) {
        return this.companyGstDetials.address;
    }
    
    return 'Address not available';
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
      console.log('Emitting company name:', this.companyDetails.legalName);
      this.companyNameChanged.emit(this.companyDetails.legalName);
    }
    
    // Disable the control after verification
    this.gstControl.disable({ emitEvent: false });
    
    // Show success toast
    this.messageService.add({
      severity: 'success',
      summary: 'Verification Successful',
      detail: 'GST details have been verified successfully',
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
      detail: 'Please verify your GST number and try again',
      life: 3000,
      styleClass: 'custom-toast-warn'
    });
    
    // Mark as error
    this.verificationError = true;
    
    // Don't reset error state automatically - keep the "ReVerify" button visible
    // The error state will be reset when the user tries to verify again or changes the GST number
  }
  
  writeValue(value: any): void {
    if (value !== undefined && value !== null) {
      this.gstControl.setValue(value, { emitEvent: false });
    }
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.gstControl.valueChanges.subscribe(val => {
      this.onChange(val);
      // Reset verification if GST number changes
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
      this.gstControl.disable();
    } else if (!this._isVerified) { // Only enable if not verified
      this.gstControl.enable();
    }
  }
  
  markAsTouched(): void {
    if (this.onTouched) {
      this.onTouched();
    }
  }
} 