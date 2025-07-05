import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomerAuthService } from '../services/customer-auth.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerAuthGuard implements CanActivate {
  constructor(
    private customerAuthService: CustomerAuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.customerAuthService.isCustomerAuthenticated()
      .pipe(
        tap(isAuthenticated => {
          if (!isAuthenticated) {
            // Clear any invalid auth data
            this.customerAuthService.customerLogout();
            // Redirect to customer login page
            this.router.navigate(['/wefab/customer/login']);
          }
        })
      );
  }
} 