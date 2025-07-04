import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonTableComponent, TableConfig, TableColumn, ActionButton } from '../../../../shared/components/common-table/common-table.component';
import { CommonService } from '../../../../shared/services/common.service';
import { BadgeService } from '../../../../shared/services/badge.service';
import { HttpParams } from '@angular/common/http';
import { ActivityTrailComponent, ActivityLogData } from '../../../../shared/components/activity-trail/activity-trail.component';
import { ConversationTrailComponent } from '../../../../shared/components/conversation-trail/conversation-trail.component';
import { SplitButtonComponent } from '../../../../shared/components/split-button/split-button.component';
import { SweetAlertService } from '../../../../shared/services/sweet-alert.service';

import { ConfigurableButtonComponent } from '../../../../shared/components/configurable-button/configurable-button.component';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

// API Response Interfaces
export interface CustomerQuotationApiResponse {
  name: string;
  owner: string;
  project_name: string;
  delivery_date: string;
  delivery_location: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: number;
  idx: number;
  workflow_state: string;
  status: string;
  quotation_name: string;
  rfq_id: string;
  supplier_id: string;
  currency_code: string;
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
  total_miscellaneous: number;
  total_tooling: number;
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
  miscellaneous: number;
  tooling: number;
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
  status: string;
  estimatedDuration: string;
  validity: string;
  deliveryAddress: string;
  projectName: string;
  deliveryDate: string;
  deliveryLocation: string;
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
  sub_total: number;
  quotation_name: string;
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
  totalMiscellaneous: number;
  totalTooling: number;
  quoteFrom: {
    company: string;
    address: string;
    email: string;
    phone: string;
  };
  quoteTo: {
    company: string;
    address: string;
    email: string;
    phone: string;
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
  miscellaneous: number;
  tooling: number;
}

export interface QuotationAttachment {
  name: string;
  file: string;
  file_name: string;
  file_url: string;
  file_type: string;
  category: string;
  uploaded_on: string;
}

@Component({
  selector: 'app-quotation-details',
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
    SplitButtonComponent,
    ConfigurableButtonComponent
  ],
  templateUrl: './quotation-details.component.html',
  styleUrl: './quotation-details.component.scss'
})
export class QuotationDetailsComponent implements OnInit {

  severityOptions: any[] = [];

  // Component data - initialized as empty, will be populated from API
  quotationDetails: QuotationDetails = {
    quotationId: '',
    rfqId: '',
    createdOn: '',
    lastModified: '',
    workflowState: '',
    status: '',
    estimatedDuration: '',
    validity: '',
    deliveryAddress: '',
    projectName: '',
    deliveryDate: '',
    deliveryLocation: '',
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
    quotation_name: '',
    sub_total: 0,
    sgstAmount: 0,
    cgstAmount: 0,
    igstAmount: 0,
    totalTaxAmount: 0,
    grandTotalWithTax: 0,
    paymentTerms: '',
    shippingTerms: '',
    notes: '',
    supplierId: '',
    totalMiscellaneous: 0,
    totalTooling: 0,
    quoteFrom: {
      company: '',
      address: '',
      email: '',
      phone: ''
    },
    quoteTo: {
      company: '',
      address: '',
      email: '',
      phone: ''
    }
  };

  quotationItems: QuotationItem[] = [];
  rawQuotationItems: QuotationLineItem[] = []; // Raw API data for table
  currencyCode: string = 'USD'; // Default currency code

