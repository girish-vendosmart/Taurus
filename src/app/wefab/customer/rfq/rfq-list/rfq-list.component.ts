import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonTableComponent, TableConfig, ActionButton, FilterOption } from '../../../../shared/components/common-table/common-table.component';

export interface RFQSummary {
  totalRfqs: number;
  openRfqs: number;
  quotedRfqs: number;
  expiredRfqs: number;
}

export interface RFQData {
  rfqName: string;
  rfqId: string;
  creationDate: string;
  status: 'Open' | 'Quoted' | 'Expired' | 'Draft' | 'Under Review';
  routerLink?: string;
}

@Component({
  selector: 'app-rfq-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CommonTableComponent
  ],
  templateUrl: './rfq-list.component.html',
  styleUrl: './rfq-list.component.scss'
})
export class RfqListComponent implements OnInit {
  
  // RFQ Summary Data
  rfqSummary: RFQSummary = {
    totalRfqs: 8,
    openRfqs: 3,
    quotedRfqs: 2,
    expiredRfqs: 1
  };

  // Sample RFQ Data with 8 entries
  rfqData: RFQData[] = [
    {
      rfqName: 'Tool & Die Manufacturing Project',
      rfqId: 'RFQ0000136',
      creationDate: '26 June 2025, 12:10 PM',
      status: 'Quoted',
      routerLink: '/wefab/customer/rfq-details/RFQ0000136'
    },
    {
      rfqName: 'Precision CNC Machining Components',
      rfqId: 'RFQ0000137',
      creationDate: '25 June 2025, 09:30 AM',
      status: 'Open',
      routerLink: '/wefab/customer/rfq-details/RFQ0000137'
    },
    {
      rfqName: 'Automotive Parts Manufacturing',
      rfqId: 'RFQ0000138',
      creationDate: '24 June 2025, 02:15 PM',
      status: 'Under Review',
      routerLink: '/wefab/customer/rfq-details/RFQ0000138'
    },
    {
      rfqName: 'Electronic Enclosure Fabrication',
      rfqId: 'RFQ0000139',
      creationDate: '23 June 2025, 11:45 AM',
      status: 'Open',
      routerLink: '/wefab/customer/rfq-details/RFQ0000139'
    },
    {
      rfqName: 'Industrial Valve Components',
      rfqId: 'RFQ0000140',
      creationDate: '22 June 2025, 04:20 PM',
      status: 'Quoted',
      routerLink: '/wefab/customer/rfq-details/RFQ0000140'
    },
    {
      rfqName: 'Medical Device Parts',
      rfqId: 'RFQ0000141',
      creationDate: '21 June 2025, 10:30 AM',
      status: 'Expired',
      routerLink: '/wefab/customer/rfq-details/RFQ0000141'
    },
    {
      rfqName: 'Aerospace Component Manufacturing',
      rfqId: 'RFQ0000142',
      creationDate: '20 June 2025, 01:45 PM',
      status: 'Open',
      routerLink: '/wefab/customer/rfq-details/RFQ0000142'
    },
    {
      rfqName: 'Custom Fixture Design & Build',
      rfqId: 'RFQ0000143',
      creationDate: '19 June 2025, 03:20 PM',
      status: 'Draft',
      routerLink: '/wefab/customer/rfq-details/RFQ0000143'
    }
  ];

  // Status filter options
  statusOptions: FilterOption[] = [
    { label: 'All Status', value: null },
    { label: 'Open', value: 'Open' },
    { label: 'Quoted', value: 'Quoted' },
    { label: 'Expired', value: 'Expired' },
    { label: 'Draft', value: 'Draft' },
    { label: 'Under Review', value: 'Under Review' }
  ];

  // Table configuration
  tableConfig: TableConfig = {
    columns: [
      {
        field: 'rfqName',
        header: 'RFQ Name',
        sortable: true,
        filterable: true,
        filterType: 'text',
        isLink: true,
        routerLinkField: 'routerLink',
        width: '40%'
      },
      {
        field: 'creationDate',
        header: 'Creation Date',
        sortable: true,
        filterable: true,
        filterType: 'dateRange',
        width: '30%'
      },
      {
        field: 'status',
        header: 'Status',
        sortable: true,
        filterable: true,
        filterType: 'dropdown',
        filterOptions: this.statusOptions,
        isStatus: true,
        width: '30%'
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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // No loading needed since we have static data
  }

  onRowClick(event: any): void {
    console.log('Row clicked:', event.rowData);
    // Navigate to RFQ details when row is clicked
    if (event.rowData.routerLink) {
      this.router.navigate([event.rowData.routerLink]);
    }
  }

  onLinkClick(event: { rowData: any, column: any, event: any }): void {
    console.log('Link clicked:', event.rowData);
    // Navigation is now handled automatically by the routerLink directive in the template
  }

  onActionClick(event: { action: string, rowData: any }): void {
    console.log('Action clicked:', event.action, event.rowData);
  }
}
