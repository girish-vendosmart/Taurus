import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // During server-side rendering, allow navigation but client side will recheck
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    // Handle logout route specially
    if (route.routeConfig?.path === 'logout') {
      this.authService.logout().subscribe();
      return this.router.createUrlTree(['/wefab/supplier/login']);
    }
    
    if (this.authService.isAuthenticated()) {
      return true;
    }
    
    // Redirect to login page if not authenticated
    return this.router.createUrlTree(['/wefab/supplier/login']);
  }
} 