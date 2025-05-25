import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CommonSidebarComponent, SidebarMenuItem } from '../../common-core-component/common-sidebar/common-sidebar.component';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  status: string;
  quantity: number;
}


@Component({
  selector: 'app-test-components',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, FormsModule, CommonSidebarComponent],
  templateUrl: './test-components.component.html',
  styleUrl: './test-components.component.scss'
})
export class TestComponentsComponent {

  products: Product[] = [];
  globalFilterValue: string = '';

  // Sidebar configuration
  sidebarMenuItems: SidebarMenuItem[] = 
  [
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
        }
      ]
    },
    {
      icon: 'pi pi-question-circle',
      name: 'Help & Support',
      route: '/help'
    }
  ];

  ngOnInit() {
    this.products = [
      {
        id: 1,
        name: 'Laptop',
        price: 1200,
        category: 'Electronics',
        status: 'In Stock',
        quantity: 25
      },
      {
        id: 2,
        name: 'Smartphone',
        price: 850,
        category: 'Electronics',
        status: 'Low Stock',
        quantity: 8
      },
      {
        id: 3,
        name: 'Desk Chair',
        price: 150,
        category: 'Furniture',
        status: 'In Stock',
        quantity: 42
      },
      {
        id: 4,
        name: 'Coffee Maker',
        price: 80,
        category: 'Kitchen',
        status: 'Out of Stock',
        quantity: 0
      },
      {
        id: 5,
        name: 'Headphones',
        price: 120,
        category: 'Electronics',
        status: 'In Stock',
        quantity: 30
      }
    ];
  }

  clear(table: any) {
    table.clear();
    this.globalFilterValue = '';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'In Stock':
        return 'badge bg-success';
      case 'Low Stock':
        return 'badge bg-warning text-dark';
      case 'Out of Stock':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

}
