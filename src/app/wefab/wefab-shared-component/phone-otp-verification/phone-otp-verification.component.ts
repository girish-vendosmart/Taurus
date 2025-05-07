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
    ToastModule
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
      <div class="input-group">
        <span class="input-group-text">+{{ countryCode }}</span>
        <input 
          type="text" 
          [formControl]="phoneControl"
          class="form-control" 
          [placeholder]="placeholder"
          (blur)="markAsTouched()">
        <button 
          type="button" 
          class="btn btn-primary verify-otp-button" 
          [disabled]="isVerified || !phoneControl.value || phoneControl.invalid"
          (click)="sendOTP()">
          {{ isVerified ? 'Verified' : 'Verify OTP' }}
        </button>
      </div>
      <div class="invalid-feedback d-block" *ngIf="phoneControl.invalid && phoneControl.touched">
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
    .form-label {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
    }
    .phone-field-wrapper {
      .input-group {
        display: flex;
        flex-wrap: nowrap;
        .input-group-text {
          background-color: var(--blueprint-blue, #0066cc);
          color: white;
          border-color: var(--blueprint-blue, #0066cc);
          font-weight: 500;
          border-top-left-radius: 8px;
          border-bottom-left-radius: 8px;
        }
        
        .form-control {
          border-radius: 0;
          border-left: 0;
          
          &:focus {
            box-shadow: none;
            border-color: var(--material-finish-silver, #cccccc);
          }
        }
        
        .verify-otp-button {
          border-top-right-radius: 8px;
          border-bottom-right-radius: 8px;
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          white-space: nowrap;
          background-color: var(--blueprint-blue, #0066cc);
          color: white;
          border-color: var(--blueprint-blue, #0066cc);
          
          &:hover:not(:disabled) {
            background-color: var(--blueprint-blue-dark, #0052a3);
            border-color: var(--blueprint-blue-dark, #0052a3);
          }
          
          &:disabled {
            background-color: var(--blueprint-blue-light, #66a3ff);
            border-color: var(--blueprint-blue-light, #66a3ff);
            opacity: 0.7;
          }
        }
      }
    }
  `]
})
export class PhoneOtpVerificationComponent implements OnInit, ControlValueAccessor {
  @Input() label: any = 'Phone Number';
  @Input() placeholder: any = 'Enter phone number';
  @Input() required: any = false;
  @Input() countryCode: any = '91';
  @Input() errorMessage: any = 'Please enter a valid phone number';
  
  @Output() verified = new EventEmitter<boolean>();
  
  phoneControl = new FormControl('');
  isVerified = false;
  showOtpDialog = false;
  otpValue: string = '';
  
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};
  confirmationResult: any;
  
  constructor(private messageService: MessageService, private commonService: CommonService, private firebaseService: FirebaseService) {}
  
  ngOnInit(): void {
    // Initialize with initial value if needed
    this.phoneControl.valueChanges.subscribe(value => {
      this.onChange(value);
      // Reset verification if phone number changes
      if (this.isVerified) {
        this.isVerified = false;
        this.verified.emit(false);
      }
    });
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
      // Create a unique ID for the recaptcha container
      const recaptchaContainerId = 'recaptcha-container-' + new Date().getTime();
      
      // Create the container element if it doesn't exist
      let container = document.getElementById(recaptchaContainerId);
      if (!container) {
        container = document.createElement('div');
        container.id = recaptchaContainerId;
        document.body.appendChild(container);
      }
      
      // Call the updated method with the container ID
      this.confirmationResult = await this.firebaseService.sendPhoneVerificationCode(
        '+' + this.countryCode + this.phoneControl.value, 
        recaptchaContainerId
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