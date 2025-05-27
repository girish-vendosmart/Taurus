import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonTableComponent, TableConfig, ActionButton } from '../../wefab-shared-component/common-table/common-table.component';

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

  constructor(private router: Router) { }
  
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
  tableConfig: TableConfig = {
    columns: [
      {
        field: 'rfqId',
        header: 'RFQ ID',
        sortable: true,
        filterable: true,
        isLink: true,
      },
      {
        field: 'title',
        header: 'Title',
        sortable: true,
        filterable: true,
      },
      {
        field: 'company',
        header: 'Company',
        sortable: true,
        filterable: true,
      },
      {
        field: 'parts',
        header: 'Parts',
        sortable: true,
      },
      {
        field: 'dueDate',
        header: 'Due Date',
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
    this.loadSampleData();
  }

  loadSampleData() {
    // Consolidate all RFQ data into a single array
    const openRFQs: RFQItem[] = [
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
        estimatedValue: 25000,
        routerLink: '/wefab/supplier/rfq/details/RFQ-2023-001'
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
        estimatedValue: 15000,
        routerLink: '/wefab/supplier/rfq/details/RFQ-2023-002'
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
        estimatedValue: 18000,
        routerLink: '/wefab/supplier/rfq/details/RFQ-2023-003'
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
        estimatedValue: 32000,
        routerLink: '/wefab/supplier/rfq/details/RFQ-2023-008'
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
        estimatedValue: 12000,
        routerLink: '/wefab/supplier/rfq/details/RFQ-2023-009'
      }
    ];

    const inProgressRFQs: RFQItem[] = [
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
        estimatedValue: 8000,
        routerLink: '/wefab/supplier/rfq/details/RFQ-2023-004'
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
        estimatedValue: 35000,
        routerLink: '/wefab/supplier/rfq/details/RFQ-2023-005'
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
        estimatedValue: 22000,
        routerLink: '/wefab/supplier/rfq/details/RFQ-2023-010'
      }
    ];

    const closedRFQs: RFQItem[] = [
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
        estimatedValue: 45000,
        routerLink: '/wefab/supplier/rfq/details/RFQ-2023-006'
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
        estimatedValue: 28000,
        routerLink: '/wefab/supplier/rfq/details/RFQ-2023-007'
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
        estimatedValue: 38000,
        routerLink: '/wefab/supplier/rfq/details/RFQ-2023-011'
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
        estimatedValue: 16000,
        routerLink: '/wefab/supplier/rfq/details/RFQ-2023-012'
      }
    ];

    // Combine all RFQs into a single array
    this.allRFQs = [...openRFQs, ...inProgressRFQs, ...closedRFQs];
    
    // Calculate status counts for cards
    this.calculateStatusCounts();
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

