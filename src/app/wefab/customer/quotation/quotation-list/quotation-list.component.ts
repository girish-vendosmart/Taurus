import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonTableComponent, TableConfig, ActionButton, FilterOption } from '../../../../shared/components/common-table/common-table.component';
import { CommonService } from '../../../../shared/services/common.service';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

export interface QuotationSummary {
  totalQuotations: number;
  openQuotations: number;
  submittedQuotations: number;
  expiredQuotations: number;
}

export interface QuotationData {
  name: string;
  quotation_name: string;
  customer_rfq_id: string;
  creation: string;
  validity: string;
  grand_total: number;
  status: string;
  currency_code: string;
  workflow_state: string;
}

@Component({
  selector: 'app-quotation-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CommonTableComponent,
    DateFormatPipe
  ],
  templateUrl: './quotation-list.component.html',
  styleUrl: './quotation-list.component.scss'
})
export class QuotationListComponent implements OnInit {
  quotationData: QuotationData[] = [];
  loading = false;

  quotationSummary = {
    totalQuotations: 0,
    openQuotations: 0,
    submittedQuotations: 0,
    expiredQuotations: 0
  };

  // Table configuration
  tableConfig: TableConfig = {
    columns: [
      {
        field: 'quotation_name',
        header: 'Quotation Id',
        sortable: true,
        filterable: true,
        filterType: 'text',
        isLink: true,
        routerLinkField: 'routerLink',
        width: '20%'
      },
      {
        field: 'customer_rfq_id',
        header: 'RFQ Id',
        sortable: true,
        filterable: true,
        filterType: 'text',
        width: '20%'
      },
      {
        field: 'formattedGrandTotal',
        header: 'Grand Total',
        sortable: true,
        filterable: true,
        filterType: 'text',
        width: '20%'
      },
      {
        field: 'creation',
        header: 'Creation Date',
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
        filterOptions: [
          { label: 'All Status', value: null },
          { label: 'Draft', value: 'Draft' },
          { label: 'Open', value: 'Open' },
          { label: 'Submitted', value: 'Submitted' },
          { label: 'Expired', value: 'Expired' }
        ],
        isStatus: true,
        width: '20%'
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
    this.getQuotationList();
  }

  getQuotationList() {
    this.loading = true;
    let apiEndpoint = '/api/resource/Wefab Quotation?fields=["*"]&filters=[["status","!=","Draft"]]';
    this.commonService.getData(apiEndpoint).subscribe({
      next: (res: any) => {
        this.quotationData = res.data.map((quotation: any) => ({
          companySubInfo: quotation.name,
          ...quotation,
          routerLink: `/wefab/customer/quotation-details/${quotation.name}`,
          formattedGrandTotal: `${quotation.currency_code} ${quotation.grand_total.toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          })}`
        }));
        this.updateQuotationSummary();
      },
      error: (error) => {
        console.error('Error fetching quotation list:', error);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  updateQuotationSummary() {
    const summary = {
      totalQuotations: this.quotationData.length,
      openQuotations: this.quotationData.filter(q => q.workflow_state === 'Open').length,
      submittedQuotations: this.quotationData.filter(q => q.workflow_state === 'Submitted').length,
      expiredQuotations: this.quotationData.filter(q => q.workflow_state === 'Expired').length
    };
    this.quotationSummary = summary;
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
