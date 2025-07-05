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
          next: (response) => {
            if (response.frappeResponse?.message?.token) {
              // Store remember me preference if selected
              if (this.loginData.rememberMe) {
                localStorage.setItem('customer_remember_me', 'true');
              }
              
              // Navigate to customer dashboard
              this.router.navigate(['/wefab/customer/rfq-list']);
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Login Failed',
                detail: 'Token verification failed'
              });
            }
            this.isLoading = false;
          },
          error: (error) => {
            this.isLoading = false;
            let errorMessage = 'An error occurred during login';
            
            // Handle Firebase auth errors
            if (error.code) {
              switch (error.code) {
                case 'auth/invalid-email':
                  errorMessage = 'Invalid email address';
                  break;
                case 'auth/user-disabled':
                  errorMessage = 'This account has been disabled';
                  break;
                case 'auth/user-not-found':
                  errorMessage = 'No account found with this email';
                  break;
                case 'auth/wrong-password':
                  errorMessage = 'Invalid password';
                  break;
                default:
                  errorMessage = error.message || 'Authentication failed';
              }
            } 
            // Handle Frappe API errors
            else if (error.error) {
              if (error.error.message) {
                errorMessage = error.error.message;
              } else if (error.error._server_messages) {
                try {
                  const serverMessages = JSON.parse(error.error._server_messages);
                  errorMessage = serverMessages[0] || errorMessage;
                } catch {
                  errorMessage = 'Token verification failed';
                }
              }
            }
            
            this.messageService.add({
              severity: 'error',
              summary: 'Login Failed',
              detail: errorMessage
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
