import { Component, EventEmitter, Input, OnInit, Output, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CommonService } from '../../shared/common.service';
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
    DialogModule,
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
    </div>

    <!-- OTP Verification Dialog -->
    <p-dialog 
      [(visible)]="showOtpDialog" 
      [modal]="true" 
      header="OTP Verification" 
      [draggable]="false" 
      [resizable]="false"
      [style]="{ width: '400px' }"
      [closeOnEscape]="true"
      [dismissableMask]="true">
      <div class="p-fluid">
        <div class="field mb-4">
          <label for="otp" class="block mb-2">Enter 6-digit OTP</label>
          <p class="text-muted mb-3 small">We've sent a verification code to your mobile number</p>
          <div class="otp-input-container">
            <input 
              type="text" 
              class="p-inputtext w-100" 
              id="otp" 
              [(ngModel)]="otpValue" 
              maxlength="6"
              placeholder="Enter verification code"
              autocomplete="off" />
          </div>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button 
          type="button" 
          pButton 
          label="Verify OTP" 
          (click)="verifyOTP()"
          [disabled]="!otpValue || otpValue.length !== 6"
          class="p-button-primary"></button>
      </ng-template>
    </p-dialog>
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
      }
      
      .verify-otp-button {
        border-radius: 4px;
        white-space: nowrap;
        background-color: #1a3a60; /* Default navy blue color */
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
          background-color: #28a745; /* Green for verified state */
        }
        
        &.error {
          background-color: #dc3545; /* Red for error state */
        }
      }
      
      .phone-otp-error {
        color: #ff6b6b !important;
        font-size: 0.8rem;
        margin-top: 0.3rem;
        display: flex !important;
        align-items: center;
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

  
  constructor(private messageService: MessageService, private commonService: CommonService, private firebaseService: FirebaseService) {
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
  
  async sendOTP() {
    if (!this.phoneControl.value) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a valid phone number before verifying.',
        life: 3000
      });
      return;
    }

    try {
      // Show loading state
      this.isLoading = true;
      
      // Use the pre-initialized container
      this.confirmationResult = await this.firebaseService.sendPhoneVerificationCode(
        '+' + this.countryCode + this.phoneControl.value, 
        this.recaptchaContainerId
      );
      
      this.showOtpDialog = true;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to send verification code',
        life: 5000
      });
    } finally {
      this.isLoading = false;
    }
  }
  
  verifyOTP(): void {
    // Mock function to simulate verifying OTP
    if (this.otpValue && this.otpValue.length === 6) {
      this.messageService.add({
        severity: 'success',
        summary: 'Verified',
        detail: 'Your phone number has been successfully verified.',
        life: 3000
      });
      this.showOtpDialog = false;
      this.isVerified = true;
      this.verified.emit(true);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid OTP',
        detail: 'Please enter a valid 6-digit OTP code.',
        life: 3000
      });
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
    } else {
      this.phoneControl.enable();
    }
  }
}