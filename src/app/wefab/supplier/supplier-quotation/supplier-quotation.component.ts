import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface QuotationItem {
  quotationId: string;
  rfqId: string;
  title: string;
  parts: number;
  submittedDate: string;
  status: 'Draft' | 'Quoted' | 'Awarded';
  statusClass: string;
  description?: string;
  company?: string;
  priority?: 'High' | 'Medium' | 'Low';
  estimatedValue?: number;
  totalAmount?: number;
}

export interface SearchFilters {
  quotationId: string;
  rfqId: string;
  title: string;
  company: string;
  parts: string;
  submittedDate: string;
  status: string;
}

@Component({
  selector: 'app-supplier-quotation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './supplier-quotation.component.html',
  styleUrl: './supplier-quotation.component.scss'
})
export class SupplierQuotationComponent implements OnInit {

  constructor(private router: Router) { }
  
  // Tab data
  draftQuotations: QuotationItem[] = [];
  quotedQuotations: QuotationItem[] = [];
  awardedQuotations: QuotationItem[] = [];
  
  // Search filters
  searchFilters: SearchFilters = {
    quotationId: '',
    rfqId: '',
    title: '',
    company: '',
    parts: '',
    submittedDate: '',
    status: ''
  };
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  
  // Loading states
  loading = false;
  
  // Active tab index
  activeTabIndex = 0;

  ngOnInit() {
    this.loadSampleData();
  }

  loadSampleData() {
    // Sample draft quotations
    this.draftQuotations = [
      {
        quotationId: 'QUO-2023-001',
        rfqId: 'RFQ-2023-001',
        title: 'CNC Machined Aluminum Brackets',
        parts: 1,
        submittedDate: '2023-12-10',
        status: 'Draft',
        statusClass: 'status-draft',
        description: 'High precision aluminum brackets for automotive application',
        company: 'AutoTech Industries',
        priority: 'High',
        estimatedValue: 25000,
        totalAmount: 24500
      },
      {
        quotationId: 'QUO-2023-005',
        rfqId: 'RFQ-2023-005',
        title: 'Custom Fabricated Brackets',
        parts: 4,
        submittedDate: '2023-12-12',
        status: 'Draft',
        statusClass: 'status-draft',
        description: 'Custom fabricated steel brackets for construction',
        company: 'BuildPro Inc',
        priority: 'Medium',
        estimatedValue: 12000,
        totalAmount: 11800
      },
      {
        quotationId: 'QUO-2023-008',
        rfqId: 'RFQ-2023-008',
        title: 'Precision Turned Parts',
        parts: 2,
        submittedDate: '2023-12-14',
        status: 'Draft',
        statusClass: 'status-draft',
        description: 'High precision turned components for aerospace',
        company: 'AeroSpace Solutions',
        priority: 'High',
        estimatedValue: 32000,
        totalAmount: 31200
      }
    ];

    // Sample quoted quotations
    this.quotedQuotations = [
      {
        quotationId: 'QUO-2023-002',
        rfqId: 'RFQ-2023-002',
        title: 'Sheet Metal Enclosure',
        parts: 1,
        submittedDate: '2023-12-08',
        status: 'Quoted',
        statusClass: 'status-quoted',
        description: 'Custom sheet metal enclosure for electronic equipment',
        company: 'ElectroSystems Ltd',
        priority: 'Medium',
        estimatedValue: 15000,
        totalAmount: 14750
      },
      {
        quotationId: 'QUO-2023-003',
        rfqId: 'RFQ-2023-003',
        title: 'Injection Molded Components',
        parts: 3,
        submittedDate: '2023-12-09',
        status: 'Quoted',
        statusClass: 'status-quoted',
        description: 'Plastic injection molded parts for consumer electronics',
        company: 'TechGadgets Inc',
        priority: 'Medium',
        estimatedValue: 18000,
        totalAmount: 17500
      },
      {
        quotationId: 'QUO-2023-006',
        rfqId: 'RFQ-2023-006',
        title: '3D Printed Prototype Parts',
        parts: 2,
        submittedDate: '2023-12-11',
        status: 'Quoted',
        statusClass: 'status-quoted',
        description: 'Rapid prototyping for new product development',
        company: 'Innovation Labs',
        priority: 'High',
        estimatedValue: 8000,
        totalAmount: 7800
      },
      {
        quotationId: 'QUO-2023-009',
        rfqId: 'RFQ-2023-009',
        title: 'Welded Steel Assemblies',
        parts: 5,
        submittedDate: '2023-12-13',
        status: 'Quoted',
        statusClass: 'status-quoted',
        description: 'Complex welded assemblies for industrial equipment',
        company: 'Heavy Industries Corp',
        priority: 'Medium',
        estimatedValue: 45000,
        totalAmount: 43500
      }
    ];

    // Sample awarded quotations
    this.awardedQuotations = [
      {
        quotationId: 'QUO-2023-004',
        rfqId: 'RFQ-2023-004',
        title: 'Machined Steel Components',
        parts: 3,
        submittedDate: '2023-11-28',
        status: 'Awarded',
        statusClass: 'status-awarded',
        description: 'Precision machined steel components for machinery',
        company: 'Precision Manufacturing',
        priority: 'High',
        estimatedValue: 22000,
        totalAmount: 21500
      },
      {
        quotationId: 'QUO-2023-007',
        rfqId: 'RFQ-2023-007',
        title: 'Cast Iron Parts',
        parts: 2,
        submittedDate: '2023-11-30',
        status: 'Awarded',
        statusClass: 'status-awarded',
        description: 'Custom cast iron parts for heavy machinery',
        company: 'Industrial Casting Ltd',
        priority: 'Medium',
        estimatedValue: 35000,
        totalAmount: 34200
      }
    ];
  }

