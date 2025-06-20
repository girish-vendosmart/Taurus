import { Component } from '@angular/core';
import { CommonHeaderComponent } from '../common-header/common-header.component';
import { CommonSidebarComponent, SidebarMenuItem } from './common-sidebar.component';

/**
 * Simple test component to verify mobile hamburger menu functionality
 * 
 * Usage:
 * 1. Add this component to your route or app component temporarily
 * 2. Test on mobile device or browser dev tools (≤768px width)
 * 3. Click hamburger icon in header - sidebar should slide in
 * 4. Click backdrop (dark area) - sidebar should close
 */
@Component({
  selector: 'app-mobile-menu-test',
  standalone: true,
  imports: [CommonHeaderComponent, CommonSidebarComponent],
  template: `
    <div class="test-layout">
      <!-- Header Component with Hamburger -->
      <app-common-header 
        [title]="'Mobile Menu Test'"
        [showMobileMenu]="mobileMenuOpen"
        (mobileMenuToggle)="onToggleMobileMenu()">
      </app-common-header>
      
      <!-- Sidebar Component -->
      <app-common-sidebar 
        [menuItems]="testMenuItems"
        [mobileMenuOpen]="mobileMenuOpen"
        (mobileMenuClose)="onCloseMobileMenu()">
      </app-common-sidebar>
      
      <!-- Main Content -->
      <div class="test-content" [class.menu-open]="mobileMenuOpen">
        <div class="content-wrapper">
          <h1>🍔 Mobile Hamburger Menu Test</h1>
          
          <div class="status-box">
            <h3>📊 Current Status:</h3>
            <p><strong>Mobile Menu Open:</strong> 
              <span [class]="mobileMenuOpen ? 'status-yes' : 'status-no'">
                {{ mobileMenuOpen ? '✅ YES' : '❌ NO' }}
              </span>
            </p>
            <p><strong>Screen Width:</strong> {{ screenWidth }}px</p>
            <p><strong>Is Mobile View:</strong> 
              <span [class]="isMobileView ? 'status-yes' : 'status-no'">
                {{ isMobileView ? '✅ YES' : '❌ NO' }}
              </span>
            </p>
          </div>
          
          <div class="instructions">
            <h3>🧪 Test Instructions:</h3>
            <ol>
              <li><strong>Desktop Test:</strong> Sidebar should be always visible on the left</li>
              <li><strong>Mobile Test:</strong> Resize browser to &lt;768px or use mobile device</li>
              <li><strong>Click Hamburger:</strong> Hamburger icon (☰) should appear in header on mobile</li>
              <li><strong>Open Sidebar:</strong> Click hamburger - sidebar should slide in from left</li>
              <li><strong>Close Sidebar:</strong> Click dark backdrop area - sidebar should close</li>
            </ol>
          </div>
          
          <div class="manual-controls">
            <h3>🎮 Manual Controls:</h3>
            <button 
              type="button" 
              class="test-btn test-btn-primary"
              (click)="onToggleMobileMenu()">
              {{ mobileMenuOpen ? 'Close' : 'Open' }} Mobile Menu
            </button>
            
            <button 
              type="button" 
              class="test-btn test-btn-secondary"
              (click)="simulateMobileView()">
              Simulate Mobile View
            </button>
          </div>
          
          <div class="debug-info">
            <h3>🔧 Debug Information:</h3>
            <pre>{{ getDebugInfo() | json }}</pre>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .test-layout {
      min-height: 100vh;
      position: relative;
    }
    
    .test-content {
      margin-left: 280px;
      min-height: calc(100vh - 60px);
      background: #f8f9fa;
      transition: all 0.3s ease;
    }
    
    .content-wrapper {
      padding: 2rem;
      max-width: 800px;
    }
    
    .status-box, .instructions, .manual-controls, .debug-info {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .status-yes {
      color: #28a745;
      font-weight: bold;
    }
    
    .status-no {
      color: #dc3545;
      font-weight: bold;
    }
    
    .test-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      margin-right: 1rem;
      margin-bottom: 0.5rem;
      transition: all 0.2s ease;
    }
    
    .test-btn-primary {
      background: #007bff;
      color: white;
    }
    
    .test-btn-primary:hover {
      background: #0056b3;
    }
    
    .test-btn-secondary {
      background: #6c757d;
      color: white;
    }
    
    .test-btn-secondary:hover {
      background: #545b62;
    }
    
    pre {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      font-size: 0.85rem;
      overflow-x: auto;
    }
    
    /* Mobile Styles */
    @media (max-width: 768px) {
      .test-content {
        margin-left: 0;
      }
      
      .test-content.menu-open {
        filter: blur(1px);
      }
      
      .content-wrapper {
        padding: 1rem;
      }
    }
  `]
})
export class TestMobileMenuComponent {
  // Mobile menu state
  mobileMenuOpen = false;
  
  // Screen tracking
  screenWidth = window.innerWidth;
  isMobileView = window.innerWidth <= 768;
  
  // Test menu items
  testMenuItems: SidebarMenuItem[] = [
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
      icon: 'pi pi-cog',
      name: 'Settings',
      children: [
        {
          icon: 'pi pi-user-edit',
          name: 'Account',
          route: '/settings/account'
        },
        {
          icon: 'pi pi-bell',
          name: 'Notifications',
          route: '/settings/notifications'
        }
      ]
    }
  ];

  constructor() {
    // Track screen size changes
    window.addEventListener('resize', () => {
      this.screenWidth = window.innerWidth;
      this.isMobileView = window.innerWidth <= 768;
      
      // Auto-close on desktop
      if (!this.isMobileView && this.mobileMenuOpen) {
        this.mobileMenuOpen = false;
      }
    });
  }

  /**
   * Called when hamburger menu is clicked
   */
  onToggleMobileMenu(): void {
    console.log('🍔 Toggle mobile menu clicked');
    console.log('📊 Before toggle:', this.mobileMenuOpen);
    
    this.mobileMenuOpen = !this.mobileMenuOpen;
    
    console.log('📊 After toggle:', this.mobileMenuOpen);
    console.log('📱 Screen width:', this.screenWidth);
    console.log('📱 Is mobile view:', this.isMobileView);
  }

  /**
   * Called when backdrop is clicked to close menu
   */
  onCloseMobileMenu(): void {
    console.log('🌚 Close mobile menu via backdrop');
    this.mobileMenuOpen = false;
  }

  /**
   * Simulate mobile view for testing
   */
  simulateMobileView(): void {
    console.log('📱 Simulating mobile view');
    // This will help test the functionality even on desktop
    this.isMobileView = true;
    this.screenWidth = 360;
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      mobileMenuOpen: this.mobileMenuOpen,
      screenWidth: this.screenWidth,
      isMobileView: this.isMobileView,
      userAgent: navigator.userAgent.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    };
  }
} 