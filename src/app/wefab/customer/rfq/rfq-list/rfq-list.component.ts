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
    console.log('Fetching RFQ list...');
    
    // Try using wefab-specific API first
    let apiEndpoint = '/api/resource/Customer Request for Quotation?fields=["*"]';
    
    this.commonService.getWefabData(apiEndpoint).subscribe({
      next: (res: any) => {
        console.log('API Response:', res);
        console.log('Response data:', res.data);
        
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          this.rfqData = res.data.map((rfq: any) => ({
            ...rfq,
            // Keep original RFQ name and add ID as sub-info
            companySubInfo: rfq.name, // RFQ ID as subtitle
            routerLink: `/wefab/customer/rfq-details/${rfq.name}`
          }));
          console.log('Processed RFQ data:', this.rfqData);
        } else {
          console.warn('No data received from API, using mock data for testing');
          this.loadMockData();
        }
        
        this.updateRFQSummary();
      },
      error: (error) => {
        console.error('Error fetching RFQ list:', error);
        // Fallback to regular getData method
        console.log('Trying fallback API...');
        this.fallbackGetRFQList();
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  fallbackGetRFQList() {
    let apiEndpoint = '/api/resource/Customer Request for Quotation?fields=["*"]';
    this.commonService.getData(apiEndpoint).subscribe({
      next: (res: any) => {
        console.log('Fallback API Response:', res);
        console.log('Fallback Response data:', res.data);
        
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          this.rfqData = res.data.map((rfq: any) => ({
            ...rfq,
            // Keep original RFQ name and add ID as sub-info
            companySubInfo: rfq.name, // RFQ ID as subtitle
            routerLink: `/wefab/customer/rfq-details/${rfq.name}`
          }));
          console.log('Processed RFQ data (fallback):', this.rfqData);
        } else {
          console.warn('Fallback API also returned no data, using mock data for testing');
          this.loadMockData();
        }
        
        this.updateRFQSummary();
      },
      error: (error) => {
        console.error('Fallback API also failed:', error);
        console.log('Loading mock data due to API failure');
        this.loadMockData();
        this.updateRFQSummary();
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  loadMockData() {
    // Mock data for testing
    this.rfqData = [
      {
        name: 'RFQ0000143',
        customer_rfq_name: 'Railway Rolling Stock Parts',
        creation: '2025-06-28 19:22:00',
        status: 'Open',
        workflow_state: 'Quoted',
        customer_name: 'ABC Railways Ltd',
        priority: 'High',
        project_type: 'Manufacturing',
        expiry_date: '2025-07-28',
        companySubInfo: 'RFQ0000143',
        routerLink: '/wefab/customer/rfq-details/RFQ0000143'
      },
      {
        name: 'RFQ0000144',
        customer_rfq_name: 'Defense Equipment Manufacturing',
        creation: '2025-06-28 15:28:00',
        status: 'Open',
        workflow_state: 'Quoted',
        customer_name: 'Defense Corp',
        priority: 'Critical',
        project_type: 'Defense',
        expiry_date: '2025-08-15',
        companySubInfo: 'RFQ0000144',
        routerLink: '/wefab/customer/rfq-details/RFQ0000144'
      }
    ] as any[];
    console.log('Mock data loaded:', this.rfqData);
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

  createRFQ(): void {
    // Navigate to create RFQ page
    this.router.navigate(['/wefab/customer/create-rfq']);
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
