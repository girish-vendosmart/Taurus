// phone-otp-verification.component.ts

import { Component, EventEmitter, Input, OnInit, Output, forwardRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CommonService } from '../../services/common.service';
import { FirebaseService } from '../../../core/services/firebase.service';
import { DropdownModule } from 'primeng/dropdown'
import { getAuth } from 'firebase/auth';

import { 
  Auth, 
  RecaptchaVerifier, 
  PhoneAuthProvider, 
  signInWithCredential,
  signInWithPhoneNumber
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { environment } from '../../../../enviornments/enviornment';

interface Country {
  name: string;
  code: string;
  emoji: string;  // Using emoji flags instead of image assets
}

@Component({
  selector: 'app-phone-otp-verification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    DropdownModule
  ],
  providers: [
    MessageService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneOtpVerificationComponent),
      multi: true
    }
  ],
  template: `
    <div class="phone-field-wrapper mb-3">
      <label *ngIf="label" class="form-label">
        {{ label }}
        <span class="text-danger" *ngIf="required">*</span>
      </label>
      <div class="phone-input-container">
        <!-- Country Dropdown -->
        <div class="country-selector">
          <p-dropdown 
            [options]="countries" 
            [(ngModel)]="selectedCountry" 
            optionLabel="name"
            [disabled]="_isVerified"
            styleClass="country-dropdown">
            <ng-template pTemplate="selectedItem">
              <div class="country-item selected-country">
                <span class="flag-emoji">{{ selectedCountry.emoji }}</span>
                <span class="country-code">+{{ selectedCountry.code }}</span>
              </div>
            </ng-template>
            <ng-template let-country pTemplate="item">
              <div class="country-item">
                <span class="flag-emoji">{{ country.emoji }}</span>
                <span>{{ country.name }} (+{{ country.code }})</span>
              </div>
            </ng-template>
          </p-dropdown>
        </div>
        
        <!-- Phone Input Field -->
        <div class="phone-field">
          <input 
            type="text" 
            [formControl]="phoneControl"
            class="form-control phone-input" 
            [placeholder]="placeholder"
            [readonly]="_isVerified"
            (blur)="markAsTouched()">
        </div>
        
        <!-- Verify OTP Button -->
        <div class="verify-button-container">
          <button 
            type="button" 
            class="btn verify-otp-button"
            [ngClass]="{'verified': _isVerified, 'error': verificationError}" 
            [disabled]="!phoneControl.value || phoneControl.invalid || _isVerified || isLoading"
            [style.backgroundColor]="_isVerified ? '#28a745' : (verificationError ? '#dc3545' : '#1a3a60')"
            (click)="sendOTP()">
            <span *ngIf="isLoading">
                <i class="pi pi-spin pi-spinner" style="margin-right: 0.5rem"></i>
                Sending...
            </span>
            <span *ngIf="!isLoading">
                {{ _isVerified ? 'Verified' : (verificationError ? 'Failed' : 'VERIFY OTP') }}
            </span>
          </button>
        </div>
      </div>
      
      <div class="invalid-feedback d-block phone-otp-error" *ngIf="phoneControl.invalid && phoneControl.touched">
        <i class="pi pi-exclamation-triangle" style="margin-right: 0.4rem;"></i>
        {{ errorMessage }}
      </div>
      
      <!-- Inline OTP Verification Section (Replaces Dialog) -->
      <div class="otp-verification-section" *ngIf="showOtpDialog" [ngClass]="{'has-error': otpError}">
        <div class="otp-verification-content">
          <div class="otp-header">
            <h5 class="mb-2">Enter 6-digit OTP</h5>
            <p class="text-muted mb-3">
              We've sent a verification code to +{{ selectedCountry.code }} {{ phoneControl.value }}
            </p>
          </div>
          
          <!-- OTP Error Message -->
          <div class="otp-error-message" *ngIf="otpError">
            <i class="pi pi-exclamation-triangle"></i>
            <span>{{ otpErrorMessage }}</span>
          </div>
          
          <div class="otp-input-wrapper">
            <input 
              type="text" 
              class="form-control otp-input" 
              [(ngModel)]="otpValue" 
              maxlength="6"
              placeholder="Enter verification code"
              autocomplete="off"
              [ngClass]="{'is-invalid': otpError}" />
              
            <button 
              type="button" 
              class="btn verify-btn"
              [disabled]="!otpValue || otpValue.length !== 6 || isVerifying"
              (click)="verifyOTP()">
              <i *ngIf="isVerifying" class="pi pi-spin pi-spinner" style="margin-right: 0.5rem"></i>
              {{ isVerifying ? 'Verifying...' : 'Verify OTP' }}
            </button>
          </div>
          
          <!-- Resend OTP timer and button -->
          <div class="resend-otp-container mt-3">
            <span *ngIf="resendTimer > 0" class="resend-timer">
              Resend OTP in {{ resendTimer }} seconds
            </span>
            <button 
              *ngIf="resendTimer === 0" 
              type="button" 
              class="btn-link resend-btn"
              [disabled]="isLoading"
              (click)="resendOTP()">
              <i *ngIf="isLoading" class="pi pi-spin pi-spinner" style="margin-right: 0.3rem"></i>
              Resend OTP
            </button>
          </div>
          
          <!-- Cancel Button -->
          <div class="cancel-container text-end mt-2">
            <button 
              type="button" 
              class="btn-link cancel-btn"
              (click)="cancelVerification()">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .p-dropdown {
        border-radius: 4px;
        width: 125px !important;
        height: 40px;
        display: flex;
        align-items: center;
        background-color: #ffffff;
        border: 1px solid #ced4da;
      }
      
      .p-dropdown-panel .p-dropdown-items .p-dropdown-item {
        padding: 0.5rem 1rem;
      }

      .p-dropdown .p-dropdown-label {
        padding: 0.5rem;
      }

      .p-dropdown .p-dropdown-trigger {
        width: 2rem;
      }
    }
    
    .form-label {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .phone-field-wrapper {
      .phone-input-container {
        display: flex;
        gap: 10px;
        align-items: stretch;
      }
      
      .country-selector {
        flex-shrink: 0;
      }
      
      .phone-field {
        flex-grow: 1;
      }
      
      .verify-button-container {
        flex-shrink: 0;
      }
      
      .flag-emoji {
        font-size: 16px;
        margin-right: 6px;
      }
      
      .country-item {
        display: flex;
        align-items: center;
      }

      .selected-country {
        display: flex;
        align-items: center;
        
        .country-code {
          font-weight: 500;
          color: #333;
          margin-left: 2px;
        }
      }
      
      .phone-input {
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
      
      .verify-otp-button {
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
          background-color: #dc3545;
        }
      }
      
      .phone-otp-error {
        color: #ff6b6b !important;
        font-size: 0.8rem;
        margin-top: 0.3rem;
        display: flex !important;
        align-items: center;
      }
      
      /* New styles for inline OTP verification */
      .otp-verification-section {
        margin-top: 15px;
        padding: 15px;
        background-color: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        animation: fadeIn 0.3s ease-in-out;
        
        &.has-error {
          border-color: #ffcdd2;
          background-color: #fff5f5;
        }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .otp-verification-content {
        .otp-header {
          h5 {
            font-weight: 600;
            color: #333;
            margin-bottom: 0.3rem;
            font-size: 1rem;
          }
          
          p {
            color: #6c757d;
            font-size: 0.85rem;
            margin-bottom: 12px;
          }
        }
        
        .otp-error-message {
          display: flex;
          align-items: center;
          background-color: #ffebee;
          border-radius: 4px;
          padding: 8px 12px;
          margin-bottom: 12px;
          color: #d32f2f;
          font-size: 0.85rem;
          
          i {
            margin-right: 8px;
            font-size: 14px;
          }
        }
        
        .otp-input-wrapper {
          display: flex;
          gap: 10px;
          
          .otp-input {
            flex-grow: 1;
            border: 1px solid #ced4da;
            border-radius: 4px;
            padding: 0.5rem 0.75rem;
            height: 40px;
            font-size: 1rem;
            letter-spacing: 1px;
            text-align: center;
            
            &:focus {
              box-shadow: none;
              border-color: #80bdff;
            }
            
            &.is-invalid {
              border-color: #dc3545;
              background-image: none;
            }
          }
          
          .verify-btn {
            background-color: #1a3a60;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 0 1.5rem;
            height: 40px;
            font-weight: 500;
            white-space: nowrap;
            
            &:hover:not(:disabled) {
              background-color: #15304f;
            }
            
            &:disabled {
              opacity: 0.7;
            }
          }
        }
        
        .resend-otp-container {
          display: flex;
          justify-content: center;
          font-size: 0.85rem;
          
          .resend-timer {
            color: #6c757d;
          }
          
          .resend-btn {
            color: #1a3a60;
            background: none;
            border: none;
            padding: 0;
            text-decoration: underline;
            cursor: pointer;
            
            &:hover:not(:disabled) {
              color: #15304f;
            }
            
            &:disabled {
              opacity: 0.7;
              cursor: not-allowed;
            }
          }
        }
        
        .cancel-container {
          margin-top: 10px;
          
          .cancel-btn {
            color: #6c757d;
            background: none;
            border: none;
            padding: 0;
            text-decoration: underline;
            cursor: pointer;
            font-size: 0.85rem;
            
            &:hover {
              color: #495057;
            }
          }
        }
      }
    }
  `]
})
export class PhoneOtpVerificationComponent implements OnInit, ControlValueAccessor {
  @Input() label: any = 'Phone Number';
  @Input() placeholder: any = 'Phone number';
  @Input() required: any = false;
  @Input() countryCode: any = '91';
  @Input() errorMessage: any = 'Please enter a valid phone number';
  @Input() set isVerified(value: boolean) {
    if (value === true) {
      this._isVerified = true;
      this.verified.emit(true);
      
      // If we have a FormControl and it's not already disabled, disable it
      if (this.phoneControl && !this.phoneControl.disabled) {
        this.phoneControl.disable({ emitEvent: false });
      }
    }
  }
  get isVerified(): boolean {
    return this._isVerified;
  }
  
