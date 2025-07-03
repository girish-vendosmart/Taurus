import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { CustomerSidebarComponent, MenuItem, SidebarConfig } from './component/customer-sidebar/customer-sidebar.component';
import { CustomerHeaderComponent } from './component/customer-header/customer-header.component';

@Component({
  selector: 'app-customer-component',
  standalone: true,
  imports: [RouterOutlet, CommonModule, CustomerSidebarComponent, CustomerHeaderComponent],
  templateUrl: './customer-component.component.html',
  styleUrl: './customer-component.component.scss'
})
export class CustomerComponentComponent implements OnInit {
  @ViewChild(CustomerSidebarComponent) sidebar!: CustomerSidebarComponent;
  @ViewChild(CustomerHeaderComponent) header!: CustomerHeaderComponent;

  // Login page detection
  isLoginPage = false;

  sidebarConfig: SidebarConfig = {
    logoUrl: 'assets/wefab-Logo Design 1.png',
    logoAlt: 'Wefab Logo',
    showProgress: true,
    progressLabel: 'Progress',
    progressValue: 85,
    menuItems: [
      {
        id: 'rfq',
        label: 'RFQ',
        icon: 'pi pi-file-edit',
        completed: true,
        active: false,
        disabled: false,
        route: '/wefab/customer/rfq-list'
      },
      {
        id: 'quotation',
        label: 'Quotation',
        icon: 'pi pi-calculator',
        completed: false,
        active: false,
        disabled: false,
        statusIndicator: {
          active: true,
          color: '#4CAF50'
        },
        route: '/wefab/customer/quotation-list'
      },
      {
        id: 'order',
        label: 'Order',
        icon: 'pi pi-shopping-cart',
        completed: false,
        active: false,
        disabled: false,
        route: '/wefab/customer/order-list'
      }
    ],
    showHelpSection: true,
    helpSection: {
      title: 'Need Help?',
      description: 'Our support team is here to assist you with your manufacturing needs.',
      buttonText: 'Contact Support'
    }
  };

  // Mobile sidebar state
  isMobile = false;
  sidebarOpen = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkScreenSize();
    this.checkLoginPage();
    this.updateActiveMenuBasedOnRoute();
    
