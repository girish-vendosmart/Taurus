import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonTableComponent, TableConfig, TableColumn, ActionButton } from '../../wefab-shared-component/common-table/common-table.component';
import { CommonService } from '../../shared/common.service';
import { HttpParams } from '@angular/common/http';
import { ActivityTrailComponent, ActivityLogData } from '../../../common-core-component/activity-trail';
import { ConversationTrailComponent } from '../../shared/components/conversation-trail/conversation-trail.component';
import { SplitButtonComponent } from '../../../shared/split-button/split-button.component';

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
  shipping_charges: number;
  grand_total: number;
  tax_applicable: number;
  sgst_cgst_applicable: number;
  igst_applicable: number;
  sgst_rate: number;
  cgst_rate: number;
  igst_rate: number;
  taxable_amount: number;
  sgst_amount: number;
  cgst_amount: number;
  igst_amount: number;
  total_tax_amount: number;
  grand_total_with_tax: number;
  payment_terms: string;
  shipping_terms: string;
  notes: string;
  doctype: string;
  items: QuotationLineItem[];
  attachments: any[];
  quotation_from: string;
  quotation_to: string;
  quotation_from_email_address: string;
  quotation_from_phone_number: string;
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
  shippingCharges: number;
  grandTotal: number;
  taxApplicable: number;
  sgstCgstApplicable: boolean;
  igstApplicable: boolean;
  sgstRate: number;
  cgstRate: number;
  igstRate: number;
  taxableAmount: number;
  sgstAmount: number;
  cgstAmount: number;
  igstAmount: number;
  totalTaxAmount: number;
  grandTotalWithTax: number;
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
    InputTextModule,
    ActivityTrailComponent,
    ConversationTrailComponent,
    SplitButtonComponent
  ],
  templateUrl: './supplier-quotation-details.component.html',
  styleUrl: './supplier-quotation-details.component.scss'
})
export class SupplierQuotationDetailsComponent implements OnInit {

  severityOptions: any[] = [];

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
    shippingCharges: 0,
    grandTotal: 0,
    taxApplicable: 0,
    sgstCgstApplicable: false,
    igstApplicable: false,
    sgstRate: 0,
    cgstRate: 0,
    igstRate: 0,
    taxableAmount: 0,
    sgstAmount: 0,
    cgstAmount: 0,
    igstAmount: 0,
    totalTaxAmount: 0,
    grandTotalWithTax: 0,
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

