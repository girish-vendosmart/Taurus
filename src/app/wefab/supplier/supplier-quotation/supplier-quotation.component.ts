import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../../shared/common.service';
import { CommonTableComponent, TableConfig, ActionButton } from '../../wefab-shared-component/common-table/common-table.component';

export interface SupplierQuotationData {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: number;
  idx: number;
  workflow_state: string;
  quotation_id: string | null;
  rfq_id: string;
  supplier_id: string;
  estimated_completion_duration: string;
  validity: string;
  delivery_address: string;
  total_amount: number;
  discount_percentage: number;
  discount_amount: number;
  grand_total: number;
  payment_terms: string;
  shipping_terms: string;
  notes: string;
  amended_from: string | null;
}

export interface QuotationTableItem {
  quotationId: string;
  rfqId: string;
  title: string;
  parts: number;
  submittedDate: string;
  status: string;
  statusClass: string;
  description?: string;
  company?: string;
  priority?: 'High' | 'Medium' | 'Low';
  estimatedValue?: number;
  totalAmount?: string | number;
  grandTotal?: string | number;
  paymentTerms?: string;
  shippingTerms?: string;
  validity?: string;
  duration?: string;
  notes?: string;
}

@Component({
  selector: 'app-supplier-quotation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CommonTableComponent
  ],
  templateUrl: './supplier-quotation.component.html',
  styleUrl: './supplier-quotation.component.scss'
})
export class SupplierQuotationComponent implements OnInit {

  constructor(private router: Router, private commonService: CommonService) { }
  
  // Raw API data
  rawQuotationData: SupplierQuotationData[] = [];
  
  // All processed quotations
  allQuotations: QuotationTableItem[] = [];
  
  // Loading states
  loading = false;

  // Dashboard cards data
  dashboardCards = [
    {
      title: 'Total Quotations',
      value: '0',
      icon: 'pi pi-file-o',
      color: 'info',
      description: 'All submitted quotations',
    },
    {
      title: 'Awarded Quotations',
      value: '0',
      icon: 'pi pi-check-circle',
      color: 'success',
      description: 'Successfully awarded quotations',
    },
    {
      title: 'Non Awarded Quotations',
      value: '0',
      icon: 'pi pi-times-circle',
      color: 'warning',
      description: 'Pending or rejected quotations',
    }
  ];

  // Status counts for cards
  totalQuotationsCount = 0;
  awardedQuotationsCount = 0;
  nonAwardedQuotationsCount = 0;

  // Table configuration for common-table component
  tableConfig: TableConfig = {
    columns: [
      {
        field: 'quotationId',
        header: 'QUOTATION ID',
        sortable: true,
        filterable: true,
        isLink: true,
      },
      {
        field: 'rfqId',
        header: 'RFQ ID',
        sortable: true,
        filterable: true,
      },
      {
        field: 'totalAmount',
        header: 'TOTAL AMOUNT',
        sortable: true,
        filterable: true,
      },
      {
        field: 'grandTotal',
        header: 'GRAND TOTAL',
        sortable: true,
        filterable: true,
      },
      {
        field: 'submittedDate',
        header: 'SUBMITTED DATE',
        sortable: true,
        filterable: true,
      },
      {
        field: 'validity',
        header: 'VALIDITY',
        sortable: true,
        filterable: true,
      },
      {
        field: 'status',
        header: 'STATUS',
        sortable: true,
        filterable: true,
        isStatus: true,
      },
    ],
    enableSearch: true,
    enableSort: true,
    enableFilter: true,
    enablePagination: true,
    pageSize: 10,
    showActions: true,
    enableColumnHide: false,
    enableColumnResize: true,
  };

  ngOnInit() {
    this.getQuotationList();
  }

