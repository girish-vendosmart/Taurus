import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  onSubmit() {
    if (this.loginData.email && this.loginData.password) {
      console.log('Login attempt:', this.loginData);
      // Handle login logic here
    }
  }
}
