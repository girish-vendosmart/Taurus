import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonTableComponent, TableConfig, TableColumn, ActionButton } from '../../wefab-shared-component/common-table/common-table.component';
import { CommonService } from '../../shared/common.service';
import { HttpParams } from '@angular/common/http';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

// API Response Interfaces
export interface SupplierQuotationApiResponse {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: number;
  idx: number;
  workflow_state: string;
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
  doctype: string;
  items: QuotationLineItem[];
  attachments: any[];
}

export interface QuotationLineItem {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: number;
  idx: number;
  item_code: string;
  item_description: string;
  quantity: number;
  unit: string;
  currency_code: string;
  unit_price: number;
  total_price: number;
  comments: string;
  discount_type: string;
  discount: number;
  parent: string;
  parentfield: string;
  parenttype: string;
  doctype: string;
}

// Component Data Interfaces
export interface QuotationDetails {
  quotationId: string;
  rfqId: string;
  createdOn: string;
  lastModified: string;
  workflowState: string;
  estimatedDuration: string;
  validity: string;
  deliveryAddress: string;
  totalAmount: number;
  discountPercentage: number;
  discountAmount: number;
  grandTotal: number;
  paymentTerms: string;
  shippingTerms: string;
  notes: string;
  supplierId: string;
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
  itemCode: string;
  description: string;
  quantity: number;
  unit: string;
  currency: string;
  unitPrice: number;
  totalPrice: number;
  comments: string;
  discount: number;
  discountType: string;
}

@Component({
  selector: 'app-supplier-quotation-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CommonTableComponent,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './supplier-quotation-details.component.html',
  styleUrl: './supplier-quotation-details.component.scss'
})
export class SupplierQuotationDetailsComponent implements OnInit {

  // Component data - initialized as empty, will be populated from API
  quotationDetails: QuotationDetails = {
    quotationId: '',
    rfqId: '',
    createdOn: '',
    lastModified: '',
    workflowState: '',
    estimatedDuration: '',
    validity: '',
    deliveryAddress: '',
    totalAmount: 0,
    discountPercentage: 0,
    discountAmount: 0,
    grandTotal: 0,
    paymentTerms: '',
    shippingTerms: '',
    notes: '',
    supplierId: '',
    quoteFrom: {
      company: '',
      email: '',
      phone: ''
    },
    quoteTo: {
      company: '',
      email: '',
      location: ''
    }
  };

  quotationItems: QuotationItem[] = [];

  activeTab: string = 'overview';
  currentPage: number = 1;
  itemsPerPage: number = 7;
  totalItems: number = 0;
  loading: boolean = false;

