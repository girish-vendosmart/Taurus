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
import { SweetAlertService } from '../../shared/sweet-alert.service';

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
  quotation_name: string;
  rfq_id: string;
  supplier_id: string;
  quotation_from: string;
  quotation_to: string;
  estimated_completion_duration: string;
  validity: string;
  sub_total: number;
  discount_type: string;
  discount: number;
  discount_amount: number;
  total_tax_amount: number;
  shipping_charges: number;
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
  tax_type: string;
  tax_amount: number;
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
  tax_type: string;
  tax_amount: number;
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
  rawQuotationItems: QuotationLineItem[] = []; // Raw API data for table

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
        field: 'item_code',
        header: 'Item Code',
        sortable: true,
        filterable: true,
      },
      {
        field: 'item_description',
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
        field: 'unit_price_formatted',
        header: 'Unit Price',
        sortable: true,
        filterable: true,
      },
      {
        field: 'tax_type',
        header: 'Tax Type',
        sortable: true,
        filterable: true,
      },
      {
        field: 'tax_amount_formatted',
        header: 'Tax Amount',
        sortable: true,
        filterable: true,
      },
      {
        field: 'total_price_formatted',
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
    showActions: false,
  };
  quotationId: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private sweetAlert: SweetAlertService
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
    console.log('API Data:', apiData);

    // Map main quotation details
    this.quotationDetails = {
      quotationId: apiData.name,
      rfqId: apiData.rfq_id,
      createdOn: this.formatApiDate(apiData.creation),
      lastModified: this.formatApiDate(apiData.modified),
      workflowState: apiData.workflow_state,
      estimatedDuration: apiData.estimated_completion_duration,
      validity: this.formatApiDate(apiData.validity),
      deliveryAddress: '', // Not available in new API structure
      totalAmount: 0,
      discountPercentage: apiData.discount,
      discountAmount: apiData.discount_amount,
      shippingCharges: apiData.shipping_charges,
      grandTotal: apiData.grand_total,
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
      totalTaxAmount: apiData.total_tax_amount,
      grandTotalWithTax: apiData.grand_total,
      paymentTerms: apiData.payment_terms,
      shippingTerms: apiData.shipping_terms,
      notes: apiData.notes,
      supplierId: apiData.supplier_id,
      quoteFrom: {
        company: apiData.quotation_from,
        email: '----', // Not available in new API structure
        phone: '----' // Not available in new API structure
      },
      quoteTo: {
        company: apiData.quotation_to.split('\n')[0],
        email: apiData.quotation_to.split('\n')[1] || '----',
        location: apiData.quotation_to.split('\n')[2] || '----'
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
      discountType: item.discount_type,
      tax_type: item.tax_type,
      tax_amount: item.tax_amount
    }));

    this.rawQuotationItems = apiData.items.map(item => ({
      ...item,
      unit_price_formatted: item.unit_price.toLocaleString('en-US'),
      total_price_formatted: item.total_price.toLocaleString('en-US'),
      tax_amount_formatted: item.tax_amount.toLocaleString('en-US')
    }));

    // Calculate sub total from items since API returns 0
    const calculatedSubTotal = apiData.items.reduce((total, item) => total + item.total_price, 0);
    this.quotationDetails.totalAmount = calculatedSubTotal;
    
    this.totalItems = this.quotationItems.length;
  }

  // Helper method to format API date
  formatApiDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      // Use the same formatting logic as DateFormatPipe formatMedium method
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'long' });
      const year = date.getFullYear();
      
      let hours = date.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
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
    // Use direct value from API
    return this.quotationDetails.totalTaxAmount;
  }

  // Calculate taxable amount (Sub Total - Discount)
  getTaxableAmount(): number {
    const subTotal = this.quotationDetails.totalAmount || 0;
    const discountAmount = this.quotationDetails.discountAmount || 0;
    return subTotal - discountAmount;
  }

  // Calculate SGST amount - not applicable in new API structure
  getSGSTAmount(): number {
    return 0;
  }

  // Calculate CGST amount - not applicable in new API structure
  getCGSTAmount(): number {
    return 0;
  }

  // Calculate IGST amount - not applicable in new API structure
  getIGSTAmount(): number {
    return 0;
  }

  // Calculate grand total based on applicable taxes and shipping charges
  getGrandTotal(): number {
    // Use direct value from API
    return this.quotationDetails.grandTotal;
  }

  // Check if any tax is applicable
  isTaxApplicable(): boolean {
    return this.quotationDetails.totalTaxAmount > 0;
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
        <td>${item.tax_type}</td>
        <td>${this.formatCurrency(item.tax_amount, this.getSummaryCurrency())}</td>
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
                <th>Tax Type</th>
                <th>Tax Amount</th>
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

  // Calculate total quantity from raw quotation items
  getTotalQuantity(): number {
    return this.rawQuotationItems.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      return total + quantity;
    }, 0);
  }
  
  private loadActivityTrail(): void {
    this.activityTrailLoading = true;
    this.commonService.getData('/api/method/wefab.wefab.api.common.engine.trail.acitivty.get_new_versions_trail?doctype=pq_rfq&docname=' + 'RFQ0000000050')
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
    this.sweetAlert.confirm(
      '',
      `Are you sure you want to ${event.option.label} this quotation?`,
      'question',
      'Yes, ' + event.option.label,
      'Cancel'
    ).then((result: any) => {
      if (result.isConfirmed) {
        this.updateQuotationStatus(actionValue);
      }
    });
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
        this.sweetAlert.success(`Quotation ${status} successfully`);
        console.log(`Quotation ${status} successfully:`, res);
        // Refresh quotation details
        this.getQuotationDetails(this.quotationId);
        // Refresh action list after status change
        this.getActionList();
      },
      error: (error) => {
        this.sweetAlert.error(`Error updating quotation status to ${status}:`, error);
        console.error(`Error updating quotation status to ${status}:`, error);
        // Handle error (show error message to user)
      }
    });
  }

  /**
   * Check if there are any actions available for the split button
   * @returns boolean indicating if actions are available
   */
  hasAvailableActions(): boolean {
    return this.severityOptions && this.severityOptions.length > 0;
  }
}
