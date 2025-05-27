import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonTableComponent, TableConfig, ActionButton } from '../../wefab-shared-component/common-table/common-table.component';

export interface RFQDetails {
  rfqId: string;
  title: string;
  description: string;
  status: 'Published' | 'Draft' | 'Closed';
  createdOn: string;
  lastUpdated: string;
  dueDate: string;
  projectName: string;
  country: string;
  lastQuoteDate: string;
  address: string;
}

export interface RFQPart {
  partName: string;
  quantity: number;
  material: string;
  process: string;
  specifications: string;
}

export interface ExpenseItem {
  category: string;
  section: string;
  itemNumber: string;
  description: string;
  drawingNumber: string;
  unit: string;
  quantity: number;
  currency: string;
  notes: string;
}

@Component({
  selector: 'app-supplier-rfq-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CommonTableComponent
  ],
  templateUrl: './supplier-rfq-details.component.html',
  styleUrl: './supplier-rfq-details.component.scss'
})
export class SupplierRfqDetailsComponent implements OnInit {
  rfqId: string = '';
  activeTab: 'overview' | 'comment' | 'resolution' = 'overview';
  loading: boolean = false;
  
  rfqDetails: RFQDetails = {
    rfqId: 'RFQ-2023-001',
    title: 'CNC Machined Aluminum Brackets',
    description: 'Set of 4 aluminum brackets for robotics application. These brackets will be used to mount motors and sensors on a robotic arm. The parts require high precision and must meet the specified tolerances.',
    status: 'Published',
    createdOn: '8/1/2023',
    lastUpdated: '8/1/2023',
    dueDate: '8/15/2023',
    projectName: 'Logitech Office Expansion Project',
    country: 'Kuwait',
    lastQuoteDate: '07 Jun 2025, 02:23 PM',
    address: 'Kuwait City, Kuwait'
  };

  rfqParts: RFQPart[] = [
    {
      partName: 'Bracket A',
      quantity: 10,
      material: 'Aluminum 6061',
      process: 'CNC Machining',
      specifications: 'Tolerance: ±0.1mm, Surface finish: Ra 1.6'
    },
    {
      partName: 'Bracket B',
      quantity: 5,
      material: 'Aluminum 6061',
      process: 'CNC Machining',
      specifications: 'Tolerance: ±0.05mm, Surface finish: Ra 0.8'
    },
    {
      partName: 'Bracket C',
      quantity: 8,
      material: 'Aluminum 7075',
      process: 'CNC Machining',
      specifications: 'Tolerance: ±0.1mm, Surface finish: Ra 1.6, Anodized finish'
    },
    {
      partName: 'Bracket D',
      quantity: 4,
      material: 'Aluminum 7075',
      process: 'CNC Machining',
      specifications: 'Tolerance: ±0.05mm, Surface finish: Ra 0.8, Anodized finish'
    }
  ];

  expenseItems: ExpenseItem[] = [
    {
      category: 'Professional Costs',
      section: 'Power Distribution',
      itemNumber: '7.1.2',
      description: 'Description',
      drawingNumber: '-',
      unit: 'Pieces',
      quantity: 200,
      currency: 'USD',
      notes: '-'
    },
    {
      category: 'Preliminiries',
      section: 'others',
      itemNumber: '3.2.4',
      description: 'Description',
      drawingNumber: '-',
      unit: 'Pieces',
      quantity: 56,
      currency: 'USD',
      notes: '-'
    },
    {
      category: 'Contingency',
      section: 'Risk & Contingency',
      itemNumber: '8.2.1',
      description: 'Description',
      drawingNumber: '-',
      unit: 'Sqm',
      quantity: 20,
      currency: 'USD',
      notes: '-'
    },
    {
      category: 'Preliminiries',
      section: 'Other',
      itemNumber: '3.2.3',
      description: 'Description',
      drawingNumber: '-',
      unit: 'Sqm',
      quantity: 9,
      currency: 'USD',
      notes: '-'
    },
    {
      category: 'Fire Services',
      section: 'Fire maintaince',
      itemNumber: '5.2.2',
      description: 'Desc',
      drawingNumber: '-',
      unit: 'Pieces',
      quantity: 56,
      currency: 'USD',
      notes: '-'
    },
    {
      category: 'Preliminiries',
      section: 'Others',
      itemNumber: '3.2.6',
      description: 'Descrip',
      drawingNumber: '-',
      unit: 'Pieces',
      quantity: 20,
      currency: 'USD',
      notes: '-'
    },
    {
      category: 'HVAC',
      section: 'Water Supply & Drainage',
      itemNumber: '9.2.1',
      description: 'Desc',
      drawingNumber: '-',
      unit: 'Sqm',
      quantity: 12,
      currency: 'USD',
      notes: '-'
    },
    {
      category: 'IT Equipment',
      section: 'Temporary Site Facilities',
      itemNumber: '6.2.1',
      description: 'Desc',
      drawingNumber: '-',
      unit: 'Pieces',
      quantity: 2,
      currency: 'USD',
      notes: '-'
    }
  ];

