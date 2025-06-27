import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonTableComponent, TableConfig, ActionButton, FilterOption } from '../../../../shared/components/common-table/common-table.component';
import { CommonService } from '../../../../shared/services/common.service';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

export interface RFQSummary {
  totalRfqs: number;
  openRfqs: number;
  quotedRfqs: number;
  expiredRfqs: number;
}

export interface RFQData {
  name: string;
  customer_rfq_name: string;
  creation: string;
  status: string;
  workflow_state: string;
  customer_name: string;
  priority: string;
  project_type: string;
  expiry_date: string;
}

@Component({
  selector: 'app-rfq-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CommonTableComponent,
    DateFormatPipe
  ],
  templateUrl: './rfq-list.component.html',
  styleUrl: './rfq-list.component.scss'
})
export class RfqListComponent implements OnInit {
  rfqData: RFQData[] = [];
  loading = false;

  rfqSummary = {
    totalRfqs: 0,
    openRfqs: 0,
    quotedRfqs: 0,
    expiredRfqs: 0
  };

  // Table configuration
  tableConfig: TableConfig = {
    columns: [
      {
        field: 'customer_rfq_name',
        header: 'RFQ Name',
        sortable: true,
        filterable: true,
        filterType: 'text',
        isLink: true,
        routerLinkField: 'routerLink',
        width: '25%'
      },
      {
        field: 'customer_name',
        header: 'Customer',
        sortable: true,
        filterable: true,
        filterType: 'text',
        width: '25%'
      },
      {
        field: 'creation',
        header: 'Creation Date',
        sortable: true,
        filterable: true,
        filterType: 'dateRange',
        width: '25%'
      },
      {
        field: 'workflow_state',
        header: 'Status',
        sortable: true,
        filterable: true,
        filterType: 'dropdown',
        filterOptions: [
          { label: 'All Status', value: null },
          { label: 'Draft', value: 'Draft' },
          { label: 'Under Review', value: 'Under Review' },
          { label: 'Quoted', value: 'Quoted' },
          { label: 'Expired', value: 'Expired' }
        ],
        isStatus: true,
        width: '25%'
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
    this.getRFQList();
  }

  getRFQList() {
    this.loading = true;
    let apiEndpoint = '/api/resource/Customer Request for Quotation?fields=["*"]';
    this.commonService.getData(apiEndpoint).subscribe({
      next: (res: any) => {
        this.rfqData = res.data.map((rfq: any) => ({
          ...rfq,
          routerLink: `/wefab/customer/rfq-details/${rfq.name}`
        }));
        this.updateRFQSummary();
      },
      error: (error) => {
        console.error('Error fetching RFQ list:', error);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  updateRFQSummary() {
    const summary = {
      totalRfqs: this.rfqData.length,
      openRfqs: this.rfqData.filter(rfq => rfq.workflow_state === 'Open').length,
      quotedRfqs: this.rfqData.filter(rfq => rfq.workflow_state === 'Quoted').length,
      expiredRfqs: this.rfqData.filter(rfq => rfq.workflow_state === 'Expired').length
    };
    this.rfqSummary = summary;
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
