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
import { SweetAlertService } from '../../services/sweet-alert.service';

interface Country {
  name: string;
  code: string;
  emoji: string;  // Using emoji flags instead of image assets  
  currency: string;  // Currency code
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
            (click)="sendOTP()">
            <span *ngIf="isLoading">
                <i class="pi pi-spin pi-spinner" style="margin-right: 0.5rem"></i>
                Sending...
            </span>
            <span *ngIf="!isLoading && !_isVerified && !verificationError">
                VERIFY OTP
            </span>
            <span *ngIf="!isLoading && _isVerified" class="verified-badge">
                <i class="pi pi-check-circle"></i>
                VERIFIED
            </span>
            <span *ngIf="!isLoading && verificationError">
                Failed
            </span>
          </button>
        </div>
      </div>
      
      <!-- <div class="invalid-feedback d-block phone-otp-error" *ngIf="phoneControl.invalid && phoneControl.touched">
        <i class="pi pi-exclamation-triangle" style="margin-right: 0.4rem;"></i>
        {{ errorMessage }}
      </div> -->
      
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
          <!-- <div class="otp-error-message" *ngIf="otpError">
            <i class="pi pi-exclamation-triangle"></i>
            <span>{{ otpErrorMessage }}</span>
          </div> -->
          
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
        background-color: #2f59eb !important;
        color: white !important;
        border: none;
        font-weight: 500;
        padding: 0.5rem 1.5rem;
        font-size: 0.875rem;
        min-width: 120px;
        height: 40px;
        transition: all 0.3s ease;
        
        &:hover:not(:disabled) {
          background-color: #2f59eb !important;
          color: white !important;
        }
        
        &:disabled {
          opacity: 0.7;
        }
        
