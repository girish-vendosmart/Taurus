// src/app/services/firebase.service.ts
import { Injectable, inject, NgZone } from '@angular/core';
import { Auth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private auth: Auth = inject(Auth);
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;

  constructor(private ngZone: NgZone) {}

  /**
   * Initializes the invisible reCAPTCHA verifier
   */
  private initRecaptchaVerifier() {
    // Clear any existing verifier
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
    }

    // Create a container element for the invisible reCAPTCHA
    const recaptchaContainer = document.createElement('div');
    recaptchaContainer.id = 'recaptcha-container-' + new Date().getTime();
    document.body.appendChild(recaptchaContainer);

    // Initialize the new verifier
    this.recaptchaVerifier = new RecaptchaVerifier(
      this.auth,
      recaptchaContainer.id,
      {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, you can proceed with phoneAuth
          console.log('reCAPTCHA verified');
        },
        'expired-callback': () => {
          // Reset reCAPTCHA
          this.initRecaptchaVerifier();
        }
      }
    );
  }

  /**
   * Sends verification code to the provided phone number
   */
  async sendPhoneVerificationCode(phoneNumber: string): Promise<void> {
    try {
      // Initialize reCAPTCHA
      this.initRecaptchaVerifier();
      
      if (!this.recaptchaVerifier) {
        throw new Error('reCAPTCHA verifier not initialized');
      }

      // Ensure phone number is in E.164 format
      const formattedPhoneNumber = this.formatPhoneNumber(phoneNumber);
      
      // Send verification code
      this.confirmationResult = await signInWithPhoneNumber(
        this.auth,
        formattedPhoneNumber,
        this.recaptchaVerifier
      );
      
      console.log('Verification code sent successfully');
      return;
    } catch (error) {
      console.error('Error sending verification code:', error);
      
      // Clean up reCAPTCHA on error
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }
      
      throw error;
    }
  }

  /**
   * Verifies the OTP code entered by the user
   */
  async verifyOtpCode(code: string) {
    if (!this.confirmationResult) {
      throw new Error('No verification code was sent');
    }

    try {
      const result = await this.confirmationResult.confirm(code);
      return result.user;
    } catch (error) {
      console.error('Error verifying OTP code:', error);
      throw error;
    }
  }

  /**
   * Ensures phone number is in E.164 format
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-numeric characters except the leading +
    let formatted = phoneNumber.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +
    if (!formatted.startsWith('+')) {
      formatted = '+' + formatted;
    }
    
    return formatted;
  }
}