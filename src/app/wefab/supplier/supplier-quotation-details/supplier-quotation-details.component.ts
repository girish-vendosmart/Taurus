import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

export interface QuotationDetails {
  quotationId: string;
  rfqId: string;
  createdOn: string;
  projectName: string;
  country: string;
  lastQuoteDate: string;
  address: string;
  paymentTerms: string;
  totalAmount: number;
  acceptContractTerms: string;
  isAllQueriesResolved: string;
  quoteFrom: {
    company: string;
    email: string;
    phone: string;
  };
  quoteTo: {
    company: string;
    email: string;
    location: string;
  };
}

export interface QuotationItem {
  section: string;
  expenseCategory: string;
  itemNumber: string;
  description: string;
  drawingNumber: string;
  unit: string;
  quantity: number;
  currency: string;
  rate: number;
  totalAmount: number;
  notes: string;
  comment: string;
}

@Component({
  selector: 'app-supplier-quotation-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './supplier-quotation-details.component.html',
  styleUrl: './supplier-quotation-details.component.scss'
})
export class SupplierQuotationDetailsComponent implements OnInit {
  
  quotationDetails: QuotationDetails = {
    quotationId: 'QTN0000001123',
    rfqId: 'RFQ0000001104',
    createdOn: '20 May 2025, 01:10 PM',
    projectName: 'Logitech Office Expansion Project',
    country: 'Kuwait',
    lastQuoteDate: '07 Jan 2025, 03:23 PM',
    address: 'Kuwait City, Kuwait',
    paymentTerms: 'Net 20',
    totalAmount: 3086000,
    acceptContractTerms: 'Accepted',
    isAllQueriesResolved: 'Not Resolved',
    quoteFrom: {
      company: 'Swiss Electric Solutions AG',
      email: 'daniel.roth@mailinator.com',
      phone: '4121765432'
    },
    quoteTo: {
      company: 'Logitech International S.A.',
      email: 'super_admin_alshaya@mailinator.com',
      location: 'Lausanne'
    }
  };

  quotationItems: QuotationItem[] = [
    {
      section: 'Power Distribution',
      expenseCategory: 'Professional Costs',
      itemNumber: '71.2',
      description: 'Expenses related to...',
      drawingNumber: '-',
      unit: 'Pieces',
      quantity: 200,
      currency: 'USD',
      rate: 2000,
      totalAmount: 400000,
      notes: '-',
      comment: '-'
    },
    {
      section: 'others',
      expenseCategory: 'Preliminaries',
      itemNumber: '3.2.4',
      description: 'Covers fencing...',
      drawingNumber: '-',
      unit: 'Pieces',
      quantity: 56,
      currency: 'USD',
      rate: 6000,
      totalAmount: 336000,
      notes: '-',
      comment: '-'
    },
    {
      section: 'Risk & Contingency',
      expenseCategory: 'Contingency',
      itemNumber: '8.2.1',
      description: 'Reserved budget...',
      drawingNumber: '-',
      unit: 'Sqm',
      quantity: 20,
      currency: 'USD',
      rate: 10000,
      totalAmount: 200000,
      notes: '-',
      comment: '-'
    },
    {
      section: 'Other',
      expenseCategory: 'Preliminaries',
      itemNumber: '3.2.3',
      description: 'Project setup...',
      drawingNumber: '-',
      unit: 'Sqm',
      quantity: 9,
      currency: 'USD',
      rate: 14000,
      totalAmount: 126000,
      notes: '-',
      comment: '-'
    },
    {
      section: 'Fire maintaince',
      expenseCategory: 'Fire Services',
      itemNumber: '5.2.2',
      description: 'Provision and...',
      drawingNumber: '-',
      unit: 'Pieces',
      quantity: 56,
      currency: 'USD',
      rate: 28000,
      totalAmount: 1568000,
      notes: '-',
      comment: '-'
    },
    {
      section: 'Water Supply & Drainage',
      expenseCategory: 'HVAC',
      itemNumber: '9.2.1',
      description: 'Heating, ventilation...',
      drawingNumber: '-',
      unit: 'Sqm',
      quantity: 12,
      currency: 'USD',
      rate: 32000,
      totalAmount: 384000,
      notes: '-',
      comment: '-'
    },
    {
      section: 'Temporary Site Facilities',
      expenseCategory: 'IT Equipment',
      itemNumber: '6.2.1',
      description: 'Purchase and...',
      drawingNumber: '-',
      unit: 'Pieces',
      quantity: 2,
      currency: 'USD',
      rate: 36000,
      totalAmount: 72000,
      notes: '-',
      comment: '-'
    }
  ];

  activeTab: string = 'overview';
  searchKeyword: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 7;
  totalItems: number = 7;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get quotation ID from route parameters
    this.route.params.subscribe(params => {
      const quotationId = params['id'];
      if (quotationId) {
        // Update the quotation details with the new ID
        this.quotationDetails.quotationId = quotationId;
        // In a real application, you would fetch the quotation details from a service
        // this.quotationService.getQuotationDetails(quotationId).subscribe(...)
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onBackToRFQs(): void {
    this.router.navigate(['/wefab/supplier/quotation']);
  }

  onSearch(): void {
    // Implement search functionality
  }

  getFilteredItems(): QuotationItem[] {
    if (!this.searchKeyword) {
      return this.quotationItems;
    }
    return this.quotationItems.filter(item => 
      item.description.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
      item.section.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
      item.expenseCategory.toLowerCase().includes(this.searchKeyword.toLowerCase())
    );
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getSubTotal(): number {
    return this.quotationItems.reduce((sum, item) => sum + item.totalAmount, 0);
  }

  getDiscount(): number {
    return 0; // 0% discount
  }

  getTotalAmount(): number {
    return this.getSubTotal() - this.getDiscount();
  }
}
