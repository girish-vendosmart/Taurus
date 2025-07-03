import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonTableComponent, TableConfig } from '../../../../shared/components/common-table/common-table.component';
import { CommonService } from '../../../../shared/services/common.service';

// API Response Interfaces
export interface CustomerPurchaseOrderApiResponse {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: number;
  idx: number;
  cpo_status: string;
  po_name: string;
  rfq_reference: string;
  wefab_quotation: string;
  customer_id: string;
  enquiry_reference: string;
  customer_po_number: string;
  priority: string;
  requested_delivery_date: string;
  promised_delivery_date: string;
  delivery_terms: string;
  shipping_method: string;
  currency_code: string;
  sub_total: number;
  discount_type: string;
  discount: number;
  discount_amount: number;
  total_tax_amount: number;
  shipping_charges: number;
  grand_total: number;
  payment_terms: string;
  payment_method: string;
  quality_requirements: string;
  packaging_requirements: string;
  general_terms: string;
  status: string;
  doctype: string;
  items: OrderLineItem[];
  other_attachments: AttachmentItem[];
  customs_documentation: AttachmentItem[];
  quality_certificates: AttachmentItem[];
  technical_drawings: AttachmentItem[];
}

export interface OrderLineItem {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: number;
  idx: number;
  item_code: string;
  item_description: string;
  material: string;
  quantity: number;
  unit: string;
  unit_price: number;
  comments: string;
  no_bid: number;
  miscellaneous: number;
  tooling: number;
  notes: string;
  tax_type: string;
  tax_amount: number;
  total_price: number;
  parent: string;
  parentfield: string;
  parenttype: string;
  doctype: string;
}

export interface AttachmentItem {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: number;
  file_url: string;
  idx: number;
  parent: string;
  parentfield: string;
  parenttype: string;
  doctype: string;
}

// Component Data Interfaces
export interface OrderDetails {
  name: string;
  order_name: string;
  cpo_status: string;
  description: string;
  docstatus: number;
  creation: string;
  modified: string;
  expected_delivery: string;
  promised_delivery: string;
  delivery_terms: string;
  shipping_method: string;
  special_instructions: string;
  total_amount: number;
  payment_terms: string;
  payment_method: string;
  supplier: string;
  purchase_order: string;
  status: string;
  customer: string;
  quotation_id: string;
  priority: string;
  currency_code: string;
  sub_total: number;
  discount_type: string;
  discount: number;
  discount_amount: number;
  total_tax_amount: number;
  shipping_charges: number;
  grand_total: number;
  quality_requirements: string;
  packaging_requirements: string;
  general_terms: string;
  rfq_reference: string;
  customer_po_number: string;
}

export interface OrderItem {
  name: string;
  item_code: string;
  item_description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  current_status: string;
  delivery_date: string;
  notes: string;
  material: string;
  specification: string;
  drawing_ref: string;
  unit_price: number;
  comments: string;
  miscellaneous: number;
  tooling: number;
  tax_type: string;
  tax_amount: number;
  total_price: number;
  unit_price_formatted?: string;
  total_price_formatted?: string;
  tax_amount_formatted?: string;
  miscellaneous_formatted?: string;
  tooling_formatted?: string;
}

