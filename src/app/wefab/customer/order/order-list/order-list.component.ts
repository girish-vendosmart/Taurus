import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonTableComponent, TableConfig, ActionButton, FilterOption } from '../../../../shared/components/common-table/common-table.component';

export interface OrderSummary {
  totalOrders: number;
  confirmedOrders: number;
  inProgressOrders: number;
  deliveredOrders: number;
}

export interface OrderData {
  orderId: string;
  quotationId: string;
  orderDate: string;
  deliveryDate: string;
  grandTotal: string;
  status: 'Confirmed' | 'In Progress' | 'Delivered' | 'Cancelled' | 'Pending';
  routerLink?: string;
}

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CommonTableComponent
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent implements OnInit {
  
  // Order Summary Data
  orderSummary: OrderSummary = {
    totalOrders: 6,
    confirmedOrders: 2,
    inProgressOrders: 2,
    deliveredOrders: 1
  };

  // Sample Order Data
  orderData: OrderData[] = [
    {
      orderId: 'ORD0000245',
      quotationId: 'QTN0000367',
      orderDate: '28 June 2025, 10:30 AM',
      deliveryDate: '15 August 2025, 02:00 PM',
      grandTotal: 'INR 65,000.00',
      status: 'Confirmed',
      routerLink: '/customer/order-details/ORD0000245'
    },
    {
      orderId: 'ORD0000246',
      quotationId: 'QTN0000369',
      orderDate: '27 June 2025, 03:20 PM',
      deliveryDate: '20 August 2025, 11:30 AM',
      grandTotal: 'INR 1,25,000.00',
      status: 'In Progress',
      routerLink: '/customer/order-details/ORD0000246'
    },
    {
      orderId: 'ORD0000247',
      quotationId: 'QTN0000373',
      orderDate: '26 June 2025, 09:15 AM',
      deliveryDate: '10 August 2025, 04:45 PM',
      grandTotal: 'INR 1,75,500.00',
      status: 'In Progress',
      routerLink: '/customer/order-details/ORD0000247'
    },
    {
      orderId: 'ORD0000248',
      quotationId: 'QTN0000355',
      orderDate: '25 June 2025, 02:40 PM',
      deliveryDate: '5 August 2025, 09:20 AM',
      grandTotal: 'INR 85,750.00',
      status: 'Delivered',
      routerLink: '/customer/order-details/ORD0000248'
    },
    {
      orderId: 'ORD0000249',
      quotationId: 'QTN0000358',
      orderDate: '24 June 2025, 11:55 AM',
      deliveryDate: '25 August 2025, 01:30 PM',
      grandTotal: 'INR 2,35,000.00',
      status: 'Confirmed',
      routerLink: '/customer/order-details/ORD0000249'
    },
    {
      orderId: 'ORD0000250',
      quotationId: 'QTN0000360',
      orderDate: '23 June 2025, 04:25 PM',
      deliveryDate: '18 July 2025, 12:15 PM',
      grandTotal: 'INR 45,200.00',
      status: 'Cancelled',
      routerLink: '/customer/order-details/ORD0000250'
    }
  ];

  // Status filter options
  statusOptions: FilterOption[] = [
    { label: 'All Status', value: null },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Pending', value: 'Pending' }
  ];

  // Table configuration
  tableConfig: TableConfig = {
    columns: [
      {
        field: 'orderId',
        header: 'Order Id',
        sortable: true,
        filterable: true,
        filterType: 'text',
        isLink: true,
        routerLinkField: 'routerLink',
        width: '15%'
      },
      {
        field: 'quotationId',
        header: 'Quotation Id',
        sortable: true,
        filterable: true,
        filterType: 'text',
        width: '15%'
      },
      {
        field: 'orderDate',
        header: 'Order Date',
        sortable: true,
        filterable: true,
        filterType: 'dateRange',
        width: '20%'
      },
      {
        field: 'deliveryDate',
        header: 'Delivery Date',
        sortable: true,
        filterable: true,
        filterType: 'dateRange',
        width: '20%'
      },
      {
        field: 'grandTotal',
        header: 'Grand Total',
        sortable: true,
        filterable: true,
        filterType: 'text',
        width: '15%'
      },
      {
        field: 'status',
        header: 'Status',
        sortable: true,
        filterable: true,
        filterType: 'dropdown',
        filterOptions: this.statusOptions,
        isStatus: true,
        width: '15%'
      }
    ],
    enableSearch: false,
    enableSort: true,
    enableFilter: true,
    enablePagination: true,
    pageSize: 10,
    showActions: false,
    enableColumnHide: false,
    enableColumnResize: false
  };

  loading = false;

  constructor() {}

  ngOnInit(): void {
    // No loading needed since we have static data
  }

  onRowClick(event: any): void {
    console.log('Row clicked:', event.rowData);
  }

  onLinkClick(event: { rowData: any, column: any, event: any }): void {
    console.log('Link clicked:', event.rowData);
    // Navigation will be handled automatically by the common-table component
  }

  onActionClick(event: { action: string, rowData: any }): void {
    console.log('Action clicked:', event.action, event.rowData);
  }
}