        &.verified {
          background: linear-gradient(135deg, #28a745, #20c997) !important;
          color: white !important;
          border: 1px solid #28a745 !important;
          border-radius: 20px !important;
          padding: 0.4rem 1rem !important;
          font-weight: 600 !important;
          font-size: 0.8rem !important;
          min-width: 100px !important;
          height: 32px !important;
          box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3) !important;
          
          &:disabled {
            opacity: 1 !important;
            cursor: default !important;
            background: linear-gradient(135deg, #28a745, #20c997) !important;
            color: white !important;
          }
          
          .verified-badge {
            display: flex;
            align-items: center;
            gap: 0.3rem;
            
            i {
              font-size: 0.9rem;
              color: white !important;
            }
          }
          
          &:hover {
            transform: none !important;
            background: linear-gradient(135deg, #28a745, #20c997) !important;
            color: white !important;
          }
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
            background-color: #2f59eb !important;
            color: white !important;
            border: none;
            border-radius: 4px;
            padding: 0 1.5rem;
            height: 40px;
            font-weight: 500;
            white-space: nowrap;
            
            &:hover:not(:disabled) {
              background-color: #2f59eb !important;
              color: white !important;
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
    if (value !== this._isVerified) {
      this._isVerified = value;
      
      if (value === true) {
        this.verified.emit(true);
        
        // If we have a FormControl and it's not already disabled, disable it
        if (this.phoneControl && !this.phoneControl.disabled) {
          this.phoneControl.disable({ emitEvent: false });
        }
        
        // Close OTP dialog if it's open
        this.showOtpDialog = false;
      } else {
        // If verification is being revoked, re-enable the control
        if (this.phoneControl && this.phoneControl.disabled) {
          this.phoneControl.enable({ emitEvent: false });
        }
      }
      
      // Trigger change detection to update the UI
      this.cdr.detectChanges();
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
    { name: 'Afghanistan', code: '93', emoji: '🇦🇫', currency: 'AFN' },
    { name: 'Albania', code: '355', emoji: '🇦🇱', currency: 'ALL' },
    { name: 'Algeria', code: '213', emoji: '🇩🇿', currency: 'DZD' },
    { name: 'American Samoa', code: '1', emoji: '🇦🇸', currency: 'USD' },
    { name: 'Andorra', code: '376', emoji: '🇦🇩', currency: 'EUR' },
    { name: 'Angola', code: '244', emoji: '🇦🇴', currency: 'AOA' },
    { name: 'Antigua and Barbuda', code: '1', emoji: '🇦🇬', currency: 'XCD' },
    { name: 'Argentina', code: '54', emoji: '🇦🇷', currency: 'ARS' },
    { name: 'Armenia', code: '374', emoji: '🇦🇲', currency: 'AMD' },
    { name: 'Australia', code: '61', emoji: '🇦🇺', currency: 'AUD' },
    { name: 'Austria', code: '43', emoji: '🇦🇹', currency: 'EUR' },
    { name: 'Azerbaijan', code: '994', emoji: '🇦🇿', currency: 'AZN' },
    { name: 'Bahamas', code: '1', emoji: '🇧🇸', currency: 'BSD' },
    { name: 'Bahrain', code: '973', emoji: '🇧🇭', currency: 'BHD' },
    { name: 'Bangladesh', code: '880', emoji: '🇧🇩', currency: 'BDT' },
    { name: 'Barbados', code: '1', emoji: '🇧🇧', currency: 'BBD' },
    { name: 'Belarus', code: '375', emoji: '🇧🇾', currency: 'BYN' },
    { name: 'Belgium', code: '32', emoji: '🇧🇪', currency: 'EUR' },
    { name: 'Belize', code: '501', emoji: '🇧🇿', currency: 'BZD' },
    { name: 'Benin', code: '229', emoji: '🇧🇯', currency: 'XOF' },
    { name: 'Bermuda', code: '1', emoji: '🇧🇲', currency: 'BMD' },
    { name: 'Bhutan', code: '975', emoji: '🇧🇹', currency: 'BTN' },
    { name: 'Bolivia', code: '591', emoji: '🇧🇴', currency: 'BOB' },
    { name: 'Bosnia and Herzegovina', code: '387', emoji: '🇧🇦', currency: 'BAM' },
    { name: 'Botswana', code: '267', emoji: '🇧🇼', currency: 'BWP' },
    { name: 'Brazil', code: '55', emoji: '🇧🇷', currency: 'BRL' },
    { name: 'British Virgin Islands', code: '1', emoji: '🇻🇬', currency: 'USD' },
    { name: 'Brunei', code: '673', emoji: '🇧🇳', currency: 'BND' },
    { name: 'Bulgaria', code: '359', emoji: '🇧🇬', currency: 'BGN' },
    { name: 'Burkina Faso', code: '226', emoji: '🇧🇫', currency: 'XOF' },
    { name: 'Burundi', code: '257', emoji: '🇧🇮', currency: 'BIF' },
    { name: 'Cambodia', code: '855', emoji: '🇰🇭', currency: 'KHR' },
    { name: 'Cameroon', code: '237', emoji: '🇨🇲', currency: 'XAF' },
    { name: 'Canada', code: '1', emoji: '🇨🇦', currency: 'CAD' },
    { name: 'Cape Verde', code: '238', emoji: '🇨🇻', currency: 'CVE' },
    { name: 'Cayman Islands', code: '1', emoji: '🇰🇾', currency: 'KYD' },
    { name: 'Central African Republic', code: '236', emoji: '🇨🇫', currency: 'XAF' },
    { name: 'Chad', code: '235', emoji: '🇹🇩', currency: 'XAF' },
    { name: 'Chile', code: '56', emoji: '🇨🇱', currency: 'CLP' },
    { name: 'China', code: '86', emoji: '🇨🇳', currency: 'CNY' },
    { name: 'Colombia', code: '57', emoji: '🇨🇴', currency: 'COP' },
    { name: 'Comoros', code: '269', emoji: '🇰🇲', currency: 'KMF' },
    { name: 'Congo', code: '242', emoji: '🇨🇬', currency: 'XAF' },
    { name: 'Congo (DRC)', code: '243', emoji: '🇨🇩', currency: 'CDF' },
    { name: 'Cook Islands', code: '682', emoji: '🇨🇰', currency: 'NZD' },
    { name: 'Costa Rica', code: '506', emoji: '🇨🇷', currency: 'CRC' },
    { name: 'Croatia', code: '385', emoji: '🇭🇷', currency: 'EUR' },
    { name: 'Cuba', code: '53', emoji: '🇨🇺', currency: 'CUP' },
    { name: 'Cyprus', code: '357', emoji: '🇨🇾', currency: 'EUR' },
    { name: 'Czech Republic', code: '420', emoji: '🇨🇿', currency: 'CZK' },
    { name: 'Denmark', code: '45', emoji: '🇩🇰', currency: 'DKK' },
    { name: 'Djibouti', code: '253', emoji: '🇩🇯', currency: 'DJF' },
    { name: 'Dominica', code: '1', emoji: '🇩🇲', currency: 'XCD' },
    { name: 'Dominican Republic', code: '1', emoji: '🇩🇴', currency: 'DOP' },
    { name: 'East Timor', code: '670', emoji: '🇹🇱', currency: 'USD' },
    { name: 'Ecuador', code: '593', emoji: '🇪🇨', currency: 'USD' },
    { name: 'Egypt', code: '20', emoji: '🇪🇬', currency: 'EGP' },
    { name: 'El Salvador', code: '503', emoji: '🇸🇻', currency: 'USD' },
    { name: 'Equatorial Guinea', code: '240', emoji: '🇬🇶', currency: 'XAF' },
    { name: 'Eritrea', code: '291', emoji: '🇪🇷', currency: 'ERN' },
    { name: 'Estonia', code: '372', emoji: '🇪🇪', currency: 'EUR' },
    { name: 'Ethiopia', code: '251', emoji: '🇪🇹', currency: 'ETB' },
    { name: 'Fiji', code: '679', emoji: '🇫🇯', currency: 'FJD' },
    { name: 'Finland', code: '358', emoji: '🇫🇮', currency: 'EUR' },
    { name: 'France', code: '33', emoji: '🇫🇷', currency: 'EUR' },
    { name: 'Gabon', code: '241', emoji: '🇬🇦', currency: 'XAF' },
    { name: 'Gambia', code: '220', emoji: '🇬🇲', currency: 'GMD' },
    { name: 'Georgia', code: '995', emoji: '🇬🇪', currency: 'GEL' },
    { name: 'Germany', code: '49', emoji: '🇩🇪', currency: 'EUR' },
    { name: 'Ghana', code: '233', emoji: '🇬🇭', currency: 'GHS' },
    { name: 'Gibraltar', code: '350', emoji: '🇬🇮', currency: 'GIP' },
    { name: 'Greece', code: '30', emoji: '🇬🇷', currency: 'EUR' },
    { name: 'Greenland', code: '299', emoji: '🇬🇱', currency: 'DKK' },
    { name: 'Grenada', code: '1', emoji: '🇬🇩', currency: 'XCD' },
    { name: 'Guam', code: '1', emoji: '🇬🇺', currency: 'USD' },
    { name: 'Guatemala', code: '502', emoji: '🇬🇹', currency: 'GTQ' },
    { name: 'Guinea', code: '224', emoji: '🇬🇳', currency: 'GNF' },
    { name: 'Guinea-Bissau', code: '245', emoji: '🇬🇼', currency: 'XOF' },
    { name: 'Guyana', code: '592', emoji: '🇬🇾', currency: 'GYD' },
    { name: 'Haiti', code: '509', emoji: '🇭🇹', currency: 'HTG' },
    { name: 'Honduras', code: '504', emoji: '🇭🇳', currency: 'HNL' },
    { name: 'Hong Kong', code: '852', emoji: '🇭🇰', currency: 'HKD' },
    { name: 'Hungary', code: '36', emoji: '🇭🇺', currency: 'HUF' },
    { name: 'Iceland', code: '354', emoji: '🇮🇸', currency: 'ISK' },
    { name: 'India', code: '91', emoji: '🇮🇳', currency: 'INR' },
    { name: 'Indonesia', code: '62', emoji: '🇮🇩', currency: 'IDR' },
    { name: 'Iran', code: '98', emoji: '🇮🇷', currency: 'IRR' },
    { name: 'Iraq', code: '964', emoji: '🇮🇶', currency: 'IQD' },
    { name: 'Ireland', code: '353', emoji: '🇮🇪', currency: 'EUR' },
    { name: 'Israel', code: '972', emoji: '🇮🇱', currency: 'ILS' },
    { name: 'Italy', code: '39', emoji: '🇮🇹', currency: 'EUR' },
    { name: 'Ivory Coast', code: '225', emoji: '🇨🇮', currency: 'XOF' },
    { name: 'Jamaica', code: '1', emoji: '🇯🇲', currency: 'JMD' },
    { name: 'Japan', code: '81', emoji: '🇯🇵', currency: 'JPY' },
    { name: 'Jordan', code: '962', emoji: '🇯🇴', currency: 'JOD' },
    { name: 'Kazakhstan', code: '7', emoji: '🇰🇿', currency: 'KZT' },
    { name: 'Kenya', code: '254', emoji: '🇰🇪', currency: 'KES' },
    { name: 'Kiribati', code: '686', emoji: '🇰🇮', currency: 'AUD' },
    { name: 'Kuwait', code: '965', emoji: '🇰🇼', currency: 'KWD' },
    { name: 'Kyrgyzstan', code: '996', emoji: '🇰🇬', currency: 'KGS' },
    { name: 'Laos', code: '856', emoji: '🇱🇦', currency: 'LAK' },
    { name: 'Latvia', code: '371', emoji: '🇱🇻', currency: 'EUR' },
    { name: 'Lebanon', code: '961', emoji: '🇱🇧', currency: 'LBP' },
    { name: 'Lesotho', code: '266', emoji: '🇱🇸', currency: 'LSL' },
    { name: 'Liberia', code: '231', emoji: '🇱🇷', currency: 'LRD' },
    { name: 'Libya', code: '218', emoji: '🇱🇾', currency: 'LYD' },
    { name: 'Liechtenstein', code: '423', emoji: '🇱🇮', currency: 'CHF' },
    { name: 'Lithuania', code: '370', emoji: '🇱🇹', currency: 'EUR' },
    { name: 'Luxembourg', code: '352', emoji: '🇱🇺', currency: 'EUR' },
    { name: 'Macau', code: '853', emoji: '🇲🇴', currency: 'MOP' },
    { name: 'Madagascar', code: '261', emoji: '🇲🇬', currency: 'MGA' },
    { name: 'Malawi', code: '265', emoji: '🇲🇼', currency: 'MWK' },
    { name: 'Malaysia', code: '60', emoji: '🇲🇾', currency: 'MYR' },
    { name: 'Maldives', code: '960', emoji: '🇲🇻', currency: 'MVR' },
    { name: 'Mali', code: '223', emoji: '🇲🇱', currency: 'XOF' },
    { name: 'Malta', code: '356', emoji: '🇲🇹', currency: 'EUR' },
    { name: 'Marshall Islands', code: '692', emoji: '🇲🇭', currency: 'USD' },
    { name: 'Mauritania', code: '222', emoji: '🇲🇷', currency: 'MRU' },
    { name: 'Mauritius', code: '230', emoji: '🇲🇺', currency: 'MUR' },
    { name: 'Mexico', code: '52', emoji: '🇲🇽', currency: 'MXN' },
    { name: 'Micronesia', code: '691', emoji: '🇫🇲', currency: 'USD' },
    { name: 'Moldova', code: '373', emoji: '🇲🇩', currency: 'MDL' },
    { name: 'Monaco', code: '377', emoji: '🇲🇨', currency: 'EUR' },
    { name: 'Mongolia', code: '976', emoji: '🇲🇳', currency: 'MNT' },
    { name: 'Montenegro', code: '382', emoji: '🇲🇪', currency: 'EUR' },
    { name: 'Morocco', code: '212', emoji: '🇲🇦', currency: 'MAD' },
    { name: 'Mozambique', code: '258', emoji: '🇲🇿', currency: 'MZN' },
    { name: 'Myanmar', code: '95', emoji: '🇲🇲', currency: 'MMK' },
    { name: 'Namibia', code: '264', emoji: '🇳🇦', currency: 'NAD' },
    { name: 'Nauru', code: '674', emoji: '🇳🇷', currency: 'AUD' },
    { name: 'Nepal', code: '977', emoji: '🇳🇵', currency: 'NPR' },
    { name: 'Netherlands', code: '31', emoji: '🇳🇱', currency: 'EUR' },
    { name: 'New Zealand', code: '64', emoji: '🇳🇿', currency: 'NZD' },
    { name: 'Nicaragua', code: '505', emoji: '🇳🇮', currency: 'NIO' },
    { name: 'Niger', code: '227', emoji: '🇳🇪', currency: 'XOF' },
    { name: 'Nigeria', code: '234', emoji: '🇳🇬', currency: 'NGN' },
    { name: 'North Korea', code: '850', emoji: '🇰🇵', currency: 'KPW' },
    { name: 'North Macedonia', code: '389', emoji: '🇲🇰', currency: 'MKD' },
    { name: 'Norway', code: '47', emoji: '🇳🇴', currency: 'NOK' },
    { name: 'Oman', code: '968', emoji: '🇴🇲', currency: 'OMR' },
    { name: 'Pakistan', code: '92', emoji: '🇵🇰', currency: 'PKR' },
    { name: 'Palau', code: '680', emoji: '🇵🇼', currency: 'USD' },
    { name: 'Palestine', code: '970', emoji: '🇵🇸', currency: 'ILS' },
    { name: 'Panama', code: '507', emoji: '🇵🇦', currency: 'PAB' },
    { name: 'Papua New Guinea', code: '675', emoji: '🇵🇬', currency: 'PGK' },
    { name: 'Paraguay', code: '595', emoji: '🇵🇾', currency: 'PYG' },
    { name: 'Peru', code: '51', emoji: '🇵🇪', currency: 'PEN' },
    { name: 'Philippines', code: '63', emoji: '🇵🇭', currency: 'PHP' },
    { name: 'Poland', code: '48', emoji: '🇵🇱', currency: 'PLN' },
    { name: 'Portugal', code: '351', emoji: '🇵🇹', currency: 'EUR' },
    { name: 'Puerto Rico', code: '1', emoji: '🇵🇷', currency: 'USD' },
    { name: 'Qatar', code: '974', emoji: '🇶🇦', currency: 'QAR' },
    { name: 'Romania', code: '40', emoji: '🇷🇴', currency: 'RON' },
    { name: 'Russia', code: '7', emoji: '🇷🇺', currency: 'RUB' },
    { name: 'Rwanda', code: '250', emoji: '🇷🇼', currency: 'RWF' },
    { name: 'Saint Kitts and Nevis', code: '1', emoji: '🇰🇳', currency: 'XCD' },
    { name: 'Saint Lucia', code: '1', emoji: '🇱🇨', currency: 'XCD' },
    { name: 'Saint Vincent and the Grenadines', code: '1', emoji: '🇻🇨', currency: 'XCD' },
    { name: 'Samoa', code: '685', emoji: '🇼🇸', currency: 'WST' },
    { name: 'San Marino', code: '378', emoji: '🇸🇲', currency: 'EUR' },
    { name: 'Sao Tome and Principe', code: '239', emoji: '🇸🇹', currency: 'STN' },
    { name: 'Saudi Arabia', code: '966', emoji: '🇸🇦', currency: 'SAR' },
    { name: 'Senegal', code: '221', emoji: '🇸🇳', currency: 'XOF' },
    { name: 'Serbia', code: '381', emoji: '🇷🇸', currency: 'RSD' },
    { name: 'Seychelles', code: '248', emoji: '🇸🇨', currency: 'SCR' },
    { name: 'Sierra Leone', code: '232', emoji: '🇸🇱', currency: 'SLL' },
    { name: 'Singapore', code: '65', emoji: '🇸🇬', currency: 'SGD' },
    { name: 'Slovakia', code: '421', emoji: '🇸🇰', currency: 'EUR' },
    { name: 'Slovenia', code: '386', emoji: '🇸🇮', currency: 'EUR' },
    { name: 'Solomon Islands', code: '677', emoji: '🇸🇧', currency: 'SBD' },
    { name: 'Somalia', code: '252', emoji: '🇸🇴', currency: 'SOS' },
    { name: 'South Africa', code: '27', emoji: '🇿🇦', currency: 'ZAR' },
    { name: 'South Korea', code: '82', emoji: '🇰🇷', currency: 'KRW' },
    { name: 'South Sudan', code: '211', emoji: '🇸🇸', currency: 'SSP' },
    { name: 'Spain', code: '34', emoji: '🇪🇸', currency: 'EUR' },
    { name: 'Sri Lanka', code: '94', emoji: '🇱🇰', currency: 'LKR' },
    { name: 'Sudan', code: '249', emoji: '🇸🇩', currency: 'SDG' },
    { name: 'Suriname', code: '597', emoji: '🇸🇷', currency: 'SRD' },
    { name: 'Sweden', code: '46', emoji: '🇸🇪', currency: 'SEK' },
    { name: 'Switzerland', code: '41', emoji: '🇨🇭', currency: 'CHF' },
    { name: 'Syria', code: '963', emoji: '🇸🇾', currency: 'SYP' },
    { name: 'Taiwan', code: '886', emoji: '🇹🇼', currency: 'TWD' },
    { name: 'Tajikistan', code: '992', emoji: '🇹🇯', currency: 'TJS' },
    { name: 'Tanzania', code: '255', emoji: '🇹🇿', currency: 'TZS' },
    { name: 'Thailand', code: '66', emoji: '🇹🇭', currency: 'THB' },
    { name: 'Togo', code: '228', emoji: '🇹🇬', currency: 'XOF' },
    { name: 'Tonga', code: '676', emoji: '🇹🇴', currency: 'TOP' },
    { name: 'Trinidad and Tobago', code: '1', emoji: '🇹🇹', currency: 'TTD' },
    { name: 'Tunisia', code: '216', emoji: '🇹🇳', currency: 'TND' },
    { name: 'Turkey', code: '90', emoji: '🇹🇷', currency: 'TRY' },
    { name: 'Turkmenistan', code: '993', emoji: '🇹🇲', currency: 'TMT' },
    { name: 'Tuvalu', code: '688', emoji: '🇹🇻', currency: 'AUD' },
    { name: 'Uganda', code: '256', emoji: '🇺🇬', currency: 'UGX' },
    { name: 'Ukraine', code: '380', emoji: '🇺🇦', currency: 'UAH' },
    { name: 'United Arab Emirates', code: '971', emoji: '🇦🇪', currency: 'AED' },
    { name: 'United Kingdom', code: '44', emoji: '🇬🇧', currency: 'GBP' },
    { name: 'United States', code: '1', emoji: '🇺🇸', currency: 'USD' },
    { name: 'Uruguay', code: '598', emoji: '🇺🇾', currency: 'UYU' },
    { name: 'Uzbekistan', code: '998', emoji: '🇺🇿', currency: 'UZS' },
    { name: 'Vanuatu', code: '678', emoji: '🇻🇺', currency: 'VUV' },
    { name: 'Vatican City', code: '379', emoji: '🇻🇦', currency: 'EUR' },
    { name: 'Venezuela', code: '58', emoji: '🇻🇪', currency: 'VES' },
    { name: 'Vietnam', code: '84', emoji: '🇻🇳', currency: 'VND' },
    { name: 'Yemen', code: '967', emoji: '🇾🇪', currency: 'YER' },
    { name: 'Zambia', code: '260', emoji: '🇿🇲', currency: 'ZMW' },
    { name: 'Zimbabwe', code: '263', emoji: '🇿🇼', currency: 'ZWL' }
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

  constructor(private messageService: MessageService, private commonService: CommonService, private firebaseService: FirebaseService, private cdr: ChangeDetectorRef, private sweetAlertService: SweetAlertService) {
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
    console.log('Selected Country', this.selectedCountry)
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
    // let endPoint = `/api/method/wefab.wefab.api.common.core.authentication.mobile_otp_verification.send_otp`

    // let body = {
    //   phone_number: this.phoneControl.value,
    //   country_code: this.selectedCountry.code,
    // }

    // this.commonService.postData(endPoint, body).subscribe((res:any) => {
    //   this.isLoading = false;
    //   this.verificationId = res.verification_id;
    //   this.showOtpDialog = true;
    //   this.startResendTimer();
    //   this.cdr.detectChanges();
    // }, (err:any) => {
    //   this.isLoading = false;
      
    //   this.sweetAlertService.error(err.message || 'Failed to send verification code');

    //   this.isLoading = false;
    //     this.verificationError = true;
    //     this.cdr.detectChanges();
        
    //     // Reset verification error after 3 seconds
    //     setTimeout(() => {
    //       this.verificationError = false;
    //       this.cdr.detectChanges();
    //     }, 3000);
    // });
    
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

    // Create credential and verify with Firebase
    const credential = PhoneAuthProvider.credential(this.verificationId, this.otpValue);
    signInWithCredential(this.auth, credential)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Verified',
          detail: 'Your phone number has been successfully verified.',
          life: 3000
        });
        
        // Store selected country information in local storage
        const countryInfo = {
          name: this.selectedCountry.name,
          code: this.selectedCountry.code,
          emoji: this.selectedCountry.emoji,
          currency: this.selectedCountry.currency,
          phoneNumber: this.phoneControl.value,
          verifiedAt: new Date().toISOString()
        };
        
        localStorage.setItem('verifiedCountry', JSON.stringify(countryInfo));
        localStorage.setItem('selectedCurrency', this.selectedCountry.currency);

        this.getCurrencyList(this.selectedCountry.currency);
        
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

  getCurrencyList(currency: string) { 
    let endPoint = '/api/resource/Currency/' + currency;
    this.commonService.getData(endPoint).subscribe((res: any) => {
      localStorage.setItem('currencyFormat', JSON.stringify(res.data.number_format));
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