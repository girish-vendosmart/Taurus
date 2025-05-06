import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { Router } from '@angular/router';

// PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-supplier-create-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyBootstrapModule,
    // PrimeNG modules
    InputTextModule,
    PasswordModule,
    ButtonModule,
    DividerModule,
    CardModule,
    InputGroupModule,
    InputGroupAddonModule,
    TooltipModule,
    MessageModule
  ],
  templateUrl: './supplier-create-account.component.html',
  styleUrl: './supplier-create-account.component.scss'
})
export class SupplierCreateAccountComponent implements OnInit {
  form: FormGroup;
  captchaVerified = false;
  captchaText = '';
  showPassword = false;
  captchaColors = ['primary', 'success', 'danger', 'warning', 'info'];
  
  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      captcha: ['', [Validators.required]]
    });
    
    this.generateCaptcha();
  }
  
  ngOnInit(): void {}
  
  get emailControl() {
    return this.form.get('email');
  }
  
  get passwordControl() {
    return this.form.get('password');
  }
  
  get captchaControl() {
    return this.form.get('captcha');
  }
  
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  // Generate a random captcha string
  generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let captcha = '';
    
    // Generate a random 6 character string
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      captcha += chars.substring(randomIndex, randomIndex + 1);
    }
    
    this.captchaText = captcha;
    this.captchaVerified = false;
    this.captchaControl?.setValue('');
  }
  
  verifyCaptcha() {
    const captchaInput = this.captchaControl?.value;
    if (captchaInput && captchaInput === this.captchaText) {
      this.captchaVerified = true;
    } else {
      this.captchaVerified = false;
    }
  }
  
  refreshCaptcha() {
    this.generateCaptcha();
  }

  getColorClass(index: number): string {
    return `text-${this.captchaColors[index % this.captchaColors.length]}`;
  }
  
  onSubmit() {
    if (this.form.valid && this.captchaVerified) {
      console.log('Form submitted successfully', this.form.value);
      
      // Navigate to the supplier onboarding page
      this.router.navigate(['/wefab/supplier/supplier-onboarding']);
    } else {
      // Mark all fields as touched to show validation errors
      this.form.markAllAsTouched();
    }
  }
}
