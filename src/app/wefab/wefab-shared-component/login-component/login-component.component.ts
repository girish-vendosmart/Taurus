import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-component.component.html',
  styleUrl: './login-component.component.scss'
})
export class LoginComponentComponent {
  loginForm: FormGroup;
  showPassword = false;
  loginError = '';
  
  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  clearEmail() {
    this.loginForm.get('email')?.setValue('');
  }
  
  onSubmit() {
    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;
      
      // Check if credentials match the dummy values
      if (email === 'supplier@example.com' && password === 'pass123') {
        // Clear any previous error
        this.loginError = '';
        // Successful login - redirect to supplier login page
        this.router.navigate(['/wefab/supplier/profile-review']);
      } else {
        // Invalid credentials
        this.loginError = 'Invalid email or password. Please try again.';
        this.loginForm.get('password')?.reset();
      }
    }
  }
}