  @Output() verified = new EventEmitter<boolean>();
  
  phoneControl = new FormControl('');
  _isVerified = false;
  verificationError = false;
  showOtpDialog = false;
  otpValue: string = '';
  
  // New properties for OTP error handling
  otpError = false;
  otpErrorMessage: string = '';
  resendTimer: number = 0;
  private resendTimerInterval: any;
  
  countries: Country[] = [
    { name: 'India', code: '91', emoji: '🇮🇳' },
    { name: 'United States', code: '1', emoji: '🇺🇸' },
    { name: 'United Kingdom', code: '44', emoji: '🇬🇧' },
    { name: 'Australia', code: '61', emoji: '🇦🇺' },
    { name: 'Canada', code: '1', emoji: '🇨🇦' },
    { name: 'China', code: '86', emoji: '🇨🇳' },
    { name: 'Germany', code: '49', emoji: '🇩🇪' },
    { name: 'France', code: '33', emoji: '🇫🇷' },
    { name: 'Japan', code: '81', emoji: '🇯🇵' },
    { name: 'UAE', code: '971', emoji: '🇦🇪' },
    { name: 'Singapore', code: '65', emoji: '🇸🇬' },
    { name: 'Malaysia', code: '60', emoji: '🇲🇾' },
  ];
  
