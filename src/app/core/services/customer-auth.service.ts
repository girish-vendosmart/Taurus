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
  userType: string | null;
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
    userType: null,
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
    debugger
    const storedToken = localStorage.getItem('token');
    const storedFirebaseToken = localStorage.getItem('firebaseToken');
    const storedUser = localStorage.getItem('user_type');

    if (storedToken && storedFirebaseToken && storedUser) {
      // Only restore auth if it's a customer user
      if (storedUser === 'customer') {
        this.authState.next({
          isAuthenticated: true,
          userType: storedUser,
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
    localStorage.removeItem('token');
    localStorage.removeItem('firebaseToken');
    localStorage.removeItem('user_type');
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
        tap(({ userCredential, firebaseToken, frappeResponse: response }) => {
          console.log('User Credential', userCredential);
          console.log("User Response", response);
          if(response && response.data && response.data.token){
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('firebaseToken', firebaseToken);
            localStorage.setItem('primary_email_id', response.data.email_id);
            localStorage.setItem('country', response.data.country);
            localStorage.setItem('user_type', response.data.user_type);
          }
          if(response.data.user_type === 'customer'){
            localStorage.setItem('customer_id', response.data.customer_info.customer_company_id);
            localStorage.setItem('customer_company_name', response.data.customer_info.customer_company_name)
          }

            this.authState.next({
              isAuthenticated: true,
              userType: response.data.user_type,
              token: response.data.token,
              firebaseToken: firebaseToken
            });
          // if (frappeResponse.message && frappeResponse.message.token) {
          //   // Store auth data with customer type
          //   const userData = {
          //     email: userCredential.user.email,
          //     uid: userCredential.user.uid,
          //     userType: 'customer',
          //     loginTime: new Date().toISOString()
          //   };

          //   localStorage.setItem('customer_auth_token', frappeResponse.message.token);
          //   localStorage.setItem('customer_firebase_token', firebaseToken);
          //   localStorage.setItem('customer_user_data', JSON.stringify(userData));

          //   this.authState.next({
          //     isAuthenticated: true,
          //     user: userData,
          //     token: frappeResponse.message.token,
          //     firebaseToken: firebaseToken
          //   });
          // }
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
            userType: null,
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
        map(state => state.isAuthenticated && state.userType === 'customer')
      );
  }

  getCustomerToken(): string | null {
    const state = this.authState.value;
    return state.isAuthenticated && state.userType === 'customer' ? state.token : null;
  }

  getFirebaseToken(): string | null {
    const state = this.authState.value;
    return state.isAuthenticated && state.userType === 'customer' ? state.firebaseToken : null;
  } 
} 