import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonTableComponent, TableConfig, ActionButton } from '../../../../shared/components/common-table/common-table.component';
import { CommonService } from '../../../../shared/services/common.service';
import { SweetAlertService } from '../../../../shared/services/sweet-alert.service';
import { CommonCardComponent } from '../../../../shared/components/common-card/common-card.component';

export interface OrderItem {
  orderId: string;
  orderName: string;
  creationDate: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled' | 'Draft';
  // Additional fields from API
  name?: string;
  owner?: string;
  modified?: string;
  docstatus?: number;
  routerLink?: string;
  companySubInfo?: string;
  deliveryDate?: string;
  totalAmount?: number;
}

@Component({
  selector: 'app-supplier-order',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CommonTableComponent,
    CommonCardComponent
  ],
  templateUrl: './supplier-order.component.html',
  styleUrl: './supplier-order.component.scss'
})
export class SupplierOrderComponent implements OnInit {
  supplierId: string = '';

  constructor(private router: Router, private commonService: CommonService, private sweetAlertService: SweetAlertService) { }
  
  // Consolidated Order data
  allOrders: OrderItem[] = [];

  dashboardCards = [
    {
      title: 'Total Orders',
      value: '0',
      icon: 'pi pi-shopping-cart',
      color: 'secondary',
      description: '',
    },
    {
      title: 'Open Orders',
      value: '0',
      icon: 'pi pi-file-o',
      color: 'info',
      description: '',
    },
    {
      title: 'In Progress Orders',
      value: '0',
      icon: 'pi pi-clock',
      color: 'warning',
      description: '',
    },
    {
      title: 'Completed Orders',
      value: '0',
      icon: 'pi pi-check-circle',
      color: 'success',
      description: '',
    }
  ];
  
  // Status counts for cards
  openOrdersCount = 0;
  inProgressOrdersCount = 0;
  completedOrdersCount = 0;
  cancelledOrdersCount = 0;
  draftOrdersCount = 0;
  
  // Trend data for cards
  openOrdersTrend = { value: 0, isPositive: true, period: 'from last week' };
  inProgressOrdersTrend = { value: 0, isPositive: true, period: 'from last week' };
  completedOrdersTrend = { value: 0, isPositive: true, period: 'from last week' };
  cancelledOrdersTrend = { value: 0, isPositive: false, period: 'from last week' };
  
  // Table configuration
  tableConfig: any = {
    columns: [
      {
        field: 'orderName',
        header: 'Order Name',
        sortable: true,
        filterable: true,
        filterType: 'text',
        isLink: true,
      },
      {
        field: 'creationDate',
        header: 'Creation Date',
        sortable: true,
        filterable: true,
        filterType: 'dateRange',
      },
      {
        field: 'deliveryDate',
        header: 'Delivery Date',
        sortable: true,
        filterable: true,
        filterType: 'dateRange',
      },
      {
        field: 'totalAmount',
        header: 'Total Amount',
        sortable: true,
        filterable: true,
        filterType: 'text',
      },
      {
        field: 'status',
        header: 'Status',
        sortable: true,
        filterable: true,
        filterType: 'text',
        isStatus: true,
        filterOptions: [] // Will be populated dynamically
      },
    ],
    enableSearch: true,
    enableSort: true,
    enableFilter: true,
    enablePagination: true,
    enableColumnHide: false,
    enableColumnResize: true,
    pageSize: 10,
  };
  
  // Loading states
  loading = false;

  ngOnInit() {
    this.supplierId = localStorage.getItem('supplier_id') || '';
    this.getSupplierCount()
    this.getOrderList();
  }

  getSupplierCount() {
    // This will be updated with actual API endpoint when available
    let endPoint = `/api/method/wefab.wefab.api.supplier.dashboard.order_dashboard.get_order_summary_stats?supplier_company_id=${this.supplierId}`
    this.commonService.getWefabData(endPoint).subscribe({
      next: (res: any) => {
        console.log('Order Summary Stats:', res.message);
        if (res.message) {
          this.updateDashboardCardsFromAPI(res.message.data);
        }
      },
      error: (error) => {
        console.error('Error fetching Order summary stats:', error);
        // Set sample data for now
        this.loadSampleData();
      }
    })
  }

