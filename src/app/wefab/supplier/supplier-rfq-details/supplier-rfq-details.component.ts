import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
    FormsModule
  ],
  templateUrl: './supplier-rfq-details.component.html',
  styleUrl: './supplier-rfq-details.component.scss'
})
export class SupplierRfqDetailsComponent implements OnInit {
  rfqId: string = '';
  activeTab: 'overview' | 'comment' | 'resolution' = 'overview';
  
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
    console.log('Creating quotation for RFQ:', this.rfqId);
  }

  viewContract() {
    // Implement view contract functionality
    console.log('Viewing contract for RFQ:', this.rfqId);
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
}
