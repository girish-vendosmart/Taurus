import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('user_type'); // 'supplier' or 'buyer'
  const supplierId = localStorage.getItem('supplier_id');
  const isLoggedIn = !!token;
  const requestedUrl = state.url;

  console.log("LoggedIn ", isLoggedIn, "RequestedUrl", requestedUrl)

  // Check if the current route is any login route
  const isLoginRoute = requestedUrl.includes('/login') || 
                      requestedUrl === '/wefab/supplier/login' ||
                      requestedUrl.endsWith('/login');

  // 🔴 Not logged in and trying to access a protected page
  if (!isLoggedIn && !isLoginRoute) {
    router.navigate(['/wefab/supplier/login']);
    return false;
  }

  // 🟡 Logged in but trying to go back to login page
  if (isLoggedIn && isLoginRoute) {
    debugger
    if (userType === 'supplier' && supplierId) {  
      router.navigate(['/wefab/supplier/dashboard']);
    } else if(userType === 'supplier' && !supplierId) {
      router.navigate(['/wefab/supplier/supplier-onboarding-status']);
    } else if (userType === 'wefab_team') {
      router.navigate(['/wefab/wefabTeam/manage-suppliers']);
    }
    return false;
  }

  // ✅ Everything OK
  return true;
};
