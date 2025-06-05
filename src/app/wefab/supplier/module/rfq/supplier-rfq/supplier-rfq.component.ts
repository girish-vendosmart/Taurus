import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonTableComponent, TableConfig, ActionButton } from '../../../../../shared/components/common-table/common-table.component';
import { CommonService } from '../../../../../shared/services/common.service';
import { SweetAlertService } from '../../../../../shared/services/sweet-alert.service';

export interface RFQItem {
  rfqId: string;
  rfqName: string;
  creationDate: string;
  status: 'Open' | 'In Progress' | 'Closed' | 'Draft';
  // Additional fields from API
  name?: string;
  owner?: string;
  modified?: string;
  docstatus?: number;
  routerLink?: string;
  companySubInfo?: string;
}

@Component({
  selector: 'app-supplier-rfq',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CommonTableComponent,
  ],
  templateUrl: './supplier-rfq.component.html',
  styleUrl: './supplier-rfq.component.scss'
})
export class SupplierRfqComponent implements OnInit {
  supplierId: string = '';

  constructor(private router: Router, private commonService: CommonService, private sweetAlertService: SweetAlertService) { }
  
  // Consolidated RFQ data
  allRFQs: RFQItem[] = [];

  dashboardCards = [
    {
      title: 'Total RFQs',
      value: '0',
      icon: 'pi pi-file-edit',
      color: 'secondary',
      description: '',
    },
    {
      title: 'Open RFQs',
      value: '0',
      icon: 'pi pi-file-o',
      color: 'info',
      description: '',
    },
    {
      title: 'Quouted RFQ',
      value: '0',
      icon: 'pi pi-check-circle',
      color: 'success',
      description: '',
    },
    {
      title: 'Expired RFQs',
      value: '0',
      icon: 'pi pi-lock',
      color: 'danger',
      description: '',
    }
  ];
  
  // Status counts for cards (matching screenshot)
  openRFQsCount = 12;
  submittedQuotesCount = 24;
  awardedQuotesCount = 8;
  rejectedQuotesCount = 3;
  draftRFQsCount = 0;
  
  // Trend data for cards
  openRFQsTrend = { value: 2, isPositive: true, period: 'from last week' };
  submittedQuotesTrend = { value: 5, isPositive: true, period: 'from last week' };
  awardedQuotesTrend = { value: 1, isPositive: true, period: 'from last week' };
  rejectedQuotesTrend = { value: 2, isPositive: false, period: 'from last week' };
  
