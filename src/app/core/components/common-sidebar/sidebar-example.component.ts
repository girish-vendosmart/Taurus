import { Component } from '@angular/core';
import { CommonHeaderComponent } from '../common-header/common-header.component';
import { CommonSidebarComponent, SidebarMenuItem } from './common-sidebar.component';

@Component({
  selector: 'app-sidebar-example',
  standalone: true,
  imports: [CommonHeaderComponent, CommonSidebarComponent],
  template: `
    <div class="layout-container">
      <!-- Header with Mobile Menu Support -->
      <app-common-header 
        [title]="'Supplier Portal'"
        [showMobileMenu]="isMobileMenuOpen"
        (mobileMenuToggle)="toggleMobileMenu()"
        (logoutEvent)="onLogout()">
      </app-common-header>
      
      <!-- Sidebar with Mobile Menu Support -->
      <app-common-sidebar 
        [menuItems]="sidebarMenuItems"
        [mobileMenuOpen]="isMobileMenuOpen"
        (mobileMenuClose)="closeMobileMenu()">
      </app-common-sidebar>
      
      <!-- Main Content Area -->
      <div class="main-content" [class.mobile-menu-open]="isMobileMenuOpen">
        <div class="content-padding">
          <h2>Mobile Hamburger Menu Demo</h2>
          <p>This demonstrates the mobile hamburger menu functionality:</p>
          
          <div class="demo-info">
            <h3>📱 How it works:</h3>
            <ul>
              <li><strong>Desktop:</strong> Sidebar is always visible</li>
              <li><strong>Mobile (≤768px):</strong> Hamburger menu appears in header</li>
              <li><strong>Click hamburger:</strong> Sidebar slides in from left</li>
              <li><strong>Click backdrop:</strong> Sidebar closes automatically</li>
            </ul>
            
            <h3>🔧 Current State:</h3>
            <p><strong>Mobile Menu Open:</strong> {{ isMobileMenuOpen ? 'Yes' : 'No' }}</p>
            <p><strong>Screen Width:</strong> {{ screenWidth }}px</p>
            <p><strong>Is Mobile:</strong> {{ isMobile ? 'Yes' : 'No' }}</p>
            
            <h3>🧪 Test Controls:</h3>
            <button 
              type="button" 
              class="btn btn-primary"
              (click)="toggleMobileMenu()">
              {{ isMobileMenuOpen ? 'Close' : 'Open' }} Mobile Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout-container {
      position: relative;
      min-height: 100vh;
    }
    
    .main-content {
      margin-left: 280px;
      min-height: calc(100vh - 60px);
      transition: margin-left 0.3s ease;
    }
    
    .content-padding {
      padding: 2rem;
    }
    
    .demo-info {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 1.5rem;
      margin-top: 1rem;
    }
    
    .demo-info h3 {
      color: #495057;
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }
    
    .demo-info ul {
      margin-bottom: 1.5rem;
    }
    
    .demo-info li {
      margin-bottom: 0.5rem;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-primary {
      background: #007bff;
      color: white;
    }
    
    .btn-primary:hover {
      background: #0056b3;
    }
    
    /* Mobile Responsive */
    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
        padding-top: 0;
      }
      
      .main-content.mobile-menu-open {
        /* Optional: Add blur or overlay effect when mobile menu is open */
        filter: blur(2px);
        pointer-events: none;
      }
      
      .content-padding {
        padding: 1rem;
      }
    }
  `]
})
export class SidebarExampleComponent {
  // Mobile menu state
  isMobileMenuOpen = false;
  
  // Screen size tracking for demo
  screenWidth = window.innerWidth;
  isMobile = window.innerWidth <= 768;
  
  // Sample menu items
  sidebarMenuItems: SidebarMenuItem[] = [
    {
      icon: 'pi pi-home',
      name: 'Dashboard',
      route: '/dashboard'
    },
    {
      icon: 'pi pi-user',
      name: 'Profile',
      route: '/profile'
    },
    {
      icon: 'pi pi-shopping-cart',
      name: 'Orders',
      children: [
        {
          icon: 'pi pi-plus',
          name: 'Create Order',
          route: '/orders/create'
        },
        {
          icon: 'pi pi-list',
          name: 'View Orders',
          route: '/orders/list'
        },
        {
          icon: 'pi pi-history',
          name: 'Order History',
          route: '/orders/history'
        }
      ]
    },
    {
      icon: 'pi pi-cog',
      name: 'Settings',
      children: [
        {
          icon: 'pi pi-user-edit',
          name: 'Account Settings',
          route: '/settings/account'
        },
        {
          icon: 'pi pi-bell',
          name: 'Notifications',
          route: '/settings/notifications'
        }
      ]
    },
    {
      icon: 'pi pi-question-circle',
      name: 'Help & Support',
      route: '/help'
    }
  ];

  constructor() {
    // Track screen size changes for demo
    window.addEventListener('resize', () => {
      this.screenWidth = window.innerWidth;
      this.isMobile = window.innerWidth <= 768;
      
      // Auto-close mobile menu when switching to desktop
      if (!this.isMobile && this.isMobileMenuOpen) {
        this.isMobileMenuOpen = false;
      }
    });
  }

  /**
   * Toggle mobile menu open/closed
   */
  toggleMobileMenu(): void {
    console.log('🍔 Hamburger clicked - Current state:', this.isMobileMenuOpen);
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    console.log('🍔 New state:', this.isMobileMenuOpen);
  }

  /**
   * Close mobile menu (called from sidebar backdrop click)
   */
  closeMobileMenu(): void {
    console.log('🌚 Backdrop clicked - Closing mobile menu');
    this.isMobileMenuOpen = false;
  }

  /**
   * Handle logout event from header
   */
  onLogout(): void {
    console.log('👋 Logout clicked');
    // Handle logout logic here
  }
} 