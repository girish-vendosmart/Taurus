import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  firebaseToken: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerAuthService {
  private auth: FirebaseAuth;
  private authState = new BehaviorSubject<CustomerAuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    firebaseToken: null
  });

  constructor(private http: HttpClient) {
    // Initialize Firebase with customer config
    const app = initializeApp(environment.firebaseConfig, 'customer-app');
    this.auth = getAuth(app);

    // Check for stored customer auth data
    this.checkStoredAuth();
  }

  private checkStoredAuth() {
    const storedToken = localStorage.getItem('customer_auth_token');
    const storedFirebaseToken = localStorage.getItem('customer_firebase_token');
    const storedUser = localStorage.getItem('customer_user_data');

    if (storedToken && storedFirebaseToken && storedUser) {
      const userData = JSON.parse(storedUser);
      // Only restore auth if it's a customer user
      if (userData.userType === 'customer') {
        this.authState.next({
          isAuthenticated: true,
          user: userData,
          token: storedToken,
          firebaseToken: storedFirebaseToken
        });
      } else {
        // Clear invalid customer data
        this.clearAuthData();
      }
    }
  }

  private clearAuthData() {
    localStorage.removeItem('customer_auth_token');
    localStorage.removeItem('customer_firebase_token');
    localStorage.removeItem('customer_user_data');
    localStorage.removeItem('customer_remember_me');
  }

  private verifyTokenWithFrappe(firebaseToken: string): Observable<any> {
    const verifyData = {
      firebase_token: firebaseToken
    };

    return this.http.post(
      `${environment.apiUrl}/api/method/wefab.wefab.api.common.core.authentication.auth.api_token_auth_frappe`,
      verifyData
    );
  }

  customerLogin(email: string, password: string): Observable<any> {
    // First authenticate with Firebase
    return from(signInWithEmailAndPassword(this.auth, email, password))
      .pipe(
        switchMap(async (userCredential) => {
          // Get Firebase token
          const firebaseToken = await userCredential.user.getIdToken();
          return { userCredential, firebaseToken };
        }),
        switchMap(({ userCredential, firebaseToken }) => {
          // Verify Firebase token with Frappe
          return this.verifyTokenWithFrappe(firebaseToken).pipe(
            map(response => ({
              userCredential,
              firebaseToken,
              frappeResponse: response
            }))
          );
        }),
        tap(({ userCredential, firebaseToken, frappeResponse }) => {
          if (frappeResponse.message && frappeResponse.message.token) {
            // Store auth data with customer type
            const userData = {
              email: userCredential.user.email,
              uid: userCredential.user.uid,
              userType: 'customer',
              loginTime: new Date().toISOString()
            };

            localStorage.setItem('customer_auth_token', frappeResponse.message.token);
            localStorage.setItem('customer_firebase_token', firebaseToken);
            localStorage.setItem('customer_user_data', JSON.stringify(userData));

            this.authState.next({
              isAuthenticated: true,
              user: userData,
              token: frappeResponse.message.token,
              firebaseToken: firebaseToken
            });
          }
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
            token: null,
            firebaseToken: null
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

  getFirebaseToken(): string | null {
    const state = this.authState.value;
    return state.isAuthenticated && state.user?.userType === 'customer' ? state.firebaseToken : null;
  }
} 