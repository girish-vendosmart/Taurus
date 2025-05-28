import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonTableComponent, TableConfig, ActionButton } from '../../wefab-shared-component/common-table/common-table.component';
import { CommonService } from '../../shared/common.service';

export interface RFQItem {
  rfqId: string;
  title: string;
  parts: number;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Closed';
  statusClass: string;
  description?: string;
  company?: string;
  priority?: 'High' | 'Medium' | 'Low';
  estimatedValue?: number;
  routerLink?: string;
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

  constructor(private router: Router, private commonService: CommonService) { }
  
  // Consolidated RFQ data
  allRFQs: RFQItem[] = [];

  dashboardCards = [
    {
      title: 'Open RFQs',
      value: '12',
      icon: 'pi pi-file-o',
      color: 'info',
      description: '',
      trend: {
        value: '+2',
        direction: 'up',
        period: 'from last week'
      }
    },
    {
      title: 'Under Review',
      value: '8',
      icon: 'pi pi-check-circle',
      color: 'warning',
      description: '',
      trend: {
        value: '+1',
        direction: 'up',
        period: 'from last week'
      }
    },
    {
      title: 'Closed RFQs',
      value: '3',
      icon: 'pi pi-lock',
      color: 'danger',
      description: '',
      trend: {
        value: '-2',
        direction: 'down',
        period: 'from last week'
      }
    }
  ];
  
  // Status counts for cards (matching screenshot)
  openRFQsCount = 12;
  submittedQuotesCount = 24;
  awardedQuotesCount = 8;
  rejectedQuotesCount = 3;
  
  // Trend data for cards
  openRFQsTrend = { value: 2, isPositive: true, period: 'from last week' };
  submittedQuotesTrend = { value: 5, isPositive: true, period: 'from last week' };
  awardedQuotesTrend = { value: 1, isPositive: true, period: 'from last week' };
  rejectedQuotesTrend = { value: 2, isPositive: false, period: 'from last week' };
  
  // Table configuration
  tableConfig: any = {
    columns: [
      {
        field: 'rfqId',
        header: 'RFQ ID',
        sortable: true,
        filterable: true,
        isLink: true,
      },
      {
        field: 'rfq_name',
        header: 'RFQ Name',
        sortable: true,
        filterable: true,
      },
      {
        field: 'total_amount',
        header: 'Total Amount',
        sortable: true,
        filterable: true,
      },
      {
        field: 'expiry_data',
        header: 'Expiry Date',
        sortable: true,
      },
      {
        field: 'status',
        header: 'Status',
        sortable: true,
        isStatus: true,
      },
    ],
    enableSearch: true,
    enableSort: true,
    enableFilter: true,
    enablePagination: true,
    pageSize: 10,
  };
  
  // Loading states
  loading = false;

  ngOnInit() {
    // Remove sample data loading since we're using real API data
    // this.loadSampleData();
    this.getRfqList();
  }

  getRfqList() {
    this.loading = true;
    let endpoint = `/api/resource/Request for Quotation?fields=["*"]`
    
    this.commonService.getWefabData(endpoint).subscribe({
      next: (res: any) => {
        // Transform API data to match RFQItem interface
        this.allRFQs = this.transformApiDataToRFQItems(res.data);
        this.calculateStatusCounts();
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
      // Map API fields to RFQItem interface
      rfqId: item.name || '',
      rfq_name: item.rfq_name || '',
      total_amount: item.total_amount || '',
      expiry_data: this.formatApiDate(item.due_date),
      status: this.mapApiStatusToRFQStatus(item.status || item.workflow_state),
      routerLink: `/wefab/supplier/rfq/details/${item.name || item.rfq_id || item.id}`
    }));
  }

  // Helper method to format API date
  private formatApiDate(apiDate: string): string {
    if (!apiDate) return new Date().toISOString().split('T')[0];
    
    try {
      const date = new Date(apiDate);
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  // Helper method to map API status to RFQ status
  private mapApiStatusToRFQStatus(apiStatus: string): 'Open' | 'In Progress' | 'Closed' {
    if (!apiStatus) return 'Open';
    
    const status = apiStatus.toLowerCase();
    
    if (status.includes('draft') || status.includes('open') || status.includes('pending')) {
      return 'Open';
    } else if (status.includes('submitted') || status.includes('review') || status.includes('progress')) {
      return 'In Progress';
    } else if (status.includes('closed') || status.includes('completed') || status.includes('cancelled')) {
      return 'Closed';
    }
    
    return 'Open'; // Default fallback
  }

  // Calculate counts for status cards
  calculateStatusCounts() {
    this.openRFQsCount = this.allRFQs.filter(rfq => rfq.status === 'Open').length;
    this.submittedQuotesCount = this.allRFQs.filter(rfq => rfq.status === 'In Progress').length;
    this.awardedQuotesCount = this.allRFQs.filter(rfq => rfq.status === 'Closed').length;
  }

  // Event handlers for common table component
  onRowClick(event: { event: Event, rowData: RFQItem }) {
    console.log('Row clicked:', event.rowData);
  }

  onLinkClick(event: { rowData: RFQItem, column: any }) {
    console.log('RFQ link clicked:', event.rowData);
    // Navigate to RFQ details page
    this.router.navigate(['/wefab/supplier/rfq/details', event.rowData.rfqId]);
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
        if (rfq.status === 'In Progress') {
          this.onEditRFQ(rfq);
        } else {
          alert('Edit action is only available for In Progress RFQs');
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
    // Navigate to RFQ details page
    this.router.navigate(['/wefab/supplier/rfq/details', rfq.rfqId]);
  }

  onQuoteRFQ(rfq: RFQItem) {
    console.log('Quote RFQ:', rfq);
    // Navigate to quote creation page for Open RFQs
    this.router.navigate(['/wefab/supplier/rfq/quote', rfq.rfqId]);
  }

  onEditRFQ(rfq: RFQItem) {
    console.log('Edit RFQ:', rfq);
    // Navigate to quote edit page for In Progress RFQs
    this.router.navigate(['/wefab/supplier/rfq/quote/edit', rfq.rfqId]);
  }

  downloadRFQDocuments(rfq: RFQItem) {
    console.log('Download documents for RFQ:', rfq.rfqId);
    // Implement download functionality
  }

  // Utility methods
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}

