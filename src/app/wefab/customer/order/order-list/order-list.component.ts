import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonTableComponent, TableConfig, ActionButton, FilterOption } from '../../../../shared/components/common-table/common-table.component';
import { CommonService } from '../../../../shared/services/common.service';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

export interface OrderSummary {
  totalOrders: number;
  confirmedOrders: number;
  inProgressOrders: number;
  deliveredOrders: number;
}

export interface OrderData {
  name: string;
  quotation_name: string;
  creation: string;
  delivery_date: string;
  grand_total: number;
  status: string;
  currency_code: string;
  workflow_state: string;
}

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CommonTableComponent,
    DateFormatPipe
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent implements OnInit {
  orderData: OrderData[] = [];
  loading = false;

  orderSummary = {
    totalOrders: 0,
    confirmedOrders: 0,
    inProgressOrders: 0,
    deliveredOrders: 0
  };

  // Table configuration
  tableConfig: TableConfig = {
    columns: [
      {
        field: 'po_name',
        header: 'Order Id',
        sortable: true,
        filterable: true,
        filterType: 'text',
        isLink: true,
        routerLinkField: 'routerLink',
        width: '15%'
      },
      {
        field: 'wefab_quotation',
        header: 'Quotation Id',
        sortable: true,
        filterable: true,
        filterType: 'text',
        width: '15%'
      },
      {
        field: 'creation',
        header: 'Order Date',
        sortable: true,
        filterable: true,
        filterType: 'dateRange',
        width: '20%'
      },
      {
        field: 'requested_delivery_date',
        header: 'Delivery Date',
        sortable: true,
        filterable: true,
        filterType: 'dateRange',
        width: '20%'
      },
      {
        field: 'formattedGrandTotal',
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
        filterOptions: [
          { label: 'All Status', value: null },
          { label: 'Draft', value: 'Draft' },
          { label: 'Confirmed', value: 'Confirmed' },
          { label: 'In Progress', value: 'In Progress' },
          { label: 'Delivered', value: 'Delivered' },
          { label: 'Cancelled', value: 'Cancelled' }
        ],
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

  constructor(private router: Router, private commonService: CommonService) {}

  ngOnInit(): void {
    this.getOrderCount();
    this.getOrderList();
  } 

  getOrderCount() {

    let apiEndpoint = '/api/method/frappe.desk.query_report.run?report_name=Customer Purchase Order Status Distribution Report';
    this.commonService.getWefabData(apiEndpoint).subscribe({
      next: (res: any) => {
        this.orderSummary.totalOrders = res.message.result[0].count;
        this.orderSummary.confirmedOrders = res.message.result[4].count;
        this.orderSummary.inProgressOrders = res.message.result[6].count;
        this.orderSummary.deliveredOrders = res.message.result[9].count;
      }
    });
  }

  getOrderList() {
    this.loading = true;
    let apiEndpoint = '/api/resource/Customer Purchase Order?fields=["*"]';
    this.commonService.getData(apiEndpoint).subscribe({ 
      next: (res: any) => {
        this.orderData = res.data.map((order: any) => ({
          companySubInfo: order.name || '----',
          ...order,
          routerLink: `/wefab/customer/order-details/${order.name}`,
          formattedGrandTotal: `${order.currency_code} ${order.grand_total.toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          })}`
        }));
        this.updateOrderSummary();
      },
      error: (error) => {
        console.error('Error fetching order list:', error);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  updateOrderSummary() {
    const summary = {
      totalOrders: this.orderData.length,
      confirmedOrders: this.orderData.filter(o => o.workflow_state === 'Confirmed').length,
      inProgressOrders: this.orderData.filter(o => o.workflow_state === 'In Progress').length,
      deliveredOrders: this.orderData.filter(o => o.workflow_state === 'Delivered').length
    };
    this.orderSummary = summary;
  }

  onRowClick(event: any): void {
    if (event.rowData.routerLink) {
      this.router.navigate([event.rowData.routerLink]);
    }
  }

  onLinkClick(event: { rowData: any, column: any, event: any }): void {
    // Navigation handled by routerLink
  }

  onActionClick(event: { action: string, rowData: any }): void {
    console.log('Action clicked:', event.action, event.rowData);
  }
}