  // Update dashboard cards with API data
  updateDashboardCardsFromAPI(apiData: any) {
    // Map API response to dashboard cards
    this.dashboardCards[0].value = (apiData['overview']['total_orders_all_time'] || 0).toString();
    this.dashboardCards[1].value = (apiData['status_breakdown']['Open'] || 0).toString();
    this.dashboardCards[2].value = (apiData['status_breakdown']['In Progress'] || 0).toString();
    this.dashboardCards[3].value = (apiData['status_breakdown']['Completed'] || 0).toString();

    console.log('Updated dashboard cards:', this.dashboardCards);
  }

  getOrderList() {
    this.loading = true;
    // This will be updated with actual API endpoint when available
    let endpoint = `/api/resource/Purchase Order?fields=["*"]&filters=[["po_status", "not in", ["Draft", "Approval"]],["supplier_id", "=", "${this.supplierId}"]]`
    
    this.commonService.getWefabData(endpoint).subscribe({
      next: (res: any) => {
        console.log(res.data);
        // Transform API data to match OrderItem interface
        this.allOrders = this.transformApiDataToOrderItems(res.data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching Order data:', error);
        this.loading = false;
        // Fallback to sample data if API fails
        this.loadSampleData();
      }
    });
  }

  // Load sample data for demonstration
  loadSampleData() {
    this.allOrders = [
      {
        orderId: 'ORD0000001',
        orderName: 'Precision Components Order',
        creationDate: '2025-01-15',
        deliveryDate: '2025-02-15',
        totalAmount: 15000.00,
        status: 'In Progress',
        name: 'ORD0000001',
        owner: 'supplier@example.com',
        modified: '2025-01-15 10:30:00',
        docstatus: 1,
        routerLink: '/wefab/supplier/order/details/ORD0000001'
      },
      {
        orderId: 'ORD0000002',
        orderName: 'Industrial Parts Manufacturing',
        creationDate: '2025-01-10',
        deliveryDate: '2025-01-30',
        totalAmount: 25000.00,
        status: 'Open',
        name: 'ORD0000002',
        owner: 'supplier@example.com',
        modified: '2025-01-10 14:15:00',
        docstatus: 1,
        routerLink: '/wefab/supplier/order/details/ORD0000002'
      },
      {
        orderId: 'ORD0000003',
        orderName: 'Custom Machined Parts',
        creationDate: '2025-01-05',
        deliveryDate: '2025-01-25',
        totalAmount: 8500.00,
        status: 'Completed',
        name: 'ORD0000003',
        owner: 'supplier@example.com',
        modified: '2025-01-25 16:45:00',
        docstatus: 1,
        routerLink: '/wefab/supplier/order/details/ORD0000003'
      }
    ];

    // Update dashboard cards with sample data
    this.dashboardCards[0].value = this.allOrders.length.toString();
    this.dashboardCards[1].value = this.allOrders.filter(o => o.status === 'Open').length.toString();
    this.dashboardCards[2].value = this.allOrders.filter(o => o.status === 'In Progress').length.toString();
    this.dashboardCards[3].value = this.allOrders.filter(o => o.status === 'Completed').length.toString();

    this.updateFilterOptions();
  }

  // Transform API data to match OrderItem interface
  private transformApiDataToOrderItems(apiData: any[]): any[] {
    if (!apiData || !Array.isArray(apiData)) {
      return [];
    }

    return apiData.map(item => ({
      orderId: item.name || item.order_id || '',
      orderName: item.order_name || item.title || item.name || 'N/A',
      creationDate: this.formatApiDate(item.creation || item.created_date || ''),
      deliveryDate: this.formatApiDate(item.actual_delivery_date || item.expected_delivery || ''),
      totalAmount: item.total_amount || item.grand_total || 0,
      status: this.mapApiStatusToOrderStatus(item.po_status || 'Draft'),
      name: item.name || '',
      owner: item.owner || '',
      modified: item.modified || '',
      docstatus: item.docstatus || 0,
              routerLink: `/wefab/supplier/order/details/${item.name}`,
      companySubInfo: item.company || ''
    }));
  }

  onOrderIdLinkClick(orderId: string, status: string = '') {
    console.log('Order ID clicked:', orderId, 'Status:', status);
    
    // Navigate to order details
    this.router.navigate(['/wefab/supplier/order/details', orderId]);
  }

  private formatApiDate(apiDate: string): string {
    if (!apiDate) return '';
    
    try {
      // Handle different date formats that might come from API
      let date: Date;
      
      if (apiDate.includes('T')) {
        // ISO format: 2025-01-15T10:30:00
        date = new Date(apiDate);
      } else if (apiDate.includes(' ')) {
        // Format: 2025-01-15 10:30:00
        date = new Date(apiDate.replace(' ', 'T'));
      } else {
        // Just date: 2025-01-15
        date = new Date(apiDate);
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date format:', apiDate);
        return apiDate; // Return original if can't parse
      }
      
      // Return in YYYY-MM-DD format for consistency
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', apiDate, error);
      return apiDate; // Return original if error
    }
  }

  private mapApiStatusToOrderStatus(apiStatus: string): 'Open' | 'In Progress' | 'Completed' | 'Cancelled' | 'Draft' | 'Supplier Confirmation' | 'Finishing' | 'Preparation' | 'Work In Progress' | 'Quality Inspection' | 'Dispatch' | 'Order Completed' {
    const statusMap: { [key: string]: 'Open' | 'In Progress' | 'Completed' | 'Cancelled' | 'Draft' | 'Supplier Confirmation' | 'Finishing' | 'Preparation' | 'Work In Progress' | 'Quality Inspection' | 'Dispatch' | 'Order Completed' } = {
      'Open': 'Open',
      'Pending': 'Open',
      'In Progress': 'In Progress',
      'Processing': 'In Progress',
      'Completed': 'Completed',
      'Delivered': 'Completed',
      'Cancelled': 'Cancelled',
      'Canceled': 'Cancelled',
      'Draft': 'Draft',
      'Not Started': 'Open',
      'Supplier Confirmation': 'Supplier Confirmation',
      'Finishing': 'Finishing',
      'Preparation': 'Preparation',
      'Work In Progress': 'Work In Progress',
      'Quality Inspection': 'Quality Inspection',
      'Dispatch': 'Dispatch',
      'Order Completed': 'Order Completed',
    };
    
    return statusMap[apiStatus] || 'Draft';
  }

  calculateStatusCounts() {
    this.openOrdersCount = this.allOrders.filter(order => order.status === 'Open').length;
    this.inProgressOrdersCount = this.allOrders.filter(order => order.status === 'In Progress').length;
    this.completedOrdersCount = this.allOrders.filter(order => order.status === 'Completed').length;
    this.cancelledOrdersCount = this.allOrders.filter(order => order.status === 'Cancelled').length;
    this.draftOrdersCount = this.allOrders.filter(order => order.status === 'Draft').length;
    
    this.updateDashboardCards();
  }

  updateDashboardCards() {
    this.dashboardCards[0].value = this.allOrders.length.toString();
    this.dashboardCards[1].value = this.openOrdersCount.toString();
    this.dashboardCards[2].value = this.inProgressOrdersCount.toString();
    this.dashboardCards[3].value = this.completedOrdersCount.toString();
  }

  updateFilterOptions() {
    const statusOptions = Array.from(new Set(this.allOrders.map(order => order.status)));
    const statusColumn = this.tableConfig.columns.find((col: any) => col.field === 'status');
    if (statusColumn) {
      statusColumn.filterOptions = statusOptions.map((status: string) => ({ label: status, value: status }));
    }
  }

  onRowClick(event: { event: Event, rowData: OrderItem }) {
    console.log('Row clicked:', event.rowData);
  }

  onLinkClick(event: any) {
    console.log('Link clicked:', event);
    if (event.column.field === 'orderName') {
      this.onOrderIdLinkClick(event.rowData.orderId, event.rowData.status);
    }
  }

  onActionClick(event: { action: string, rowData: OrderItem }) {
    console.log('Action clicked:', event.action, event.rowData);
    
    switch (event.action) {
      case 'view':
        this.onViewOrder(event.rowData);
        break;
      case 'edit':
        this.onEditOrder(event.rowData);
        break;
      case 'download':
        this.downloadOrderDocuments(event.rowData);
        break;
      case 'track':
        this.trackOrder(event.rowData);
        break;
      default:
        console.log('Unknown action:', event.action);
    }
  }

  onViewOrder(order: OrderItem) {
    console.log('Viewing order:', order);
    this.router.navigate(['/wefab/supplier/order/details', order.orderId]);
  }

  onEditOrder(order: OrderItem) {
    console.log('Editing order:', order);
    // Navigate to edit order if needed
    // this.router.navigate(['/supplier/order/edit', order.orderId]);
  }

  downloadOrderDocuments(order: OrderItem) {
    console.log('Downloading documents for order:', order);
    // Implement download functionality
  }

  trackOrder(order: OrderItem) {
    console.log('Tracking order:', order);
    // Navigate to order tracking page
    this.router.navigate(['/wefab/supplier/order/track', order.orderId]);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }
} 