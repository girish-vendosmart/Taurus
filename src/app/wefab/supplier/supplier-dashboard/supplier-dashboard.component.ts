import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-supplier-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './supplier-dashboard.component.html',
  styleUrl: './supplier-dashboard.component.scss'
})
export class SupplierDashboardComponent {
  supplierName: string = '';
  
  constructor() {
    // Get supplier information from session storage
    this.supplierName = sessionStorage.getItem('supplier_name') || 'Supplier';
  }

  dashboardCards = [
    {
      title: 'Profile Status',
      value: 'Approved',
      icon: 'pi pi-check-circle',
      color: 'success',
      description: 'Your supplier profile has been approved'
    },
    {
      title: 'Active Projects',
      value: '0',
      icon: 'pi pi-briefcase',
      color: 'info',
      description: 'Currently active manufacturing projects'
    },
    {
      title: 'Pending Quotes',
      value: '0',
      icon: 'pi pi-clock',
      color: 'warning',
      description: 'Quotes awaiting your response'
    },
    {
      title: 'Total Orders',
      value: '0',
      icon: 'pi pi-shopping-cart',
      color: 'primary',
      description: 'Total orders completed'
    }
  ];

  recentActivities = [
    {
      title: 'Profile Approved',
      description: 'Your supplier profile has been successfully approved',
      timestamp: new Date(),
      type: 'success'
    },
    {
      title: 'Onboarding Complete',
      description: 'All onboarding stages have been completed',
      timestamp: new Date(),
      type: 'info'
    }
  ];
} 