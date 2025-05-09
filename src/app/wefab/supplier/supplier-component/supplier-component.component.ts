import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-supplier-component',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './supplier-component.component.html',
  styleUrl: './supplier-component.component.scss'
})
export class SupplierComponentComponent {
  loginError: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin(email: string, password: string) {
    const obj = {
      email: email,
      password: password,
      returnSecureToken: true
    };

    this.http.post('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyB6l9WmhjQhmNYXQKryWvuGr3Rp3V45fOM', obj).subscribe((res: any) => {
      this.loginError = '';
      this.router.navigate(['/wefab/supplier/profile-review']);
    }, (err: any) => {
      // Handle different authentication error cases
      if (err.error && err.error.error) {
        const errorCode = err.error.error.message;
        
        switch (errorCode) {
          case 'EMAIL_NOT_FOUND':
          case 'INVALID_EMAIL':
            this.loginError = 'Invalid email address. Please check and try again.';
            break;
          case 'INVALID_PASSWORD':
          case 'INVALID_LOGIN_CREDENTIALS':
            this.loginError = 'Invalid password. Please check and try again.';
            break;
          case 'USER_DISABLED':
            this.loginError = 'This account has been disabled. Please contact support.';
            break;
          case 'TOO_MANY_ATTEMPTS_TRY_LATER':
            this.loginError = 'Too many failed login attempts. Please try again later.';
            break;
          default:
            this.loginError = 'Failed to login. Please try again.';
        }
      } else {
        this.loginError = 'Network error. Please check your connection and try again.';
      }
    });
  }
}
