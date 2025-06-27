import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { FirebaseService } from '../../../core/services/firebase.service';
import { ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';

// PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    InputTextModule, 
    ButtonModule, 
    PasswordModule, 
    DividerModule, 
    MessageModule,
    TooltipModule
  ],
  templateUrl: './login-component.component.html',
  styleUrl: './login-component.component.scss'
})
export class LoginComponentComponent {
  loginForm: FormGroup;
  showPassword = false;
  loginError = '';
  emailId: any;
  companyId: any;
  submitted = false;
  isLoading = false;
  showForgotPassword = false;
  resetEmailSent = false;
  resetError = '';
  
  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private commonService: CommonService,
    private firebaseService: FirebaseService,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    const currentUrl = window.location.href;
    console.log('Current URL:', currentUrl);

    // Get just the query string part (everything after the ?)
    const queryString = window.location.search;
    console.log('Query string:', queryString);
    let queryData:any = this.parseQueryString(queryString)
    console.log("Query Data", queryData)

    if(queryData.email_id && queryData.company_name) {
      this.emailId = queryData.email_id
      this.companyId = queryData.company_name
    }

    if(this.emailId) {
      this.loginForm.get('email')?.setValue(this.emailId)
      this.loginForm.get('email')?.disable();
    } 

    if(this.companyId) {
      localStorage.setItem('company_id', this.companyId)
    }
  }
  
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  
  clearEmail() {
    this.loginForm.get('email')?.setValue('');
  }

  get f() {
    return this.loginForm.controls;
  }
  
  onSubmit() {
    this.submitted = true;
    this.isLoading = true;
    
    if (this.loginForm.invalid) {
      this.isLoading = false;
      return;
    }

    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;

      // First authenticate with Firebase
      this.firebaseService.signIn(email, password).subscribe({
        next: async (userCredential) => {
          try {
            // Get the Firebase ID token
            const firebaseToken = await userCredential.user.getIdToken();
            
            // Send the token to your API
            const payload = {
              firebase_token: firebaseToken
            };

            this.commonService.postData('/api/method/wefab.wefab.api.common.core.authentication.auth.api_token_auth_frappe', payload).subscribe({
              next: (response: any) => {
                this.isLoading = false;
                if (response && response.data && response.data.token) {
                  localStorage.setItem('token', response.data.token);
                  localStorage.setItem('primary_email_id', response.data.email_id);
                  localStorage.setItem('user_type', response.data.user_type);
                  
                  // Navigate based on user type
                  if (response.data.user_type === 'supplier') {
                    localStorage.setItem('supplier_id', response.data.supplier_info.supplier_company_id);
                    localStorage.setItem('supplier_company_name', response.data.supplier_info.supplier_company_name)
                    localStorage.setItem('currency_format', '#,##,###.##')
                    localStorage.setItem('selected_currency', 'INR')
                    if(!response.data.supplier_info.supplier_company_id) {
                      this.router.navigate(['/wefab/supplier/supplier-onboarding-welcome']);
                    } else {
                      this.getOnboardingL3Status(response.data.supplier_info.supplier_company_id);
                    }
                  } else if (response.data.user_type === 'wefab_team') {
                    this.router.navigate(['/wefab/wefabTeam/manage-suppliers']);
                  } else {
                    this.loginError = 'Invalid user type';
                    this.loginForm.get('password')?.reset();
                  }
                } else {
                  this.loginError = 'Invalid response from server';
                  this.loginForm.get('password')?.reset();
                }
              },
              error: (err) => {
                this.isLoading = false;
                console.error('API Error:', err);
                this.loginError = 'Failed to authenticate with the server';
                this.loginForm.get('password')?.reset();
              }
            });
          } catch (error) {
            this.isLoading = false;
            console.error('Token Error:', error);
            this.loginError = 'Failed to get authentication token';
            this.loginForm.get('password')?.reset();
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Firebase Auth Error:', error);
          let errorMessage = 'Failed to login. Please try again.';
          
          if (error.code) {
            switch (error.code) {
              case 'auth/user-not-found':
              case 'auth/invalid-email':
                errorMessage = 'Invalid email address. Please check and try again.';
                break;
              case 'auth/wrong-password':
                errorMessage = 'Invalid password. Please check and try again.';
                break;
              case 'auth/invalid-credential':
                errorMessage = 'Invalid credentials. Please check and try again.';
                break;
              case 'auth/user-disabled':
                errorMessage = 'This account has been disabled. Please contact support.';
                break;
              case 'auth/too-many-requests':
                errorMessage = 'Too many failed login attempts. Please try again later.';
                break;
            }
          }
          
          this.loginError = errorMessage;
          this.loginForm.get('password')?.reset();
        }
      });
    }
  }

  parseQueryString(queryString: string) {
    // Remove the leading '?' if it exists
    const str = queryString.startsWith('?') ? queryString.substring(1) : queryString;
    
    // Split by '&' to get key-value pairs
    const pairs = str.split('&');
    
    // Create an object to store the parameters
    const params: Record<string, string> = {};
    
    // Parse each key-value pair
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      params[key] = decodeURIComponent(value || '');
    });
    
    return params;
  }

  getOnboardingL3Status(supplierId: string) {
    let endPoint = `/api/resource/Supplier Onboarding L1/${supplierId}`;
    this.commonService.getData(endPoint).subscribe((res: any) => {
      if(res.data.onboarding_status === 'Approved') {
        localStorage.setItem('supplier_onboarding_complete', 'true');
        localStorage.setItem('show_supplier_dashboard', 'true');
        this.router.navigate(['/wefab/supplier/dashboard']);
      } else {
        this.router.navigate([`/wefab/supplier/profile-review/${supplierId}`]);
      }
    })
  }

  showForgotPasswordForm() {
    this.showForgotPassword = true;
    this.resetEmailSent = false;
    this.resetError = '';
    this.loginError = '';
  }

  backToLogin() {
    this.showForgotPassword = false;
    this.resetEmailSent = false;
    this.resetError = '';
    this.loginError = '';
  }

  sendPasswordResetEmail() {
    const email = this.loginForm.get('email')?.value;
    
    if (!email) {
      this.resetError = 'Please enter your email address';
      return;
    }

    this.isLoading = true;
    this.resetError = '';

    this.firebaseService.sendPasswordResetEmail(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.resetEmailSent = true;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Password reset error:', error);
        
        let errorMessage = 'Failed to send reset email. Please try again.';
        
        if (error.code) {
          switch (error.code) {
            case 'auth/user-not-found':
              errorMessage = 'No account found with this email address.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'Please enter a valid email address.';
              break;
            case 'auth/too-many-requests':
              errorMessage = 'Too many requests. Please try again later.';
              break;
          }
        }
        
        this.resetError = errorMessage;
      }
    });
  }
}
