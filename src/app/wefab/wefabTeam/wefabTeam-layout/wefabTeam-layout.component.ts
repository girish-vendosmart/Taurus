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
      <app-common-sidebar 
        [menuItems]="sidebarMenuItems"
        [visible]="true"
        [showHeader]="true"
        headerTitle="WE-FAB Team Portal"
        width="260px">
      </app-common-sidebar>
      <!-- Main content area -->
      <div class="main-content">
        <app-common-header
          [title]="''">
        </app-common-header>

        <!-- Router outlet for all content -->
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wefabTeam-layout {
      display: flex;
      min-height: 100vh;
      width: 100%;
    }

    .main-content {
      flex: 1;
      margin-left: 250px;
      background-color: #f5f6fa;
      min-height: 100vh;
    }

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

.supplier-layout {
  display: flex;
  min-height: 100vh;
  background-color: $technical-white;
  font-family: 'Inter', sans-serif;
  position: relative;
}

// Main content area
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  transition: $transition;

  &.with-sidebar {
    margin-left: $sidebar-width;
    width: calc(100% - #{$sidebar-width});
  }
}

// Content area
.content-area {
  flex: 1;
  padding: 0;
  background-color: $technical-white;
  overflow-x: hidden;

  &.with-header {
    // No padding needed as header is positioned within main-content
  }
}

// Override common-header positioning when used in this layout
:host ::ng-deep {
  app-common-header {
    .common-header {
      position: sticky;
      top: 0;
      z-index: 999;
      border-bottom: 1px solid rgba($material-silver, 0.3);
      width: 100%;
    }
  }
  
  // Ensure sidebar has proper z-index and positioning
  app-common-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1001;
    
    .sidebar-container {
      width: $sidebar-width;
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .main-content.with-sidebar {
    margin-left: 0;
    width: 100%;
  }
  
  .supplier-layout {
    position: relative;
  }
  
  :host ::ng-deep {
    app-common-sidebar {
      .sidebar-container {
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        
        &.mobile-open {
          transform: translateX(0);
        }
      }
    }
  }
}

  `]
})
export class WefabTeamLayoutComponent {
  constructor() {}

  // Sidebar menu items configuration
  sidebarMenuItems:any = [
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