    // Listen for route changes to update active menu item and login page status
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkLoginPage();
        this.updateActiveMenuBasedOnRoute();
      });
    
    // Listen for window resize
    window.addEventListener('resize', () => {
      this.checkScreenSize();
    });
  }

  private checkLoginPage(): void {
    this.isLoginPage = this.router.url.includes('/login');
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  private updateActiveMenuBasedOnRoute(): void {
    const currentRoute = this.router.url;
    this.sidebarConfig.menuItems.forEach(item => {
      item.active = false; // Reset all items first
    });

    // Check for exact matches first
    this.sidebarConfig.menuItems.forEach(item => {
      if (item.route === currentRoute) {
        item.active = true;
        return;
      }
    });

    // Check for nested route matches if no exact match found
    const hasExactMatch = this.sidebarConfig.menuItems.some(item => item.active);
    if (!hasExactMatch) {
      // Handle RFQ nested routes
      if (currentRoute.includes('/wefab/customer/rfq-details/') || 
          currentRoute.includes('/wefab/customer/create-rfq') ||
          currentRoute.includes('/wefab/customer/technical-review-page/') ||
          currentRoute.includes('/wefab/customer/ai-analysis-summary-pages')) {
        const rfqItem = this.sidebarConfig.menuItems.find(item => item.id === 'rfq');
        if (rfqItem) {
          rfqItem.active = true;
        }
      }
      // Handle Quotation nested routes  
      else if (currentRoute.includes('/wefab/customer/quotation-details/') ||
               currentRoute.includes('/wefab/customer/quotation-list')) {
        const quotationItem = this.sidebarConfig.menuItems.find(item => item.id === 'quotation');
        if (quotationItem) {
          quotationItem.active = true;
        }
      }
      // Handle Order nested routes
      else if (currentRoute.includes('/wefab/customer/order-list') ||
               currentRoute.includes('/wefab/customer/order-details/')) {
        const orderItem = this.sidebarConfig.menuItems.find(item => item.id === 'order');
        if (orderItem) {
          orderItem.active = true;
        }
      }
    }
  }

  // Header event handlers
  onLogout(): void {
    console.log('Logout initiated from header');
    
    // Clear customer-specific data
    localStorage.removeItem('customer_user_data');
    localStorage.removeItem('customer_auth_token');
    localStorage.removeItem('customer_session');
    
    // Navigate to customer login
    this.router.navigate(['/customer/login']);
    
    // You can also add logout API call here
    // this.authService.logout().subscribe(() => {
    //   this.router.navigate(['/customer/login']);
    // });
  }

  onProfileClick(): void {
    console.log('Profile clicked from header');
    
    // Navigate to customer profile page
    this.router.navigate(['/customer/profile']);
    
    // Close sidebar if open on mobile
    if (this.isMobile) {
      this.closeSidebar();
    }
  }

  onHeaderNavigation(page: string): void {
    console.log('Header navigation:', page);
    
    // Update sidebar active state based on header navigation
    this.updateSidebarForHeaderNav(page);
    
    // Close mobile sidebar
    if (this.isMobile) {
      this.closeSidebar();
    }
    
    // Handle specific navigation logic if needed
    switch (page) {
      case 'dashboard':
        // Additional dashboard logic
        break;
      case 'orders':
        // Additional orders logic
        break;
      case 'quotations':
        // Additional quotations logic
        break;
      case 'suppliers':
        // Additional suppliers logic
        break;
    }
  }

  private updateSidebarForHeaderNav(page: string): void {
    // Map header navigation to sidebar items if applicable
    const navMapping: { [key: string]: string } = {
      'quotations': 'quotation',
      'orders': 'order'
    };
    
    const sidebarId = navMapping[page];
    if (sidebarId) {
      this.setActiveStep(sidebarId);
    }
  }

  onMenuItemClick(item: MenuItem): void {
    console.log('Menu item clicked:', item);
    
    // Navigate to route if specified
    if (item.route && !item.disabled) {
      this.router.navigate([item.route]);
    }

    // Close mobile sidebar after navigation
    if (this.isMobile) {
      this.sidebarOpen = false;
    }

    // Handle specific menu actions
    this.handleMenuAction(item);
  }

  private handleMenuAction(item: MenuItem): void {
    switch (item.id) {
      case 'rfq':
        this.handleRFQ();
        break;
      case 'quotation':
        this.handleQuotation();
        break;
      case 'order':
        this.handleOrder();
        break;
      default:
        console.log('Unknown menu action:', item.id);
    }
  }

  onHelpClick(): void {
    console.log('Help clicked - opening support');
    // You can implement help/support functionality here
    // For example: open a modal, navigate to help page, or open chat widget
    this.openSupportDialog();
  }

  onProgressUpdate(progress: number): void {
    console.log('Progress updated:', progress);
    // Handle progress updates if needed
  }

  // Menu action handlers
  private handleRFQ(): void {
    console.log('Handling RFQ action');
    // Implement RFQ logic - navigate to RFQ details, create new RFQ, etc.
  }

  private handleQuotation(): void {
    console.log('Handling quotation action');
    // Implement quotation logic - view quotations, create quotation, etc.
  }

  private handleOrder(): void {
    console.log('Handling order action');
    // Implement order logic - view orders, create order, order tracking, etc.
  }

  private openSupportDialog(): void {
    // Implement support dialog/modal
    alert('Support feature coming soon!');
  }

  // Public methods for external control
  public updateProgress(value: number): void {
    this.sidebarConfig.progressValue = value;
  }

  public markStepCompleted(stepId: string): void {
    if (this.sidebar) {
      this.sidebar.markItemCompleted(stepId, true);
    }
    
    // Update local config as well
    const item = this.sidebarConfig.menuItems.find(item => item.id === stepId);
    if (item) {
      item.completed = true;
    }

    // Auto-calculate progress based on completed items
    this.updateProgressBasedOnCompletion();
  }

  public setActiveStep(stepId: string): void {
    if (this.sidebar) {
      this.sidebar.setActiveMenuItem(stepId);
    }
  }

  private updateProgressBasedOnCompletion(): void {
    const totalItems = this.sidebarConfig.menuItems.length;
    const completedItems = this.sidebarConfig.menuItems.filter(item => item.completed).length;
    const progressValue = Math.round((completedItems / totalItems) * 100);
    
    this.updateProgress(progressValue);
  }

  // Mobile sidebar toggle
  public toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  public closeSidebar(): void {
    this.sidebarOpen = false;
  }

  // Header methods for updating user data
  public updateHeaderUserData(userData: any): void {
    if (this.header) {
      this.header.updateUserData(userData);
    }
  }

  public addHeaderNotification(notification: any): void {
    if (this.header) {
      this.header.addNotification(notification);
    }
  }
}
