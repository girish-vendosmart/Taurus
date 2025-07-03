import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule
  ],
  templateUrl: './login-component.component.html',
  styleUrl: './login-component.component.scss'
})
export class LoginComponentComponent {
  
  loginData = {
    email: '',
    password: '',
    rememberMe: false
  };

  isLoading = false;

  constructor(private router: Router) {}

  onSubmit() {
    if (this.loginData.email && this.loginData.password) {
      this.isLoading = true;
      
      console.log('Customer login attempt:', this.loginData);
      
      // Simulate API call
      setTimeout(() => {
        // Mock successful login
        this.handleSuccessfulLogin();
        this.isLoading = false;
      }, 1500);
    }
  }

  private handleSuccessfulLogin() {
    // Store customer authentication data
    const customerData = {
      email: this.loginData.email,
      loginTime: new Date().toISOString(),
      userType: 'customer'
    };
    
    // Store in localStorage (in production, use secure storage)
    localStorage.setItem('customer_user_data', JSON.stringify(customerData));
    localStorage.setItem('customer_auth_token', 'mock-customer-token-' + Date.now());
    
    if (this.loginData.rememberMe) {
      localStorage.setItem('customer_remember_me', 'true');
    }
    
    // Navigate to customer dashboard
    this.router.navigate(['/wefab/customer/rfq-list']);
  }

  onForgotPassword() {
    console.log('Forgot password clicked');
    // Implement forgot password functionality
    // this.router.navigate(['/customer/forgot-password']);
  }

  onContactSupport() {
    console.log('Contact support clicked');
    // Implement contact support functionality
    // Could open a modal, navigate to support page, or open email client
    window.location.href = 'mailto:support@wefab.com';
  }
}