  quotationAttachments: QuotationAttachment[] = [];

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
        field: 'miscellaneous_formatted',
        header: 'Miscellaneous',
        sortable: true,
        filterable: true,
      },
      {
        field: 'tooling_formatted',
        header: 'Tooling',
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
    enableColumnResize: true,
  };
  quotationId: any;

  discountType: string = '';

  // Button configurations
  printButtonConfig: any = {
    size: 'medium',
    severity: 'secondary',
    label: 'Print',
    icon: 'bi bi-printer',
    outlined: true
  };

  awardButtonConfig: any = {
    size: 'medium',
    severity: 'success',
    label: 'Award',
    icon: 'bi bi-award',
    outlined: false
  };

  cancelButtonConfig: any = {
    size: 'medium',
    severity: 'danger',
    label: 'Cancel',
    icon: 'bi bi-x-lg',
    outlined: false
  };

  constructor(
    private commonService: CommonService,
    private badgeService: BadgeService,
    private router: Router,
    private route: ActivatedRoute,
    private sweetAlertService: SweetAlertService
  ) {}

  ngOnInit(): void {
    // Get quotation ID from route parameters
    this.route.params.subscribe(params => {
      const quotationId = params['id'];
      this.quotationId = quotationId || 'QUO-2024-001847';
      
      // Initialize with dummy data for demo purposes
      // this.initializeDummyData();
      
      // Uncomment these lines when actual API is available
      if (quotationId) {
        this.accessFirebaseTrigger('Wefab Quotation', quotationId)
        this.getActionList()
      }
    });
  }

  // Action List
  getActionList() {
    let obj:any = {
      doctype: 'Wefab Quotation',
      name: this.quotationId
    }
    let params = new HttpParams();
    params = params.append('doc', JSON.stringify(obj));
    let endPoint = `/api/method/frappe.model.workflow.get_transitions`;
    this.commonService.getWefabData(endPoint, params).subscribe((res:any) => {
      console.log('Action List Response:', res);
      if (res && res.message) {
        let updatedActionList = this.modifyActionList(res.message);
        this.severityOptions = [...updatedActionList];
      }
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
  // Firebase trigger access method
  accessFirebaseTrigger(docType: string, docName: string) {
    const payload = {
      doctype: docType,
      docname: docName
    };

    this.commonService.postWefabData('/api/method/wefab.wefab.utils.web_service.access_document', payload).subscribe({
      next: (res: any) => {
        console.log('Firebase trigger response:', res);
        if (res && res.message && res.message.success) {
          // Now fetch the actual quotation details
          this.getQuotationDetails(docName);
          this.getActivityTrail(docType, docName);
        }
      },
      error: (error) => {
        console.error('Error accessing firebase trigger:', error);
        // Try to fetch details anyway
        this.getQuotationDetails(docName);
        this.getActivityTrail(docType, docName);
      }
    });
  }

  getQuotationDetails(quotationId: string) {
    this.loading = true;
    let endPoint = `/api/resource/Wefab Quotation/${quotationId}`;
    
    this.commonService.getData(endPoint).subscribe({
      next: (res: any) => {
        console.log('Quotation Details API Response:', res);
        if (res && res.data) {
          this.mapApiResponseToComponent(res.data);
        }
        this.quotationAttachments = (res.data.attachments || []).map((attachment: any): QuotationAttachment => ({
          name: attachment.file_name || attachment.name,
          file: attachment.file || '----',
          file_name: attachment.file_name || '----',
          file_url: attachment.file_url || '----',
          file_type: attachment.file_type || '----',
          category: attachment.category || '----',
          uploaded_on: attachment.creation || new Date().toISOString()
        }));
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
  mapApiResponseToComponent(apiData: CustomerQuotationApiResponse) {
    console.log('API Data:', apiData);

    // Calculate sub total from items since API might return 0
    const calculatedSubTotal = apiData.items.reduce((total, item) => total + item.total_price, 0);

    // Extract currency code from first item or default to USD
    this.currencyCode = apiData.currency_code;

    // Map main quotation details
    this.quotationDetails = {
      quotationId: apiData.name,
      rfqId: apiData.rfq_id,
      createdOn: this.formatApiDate(apiData.creation),
      lastModified: this.formatApiDate(apiData.modified),
      workflowState: apiData.status,
      status: apiData.status,
      projectName: apiData.project_name || '----',
      deliveryDate: apiData.delivery_date || '----',
      deliveryLocation: apiData.delivery_location || '----',
      estimatedDuration: apiData.estimated_completion_duration,
      validity: this.formatApiDate(apiData.validity),
      deliveryAddress: '', // Not available in new API structure
      totalAmount: calculatedSubTotal, // Use calculated value
      discountPercentage: apiData.discount_type === 'Percentage' ? apiData.discount_amount : apiData.discount,
      discountAmount: this.calculateDiscountAmount(apiData.sub_total, apiData.discount_type, apiData.discount_amount),
      
      shippingCharges: apiData.shipping_charges,
      grandTotal: apiData.grand_total,
      taxApplicable: 0,
      sgstCgstApplicable: false,
      quotation_name: apiData.quotation_name,
      igstApplicable: false,
      sgstRate: 0,
      cgstRate: 0,
      sub_total: apiData.sub_total,
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
      totalMiscellaneous: apiData.total_miscellaneous,
      totalTooling: apiData.total_tooling,
      quoteFrom: {
        company: apiData?.quotation_from?.split('\n')[0] || '----',
        address: apiData?.quotation_from?.split('\n')[1] || '----',
        email: apiData?.quotation_from?.split('\n')[2] || '----',
        phone: apiData?.quotation_from?.split('\n')[3] || '----'
      },
      quoteTo: {
        company: apiData?.quotation_to?.split('\n')[0] || '----',
        address: apiData?.quotation_to?.split('\n')[1] || '----',
        email: apiData?.quotation_to?.split('\n')[2] || '----',
        phone: apiData?.quotation_to?.split('\n')[3] || '----'
      }
    };

    // Store discount type for reference
    this.discountType = apiData.discount_type;

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
      tax_amount: item.tax_amount,
      miscellaneous: item.miscellaneous,
      tooling: item.tooling
    }));

    this.rawQuotationItems = apiData.items.map(item => ({
      ...item,
      unit_price_formatted: this.getFormattedCurrencyAmount(item.unit_price, item.currency_code),
      total_price_formatted: this.getFormattedCurrencyAmount(item.total_price, item.currency_code),
      tax_amount_formatted: this.getFormattedCurrencyAmount(item.tax_amount, item.currency_code),
      miscellaneous_formatted: this.getFormattedCurrencyAmount(item.miscellaneous || 0, item.currency_code),
      tooling_formatted: this.getFormattedCurrencyAmount(item.tooling || 0, item.currency_code)
    }));
    
    this.totalItems = this.quotationItems.length;
  }

  // Helper method to calculate discount amount
  calculateDiscountAmount(subTotal: number, discountType: string, discountValue: number): number {
    if (!discountType || !discountValue) return 0;
    
    if (discountType === 'Percentage') {
      return (subTotal * discountValue) / 100;
    } else {
      return discountValue;
    }
  }

  // Activity trail methods
  getActivityTrail(doctype: string, docname: string) {
    this.activityTrailLoading = true;
    let endpoint = `/api/method/wefab.wefab.utils.web_service.get_activity_logs?doctype=${doctype}&docname=${docname}`;

    this.commonService.getWefabData(endpoint).subscribe({
      next: (res: any) => {
        console.log('Activity Trail Response:', res);
        if (res && res.message) {
          this.activityTrail = res.message.map((activity: any) => ({
            timestamp: this.formatApiDate(activity.creation),
            action: activity.title || activity.subject,
            user: activity.owner,
            description: activity.content,
            type: this.getActivityType(activity.status)
          }));
        }
        this.activityTrailLoading = false;
      },
      error: (error) => {
        console.error('Error fetching activity trail:', error);
        this.activityTrailLoading = false;
      }
    });
  }

  // Helper method to format API date
  formatApiDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Get activity type for styling
  getActivityType(status: string): string {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'success';
      case 'error':
      case 'failed':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  }

  // Format currency amount
  getFormattedCurrencyAmount(amount: number, currency?: string): string {
    if (!amount && amount !== 0) return '₹0.00';
    
    const currencySymbol = this.getCurrencySymbol(currency || this.currencyCode);
    return `${currencySymbol}${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  // Get currency symbol
  getCurrencySymbol(currencyCode: string): string {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
      'JPY': '¥'
    };
    return currencySymbols[currencyCode] || '₹';
  }

  // Get discount display text based on discount type
  getDiscountDisplayText(): string {
    if (this.discountType === 'Percentage') {
      return `Discount (${this.quotationDetails.discountPercentage}%):`;
    } else {
      return 'Discount Amount:';
    }
  }

  // Tab management
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'activity') {
      this.loadActivityTrail();
    }
  }

  // Load activity trail data
  private loadActivityTrail(): void {
    this.activityTrailLoading = true;
    let endPoint = `/api/method/wefab.wefab.utils.web_service.get_activity_logs?doctype=Wefab Quotation&docname=${this.quotationId}`;

    this.commonService.getWefabData(endPoint).subscribe({
      next: (res: any) => {
        console.log('Activity Trail Response:', res);
        if (res && res.message) {
          this.activityTrail = res.message.map((activity: any) => ({
            timestamp: this.formatApiDate(activity.creation),
            action: activity.title || activity.subject,
            user: activity.owner,
            description: activity.content,
            type: this.getActivityType(activity.status)
          }));
        }
        this.activityTrailLoading = false;
      },
      error: (error) => {
        console.error('Error fetching activity trail:', error);
        this.activityTrail = [];
        this.activityTrailLoading = false;
      }
    });
  }

  // Status class for status badge
  getStatusClass(status: string): string {
    return this.badgeService.getStatusClass(status);
  }

  // Table event handlers
  onRowClick(event: any) {
    console.log('Row clicked:', event);
  }

  onLinkClick(event: any) {
    console.log('Link clicked:', event);
  }

  onActionClick(event: any) {
    console.log('Action triggered:', event);
    
    if (!event.option) return;
    
    const actionValue = event.option.value;
    console.log('Action value:', actionValue);

    this.sweetAlertService.confirm(
      '',
      `Are you sure you want to ${event.option.label} this quotation?`,
      'question',
      'Yes, ' + event.option.label,
      'Cancel'
    ).then((result: any) => {
      if (result.isConfirmed) {
        this.performQuotationAction(actionValue);
      }
    });
  }

  // Navigation methods
  onBackToQuotations() {
    this.router.navigate(['/wefab/customer/quotation-list']);
  }

  // Print functionality
  printQuotation() {
    const printContent = this.generatePrintContent();
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }

  // Generate print content
  private generatePrintContent(): string {
    const itemsTableRows = this.quotationItems.map(item => `
      <tr>
        <td>${item.itemCode}</td>
        <td>${item.description}</td>
        <td>${item.quantity}</td>
        <td>${item.unit}</td>
        <td>${item.currency}</td>
        <td>${this.getFormattedCurrencyAmount(item.unitPrice, item.currency)}</td>
        <td>${this.getFormattedCurrencyAmount(item.miscellaneous || 0, item.currency)}</td>
        <td>${this.getFormattedCurrencyAmount(item.tooling || 0, item.currency)}</td>
        <td>${item.tax_type || ''}</td>
        <td>${this.getFormattedCurrencyAmount(item.tax_amount || 0, item.currency)}</td>
        <td>${this.getFormattedCurrencyAmount(item.totalPrice, item.currency)}</td>
        <td>${item.comments || ''}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quotation Details - ${this.quotationDetails.quotationId}</title>
        <style>
          body { margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .quote-parties { display: flex; justify-content: space-between; margin: 20px 0; }
          .quote-section { flex: 1; margin: 0 10px; }
          .company-name { font-weight: bold; font-size: 16px; }
          .contact-info { color: #666; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .summary-section { margin-top: 20px; }
          .summary-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 5px 0; }
          .summary-label { font-weight: bold; }
          .total-row { border-top: 2px solid #333; font-size: 18px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Quotation Details - ${this.quotationDetails.quotationId}</h1>
        </div>

        <div class="quote-parties">
          <div class="quote-section">
            <h3>Quote From :</h3>
            <div class="company-name">${this.quotationDetails.quoteFrom.company}</div>
            <div class="contact-info">${this.quotationDetails.quoteFrom.address}</div>
            <div class="contact-info">${this.quotationDetails.quoteFrom.email}</div>
            <div class="contact-info">${this.quotationDetails.quoteFrom.phone}</div>
          </div>
          
          <div class="quote-section">
            <h3>Quote To :</h3>
            <div class="company-name">${this.quotationDetails.quoteTo.company}</div>
            <div class="contact-info">${this.quotationDetails.quoteTo.address}</div>
            <div class="contact-info">${this.quotationDetails.quoteTo.email}</div>
            <div class="contact-info">${this.quotationDetails.quoteTo.phone}</div>
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
                <th>Miscellaneous</th>
                <th>Tooling</th>
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
            <span class="summary-value">${this.getFormattedCurrencyAmount(this.quotationDetails.sub_total)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">${this.getDiscountDisplayText()}</span>
            <span class="summary-value">${this.getFormattedCurrencyAmount(this.quotationDetails.discountAmount)}</span>
          </div>
          ${this.quotationDetails.totalMiscellaneous > 0 ? `
          <div class="summary-row">
            <span class="summary-label">Total Miscellaneous:</span>
            <span class="summary-value">${this.getFormattedCurrencyAmount(this.quotationDetails.totalMiscellaneous)}</span>
          </div>` : ''}
          ${this.quotationDetails.totalTooling > 0 ? `
          <div class="summary-row">
            <span class="summary-label">Total Tooling:</span>
            <span class="summary-value">${this.getFormattedCurrencyAmount(this.quotationDetails.totalTooling)}</span>
          </div>` : ''}
          ${this.quotationDetails.totalTaxAmount > 0 ? `
          <div class="summary-row">
            <span class="summary-label">Total Tax Amount:</span>
            <span class="summary-value">${this.getFormattedCurrencyAmount(this.quotationDetails.totalTaxAmount)}</span>
          </div>` : ''}
          ${this.quotationDetails.shippingCharges > 0 ? `
          <div class="summary-row">
            <span class="summary-label">Shipping Charges:</span>
            <span class="summary-value">${this.getFormattedCurrencyAmount(this.quotationDetails.shippingCharges)}</span>
          </div>` : ''}
          <div class="summary-row total-row">
            <span class="summary-label">Grand Total:</span>
            <span class="summary-value">${this.getFormattedCurrencyAmount(this.quotationDetails.grandTotal)}</span>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Format currency helper
  formatCurrency(amount: number, currency: string): string {
    return this.getFormattedCurrencyAmount(amount, currency);
  }

  // Customer-specific actions
  awardQuotation() {
    this.sweetAlertService.confirm(
      '',
      'Are you sure you want to award this quotation?',
      'question',
      'Yes, Award',
      'Cancel'
    ).then((result: any) => {
      if (result.isConfirmed) {
        this.performQuotationAction('Award');
      }
    });
  }

  cancelQuotation() {
    this.sweetAlertService.confirm(
      '',
      'Are you sure you want to cancel this quotation?',
      'question',
      'Yes, Cancel',
      'No'
    ).then((result: any) => {
      if (result.isConfirmed) {
        this.performQuotationAction('Cancel');
      }
    });
  }

  // Perform quotation action
  private performQuotationAction(action: string) {
    const actionPayload = {
      action: action,
      doc: {
        doctype: 'Wefab Quotation',
        name: this.quotationId
      }
    };

    this.commonService.postWefabData(`/api/method/frappe.model.workflow.apply_workflow`, actionPayload).subscribe({
      next: (res: any) => {
        console.log(`Quotation ${action} response:`, res);
        this.sweetAlertService.success(`The quotation has been ${action.toLowerCase()}ed successfully.`);
        // Refresh the quotation details
        this.getQuotationDetails(this.quotationId);
        // Refresh action list after status change
        this.getActionList();
      },
      error: (error) => {
        console.error(`Error ${action.toLowerCase()}ing quotation:`, error);
        this.sweetAlertService.error(`Failed to ${action.toLowerCase()} the quotation. Please try again.`);
      }
    });
  }

  // Check if actions are available based on status
  hasAvailableActions(): boolean {
    return ['Submitted', 'Received'].includes(this.quotationDetails.workflowState);
  }

  // Check if there are any actions available for the split button
  hasAvailableActionsList(): boolean {
    return this.severityOptions && this.severityOptions.length > 0;
  }

  // Calculate total quantity
  getTotalQuantity(): number {
    return this.rawQuotationItems.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      return total + quantity;
    }, 0);
  }

  // File type check methods for attachments
  isFileTypePdf(fileName: string): boolean {
    return fileName.toLowerCase().endsWith('.pdf');
  }

  isFileTypeImage(fileName: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  isFileTypeDocument(fileName: string): boolean {
    const docExtensions = ['.doc', '.docx', '.txt', '.rtf'];
    return docExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  // Attachment methods
  viewQuotationAttachment(attachment: QuotationAttachment) {
    if (attachment.file_url) {
      window.open(attachment.file_url, '_blank');
    }
  }

  downloadQuotationAttachment(attachment: QuotationAttachment) {
    if (attachment.file_url) {
      window.open(attachment.file_url, '_blank');
    }
  }
}


// Quotation details attachmeny
// this.quotationAttachments = [
//   {
//     name: 'Quotation-Document.pdf',
//     file: 'quotation-doc.pdf',
//     file_name: 'Quotation-Document.pdf',
//     file_url: '#',
//     file_type: 'pdf',
//     category: 'Quotation',
//     uploaded_on: '2024-01-20 10:30:00'
//   },
//   {
//     name: 'Technical-Specifications.pdf',
//     file: 'tech-specs.pdf',
//     file_name: 'Technical-Specifications.pdf',
//     file_url: '#',
//     file_type: 'pdf',
//     category: 'Technical',
//     uploaded_on: '2024-01-20 10:35:00'
//   },
//   {
//     name: 'Quality-Certificate.pdf',
//     file: 'quality-cert.pdf',
//     file_name: 'Quality-Certificate.pdf',
//     file_url: '#',
//     file_type: 'pdf',
//     category: 'Quality',
//     uploaded_on: '2024-01-22 09:15:00'
//   }
// ];