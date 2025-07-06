import { Injectable } from '@angular/core';
import { environment } from '../../../enviornments/enviornment';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  UserCredential,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from 'firebase/auth';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app = initializeApp(environment.firebaseConfig);
  private auth = getAuth(this.app);
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  constructor() {}

  // Auth methods
  signIn(email: string, password: string): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  signUp(email: string, password: string): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  sendPasswordResetEmail(email: string): Observable<void> {
    return from(firebaseSendPasswordResetEmail(this.auth, email));
  }

  // Get the current user
  get currentUser() {
    return this.auth.currentUser;
  }

  // Listen for auth state changes
  get authState() {
    return new Observable<any>(observer => {
      return this.auth.onAuthStateChanged(
        user => observer.next(user),
        error => observer.error(error),
        () => observer.complete()
      );
    });
  }

  // Phone authentication methods
  initRecaptcha(containerId: string) {
    if (!this.recaptchaVerifier) {
      this.recaptchaVerifier = new RecaptchaVerifier(this.auth, containerId, {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, you can proceed with phone auth
        }
      });
    }
    return this.recaptchaVerifier;
  }

  async sendPhoneVerificationCode(phoneNumber: string, recaptchaContainer: string) {
    try {
      const verifier = this.initRecaptcha(recaptchaContainer);
      if (!verifier) {
        throw new Error('Recaptcha verifier not initialized');
      }
      const confirmationResult = await signInWithPhoneNumber(this.auth, phoneNumber, verifier);
      return confirmationResult;
    } catch (error) {
      console.error('Error sending verification code:', error);
      throw error;
    }
  }
} 