  // Table configuration
  tableConfig: TableConfig = {
    columns: [
      {
        field: 'itemCode',
        header: 'Item Code',
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
        field: 'quantity',
        header: 'Quantity',
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
        field: 'currency',
        header: 'Currency',
        sortable: true,
        filterable: true,
      },
      {
        field: 'unitPrice',
        header: 'Unit Price',
        sortable: true,
        filterable: true,
      },
      {
        field: 'totalPrice',
        header: 'Total Price',
        sortable: true,
        filterable: true,
      },
      {
        field: 'comments',
        header: 'Comments',
        sortable: true,
        filterable: true,
      },
    ],
    enableSearch: true,
    enableSort: true,
    enableFilter: true,
    enablePagination: true,
    pageSize: 7,
    showActions: false
  };
  quotationId: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    // Get quotation ID from route parameters
    this.route.params.subscribe(params => {
      const quotationId = params['id'];
      this.quotationId = quotationId;
      if (quotationId) {
        this.getQuotationDetails(quotationId);
      }
    });
  }

  getQuotationDetails(quotationId: string) {
    this.loading = true;
    let endPoint = `/api/resource/Supplier Quotation/${quotationId}`;
    
    this.commonService.getWefabData(endPoint).subscribe({
      next: (res: any) => {
        console.log('Quotation Details API Response:', res);
        if (res && res.data) {
          this.mapApiResponseToComponent(res.data);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching quotation details:', error);
        this.loading = false;
        // You might want to show an error message to the user
      }
    });
  }

  // Map API response to component data structure
  mapApiResponseToComponent(apiData: SupplierQuotationApiResponse) {
    // Map main quotation details
    this.quotationDetails = {
      quotationId: apiData.name,
      rfqId: apiData.rfq_id,
      createdOn: this.formatApiDate(apiData.creation),
      lastModified: this.formatApiDate(apiData.modified),
      workflowState: apiData.workflow_state,
      estimatedDuration: apiData.estimated_completion_duration,
      validity: this.formatApiDate(apiData.validity),
      deliveryAddress: apiData.delivery_address,
      totalAmount: apiData.total_amount,
      discountPercentage: apiData.discount_percentage,
      discountAmount: apiData.discount_amount,
      grandTotal: apiData.grand_total,
      paymentTerms: apiData.payment_terms,
      shippingTerms: apiData.shipping_terms,
      notes: apiData.notes,
      supplierId: apiData.supplier_id,
      quoteFrom: {
        company: 'Swiss Electric Solutions AG', // This might need to come from supplier API
        email: 'daniel.roth@mailinator.com', // This might need to come from supplier API
        phone: '4121765432' // This might need to come from supplier API
      },
      quoteTo: {
        company: 'Logitech International S.A.', // This might need to come from customer/RFQ API
        email: 'super_admin_alshaya@mailinator.com', // This might need to come from customer/RFQ API
        location: 'Lausanne' // This might need to come from customer/RFQ API
      }
    };

    // Map quotation items
    this.quotationItems = apiData.items.map(item => ({
      itemCode: item.item_code,
      description: item.item_description,
      quantity: item.quantity,
      unit: item.unit,
      currency: item.currency_code,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      comments: item.comments,
      discount: item.discount,
      discountType: item.discount_type
    }));

    this.totalItems = this.quotationItems.length;
  }

  // Helper method to format API date
  formatApiDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString; // Return original string if parsing fails
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onBackToRFQs(): void {
    this.router.navigate(['/wefab/supplier/quotation']);
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Helper method to get the main currency from quotation items
  getMainCurrency(): string {
    return this.quotationItems.length > 0 ? this.quotationItems[0].currency : 'USD';
  }

  // Table event handlers
  onRowClick(event: any) {
    console.log('Row clicked:', event);
  }

  onLinkClick(event: any) {
    console.log('Link clicked:', event);
  }

  onActionClick(event: any) {
    console.log('Action clicked:', event);
  }

  editQuotation() {
    // Navigate to create quotation page with quotationId and edit mode as query parameters
    this.router.navigate(['/wefab/supplier/create-quotation'], {
      queryParams: { 
        quotationId: this.quotationDetails.quotationId,
        mode: 'edit'
      }
    });
  }

  printQuotation() {
    const printContent = this.generatePrintContent();
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  }

  private generatePrintContent(): string {
    const itemsTableRows = this.quotationItems.map(item => `
      <tr>
        <td>${item.itemCode}</td>
        <td>${item.description}</td>
        <td>${item.quantity}</td>
        <td>${item.unit}</td>
        <td>${item.currency}</td>
        <td>${this.formatCurrency(item.unitPrice, item.currency)}</td>
        <td>${this.formatCurrency(item.totalPrice, item.currency)}</td>
        <td>${item.comments}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quotation - ${this.quotationDetails.quotationId}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            font-size: 12px;
            color: #333;
          }
          .print-header {
            border-bottom: 2px solid #1a3a5f;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .quote-parties {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 20px;
          }
          .quote-section h3 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #1a3a5f;
          }
          .quote-section .company-name {
            font-weight: bold;
            margin-bottom: 5px;
          }
          .quote-section .contact-info {
            color: #666;
            margin-bottom: 3px;
          }
          .items-section h3 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #1a3a5f;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 11px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #1a3a5f;
          }
          .summary-section {
            margin-left: auto;
            width: 300px;
            border-top: 2px solid #ddd;
            padding-top: 10px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
          }
          .summary-row.total-row {
            border-top: 2px solid #ddd;
            padding-top: 10px;
            margin-top: 5px;
            font-weight: bold;
            font-size: 14px;
          }
          .summary-label {
            color: #666;
          }
          .summary-value {
            font-weight: bold;
          }
          .total-row .summary-value {
            color: #1a3a5f;
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>Quotation ${this.quotationDetails.quotationId}</h1>
        </div>

        <div class="quote-parties">
          <div class="quote-section">
            <h3>Quote From :-</h3>
            <div class="company-name">${this.quotationDetails.quoteFrom.company}</div>
            <div class="contact-info">${this.quotationDetails.quoteFrom.email}</div>
            <div class="contact-info">${this.quotationDetails.quoteFrom.phone}</div>
          </div>
          
          <div class="quote-section">
            <h3>Quote To :-</h3>
            <div class="company-name">${this.quotationDetails.quoteTo.company}</div>
            <div class="contact-info">${this.quotationDetails.quoteTo.email}</div>
            <div class="contact-info">${this.quotationDetails.quoteTo.location}</div>
          </div>
        </div>

        <div class="items-section">
          <h3>Items (${this.totalItems})</h3>
          <table>
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Currency</th>
                <th>Unit Price</th>
                <th>Total Price</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              ${itemsTableRows}
            </tbody>
          </table>
        </div>

        <div class="summary-section">
          <div class="summary-row">
            <span class="summary-label">Sub Total:</span>
            <span class="summary-value">${this.formatCurrency(this.quotationDetails.totalAmount, this.getMainCurrency())}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Discount:</span>
            <span class="summary-value">${this.formatCurrency(this.quotationDetails.discountAmount, this.getMainCurrency())}</span>
          </div>
          <div class="summary-row total-row">
            <span class="summary-label">Grand Total:</span>
            <span class="summary-value">${this.formatCurrency(this.quotationDetails.grandTotal, this.getMainCurrency())}</span>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Get formatted table data for display
  get formattedQuotationItems() {
    return this.quotationItems.map(item => ({
      ...item,
      unitPrice: this.formatCurrency(item.unitPrice, item.currency),
      totalPrice: this.formatCurrency(item.totalPrice, item.currency)
    }));
  }

  sendQuotation() {
    let params = new HttpParams()
    let action = {
      action: 'Submit',
      doc: {
        doctype: 'Supplier Quotation',
        name: this.quotationId
      } 
    }



    this.commonService.postWefabData(`/api/method/frappe.model.workflow.apply_workflow`, action).subscribe((res: any) => {
      console.log('Quotation sent successfully:', res);
    })
  }
}