  // Tab management
  setActiveTab(index: number) {
    this.activeTabIndex = index;
    this.currentPage = 1;
  }

  getCurrentTabData(): QuotationItem[] {
    switch (this.activeTabIndex) {
      case 0: return this.draftQuotations;
      case 1: return this.quotedQuotations;
      case 2: return this.awardedQuotations;
      default: return [];
    }
  }

  // Search functionality
  onSearch() {
    // Implement search logic here
  }

  getFilteredData(data: QuotationItem[]): QuotationItem[] {
    return data.filter(item => {
      return (
        (!this.searchFilters.quotationId || item.quotationId.toLowerCase().includes(this.searchFilters.quotationId.toLowerCase())) &&
        (!this.searchFilters.rfqId || item.rfqId.toLowerCase().includes(this.searchFilters.rfqId.toLowerCase())) &&
        (!this.searchFilters.title || item.title.toLowerCase().includes(this.searchFilters.title.toLowerCase())) &&
        (!this.searchFilters.company || item.company?.toLowerCase().includes(this.searchFilters.company.toLowerCase())) &&
        (!this.searchFilters.parts || item.parts.toString().includes(this.searchFilters.parts)) &&
        (!this.searchFilters.submittedDate || item.submittedDate.includes(this.searchFilters.submittedDate)) &&
        (!this.searchFilters.status || item.status.toLowerCase().includes(this.searchFilters.status.toLowerCase()))
      );
    });
  }

  // Pagination
  getTotalPages(): number {
    const filteredData = this.getFilteredData(this.getCurrentTabData());
    return Math.ceil(filteredData.length / this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  // Event handlers
  onLinkClick(quotation: QuotationItem) {
    console.log('Quotation link clicked:', quotation);
    // Navigate to quotation details
    this.router.navigate(['/wefab/supplier/quotation/details', quotation.quotationId]);
  }

  onViewQuotation(quotation: QuotationItem) {
    console.log('View quotation:', quotation);
    this.router.navigate(['/wefab/supplier/quotation/details', quotation.quotationId]);
  }

  onEditQuotation(quotation: QuotationItem) {
    console.log('Edit quotation:', quotation);
    this.router.navigate(['/wefab/supplier/quotation/details', quotation.quotationId]);
  }

  onSubmitQuotation(quotation: QuotationItem) {
    console.log('Submit quotation:', quotation);
    // Implement submit logic
  }

  onDownloadQuotation(quotation: QuotationItem) {
    console.log('Download quotation:', quotation);
    // Implement download logic
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

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getTabCount(tabIndex: number): number {
    switch (tabIndex) {
      case 0: return this.draftQuotations.length;
      case 1: return this.quotedQuotations.length;
      case 2: return this.awardedQuotations.length;
      default: return 0;
    }
  }
}
