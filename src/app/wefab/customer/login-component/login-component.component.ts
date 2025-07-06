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
import { TooltipModule } from 'primeng/tooltip';

// Services
import { CustomerAuthService } from '../../../core/services/customer-auth.service';
import { FirebaseService } from '../../../core/services/firebase.service';

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
    ToastModule,
    TooltipModule
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

  showPassword = false;
  isLoading = false;
  showForgotPassword = false;
  resetEmail = '';
  isResettingPassword = false;
  resetEmailSent = false;

  constructor(
    private customerAuthService: CustomerAuthService,
    private firebaseService: FirebaseService,
    private router: Router,
    private messageService: MessageService
  ) {
    // Check if already authenticated as customer
    this.customerAuthService.isCustomerAuthenticated().subscribe(isAuthenticated => {
      console.log('Authentication check:', isAuthenticated);
      if (isAuthenticated) {
        this.router.navigate(['/wefab/customer/rfq-list']);
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginData.email && this.loginData.password) {
      this.isLoading = true;
      
      this.customerAuthService.customerLogin(this.loginData.email, this.loginData.password)
        .subscribe({
          next: (response) => {
            console.log('Login response:', response);
            if (response.firebaseToken) {
              if (this.loginData.rememberMe) {
                localStorage.setItem('customer_remember_me', 'true');
              }
              
              this.router.navigate(['/wefab/customer/rfq-list'])
                .then(success => {
                  if (!success) {
                    this.router.navigate(['wefab/customer/rfq-list'])
                      .catch(err => {
                        this.messageService.add({
                          severity: 'error',
                          summary: 'Navigation Failed',
                          detail: 'Could not navigate to dashboard. Please check route configuration.'
                        });
                      });
                  }
                })
                .catch(err => {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Navigation Failed',
                    detail: 'Error during navigation: ' + err.message
                  });
                });
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
            console.error('Login error:', error);
            this.isLoading = false;
            let errorMessage = 'An error occurred during login';
            
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
            } else if (error.error) {
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
    this.showForgotPassword = true;
    this.resetEmail = this.loginData.email; // Pre-fill email if available
  }

  async sendPasswordResetEmail() {
    if (!this.resetEmail) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter your email address'
      });
      return;
    }

    this.isResettingPassword = true;
    try {
      await this.firebaseService.sendPasswordResetEmail(this.resetEmail);
      this.resetEmailSent = true;
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Password reset email has been sent successfully'
      });
    } catch (error: any) {
      let errorMessage = 'Failed to send password reset email';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email';
            break;
          default:
            errorMessage = error.message || 'Failed to send reset email';
        }
      }
      
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage
      });
    } finally {
      this.isResettingPassword = false;
    }
  }

  backToLogin() {
    this.showForgotPassword = false;
    this.resetEmailSent = false;
    this.resetEmail = '';
  }

  onContactSupport() {
    window.location.href = 'mailto:customer.support@wefab.com';
  }
}