export interface OrderAttachment {
  name: string;
  file: string;
  file_url: string;
  file_name: string;
  file_type: string;
  description: string;
  category: string;
  uploaded_on: string;
}

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CommonTableComponent
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent implements OnInit {
  orderId: string = '';
  loading: boolean = false;
  currencyCode: string = 'USD';
  
  orderDetails: OrderDetails = {
    name: '',
    order_name: '',
    cpo_status: '',
    description: '',
    docstatus: 0,
    creation: '',
    modified: '',
    expected_delivery: '',
    promised_delivery: '',
    delivery_terms: '',
    shipping_method: '',
    special_instructions: '',
    total_amount: 0,
    payment_terms: '',
    payment_method: '',
    supplier: '',
    purchase_order: '',
    status: '',
    customer: '',
    quotation_id: '',
    priority: '',
    currency_code: '',
    sub_total: 0,
    discount_type: '',
    discount: 0,
    discount_amount: 0,
    total_tax_amount: 0,
    shipping_charges: 0,
    grand_total: 0,
    quality_requirements: '',
    packaging_requirements: '',
    general_terms: '',
    rfq_reference: '',
    customer_po_number: ''
  };

  orderItems: OrderItem[] = [];
  rawOrderItems: OrderLineItem[] = [];
  orderAttachments: OrderAttachment[] = [];

  // Order Items Table Configuration
  orderItemsTableConfig: TableConfig = {
    columns: [
      {
        field: 'item_code',
        header: 'Item Code',
        sortable: true,
        filterable: true,
        width: '120px'
      },
      {
        field: 'item_description',
        header: 'Description',
        sortable: true,
        filterable: true,
        width: '200px'
      },
      {
        field: 'material',
        header: 'Material',
        sortable: true,
        filterable: true,
        width: '150px'
      },
      {
        field: 'quantity',
        header: 'Quantity',
        sortable: true,
        filterable: true,
        width: '100px'
      },
      {
        field: 'unit',
        header: 'Unit',
        sortable: true,
        filterable: true,
        width: '80px'
      },
      {
        field: 'unit_price_formatted',
        header: 'Unit Price',
        sortable: true,
        filterable: true,
        width: '120px'
      },
      {
        field: 'miscellaneous_formatted',
        header: 'Miscellaneous',
        sortable: true,
        filterable: true,
        width: '120px'
      },
      {
        field: 'tooling_formatted',
        header: 'Tooling',
        sortable: true,
        filterable: true,
        width: '120px'
      },
      {
        field: 'tax_type',
        header: 'Tax Type',
        sortable: true,
        filterable: true,
        width: '100px'
      },
      {
        field: 'tax_amount_formatted',
        header: 'Tax Amount',
        sortable: true,
        filterable: true,
        width: '120px'
      },
      {
        field: 'total_price_formatted',
        header: 'Total Price',
        sortable: true,
        filterable: true,
        width: '120px'
      },
      {
        field: 'comments',
        header: 'Comments',
        sortable: true,
        filterable: true,
        width: '150px'
      }
    ],
    enableSearch: true,
    enableSort: true,
    enableFilter: true,
    enablePagination: true,
    pageSize: 10,
    showActions: false,
    enableColumnResize: true,
  };

  constructor(
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orderId = params['id'];
      if (this.orderId) {
        this.accessFirebaseTrigger('Customer Purchase Order', this.orderId);
      }
    });
  }

  // Firebase trigger access method (similar to quotation-details)
  accessFirebaseTrigger(docType: string, docName: string) {
    const payload = {
      doctype: docType,
      docname: docName
    };

    this.commonService.postWefabData('/api/method/wefab.wefab.utils.web_service.access_document', payload).subscribe({
      next: (res: any) => {
        console.log('Firebase trigger response:', res);
        if (res && res.message && res.message.success) {
          this.loadOrderDetails();
        }
      },
      error: (error) => {
        console.error('Error accessing firebase trigger:', error);
        this.loadOrderDetails();
      }
    });
  }

  loadOrderDetails() {
    this.loading = true;
    let endPoint = `/api/resource/Customer Purchase Order/${this.orderId}`;
    
    this.commonService.getData(endPoint).subscribe({
      next: (res: any) => {
        console.log('Order Details API Response:', res);
        if (res && res.data) {
          this.mapApiResponseToComponent(res.data);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching order details:', error);
        this.loading = false;
      }
    });
  }

  // Map API response to component data structure
  mapApiResponseToComponent(apiData: CustomerPurchaseOrderApiResponse) {
    console.log('API Data:', apiData);

    // Extract currency code
    this.currencyCode = apiData.currency_code || 'USD';

    // Map main order details
    this.orderDetails = {
      name: apiData.name,
      order_name: apiData.po_name,
      cpo_status: apiData.cpo_status,
      description: apiData.general_terms,
      docstatus: apiData.docstatus,
      creation: apiData.creation,
      modified: apiData.modified,
      expected_delivery: apiData.requested_delivery_date,
      promised_delivery: apiData.promised_delivery_date,
      delivery_terms: apiData.delivery_terms,
      shipping_method: apiData.shipping_method,
      special_instructions: '', // Not in API, keeping for compatibility
      total_amount: apiData.grand_total,
      payment_terms: apiData.payment_terms,
      payment_method: apiData.payment_method,
      supplier: '', // Not directly available in API
      purchase_order: apiData.customer_po_number,
      status: apiData.status,
      customer: '', // Customer details not directly available
      quotation_id: apiData.wefab_quotation,
      priority: apiData.priority,
      currency_code: apiData.currency_code,
      sub_total: apiData.sub_total,
      discount_type: apiData.discount_type,
      discount: apiData.discount,
      discount_amount: apiData.discount_amount,
      total_tax_amount: apiData.total_tax_amount,
      shipping_charges: apiData.shipping_charges,
      grand_total: apiData.grand_total,
      quality_requirements: apiData.quality_requirements,
      packaging_requirements: apiData.packaging_requirements,
      general_terms: apiData.general_terms,
      rfq_reference: apiData.rfq_reference,
      customer_po_number: apiData.customer_po_number
    };

    // Map order items
    this.orderItems = apiData.items.map(item => ({
      name: item.name,
      item_code: item.item_code,
      item_description: item.item_description,
      quantity: item.quantity,
      unit: item.unit,
      rate: item.unit_price, // For backward compatibility
      amount: item.total_price, // For backward compatibility
      current_status: '', // Not available in new API
      delivery_date: '', // Not available in new API
      notes: item.notes,
      material: item.material,
      specification: '', // Not available in new API
      drawing_ref: '', // Not available in new API
      unit_price: item.unit_price,
      comments: item.comments,
      miscellaneous: item.miscellaneous,
      tooling: item.tooling,
      tax_type: item.tax_type,
      tax_amount: item.tax_amount,
      total_price: item.total_price,
      unit_price_formatted: this.getFormattedCurrencyAmount(item.unit_price),
      total_price_formatted: this.getFormattedCurrencyAmount(item.total_price),
      tax_amount_formatted: this.getFormattedCurrencyAmount(item.tax_amount),
      miscellaneous_formatted: this.getFormattedCurrencyAmount(item.miscellaneous || 0),
      tooling_formatted: this.getFormattedCurrencyAmount(item.tooling || 0)
    }));

    this.rawOrderItems = apiData.items.map(item => ({
      ...item,
      unit_price_formatted: this.getFormattedCurrencyAmount(item.unit_price),
      total_price_formatted: this.getFormattedCurrencyAmount(item.total_price),
      tax_amount_formatted: this.getFormattedCurrencyAmount(item.tax_amount),
      miscellaneous_formatted: this.getFormattedCurrencyAmount(item.miscellaneous || 0),
      tooling_formatted: this.getFormattedCurrencyAmount(item.tooling || 0)
    }));

    // Combine all attachments from different categories
    this.orderAttachments = this.combineAttachments(
      apiData.other_attachments || [],
      apiData.customs_documentation || [],
      apiData.quality_certificates || [],
      apiData.technical_drawings || []
    );
  }

  // Combine attachments from different categories
  combineAttachments(...attachmentArrays: AttachmentItem[][]): OrderAttachment[] {
    const allAttachments: OrderAttachment[] = [];
    
    attachmentArrays.forEach((attachments, index) => {
      const categoryNames = ['Other', 'Customs', 'Quality', 'Technical'];
      const category = categoryNames[index] || 'Other';
      
      attachments.forEach(attachment => {
        allAttachments.push({
          name: attachment.name,
          file: attachment.name,
          file_url: attachment.file_url, // URL not available in current API structure
          file_name: attachment.name,
          file_type: 'pdf', // Default type
          description: '',
          category: category,
          uploaded_on: attachment.creation
        });
      });
    });
    
    return allAttachments;
  }

  goBack() {
    this.router.navigate(['/wefab/customer/order-list']);
  }

  onItemRowClick(event: any): void {
    console.log('Item row clicked:', event.rowData);
  }

  onItemLinkClick(event: { rowData: any, column: any, event: any }): void {
    console.log('Item link clicked:', event.rowData);
  }

  onItemActionClick(event: { action: string, rowData: any }): void {
    console.log('Item action clicked:', event.action, event.rowData);
  }

  downloadAttachment(attachment: OrderAttachment) {
    if (attachment.file_url) {
      window.open(attachment.file_url, '_blank');
    }
  }

  viewAttachment(attachment: OrderAttachment) {
    if (attachment.file_url) {
      window.open(attachment.file_url, '_blank');
    }
  }

  printOrder() {
    window.print();
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-draft';
    
    const statusStr = status.toLowerCase();
    
    const statusClasses: { [key: string]: string } = {
      'draft': 'status-draft',
      'submitted': 'status-submitted',
      'preparation': 'status-progress',
      'in progress': 'status-progress',
      'completed': 'status-completed',
      'cancelled': 'status-rejected'
    };
    
    return statusClasses[statusStr] || 'status-draft';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch {
      return dateString;
    }
  }

  // Format API date (similar to quotation-details)
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

  getFormattedCurrencyAmount(amount: number, currency?: string): string {
    if (!amount && amount !== 0) return '$0.00';
    
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
    return currencySymbols[currencyCode] || '$';
  }

  // Get discount display text based on discount type
  getDiscountDisplayText(): string {
    if (this.orderDetails.discount_type === 'Percentage') {
      return `Discount (${this.orderDetails.discount}%):`;
    } else {
      return 'Discount Amount:';
    }
  }

  getTotalQuantity(): number {
    return this.orderItems.reduce((total, item) => total + (item.quantity || 0), 0);
  }

  isFileTypePdf(fileName: string): boolean {
    return fileName.toLowerCase().endsWith('.pdf');
  }

  isFileTypeImage(fileName: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  isFileTypeDocument(fileName: string): boolean {
    const docExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.txt'];
    return docExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  getTruncatedFileName(fileName: string): string {
    if (fileName.length <= 20) return fileName;
    const extension = fileName.split('.').pop();
    const name = fileName.substring(0, 17);
    return `${name}...${extension}`;
  }

  getFormattedFileDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch {
      return dateString;
    }
  }
}
