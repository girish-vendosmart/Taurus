import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Services
import { CustomerAuthService } from '../../../core/services/customer-auth.service';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    ToastModule
  ],
  providers: [MessageService],
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

  constructor(
    private customerAuthService: CustomerAuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    // Check if already authenticated as customer
    this.customerAuthService.isCustomerAuthenticated().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/wefab/customer/rfq-list']);
      }
    });
  }

  onSubmit() {
    if (this.loginData.email && this.loginData.password) {
      this.isLoading = true;
      
      this.customerAuthService.customerLogin(this.loginData.email, this.loginData.password)
        .subscribe({
          next: () => {
            // Navigate to customer dashboard
            this.router.navigate(['/wefab/customer/rfq-list']);
          },
          error: (error) => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Login Failed',
              detail: error.message || 'Invalid email or password'
            });
          }
        });
    }
  }

  onForgotPassword() {
    this.messageService.add({
      severity: 'info',
      summary: 'Password Reset',
      detail: 'Please contact customer support to reset your password'
    });
  }

  onContactSupport() {
    window.location.href = 'mailto:customer.support@wefab.com';
  }
}