  activityTrail: ActivityLogData[] = [];
  activityTrailLoading: boolean = false;

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
        isHtml: true,
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
        this.getActionList()
      }
    });
  }

  getActionList() {

    let obj:any = {
      doctype: 'Supplier Quotation',
      name: this.quotationId
    }
    let params = new HttpParams();
    params = params.append('doc', JSON.stringify(obj));
    let endPoint = `/api/method/frappe.model.workflow.get_transitions`;
    this.commonService.getWefabData(endPoint, params).subscribe((res:any) => {
      let updatedActionList = this.modifyActionList(res.message);
      this.severityOptions = [...updatedActionList];
    });
  }

  modifyActionList(actionList: any) {
    let updatedActionList:any = []

    actionList.forEach((action:any) => {
      let obj:any = {}
      obj['label'] = action.action 
      obj['value'] = action.action
      updatedActionList.push(obj)
    })

    return updatedActionList;
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
    console.log('API Tax Data:', {
      sgst_cgst_applicable: apiData.sgst_cgst_applicable,
      igst_applicable: apiData.igst_applicable,
      sgst_rate: apiData.sgst_rate,
      cgst_rate: apiData.cgst_rate,
      igst_rate: apiData.igst_rate,
      sgst_amount: apiData.sgst_amount,
      cgst_amount: apiData.cgst_amount,
      igst_amount: apiData.igst_amount,
      total_amount: apiData.total_amount,
      discount_amount: apiData.discount_amount
    });

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
      shippingCharges: apiData.shipping_charges,
      grandTotal: apiData.grand_total,
      taxApplicable: apiData.tax_applicable,
      sgstCgstApplicable: apiData.sgst_cgst_applicable === 1,
      igstApplicable: apiData.igst_applicable === 1,
      sgstRate: apiData.sgst_rate,
      cgstRate: apiData.cgst_rate,
      igstRate: apiData.igst_rate,
      taxableAmount: apiData.taxable_amount,
      sgstAmount: apiData.sgst_amount,
      cgstAmount: apiData.cgst_amount,
      igstAmount: apiData.igst_amount,
      totalTaxAmount: apiData.total_tax_amount,
      grandTotalWithTax: apiData.grand_total_with_tax,
      paymentTerms: apiData.payment_terms,
      shippingTerms: apiData.shipping_terms,
      notes: apiData.notes,
      supplierId: apiData.supplier_id,
      quoteFrom: {
        company: apiData.quotation_from, // This might need to come from supplier API
        email: apiData.quotation_from_email_address ? apiData.quotation_from_email_address : '----', // This might need to come from supplier API
        phone: apiData.quotation_from_phone_number ? apiData.quotation_from_phone_number : '----' // This might need to come from supplier API
      },
      quoteTo: {
        company: apiData.quotation_to.split('\n')[0],
        email: apiData.quotation_to.split('\n')[1],
        location: apiData.quotation_to.split('\n')[2]
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
    if (tab === 'activity') {
      this.loadActivityTrail();
    }
  }

  onBackToRFQs(): void {
    this.router.navigate(['/wefab/supplier/quotation']);
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    // Handle INR currency specifically
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
    
    // Default formatting for other currencies
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Helper method to get the main currency dynamically from quotation items
  getMainCurrency(): string {
    // First priority: Check if we have quotation items with currencies
    if (this.quotationItems && this.quotationItems.length > 0) {
      // Get all currencies from items
      const currencies = this.quotationItems
        .map(item => item.currency)
        .filter(currency => currency && currency.trim() !== '');
      
      if (currencies.length > 0) {
        // If all items have the same currency, use it
        const uniqueCurrencies = [...new Set(currencies)];
        
        if (uniqueCurrencies.length === 1) {
          return uniqueCurrencies[0];
        }
        
        // If multiple currencies, find the most common one
        if (uniqueCurrencies.length > 1) {
          const currencyCount = currencies.reduce((acc: {[key: string]: number}, currency) => {
            acc[currency] = (acc[currency] || 0) + 1;
            return acc;
          }, {});
          
          const mostCommonCurrency = Object.keys(currencyCount).reduce((a, b) => 
            currencyCount[a] > currencyCount[b] ? a : b
          );
          
          console.log('Multiple currencies found, using most common:', mostCommonCurrency);
          return mostCommonCurrency;
        }
      }
    }
    
    // Second priority: Check if there's a currency from the API response (quotation level)
    if (this.quotationDetails && this.quotationItems.length > 0) {
      const firstItemCurrency = this.quotationItems[0].currency;
      if (firstItemCurrency && firstItemCurrency.trim() !== '') {
        return firstItemCurrency;
      }
    }
    
    // Third priority: Default based on quotation data context
    // Check if amounts suggest INR (typically larger numbers) or USD
    const totalAmount = this.quotationDetails?.totalAmount || 0;
    if (totalAmount > 100000) {
      return 'INR'; // Likely INR if large amounts
    }
    
    // Final fallback
    return 'USD';
  }

  // Get currency specifically for a particular context (items vs totals)
  getItemsCurrency(): string {
    if (this.quotationItems && this.quotationItems.length > 0) {
      return this.quotationItems[0].currency || 'USD';
    }
    return 'USD';
  }

  // Get currency for summary section (could be different logic if needed)
  getSummaryCurrency(): string {
    const currency = this.getMainCurrency();
    console.log('Summary Currency Selected:', currency);
    return currency;
  }

  // Calculate total tax amount based on applicable taxes
  getTotalTaxAmount(): number {
    let totalTax = 0;
    
    // If API provides tax amounts, use them
    if (this.quotationDetails.sgstCgstApplicable) {
      const sgstAmount = this.quotationDetails.sgstAmount || 0;
      const cgstAmount = this.quotationDetails.cgstAmount || 0;
      
      // If API amounts are 0, calculate them based on rates
      if (sgstAmount === 0 && cgstAmount === 0 && (this.quotationDetails.sgstRate > 0 || this.quotationDetails.cgstRate > 0)) {
        const taxableAmount = this.getTaxableAmount();
        totalTax += (taxableAmount * (this.quotationDetails.sgstRate || 0) / 100);
        totalTax += (taxableAmount * (this.quotationDetails.cgstRate || 0) / 100);
      } else {
        totalTax += sgstAmount + cgstAmount;
      }
    }
    
    if (this.quotationDetails.igstApplicable) {
      const igstAmount = this.quotationDetails.igstAmount || 0;
      
      // If API amount is 0, calculate it based on rate
      if (igstAmount === 0 && this.quotationDetails.igstRate > 0) {
        const taxableAmount = this.getTaxableAmount();
        totalTax += (taxableAmount * this.quotationDetails.igstRate / 100);
      } else {
        totalTax += igstAmount;
      }
    }
    
    return totalTax;
  }

  // Calculate taxable amount (Sub Total - Discount)
  getTaxableAmount(): number {
    const subTotal = this.quotationDetails.totalAmount || 0;
    const discountAmount = this.quotationDetails.discountAmount || 0;
    return subTotal - discountAmount;
  }

  // Calculate SGST amount
  getSGSTAmount(): number {
    if (!this.quotationDetails.sgstCgstApplicable) return 0;
    
    const apiAmount = this.quotationDetails.sgstAmount || 0;
    if (apiAmount > 0) return apiAmount;
    
    // Calculate based on rate if API amount is 0
    if (this.quotationDetails.sgstRate > 0) {
      const taxableAmount = this.getTaxableAmount();
      const calculatedAmount = taxableAmount * this.quotationDetails.sgstRate / 100;
      console.log('SGST Calculation:', {
        taxableAmount,
        sgstRate: this.quotationDetails.sgstRate,
        calculatedAmount
      });
      return calculatedAmount;
    }
    
    return 0;
  }

  // Calculate CGST amount
  getCGSTAmount(): number {
    if (!this.quotationDetails.sgstCgstApplicable) return 0;
    
    const apiAmount = this.quotationDetails.cgstAmount || 0;
    if (apiAmount > 0) return apiAmount;
    
    // Calculate based on rate if API amount is 0
    if (this.quotationDetails.cgstRate > 0) {
      const taxableAmount = this.getTaxableAmount();
      const calculatedAmount = taxableAmount * this.quotationDetails.cgstRate / 100;
      console.log('CGST Calculation:', {
        taxableAmount,
        cgstRate: this.quotationDetails.cgstRate,
        calculatedAmount
      });
      return calculatedAmount;
    }
    
    return 0;
  }

  // Calculate IGST amount
  getIGSTAmount(): number {
    if (!this.quotationDetails.igstApplicable) return 0;
    
    const apiAmount = this.quotationDetails.igstAmount || 0;
    if (apiAmount > 0) return apiAmount;
    
    // Calculate based on rate if API amount is 0
    if (this.quotationDetails.igstRate > 0) {
      const taxableAmount = this.getTaxableAmount();
      return taxableAmount * this.quotationDetails.igstRate / 100;
    }
    
    return 0;
  }

  // Calculate grand total based on applicable taxes and shipping charges
  getGrandTotal(): number {
    const subTotal = this.quotationDetails.totalAmount || 0;
    const discountAmount = this.quotationDetails.discountAmount || 0;
    const shippingCharges = this.quotationDetails.shippingCharges || 0;
    const taxAmount = this.getTotalTaxAmount();
    
    // Grand Total = Sub Total - Discount + Tax + Shipping Charges
    return subTotal - discountAmount + taxAmount + shippingCharges;
  }

  // Check if any tax is applicable
  isTaxApplicable(): boolean {
    return this.quotationDetails.sgstCgstApplicable || this.quotationDetails.igstApplicable;
  }

  // Table event handlers
  onRowClick(event: any) {
    console.log('Row clicked:', event);
  }

  onLinkClick(event: any) {
    console.log('Link clicked:', event);
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

    // Generate tax rows based on applicability
    let taxRows = '';
    if (this.isTaxApplicable()) {
      if (this.quotationDetails.sgstCgstApplicable) {
        taxRows += `
          <div class="summary-row">
            <span class="summary-label">SGST (${this.quotationDetails.sgstRate}%):</span>
            <span class="summary-value">${this.formatCurrency(this.getSGSTAmount(), this.getSummaryCurrency())}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">CGST (${this.quotationDetails.cgstRate}%):</span>
            <span class="summary-value">${this.formatCurrency(this.getCGSTAmount(), this.getSummaryCurrency())}</span>
          </div>
        `;
      }
      if (this.quotationDetails.igstApplicable) {
        taxRows += `
          <div class="summary-row">
            <span class="summary-label">IGST (${this.quotationDetails.igstRate}%):</span>
            <span class="summary-value">${this.formatCurrency(this.getIGSTAmount(), this.getSummaryCurrency())}</span>
          </div>
        `;
      }
      taxRows += `
        <div class="summary-row">
          <span class="summary-label">Total Tax:</span>
          <span class="summary-value">${this.formatCurrency(this.getTotalTaxAmount(), this.getSummaryCurrency())}</span>
        </div>
      `;
    }

    // Add shipping charges if applicable
    let shippingRow = '';
    if (this.quotationDetails.shippingCharges > 0) {
      shippingRow = `
        <div class="summary-row">
          <span class="summary-label">Shipping Charges:</span>
          <span class="summary-value">${this.formatCurrency(this.quotationDetails.shippingCharges, this.getSummaryCurrency())}</span>
        </div>
      `;
    }

    const finalTotal = this.getGrandTotal();

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
            <h3>Quote From :</h3>
            <div class="company-name">${this.quotationDetails.quoteFrom.company}</div>
            <div class="contact-info">${this.quotationDetails.quoteFrom.email}</div>
            <div class="contact-info">${this.quotationDetails.quoteFrom.phone}</div>
          </div>
          
          <div class="quote-section">
            <h3>Quote To :</h3>
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
            <span class="summary-value">${this.formatCurrency(this.quotationDetails.totalAmount, this.getSummaryCurrency())}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Discount (${this.quotationDetails.discountPercentage}%):</span>
            <span class="summary-value">${this.formatCurrency(this.quotationDetails.discountAmount, this.getSummaryCurrency())}</span>
          </div>
          ${taxRows}
          ${shippingRow}
          <div class="summary-row total-row">
            <span class="summary-label">Grand Total:</span>
            <span class="summary-value">${this.formatCurrency(finalTotal, this.getSummaryCurrency())}</span>
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

  // Get taxable amount for display
  getDisplayTaxableAmount(): number {
    return this.getTaxableAmount();
  }
  
  private loadActivityTrail(): void {
    this.activityTrailLoading = true;
    this.commonService.getData('/api/method/proq_buyer.api.core.versioning.get_new_versions_trail?doctype=pq_rfq&docname=' + 'RFQ0000000050')
      .subscribe({
        next: (response: any) => {
          this.activityTrail = response.data || [];
          this.activityTrailLoading = false;
        },
        error: () => {
          this.activityTrail = [];
          this.activityTrailLoading = false;
        }
      });
  }

  onActionClick(event: any) {
    console.log('Action triggered:', event);
    
    if (!event.option) return;
    
    // Get the action value from the option
    const actionValue = event.option.value;
    console.log('Action value:', actionValue);

    // Update quotation status based on the action
    this.updateQuotationStatus(actionValue);
  }

  private updateQuotationStatus(status: string) {
    console.log('Updating quotation status to:', status);
    const action = {
      action: status,
      doc: {
        doctype: 'Supplier Quotation',
        name: this.quotationId
      }
    };

    this.commonService.postWefabData('/api/method/frappe.model.workflow.apply_workflow', action).subscribe({
      next: (res: any) => {
        console.log(`Quotation ${status} successfully:`, res);
        // Refresh quotation details
        this.getQuotationDetails(this.quotationId);
        // Refresh action list after status change
        this.getActionList();
      },
      error: (error) => {
        console.error(`Error updating quotation status to ${status}:`, error);
        // Handle error (show error message to user)
      }
    });
  }
}
