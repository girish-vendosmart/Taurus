import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
}

export interface SearchFilters {
  rfqId: string;
  title: string;
  company: string;
  parts: string;
  dueDate: string;
  status: string;
}

@Component({
  selector: 'app-supplier-rfq',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './supplier-rfq.component.html',
  styleUrl: './supplier-rfq.component.scss'
})
export class SupplierRfqComponent implements OnInit {

  constructor(private router: Router) { }
  
  // Tab data
  openRFQs: RFQItem[] = [];
  inProgressRFQs: RFQItem[] = [];
  closedRFQs: RFQItem[] = [];
  
  // Search filters
  searchFilters: SearchFilters = {
    rfqId: '',
    title: '',
    company: '',
    parts: '',
    dueDate: '',
    status: ''
  };
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  
  // Table configuration
  tableColumns: any = [];
  
  // Loading states
  loading = false;
  
  // Active tab index
  activeTabIndex = 0;

  ngOnInit() {
    this.initializeTableColumns();
    this.loadSampleData();
  }

  initializeTableColumns() {
    this.tableColumns = [
      {
        field: 'rfqId',
        header: 'RFQ ID',
        sortable: true,
        filterable: true,
        width: '15%',
        isLink: true
      },
      {
        field: 'title',
        header: 'Title',
        sortable: true,
        filterable: true,
        width: '35%'
      },
      {
        field: 'parts',
        header: 'Parts',
        sortable: true,
        width: '10%',
        formatter: (value: number) => value.toString()
      },
      {
        field: 'dueDate',
        header: 'Due Date',
        sortable: true,
        width: '15%',
        formatter: (value: string) => this.formatDate(value)
      },
      {
        field: 'status',
        header: 'Status',
        sortable: true,
        width: '15%',
        customTemplate: true
      },
      {
        field: 'actions',
        header: 'Actions',
        width: '10%',
        customTemplate: true
      }
    ];
  }

  loadSampleData() {
    // Sample data with realistic information
    this.openRFQs = [
      {
        rfqId: 'RFQ-2023-001',
        title: 'CNC Machined Aluminum Brackets',
        parts: 1,
        dueDate: '2023-12-15',
        status: 'Open',
        statusClass: 'status-open',
        description: 'High precision aluminum brackets for automotive application',
        company: 'AutoTech Industries',
        priority: 'High',
        estimatedValue: 25000
      },
      {
        rfqId: 'RFQ-2023-002',
        title: 'Sheet Metal Enclosure',
        parts: 1,
        dueDate: '2023-12-18',
        status: 'Open',
        statusClass: 'status-open',
        description: 'Custom sheet metal enclosure for electronic equipment',
        company: 'ElectroSystems Ltd',
        priority: 'Medium',
        estimatedValue: 15000
      },
      {
        rfqId: 'RFQ-2023-003',
        title: 'Injection Molded Components',
        parts: 3,
        dueDate: '2023-12-20',
        status: 'Open',
        statusClass: 'status-open',
        description: 'Plastic injection molded parts for consumer electronics',
        company: 'TechGadgets Inc',
        priority: 'Medium',
        estimatedValue: 18000
      },
      {
        rfqId: 'RFQ-2023-008',
        title: 'Precision Turned Parts',
        parts: 2,
        dueDate: '2023-12-22',
        status: 'Open',
        statusClass: 'status-open',
        description: 'High precision turned components for aerospace',
        company: 'AeroSpace Solutions',
        priority: 'High',
        estimatedValue: 32000
      },
      {
        rfqId: 'RFQ-2023-009',
        title: 'Custom Fabricated Brackets',
        parts: 4,
        dueDate: '2023-12-25',
        status: 'Open',
        statusClass: 'status-open',
        description: 'Custom fabricated steel brackets for construction',
        company: 'BuildPro Inc',
        priority: 'Low',
        estimatedValue: 12000
      }
    ];

    this.inProgressRFQs = [
      {
        rfqId: 'RFQ-2023-004',
        title: '3D Printed Prototype Parts',
        parts: 2,
        dueDate: '2023-12-25',
        status: 'In Progress',
        statusClass: 'status-progress',
        description: 'Rapid prototyping for new product development',
        company: 'Innovation Labs',
        priority: 'High',
        estimatedValue: 8000
      },
      {
        rfqId: 'RFQ-2023-005',
        title: 'Precision Machined Gears',
        parts: 5,
        dueDate: '2023-12-30',
        status: 'In Progress',
        statusClass: 'status-progress',
        description: 'High precision gears for industrial machinery',
        company: 'MechPrecision Co',
        priority: 'High',
        estimatedValue: 35000
      },
      {
        rfqId: 'RFQ-2023-010',
        title: 'Welded Assemblies',
        parts: 3,
        dueDate: '2024-01-05',
        status: 'In Progress',
        statusClass: 'status-progress',
        description: 'Complex welded assemblies for marine equipment',
        company: 'Marine Tech Ltd',
        priority: 'Medium',
        estimatedValue: 22000
      }
    ];

    this.closedRFQs = [
      {
        rfqId: 'RFQ-2023-006',
        title: 'Welded Steel Framework',
        parts: 1,
        dueDate: '2023-11-15',
        status: 'Closed',
        statusClass: 'status-closed',
        description: 'Structural steel framework for construction project',
        company: 'BuildTech Solutions',
        priority: 'Low',
        estimatedValue: 45000
      },
      {
        rfqId: 'RFQ-2023-007',
        title: 'Cast Iron Components',
        parts: 4,
        dueDate: '2023-11-20',
        status: 'Closed',
        statusClass: 'status-closed',
        description: 'Heavy duty cast iron parts for mining equipment',
        company: 'Mining Solutions Ltd',
        priority: 'Medium',
        estimatedValue: 28000
      },
      {
        rfqId: 'RFQ-2023-011',
        title: 'Machined Valve Bodies',
        parts: 6,
        dueDate: '2023-11-25',
        status: 'Closed',
        statusClass: 'status-closed',
        description: 'Precision machined valve bodies for hydraulic systems',
        company: 'Hydraulic Systems Inc',
        priority: 'High',
        estimatedValue: 38000
      },
      {
        rfqId: 'RFQ-2023-012',
        title: 'Sheet Metal Panels',
        parts: 8,
        dueDate: '2023-11-30',
        status: 'Closed',
        statusClass: 'status-closed',
        description: 'Custom sheet metal panels for industrial equipment',
        company: 'Industrial Panels Co',
        priority: 'Medium',
        estimatedValue: 16000
      }
    ];
  }