  // Table configuration
  tableConfig: any = {
    columns: [
      {
        field: 'rfqName',
        header: 'RFQ Name',
        sortable: true,
        filterable: true,
        filterType: 'text',
        isHtml: true,
      },
      {
        field: 'creationDate',
        header: 'Creation Date',
        sortable: true,
        filterable: true,
        filterType: 'dateRange',
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
    // Remove sample data loading since we're using real API data
    // this.loadSampleData();
    this.supplierId = localStorage.getItem('supplier_id') || '';
    this.getSupplierCount()
    this.getRfqList();
  }

  getSupplierCount() {
    let endPoint  = `/api/method/wefab.wefab.api.supplier.dashboard.rfq_dashboard.get_rfq_summary_stats?supplier_company_id=${this.supplierId}`
    this.commonService.getWefabData(endPoint).subscribe({
      next: (res: any) => {
        console.log('RFQ Summary Stats:', res.message);
        if (res.message) {
          this.updateDashboardCardsFromAPI(res.message);
        }
      },
      error: (error) => {
        console.error('Error fetching RFQ summary stats:', error);
      }
    })
  }

  // Update dashboard cards with API data
  updateDashboardCardsFromAPI(apiData: any) {
    // Map API response to dashboard cards
    // Draft RFQs -> Not Opened
    this.dashboardCards[0].value = (apiData['total_rfqs'] || 0).toString();
    
    // Open RFQs -> Opened  
    this.dashboardCards[1].value = (apiData['Opened'] || 0).toString();
    
    // Under Review -> Quoted
    this.dashboardCards[2].value = (apiData['Quoted'] || 0).toString();
    
    // Closed RFQs -> Expired + Cancelled
    this.dashboardCards[3].value = (apiData['Expired'] || 0).toString();

    console.log('Updated dashboard cards:', this.dashboardCards);
  }

  getRfqList() {
    this.loading = true;
    let endpoint = `/api/resource/Supplier Request for Quotation?fields=["*"]&filters=[["status", "not in", ["Draft"]],["supplier_id", "=", "${this.supplierId}"]]`
    // let endpoint = `/api/resource/Supplier Request for Quotation?fields=["*"]&filters=[["supplier_id", "=", "${this.supplierId}"]]`

    
    this.commonService.getWefabData(endpoint).subscribe({
      next: (res: any) => {
        ;
        console.log(res.data);
        // Transform API data to match RFQItem interface
        this.allRFQs = this.transformApiDataToRFQItems(res.data);
        // this.calculateStatusCounts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching RFQ data:', error);
        this.loading = false;
        // Fallback to sample data if API fails
        // this.loadSampleData();
      }
    });
  }

  // Add this new method to transform API data
  private transformApiDataToRFQItems(apiData: any[]): any[] {
    if (!apiData || !Array.isArray(apiData)) {
      return [];
    }

    return apiData.map(item => ({
      // Map API fields to match the table configuration
      name: item.rfq_name || '',
      rfqName: `${item.rfq_name || ''}<br><span class="rfq-id-link">${item.rfq_id || ''}</span>`,
      rfqId: item.rfq_id || '', // Add rfq_id for easier access in click handler
      creationDate: this.formatApiDate(item.creation),
      status: item.status[0].toUpperCase() + item.status.slice(1).toLowerCase(),
      // Additional fields for potential use
      owner: item.owner || '',
      suppler_rfq_id: item.supplier_id || '',
      modified: item.modified || '',
      docstatus: item.docstatus || 0,
      routerLink: `/wefab/supplier/rfq/details/${item.rfq_id}`
    }));
  }

  onRfqIdLinkClick(rfqId: string, status: string = '') {
    if(status === "Cancelled" || status === "Paused" || status === "Deactivated") {
       this.sweetAlertService.warning('RFQ is unavailable. It may be paused or deactivated by the buyer.');
       return;
    } else {
      this.router.navigate(['/wefab/supplier/rfq/details', rfqId]);
    }
    // this.router.navigate(['/wefab/supplier/rfq/details', rfqId]);
  }

  // Helper method to format API date
  private formatApiDate(apiDate: string): string {
    if (!apiDate) return new Date().toISOString().split('T')[0];
    
    try {
      // Handle the datetime format from API: "2025-05-28 17:56:55.424710"
      const date = new Date(apiDate);
      
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'long' });
      const year = date.getFullYear();
      
      let hours = date.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    } catch {
      const date = new Date();
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'long' });
      const year = date.getFullYear();
      