  getQuotationList() {
    this.loading = true;
    let endPoint = '/api/resource/Supplier Quotation?fields=["*"]';
    this.commonService.getWefabData(endPoint).subscribe({
      next: (res: any) => {
        console.log('API Response:', res);
        if (res && res.data) {
          this.rawQuotationData = res.data;
          this.processQuotationData();
        } else {
          // No data received, still calculate stats for empty state
          this.allQuotations = [];
          this.calculateQuotationStats();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching quotation data:', error);
        this.loading = false;
        // Ensure cards show 0 values when API fails
        this.allQuotations = [];
        this.calculateQuotationStats();
        // Optionally load sample data as fallback
        // this.loadSampleData();
      }
    });
  }

  processQuotationData() {
    // Convert raw API data to table format
    this.allQuotations = this.rawQuotationData.map(item => this.mapApiDataToTableItem(item));
    // Update dashboard cards with calculated statistics
    this.calculateQuotationStats();
  }

  mapApiDataToTableItem(apiItem: SupplierQuotationData): QuotationTableItem {
    return {
      quotationId: apiItem.name,
      rfqId: apiItem.rfq_id,
      title: `Quotation ${apiItem.name}`,
      parts: 1, // Default value as not provided in API
      submittedDate: this.formatDate(apiItem.creation),
      status: apiItem.workflow_state,
      statusClass: this.getStatusClass(apiItem.workflow_state),
      description: apiItem.notes ? apiItem.notes.substring(0, 100) + '...' : '',
      totalAmount: this.formatCurrency(apiItem.total_amount),
      grandTotal: this.formatCurrency(apiItem.grand_total),
      paymentTerms: apiItem.payment_terms,
      shippingTerms: apiItem.shipping_terms,
      validity: this.formatDate(apiItem.validity),
      duration: apiItem.estimated_completion_duration,
      notes: apiItem.notes
    };
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'draft': return 'status-draft';
      case 'submitted': return 'status-quoted';
      case 'quoted': return 'status-quoted';
      case 'awarded': return 'status-awarded';
      default: return 'status-draft';
    }
  }

  // Utility methods
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    if (amount == null || isNaN(amount)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  // Common Table Event Handlers
  onRowClick(event: { event: Event, rowData: any }) {
    console.log('Quotation row clicked:', event.rowData);
    this.router.navigate(['/wefab/supplier/quotation/details', event.rowData.quotationId]);
  }

  onLinkClick(event: { rowData: any, column: any }) {
    console.log('Quotation link clicked:', event.rowData);
    this.router.navigate(['/wefab/supplier/quotation/details', event.rowData.quotationId]);
  }

  onActionClick(event: { action: string, rowData: any }) {
    console.log('Action clicked:', event.action, event.rowData);
    
    switch (event.action) {
      case 'view':
        this.onViewQuotation(event.rowData);
        break;
      case 'edit':
        this.onEditQuotation(event.rowData);
        break;
      case 'download':
        this.onDownloadQuotation(event.rowData);
        break;
    }
  }

  // Action handlers
  onViewQuotation(quotation: QuotationTableItem) {
    console.log('View quotation:', quotation);
    this.router.navigate(['/wefab/supplier/quotation/details', quotation.quotationId]);
  }

  onEditQuotation(quotation: QuotationTableItem) {
    console.log('Edit quotation:', quotation);
    this.router.navigate(['/wefab/supplier/quotation/details', quotation.quotationId]);
  }

  onDownloadQuotation(quotation: QuotationTableItem) {
    console.log('Download quotation:', quotation);
    // Implement download logic
  }

  // Calculate statistics for dashboard cards
  calculateQuotationStats() {
    this.totalQuotationsCount = this.allQuotations.length;
    this.awardedQuotationsCount = this.allQuotations.filter(q => 
      q.status?.toLowerCase() === 'awarded'
    ).length;
    this.nonAwardedQuotationsCount = this.totalQuotationsCount - this.awardedQuotationsCount;

    // Update dashboard cards with actual values
    this.dashboardCards[0].value = this.totalQuotationsCount.toString();
    this.dashboardCards[1].value = this.awardedQuotationsCount.toString();
    this.dashboardCards[2].value = this.nonAwardedQuotationsCount.toString();

    // Optional: Calculate trends (you can enhance this based on historical data)
  }

}