  // Tab management
  setActiveTab(index: number) {
    this.activeTabIndex = index;
    this.currentPage = 1; // Reset pagination when switching tabs
  }

  // Get current tab data
  getCurrentTabData(): RFQItem[] {
    switch (this.activeTabIndex) {
      case 0: return this.openRFQs;
      case 1: return this.inProgressRFQs;
      case 2: return this.closedRFQs;
      default: return this.openRFQs;
    }
  }

  // Search functionality
  onSearch() {
    this.currentPage = 1; // Reset to first page when searching
  }

  getFilteredData(data: RFQItem[]): RFQItem[] {
    let filtered = data.filter(item => {
      return (
        (!this.searchFilters.rfqId || item.rfqId.toLowerCase().includes(this.searchFilters.rfqId.toLowerCase())) &&
        (!this.searchFilters.title || item.title.toLowerCase().includes(this.searchFilters.title.toLowerCase())) &&
        (!this.searchFilters.company || item.company?.toLowerCase().includes(this.searchFilters.company.toLowerCase())) &&
        (!this.searchFilters.parts || item.parts.toString().includes(this.searchFilters.parts)) &&
        (!this.searchFilters.dueDate || this.formatDate(item.dueDate).toLowerCase().includes(this.searchFilters.dueDate.toLowerCase())) &&
        (!this.searchFilters.status || item.status === this.searchFilters.status)
      );
    });

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }

  // Pagination methods
  getTotalPages(): number {
    const currentData = this.getCurrentTabData();
    const filteredCount = currentData.filter(item => {
      return (
        (!this.searchFilters.rfqId || item.rfqId.toLowerCase().includes(this.searchFilters.rfqId.toLowerCase())) &&
        (!this.searchFilters.title || item.title.toLowerCase().includes(this.searchFilters.title.toLowerCase())) &&
        (!this.searchFilters.company || item.company?.toLowerCase().includes(this.searchFilters.company.toLowerCase())) &&
        (!this.searchFilters.parts || item.parts.toString().includes(this.searchFilters.parts)) &&
        (!this.searchFilters.dueDate || this.formatDate(item.dueDate).toLowerCase().includes(this.searchFilters.dueDate.toLowerCase())) &&
        (!this.searchFilters.status || item.status === this.searchFilters.status)
      );
    }).length;
    
    return Math.ceil(filteredCount / this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  // Event handlers
  onTabChange(event: any) {
    this.activeTabIndex = event.index;
  }

  onRowSelect(event: any) {
    console.log('Row selected:', event);
  }

  onLinkClick(rowData: RFQItem) {
    console.log('RFQ clicked:', rowData);
    // Navigate to RFQ details page
    this.router.navigate(['/wefab/supplier/rfq/details', rowData.rfqId]);
  }

  onViewRFQ(rfq: RFQItem) {
    console.log('View RFQ:', rfq);
    // Implement view functionality
  }

  onQuoteRFQ(rfq: RFQItem) {
    console.log('Quote RFQ:', rfq);
    // Implement quote functionality
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

  getTabCount(tabIndex: number): number {
    switch (tabIndex) {
      case 0: return this.openRFQs.length;
      case 1: return this.inProgressRFQs.length;
      case 2: return this.closedRFQs.length;
      default: return 0;
    }
  }
}
