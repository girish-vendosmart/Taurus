import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonSidebarComponent, SidebarMenuItem } from './common-sidebar.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-sidebar-example',
  standalone: true,
  imports: [CommonModule, CommonSidebarComponent, ButtonModule],
  template: `
    <!-- Example 1: Basic Sidebar -->
    <app-common-sidebar 
      [menuItems]="basicMenuItems"
      [visible]="showBasicSidebar"
      headerTitle="Basic Sidebar"
      width="280px">
    </app-common-sidebar>

    <!-- Example 2: Advanced Sidebar with nested items -->
    <app-common-sidebar 
      [menuItems]="advancedMenuItems"
      [visible]="showAdvancedSidebar"
      headerTitle="Advanced Sidebar"
      width="320px"
      *ngIf="!showBasicSidebar">
    </app-common-sidebar>

    <!-- Main Content Area -->
    <div class="main-content" [style.margin-left]="getContentMargin()">
      <div class="container-fluid p-4">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h2>Sidebar Component Examples</h2>
            <p class="mb-0">Toggle between different sidebar configurations</p>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <h5>Basic Sidebar</h5>
                <p>Simple menu items with icons and routes</p>
                <p-button 
                  label="Show Basic Sidebar" 
                  icon="pi pi-bars"
                  styleClass="p-button-outlined"
                  (onClick)="toggleBasicSidebar()">
                </p-button>
              </div>
              <div class="col-md-6 mb-3">
                <h5>Advanced Sidebar</h5>
                <p>Nested menu items with custom actions</p>
                <p-button 
                  label="Show Advanced Sidebar" 
                  icon="pi pi-cog"
                  styleClass="p-button-outlined p-button-secondary"
                  (onClick)="toggleAdvancedSidebar()">
                </p-button>
              </div>
            </div>
            
            <div class="mt-4">
              <h5>Current Configuration:</h5>
              <pre class="bg-light p-3 rounded">{{ getCurrentConfig() | json }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .main-content {
      transition: margin-left 0.3s ease;
      min-height: 100vh;
      background-color: #f8f9fa;
    }
    
    pre {
      font-size: 0.875rem;
      max-height: 300px;
      overflow-y: auto;
    }
  `]
})
export class SidebarExampleComponent {
  showBasicSidebar = true;
  showAdvancedSidebar = false;

  basicMenuItems: SidebarMenuItem[] = [
    {
      icon: 'pi pi-home',
      name: 'Dashboard',
      route: '/dashboard'
    },
    {
      icon: 'pi pi-users',
      name: 'Manage Suppliers',
      route: '/suppliers'
    },
    {
      icon: 'pi pi-search',
      name: 'Supplier Finder',
      route: '/supplier-finder'
    },
    {
      icon: 'pi pi-chart-bar',
      name: 'Analytics',
      route: '/analytics'
    },
    {
      icon: 'pi pi-question-circle',
      name: 'Help & Support',
      route: '/help'
    }
  ];

  advancedMenuItems: SidebarMenuItem[] = [
    {
      icon: 'pi pi-home',
      name: 'Dashboard',
      route: '/dashboard'
    },
    {
      icon: 'pi pi-users',
      name: 'Supplier Management',
      children: [
        {
          icon: 'pi pi-plus',
          name: 'Add Supplier',
          route: '/suppliers/add'
        },
        {
          icon: 'pi pi-list',
          name: 'View All',
          route: '/suppliers/list'
        },
        {
          icon: 'pi pi-verified',
          name: 'Pending Approval',
          route: '/suppliers/pending'
        }
      ]
    },
    {
      icon: 'pi pi-chart-bar',
      name: 'Analytics',
      children: [
        {
          icon: 'pi pi-chart-line',
          name: 'Performance',
          route: '/analytics/performance'
        },
        {
          icon: 'pi pi-chart-pie',
          name: 'Reports',
          route: '/analytics/reports'
        },
        {
          icon: 'pi pi-download',
          name: 'Export Data',
          command: () => this.exportData()
        }
      ]
    },
    {
      icon: 'pi pi-cog',
      name: 'Settings',
      children: [
        {
          icon: 'pi pi-user',
          name: 'Profile',
          route: '/settings/profile'
        },
        {
          icon: 'pi pi-shield',
          name: 'Security',
          route: '/settings/security'
        },
        {
          icon: 'pi pi-bell',
          name: 'Notifications',
          route: '/settings/notifications'
        },
        {
          icon: 'pi pi-sign-out',
          name: 'Logout',
          command: () => this.logout()
        }
      ]
    }
  ];

  toggleBasicSidebar() {
    this.showBasicSidebar = true;
    this.showAdvancedSidebar = false;
  }

  toggleAdvancedSidebar() {
    this.showBasicSidebar = false;
    this.showAdvancedSidebar = true;
  }

  getContentMargin(): string {
    if (this.showBasicSidebar) return '280px';
    if (this.showAdvancedSidebar) return '320px';
    return '0px';
  }

  getCurrentConfig() {
    return {
      type: this.showBasicSidebar ? 'Basic' : 'Advanced',
      menuItems: this.showBasicSidebar ? this.basicMenuItems : this.advancedMenuItems,
      width: this.getContentMargin(),
      visible: this.showBasicSidebar || this.showAdvancedSidebar
    };
  }

  exportData() {
    console.log('Exporting data...');
    alert('Data export functionality would be implemented here');
  }

  logout() {
    console.log('Logging out...');
    alert('Logout functionality would be implemented here');
  }
} 