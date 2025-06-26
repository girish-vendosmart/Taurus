import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonTableComponent, TableConfig, ActionButton, FilterOption } from '../../../../shared/components/common-table/common-table.component';

export interface QuotationSummary {
  totalQuotations: number;
  submittedQuotations: number;
  draftQuotations: number;
}

export interface QuotationData {
  quotationId: string;
  rfqId: string;
  grandTotal: string;
  submittedDate: string;
  validity: string;
  status: 'Submitted' | 'Draft' | 'Expired' | 'Under Review';
  routerLink?: string;
}

@Component({
  selector: 'app-quotation-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CommonTableComponent
  ],
  templateUrl: './quotation-list.component.html',
  styleUrl: './quotation-list.component.scss'
})
export class QuotationListComponent implements OnInit {
  
  // Quotation Summary Data
  quotationSummary: QuotationSummary = {
    totalQuotations: 8,
    submittedQuotations: 3,
    draftQuotations: 3
  };

  // Sample Quotation Data
  quotationData: QuotationData[] = [
    {
      quotationId: 'QTN0000367',
      rfqId: 'RFQ0000136',
      grandTotal: 'INR 65,000.00',
      submittedDate: '26 June 2025, 12:11 PM',
      validity: '5 August 2025, 5:30 AM',
      status: 'Submitted',
      routerLink: '/customer/quotation-details/QTN0000367'
    },
    {
      quotationId: 'QTN0000368',
      rfqId: 'RFQ0000137',
      grandTotal: 'INR 85,500.00',
      submittedDate: '25 June 2025, 03:45 PM',
      validity: '10 August 2025, 11:30 AM',
      status: 'Draft',
      routerLink: '/customer/quotation-details/QTN0000368'
    },
    {
      quotationId: 'QTN0000369',
      rfqId: 'RFQ0000138',
      grandTotal: 'INR 1,25,000.00',
      submittedDate: '24 June 2025, 09:20 AM',
      validity: '15 August 2025, 02:15 PM',
      status: 'Submitted',
      routerLink: '/customer/quotation-details/QTN0000369'
    },
    {
      quotationId: 'QTN0000370',
      rfqId: 'RFQ0000139',
      grandTotal: 'INR 45,750.00',
      submittedDate: '23 June 2025, 11:30 AM',
      validity: '20 July 2025, 06:00 PM',
      status: 'Expired',
      routerLink: '/customer/quotation-details/QTN0000370'
    },
    {
      quotationId: 'QTN0000371',
      rfqId: 'RFQ0000140',
      grandTotal: 'INR 2,15,000.00',
      submittedDate: '22 June 2025, 02:15 PM',
      validity: '25 August 2025, 09:45 AM',
      status: 'Under Review',
      routerLink: '/customer/quotation-details/QTN0000371'
    },
    {
      quotationId: 'QTN0000372',
      rfqId: 'RFQ0000141',
      grandTotal: 'INR 95,200.00',
      submittedDate: '21 June 2025, 04:50 PM',
      validity: '30 August 2025, 12:30 PM',
      status: 'Draft',
      routerLink: '/customer/quotation-details/QTN0000372'
    },
    {
      quotationId: 'QTN0000373',
      rfqId: 'RFQ0000142',
      grandTotal: 'INR 1,75,500.00',
      submittedDate: '20 June 2025, 10:25 AM',
      validity: '5 September 2025, 04:20 PM',
      status: 'Submitted',
      routerLink: '/customer/quotation-details/QTN0000373'
    },
    {
      quotationId: 'QTN0000374',
      rfqId: 'RFQ0000143',
      grandTotal: 'INR 55,800.00',
      submittedDate: '19 June 2025, 01:40 PM',
      validity: '10 September 2025, 08:15 AM',
      status: 'Draft',
      routerLink: '/customer/quotation-details/QTN0000374'
    }
  ];

  // Status filter options
  statusOptions: FilterOption[] = [
    { label: 'All Status', value: null },
    { label: 'Submitted', value: 'Submitted' },
    { label: 'Draft', value: 'Draft' },
    { label: 'Expired', value: 'Expired' },
    { label: 'Under Review', value: 'Under Review' }
  ];

  // Table configuration
  tableConfig: TableConfig = {
    columns: [
      {
        field: 'quotationId',
        header: 'Quotation Id',
        sortable: true,
        filterable: true,
        filterType: 'text',
        isLink: true,
        routerLinkField: 'routerLink',
        width: '15%'
      },
      {
        field: 'rfqId',
        header: 'RFQ Id',
        sortable: true,
        filterable: true,
        filterType: 'text',
        width: '15%'
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
        field: 'submittedDate',
        header: 'Submitted Date',
        sortable: true,
        filterable: true,
        filterType: 'dateRange',
        width: '20%'
      },
      {
        field: 'validity',
        header: 'Validity',
        sortable: true,
        filterable: true,
        filterType: 'dateRange',
        width: '20%'
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
