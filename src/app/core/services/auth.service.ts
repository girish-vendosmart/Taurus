import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (!this.isBrowser()) {
      return false; // Return false for server-side rendering
    }
    const token = sessionStorage.getItem('token');
    return !!token;
  }

  // Get the authentication token
  getToken(): string | null {
    if (!this.isBrowser()) {
      return null; // Return null for server-side rendering
    }
    return sessionStorage.getItem('token');
  }

  // Logout user
  logout(): Observable<boolean> {
    if (this.isBrowser()) {
      sessionStorage.removeItem('token');
    }
    this.router.navigate(['/wefab/supplier/login']);
    return of(true);
  }
} 