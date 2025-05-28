import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonSidebarComponent, SidebarMenuItem } from '../../../common-core-component/common-sidebar/common-sidebar.component';
import { CommonHeaderComponent } from '../../../common-core-component/common-header/common-header.component';

@Component({
  selector: 'app-supplier-component',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule, CommonSidebarComponent, CommonHeaderComponent],
  templateUrl: './supplier-component.component.html',
  styleUrl: './supplier-component.component.scss'
})
export class SupplierComponentComponent {
  loginError: string = '';
  showDashboardLayout: boolean = false;
  normalLayoutHeader: string = '';

  // Sidebar menu items configuration
  sidebarMenuItems: SidebarMenuItem[] = [
    {
      icon: 'pi pi-home',
      name: 'Dashboard',
      route: '/wefab/supplier/dashboard'
    },
    {
      icon: 'pi pi-user',
      name: 'RFQ',
      route: '/wefab/supplier/rfq'
    },
    {
      icon: 'pi pi-check-circle',
      name: 'Quotations',
      route: '/wefab/supplier/quotation'
    }
  ];
  userType: any;

  constructor(private http: HttpClient, private router: Router) {
    // Check if onboarding is complete and dashboard should be shown
    this.checkDashboardVisibility();
    
    // Listen for route changes to update dashboard visibility
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkDashboardVisibility();
    });
  }

  checkDashboardVisibility(): void {
    debugger
    const onboardingComplete = sessionStorage.getItem('supplier_onboarding_complete');
    const showDashboard = sessionStorage.getItem('show_supplier_dashboard');
    const userType = sessionStorage.getItem('user_type');
    this.userType = userType;
    
    this.showDashboardLayout = onboardingComplete === 'true' || showDashboard === 'true' || userType === 'wefab_team';
    this.updateSidebarMenuItems();

    if(this.showDashboardLayout) {
      this.normalLayoutHeader = 'WE-FAB Supplier Portal';
    } else {
      this.normalLayoutHeader = '';
    }
  }

  onHeaderLogout(): void {
    this.logout();
  }

  updateSidebarMenuItems() {
    if(this.userType === 'wefab_team') {
      this.sidebarMenuItems = [
        {
          icon: 'bi bi-people',
          name: 'Manage Suppliers',
          route: '/wefab/wefabTeam/manage-suppliers'
        },
        {
          icon: 'pi pi-search',
          name: 'Supplier Finder',
          route: '/wefab/wefabTeam/supplier-finder'
        },
      ];
    } else {
      this.sidebarMenuItems = [
        {
          icon: 'pi pi-home',
          name: 'Dashboard',
          route: '/wefab/supplier/dashboard'
        },
        {
          icon: 'pi pi-user',
          name: 'RFQ',
          route: '/wefab/supplier/rfq'
        },
        {
          icon: 'pi pi-check-circle',
          name: 'Quotations',
          route: '/wefab/supplier/quotation'
        }
      ]
    }
  }

  logout(): void {
    // Clear session storage
    sessionStorage.removeItem('supplier_onboarding_complete');
    sessionStorage.removeItem('show_supplier_dashboard');
    sessionStorage.removeItem('supplier_id');
    
    // Navigate to login or home page
    this.router.navigate(['/wefab/supplier']);
  }

  onLogin(email: string, password: string) {
    const obj = {
      email: email,
      password: password,
      returnSecureToken: true
    };

    this.http.post('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyB6l9WmhjQhmNYXQKryWvuGr3Rp3V45fOM', obj).subscribe((res: any) => {
      this.loginError = '';
      this.router.navigate(['/wefab/supplier/profile-review']);
    }, (err: any) => {
      // Handle different authentication error cases
      if (err.error && err.error.error) {
        const errorCode = err.error.error.message;
        
        switch (errorCode) {
          case 'EMAIL_NOT_FOUND':
          case 'INVALID_EMAIL':
            this.loginError = 'Invalid email address. Please check and try again.';
            break;
          case 'INVALID_PASSWORD':
          case 'INVALID_LOGIN_CREDENTIALS':
            this.loginError = 'Invalid password. Please check and try again.';
            break;
          case 'USER_DISABLED':
            this.loginError = 'This account has been disabled. Please contact support.';
            break;
          case 'TOO_MANY_ATTEMPTS_TRY_LATER':
            this.loginError = 'Too many failed login attempts. Please try again later.';
            break;
          default:
            this.loginError = 'Failed to login. Please try again.';
        }
      } else {
        this.loginError = 'Network error. Please check your connection and try again.';
      }
    });
  }
}