  selectedCountry: Country;
  
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  confirmationResult: any;
  private auth: Auth;
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private recaptchaContainerId = 'recaptcha-container';
  isLoading = false;
  isVerifying = false;
  verificationId: string = '';
  
  constructor(private messageService: MessageService, private commonService: CommonService, private firebaseService: FirebaseService, private cdr: ChangeDetectorRef) {
    // Set default country to India or use the provided countryCode
    this.selectedCountry = this.countries.find(c => c.code === this.countryCode) || this.countries[0];
    
    // If created in verified state (from parent's phoneVerified=true), set visually verified
    if (this._isVerified) {
      setTimeout(() => {
        this.phoneControl.disable({ emitEvent: false });
      });
    }

    const app = initializeApp(environment.firebaseConfig);
    this.auth = getAuth(app);
  }
  
  ngOnInit(): void {
    // If already set as verified through input property, ensure component state matches
    if (this._isVerified) {
      this.phoneControl.disable({ emitEvent: false });
    }
    
    // Initialize with initial value if needed
    this.phoneControl.valueChanges.subscribe(value => {
      this.onChange(value);
      // Reset verification if phone number changes
      if (this._isVerified) {
        this._isVerified = false;
        this.verified.emit(false);
      }
    });
    
    // Set the default country based on the input
    if (this.countryCode) {
      const country = this.countries.find(c => c.code === this.countryCode);
      if (country) {
        this.selectedCountry = country;
      }
    }
    
    // Initialize reCAPTCHA container once
    let container = document.getElementById(this.recaptchaContainerId);
    if (!container) {
        container = document.createElement('div');
        container.id = this.recaptchaContainerId;
        document.body.appendChild(container);
    }
  }
  
  ngOnDestroy(): void {
    // Clear the resend timer interval when component is destroyed
    if (this.resendTimerInterval) {
      clearInterval(this.resendTimerInterval);
    }
  }
  
