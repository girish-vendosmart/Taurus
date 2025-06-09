import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommonSidebarComponent } from '../../../core/components/common-sidebar/common-sidebar.component';
import { CommonHeaderComponent } from '../../../core/components/common-header/common-header.component';

@Component({
  selector: 'app-wefabTeam-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, CommonSidebarComponent, CommonHeaderComponent],
  template: `
    <div class="wefabTeam-layout">
      <!-- Common Header Component - moved to top level for full width -->
      <app-common-header
        [title]="'WE-FAB Team Portal'">
      </app-common-header>

      <!-- Layout body containing sidebar and main content -->
      <div class="layout-body">
        <!-- Common Sidebar Component - positioned below header -->
        <app-common-sidebar 
          [menuItems]="sidebarMenuItems"
          [visible]="true"
          [showHeader]="true"
          headerTitle="WE-FAB Team Portal"
          width="260px">
        </app-common-sidebar>

        <!-- Main content area -->
        <div class="main-content with-sidebar">
          <!-- Router outlet for all content -->
          <div class="content-area">
            <router-outlet></router-outlet>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`

    // WE-FAB Style Guide Variables
    $blueprint-blue: #1A3A5F;   // Primary brand color
    $technical-white: #f5f6fa;  // Background color
    $precision-black: #1A1D21;  // Text color
    $machine-gray: #545A64;     // Secondary elements
    $material-silver: #D1D5DB;  // Borders, backgrounds
    $safety-orange: #FF5722;    // CTAs, highlights
    $process-green: #12856E;    // Success states, progress

    // Layout variables
    $sidebar-width: 260px;
    $header-height: 60px; // Height of common-header component
    $border-radius: 8px;
    $box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    $transition: all 0.3s ease;

    .wefabTeam-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: $technical-white;
      position: relative;
    }

    // Layout body containing sidebar and main content
    .layout-body {
      display: flex;
      flex: 1;
      height: calc(100vh - #{$header-height});
    }

    // Main content area
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 100%;
      width: 100%;
      transition: $transition;

      &.with-sidebar {
        width: calc(100% - #{$sidebar-width});
      }
    }

    // Content area
    .content-area {
      flex: 1;
      padding: 0;
      background-color: $technical-white;
      overflow-x: hidden;
      overflow-y: auto;
    }

    // Override common-header positioning when used in this layout
    :host ::ng-deep {
      app-common-header {
        .common-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          border-bottom: 1px solid rgba($material-silver, 0.3);
          width: 100%;
          height: $header-height;
        }
      }
      
      // Ensure sidebar has proper positioning within layout-body
      app-common-sidebar {
        position: relative;
        z-index: 999;
        
        .sidebar-container {
          width: $sidebar-width;
          height: 100%;
          position: sticky;
          top: 0;
        }
      }
    }

    // Responsive design
    @media (max-width: 768px) {
      .layout-body {
        flex-direction: column;
      }

      .main-content.with-sidebar {
        width: 100%;
      }
      
      .wefabTeam-layout {
        position: relative;
      }
      
      :host ::ng-deep {
        app-common-sidebar {
          position: relative;
          
          .sidebar-container {
            width: 100%;
            height: auto;
            transform: translateY(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: absolute;
            z-index: 1001;
            
            &.mobile-open {
              transform: translateY(0);
            }
          }
        }
      }
    }
  `]
})
export class WefabTeamLayoutComponent {
  constructor() { }

  // Sidebar menu items configuration
  sidebarMenuItems: any = [
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
} 