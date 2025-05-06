import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';

@Component({
  selector: 'app-supplier-create-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyBootstrapModule
  ],
  templateUrl: './supplier-create-account.component.html',
  styleUrl: './supplier-create-account.component.scss'
})
export class SupplierCreateAccountComponent implements OnInit {
  form: FormGroup;
  captchaVerified = false;
  captchaText = 'BTVAEs';
  showPassword = false;
  
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      captcha: ['', [Validators.required]]
    });
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
  
  verifyCaptcha() {
    const captchaInput = this.captchaControl?.value;
    if (captchaInput && captchaInput === this.captchaText) {
      this.captchaVerified = true;
    } else {
      this.captchaVerified = false;
    }
  }
  
  refreshCaptcha() {
    // In a real application, this would generate a new captcha
    this.captchaText = 'BTVAEs';
    this.captchaVerified = false;
    this.captchaControl?.setValue('');
  }
  
  onSubmit() {
    if (this.form.valid && this.captchaVerified) {
      console.log('Form submitted successfully', this.form.value);
      // Proceed to the next step or send data to the server
    } else {
      // Mark all fields as touched to show validation errors
      this.form.markAllAsTouched();
    }
  }
}