  sendOTP() {
    if (!this.phoneControl.value) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a valid phone number before verifying.',
        life: 3000
      });
      return;
    }

    this.isLoading = true;
    // Reset OTP error state
    this.otpError = false;
    this.otpErrorMessage = '';
    
    this.firebaseService.sendPhoneVerificationCode(
      '+' + this.selectedCountry.code + this.phoneControl.value,
      'recaptcha-container'
    ).then((res:any) => {
      console.log(res);
      if(res.verificationId) {
        this.verificationId = res.verificationId;
        this.isLoading = false;
        this.showOtpDialog = true;
        // Start the resend timer
        this.startResendTimer();
        this.cdr.detectChanges();
      }
    }, (err:any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error', 
          detail: err.message || 'Failed to send verification code',
          life: 5000
        });
        this.isLoading = false;
        this.verificationError = true;
        this.cdr.detectChanges();
        
        // Reset verification error after 3 seconds
        setTimeout(() => {
          this.verificationError = false;
          this.cdr.detectChanges();
        }, 3000);
    });
  }
  
  verifyOTP(): void {
    if (!this.otpValue || this.otpValue.length !== 6) {
      this.otpError = true;
      this.otpErrorMessage = 'Please enter a valid 6-digit OTP code.';
      return;
    }
    
    this.isVerifying = true;
    // Reset OTP error state
    this.otpError = false;
    
    // Use the confirmation result directly since the FirebaseService's sendPhoneVerificationCode method returns it
    if (!this.verificationId) {
      this.otpError = true;
      this.otpErrorMessage = 'Verification ID not found. Please try again.';
      this.isVerifying = false;
      return;
    }

    const credential = PhoneAuthProvider.credential(this.verificationId, this.otpValue);
    signInWithCredential(this.auth, credential)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Verified',
          detail: 'Your phone number has been successfully verified.',
          life: 3000
        });
        
        this.showOtpDialog = false;
        this._isVerified = true;
        this.verified.emit(true);
        
        // Disable the phone control to prevent further changes
        this.phoneControl.disable({ emitEvent: false });
        this.isVerifying = false;
        
        // Clear the resend timer
        if (this.resendTimerInterval) {
          clearInterval(this.resendTimerInterval);
        }
        
        this.cdr.detectChanges();
      })
      .catch((error: any) => {
        // Handle OTP verification failure
        this.isVerifying = false;
        this.otpError = true;
        this.otpErrorMessage = this.getReadableErrorMessage(error.message) || 'Invalid verification code. Please try again.';
        
        this.messageService.add({
          severity: 'error',
          summary: 'Verification Failed',
          detail: this.otpErrorMessage,
          life: 3000
        });
        
        this.cdr.detectChanges();
      });
  }
  
  // Get user-friendly error messages
  private getReadableErrorMessage(errorMessage: string): string {
    if (errorMessage.includes('invalid-verification-code')) {
      return 'The verification code you entered is invalid. Please try again.';
    } else if (errorMessage.includes('code-expired')) {
      return 'The verification code has expired. Please request a new code.';
    } else if (errorMessage.includes('too-many-requests')) {
      return 'Too many unsuccessful attempts. Please try again later.';
    }
    return errorMessage;
  }
  
  // Start the resend timer (60 seconds)
  private startResendTimer(): void {
    this.resendTimer = 60;
    
    // Clear any existing interval
    if (this.resendTimerInterval) {
      clearInterval(this.resendTimerInterval);
    }
    
    this.resendTimerInterval = setInterval(() => {
      this.resendTimer--;
      
      if (this.resendTimer <= 0) {
        clearInterval(this.resendTimerInterval);
      }
      
      this.cdr.detectChanges();
    }, 1000);
  }
  
  // Resend OTP method
  resendOTP(): void {
    // Clear previous OTP
    this.otpValue = '';
    this.otpError = false;
    
    // Reuse the sendOTP method
    this.sendOTP();
  }
  
  // Cancel verification
  cancelVerification(): void {
    this.showOtpDialog = false;
    this.otpValue = '';
    this.otpError = false;
    
    // Clear the resend timer
    if (this.resendTimerInterval) {
      clearInterval(this.resendTimerInterval);
    }
  }
  
  // Method to mark the control as touched
  markAsTouched(): void {
    if (this.onTouched) {
      this.onTouched();
    }
  }
  
  // ControlValueAccessor interface implementation
  writeValue(value: any): void {
    if (value !== undefined) {
      this.phoneControl.setValue(value, { emitEvent: false });
      
      // If the phone is already verified, don't allow changing the value
      if (this._isVerified) {
        this.phoneControl.disable({ emitEvent: false });
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
      this.phoneControl.disable();
    } else if (!this._isVerified) { // Only enable if not verified
      this.phoneControl.enable();
    }
  }
}