      let hours = date.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    }
  }

  // Helper method to map API status to RFQ status
  private mapApiStatusToRFQStatus(apiStatus: string): 'Open' | 'In Progress' | 'Closed' | 'Draft' | 'Quoted' | 'Cancelled' | 'Not Opened' {
    if (!apiStatus) return 'Draft';
    
    const status = apiStatus.toLowerCase();
    
    if (status.includes('draft')) {
      return 'Draft';
    } else if (status.includes('Not Opened')) {
      return 'Not Opened';
    } else if (status.includes('open')) {
      return 'Open';
    } else if (status.includes('submitted') || status.includes('review') || status.includes('progress') || status.includes('in progress')) {
      return 'In Progress';
    } else if (status.includes('closed') || status.includes('completed') || status.includes('Cancelled') || status.includes('approved')) {
      return 'Cancelled';
    } else if (status.includes('quoted')) {
      return 'Quoted';
    }
    
    return 'Draft'; // Default fallback
  }

  // Calculate counts for status cards
  calculateStatusCounts() {
    this.openRFQsCount = this.allRFQs.filter(rfq => rfq.status === 'Open').length;
    this.submittedQuotesCount = this.allRFQs.filter(rfq => rfq.status === 'In Progress').length;
    this.awardedQuotesCount = this.allRFQs.filter(rfq => rfq.status === 'Closed').length;
    this.draftRFQsCount = this.allRFQs.filter(rfq => rfq.status === 'Draft').length;
    
    // Update dashboard cards with dynamic data
    this.updateDashboardCards();
    
    // Update filter options based on actual data
    this.updateFilterOptions();
  }

  // Update dashboard cards with dynamic counts
  updateDashboardCards() {
    this.dashboardCards[0].value = this.draftRFQsCount.toString();
    this.dashboardCards[1].value = this.openRFQsCount.toString();
    this.dashboardCards[2].value = this.submittedQuotesCount.toString();
    this.dashboardCards[3].value = this.awardedQuotesCount.toString();
  }

  // Update filter options based on actual data
  updateFilterOptions() {
    const statusColumn = this.tableConfig.columns.find((col: any) => col.field === 'status');
    if (statusColumn && this.allRFQs.length > 0) {
      const uniqueStatuses = [...new Set(this.allRFQs.map(rfq => rfq.status).filter(status => status))];
      statusColumn.filterOptions = uniqueStatuses.map(status => ({
        label: status,
        value: status
      }));
      console.log('Updated filter options:', statusColumn.filterOptions);
    }
  }

  // Event handlers for common table component
  onRowClick(event: { event: Event, rowData: RFQItem }) {
    console.log('Row clicked:', event.rowData);
  }

  onLinkClick(event: any) {
    console.log('Link clicked:', event.rowData);
    
    // Handle click on RFQ ID link
    const target = event.event.target as HTMLElement;
    if (target?.classList?.contains('rfq-id-link')) {
      console.log('RFQ ID link clicked:', event.rowData);
      event.event.preventDefault();
      event.event.stopPropagation();
      
      // Call the onRfqIdLinkClick function with the RFQ ID
      const rfqId = event.rowData.rfqId || event.rowData.name || '';
      if (rfqId) {
        localStorage.setItem('supplier_rfq_id', event.rowData.suppler_rfq_id);
        this.onRfqIdLinkClick(rfqId, event.rowData.status);
      }
    } else {
      // Handle other link clicks (if any)
      console.log('Other link clicked');
    }
  }

  onActionClick(event: { action: string, rowData: RFQItem }) {
    console.log('Action clicked:', event.action, event.rowData);
    
    const rfq = event.rowData;
    
    switch (event.action) {
      case 'view':
        this.onViewRFQ(rfq);
        break;
      case 'quote':
        if (rfq.status === 'Open') {
          this.onQuoteRFQ(rfq);
        } else {
          alert('Quote action is only available for Open RFQs');
        }
        break;
      case 'edit':
        if (rfq.status === 'In Progress' || rfq.status === 'Draft') {
          this.onEditRFQ(rfq);
        } else {
          alert('Edit action is only available for In Progress or Draft RFQs');
        }
        break;
      case 'download':
        if (rfq.status === 'Closed') {
          this.downloadRFQDocuments(rfq);
        } else {
          alert('Download action is only available for Closed RFQs');
        }
        break;
      default:
        console.log('Unknown action:', event.action);
    }
  }

  onViewRFQ(rfq: RFQItem) {
    console.log('View RFQ:', rfq);
    // Navigate to RFQ details page using the name field for routing
    this.router.navigate(['/wefab/supplier/rfq/details', rfq.name || rfq.rfqId]);
  }

  onQuoteRFQ(rfq: RFQItem) {
    console.log('Quote RFQ:', rfq);
    // Navigate to quote creation page for Open RFQs
    this.router.navigate(['/wefab/supplier/rfq/quote', rfq.name || rfq.rfqId]);
  }

  onEditRFQ(rfq: RFQItem) {
    console.log('Edit RFQ:', rfq);
    // Navigate to quote edit page for In Progress RFQs
    this.router.navigate(['/wefab/supplier/rfq/quote/edit', rfq.name || rfq.rfqId]);
  }

  downloadRFQDocuments(rfq: RFQItem) {
    console.log('Download documents for RFQ:', rfq.name || rfq.rfqId);
    // Implement download functionality
  }

  // Utility methods
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  }
}

