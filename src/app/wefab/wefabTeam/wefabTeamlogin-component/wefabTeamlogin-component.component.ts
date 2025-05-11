import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { error } from 'console';

@Component({
  selector: 'app-wefabTeamlogin-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './wefabTeamlogin-component.component.html',
  styleUrl: './wefabTeamlogin-component.component.scss'
})
export class WefabTeamloginComponentComponent {
  loginForm: FormGroup;
  showPassword = false;
  loginError = '';
  
  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient) {
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

      let obj = {
        clientType: 'CLIENT_TYPE_WEB',
        email: email,
        password: password,
        returnSecureToken: true
      }

      this.http.post('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyB6l9WmhjQhmNYXQKryWvuGr3Rp3V45fOM', obj).subscribe((res: any) => {
        this.loginError = '';
        sessionStorage.setItem('token', 'c82020f17e1fd10:f34acaf7862dc9c');
        this.router.navigate(['/wefab/wefabTeam/dashboard']);
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
        
        // Reset password field for security
        this.loginForm.get('password')?.reset();
      });
    }
  }
}