  // Contract modal properties
  showContractModal: boolean = false;
  contractFullyRead: boolean = false;
  contractAccepted: boolean = false;
  pdfLoaded: boolean = false;
  contractPdfUrl: string = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'; // Sample PDF for demonstration

  // Expense Table Configuration
  expenseTableConfig: TableConfig = {
    columns: [
      {
        field: 'category',
        header: 'Expense Category',
        sortable: true,
        filterable: true,
      },
      {
        field: 'section',
        header: 'Section',
        sortable: true,
        filterable: true,
      },
      {
        field: 'itemNumber',
        header: 'Item Number',
        sortable: true,
        filterable: true,
      },
      {
        field: 'description',
        header: 'Description',
        sortable: true,
        filterable: true,
      },
      {
        field: 'drawingNumber',
        header: 'Drawing Number',
        sortable: true,
        filterable: true,
      },
      {
        field: 'unit',
        header: 'Unit',
        sortable: true,
        filterable: true,
      },
      {
        field: 'quantity',
        header: 'Quantity',
        sortable: true,
        filterable: true,
      },
      {
        field: 'currency',
        header: 'Currency',
        sortable: true,
        filterable: true,
      },
      {
        field: 'notes',
        header: 'Notes',
        sortable: true,
        filterable: true,
      }
    ],
    enableSearch: true,
    enableSort: true,
    enableFilter: true,
    enablePagination: true,
    pageSize: 10,
    showActions: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.rfqId = params['id'];
      this.loadRFQDetails();
    });
  }

  loadRFQDetails() {
    // In a real application, this would fetch data from a service
    // For now, we'll use the mock data above
    console.log('Loading RFQ details for:', this.rfqId);
  }

  setActiveTab(tab: 'overview' | 'comment' | 'resolution') {
    this.activeTab = tab;
  }

  goBack() {
    this.router.navigate(['/wefab/supplier/rfq']);
  }

  createQuotation() {
    // Implement create quotation functionality
    this.router.navigate(['/wefab/supplier/create-quotation']);
  }

  viewContract() {
    // Open the contract modal
    this.showContractModal = true;
    this.contractFullyRead = false;
    this.contractAccepted = false;
    this.pdfLoaded = true;
    
    // For demo purposes, we'll simulate PDF loading and enable checkbox after 3 seconds
    // In a real application, you would detect when the user has scrolled through the PDF
    setTimeout(() => {
      this.contractFullyRead = true;
    }, 3000);
  }

  closeContractModal() {
    this.showContractModal = false;
    this.contractFullyRead = false;
    this.contractAccepted = false;
    this.pdfLoaded = false;
  }

  onPdfLoad() {
    this.pdfLoaded = true;
  }

  onContractScroll(event: Event) {
    const element = event.target as HTMLElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    
    // Check if user has scrolled to the bottom (with a small tolerance)
    const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
    if (scrolledToBottom && !this.contractFullyRead) {
      this.contractFullyRead = true;
    }
  }

  acceptContract() {
    if (this.contractAccepted && this.contractFullyRead) {
      // Implement contract acceptance logic
      console.log('Contract accepted for RFQ:', this.rfqId);
      
      // You can add additional logic here such as:
      // - API call to save contract acceptance
      // - Update RFQ status
      // - Show success message
      
      this.closeContractModal();
      
      // Optional: Show success notification
      alert('Contract has been accepted successfully!');
    }
  }

  downloadFile() {
    // Implement file download functionality
    console.log('Downloading file for RFQ:', this.rfqId);
  }

  getStatusClass(): string {
    switch (this.rfqDetails.status) {
      case 'Published':
        return 'status-published';
      case 'Draft':
        return 'status-draft';
      case 'Closed':
        return 'status-closed';
      default:
        return 'status-default';
    }
  }

  // Common Table Event Handlers
  onExpenseRowClick(event: { event: Event, rowData: any }) {
    console.log('Expense row clicked:', event.rowData);
  }

  onExpenseLinkClick(event: { rowData: any, column: any }) {
    console.log('Expense link clicked:', event.rowData, event.column);
  }

  onExpenseActionClick(event: { action: string, rowData: any }) {
    console.log('Expense action clicked:', event.action, event.rowData);
  }
}
