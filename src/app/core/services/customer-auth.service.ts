import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut,
  Auth as FirebaseAuth,
  UserCredential 
} from 'firebase/auth';
import { environment } from '../../../enviornments/environment.customer';

export interface CustomerAuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerAuthService {
  private auth: FirebaseAuth;
  private authState = new BehaviorSubject<CustomerAuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  constructor() {
    // Initialize Firebase with customer config
    const app = initializeApp(environment.firebaseConfig, 'customer-app');
    this.auth = getAuth(app);

    // Check for stored customer auth data
    this.checkStoredAuth();
  }

  private checkStoredAuth() {
    const storedToken = localStorage.getItem('customer_auth_token');
    const storedUser = localStorage.getItem('customer_user_data');

    if (storedToken && storedUser) {
      const userData = JSON.parse(storedUser);
      // Only restore auth if it's a customer user
      if (userData.userType === 'customer') {
        this.authState.next({
          isAuthenticated: true,
          user: userData,
          token: storedToken
        });
      } else {
        // Clear invalid customer data
        this.clearAuthData();
      }
    }
  }

  private clearAuthData() {
    localStorage.removeItem('customer_auth_token');
    localStorage.removeItem('customer_user_data');
    localStorage.removeItem('customer_remember_me');
  }

  customerLogin(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password))
      .pipe(
        tap(async (userCredential) => {
          // Get the Firebase token
          const token = await userCredential.user.getIdToken();
          
          // For demo purposes, we'll use a dummy token
          const dummyToken = 'dummy-customer-token-' + Date.now();
          
          // Store auth data with customer type
          const userData = {
            email: userCredential.user.email,
            uid: userCredential.user.uid,
            userType: 'customer',
            loginTime: new Date().toISOString()
          };

          localStorage.setItem('customer_auth_token', dummyToken);
          localStorage.setItem('customer_user_data', JSON.stringify(userData));

          this.authState.next({
            isAuthenticated: true,
            user: userData,
            token: dummyToken
          });
        }),
        catchError((error) => {
          console.error('Customer login error:', error);
          throw error;
        })
      );
  }

  customerLogout(): Observable<void> {
    return from(signOut(this.auth))
      .pipe(
        tap(() => {
          this.clearAuthData();
          this.authState.next({
            isAuthenticated: false,
            user: null,
            token: null
          });
        })
      );
  }

  getCustomerAuthState(): Observable<CustomerAuthState> {
    return this.authState.asObservable();
  }

  isCustomerAuthenticated(): Observable<boolean> {
    return this.getCustomerAuthState()
      .pipe(
        map(state => state.isAuthenticated && state.user?.userType === 'customer')
      );
  }

  getCustomerToken(): string | null {
    const state = this.authState.value;
    return state.isAuthenticated && state.user?.userType === 'customer' ? state.token : null;
  }
} 