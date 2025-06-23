import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { CommonTableComponent, TableConfig, ActionButton } from '../../../../shared/components/common-table/common-table.component';
import { CommonService } from '../../../../shared/services/common.service';
import { ConversationTrailComponent } from '../../../../shared/components/conversation-trail/conversation-trail.component';
import { ConfigurableButtonComponent } from '../../../../shared/components/configurable-button/configurable-button.component';
import { ActivityTrailComponent, ActivityLogData } from '../../../../shared/components/activity-trail/activity-trail.component';
import { SplitButtonComponent } from '../../../../shared/components/split-button/split-button.component';
import { SweetAlertService } from '../../../../shared/services/sweet-alert.service';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

export interface OrderDetails {
  name: string;
  order_name: string;
  description: string;
  docstatus: number;
  creation: string;
  modified: string;
  expected_delivery: string;
  delivery_address: string;
  special_instructions: string;
  total_amount: number;
  payment_terms: string;
  delivery_terms: string;
  supplier: string;
  purchase_order: string;
  status: string;
}

export interface OrderItem {
  name: string;
  item_number: string;
  item_code: string;
  item_description: string;
  drawing_ref: string;
  material: string;
  specification: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  current_status: string;
  delivery_date: string;
  notes: string;
  cad_file_reference: string;
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
  selector: 'app-supplier-order-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CommonTableComponent,
    ConversationTrailComponent,
    ConfigurableButtonComponent,
    ActivityTrailComponent,
    SplitButtonComponent,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './supplier-order-details.component.html',
  styleUrl: './supplier-order-details.component.scss'
})
export class SupplierOrderDetailsComponent implements OnInit {
  orderId: string = '';
  activeTab: 'overview' | 'comment' | 'activity' = 'overview';
  loading: boolean = false;
  
  orderDetails: OrderDetails = {
    name: '',
    order_name: '',
    description: '',
    docstatus: 0,
    creation: '',
    modified: '',
    expected_delivery: '',
    delivery_address: '',
    special_instructions: '',
    total_amount: 0,
    payment_terms: '',
    delivery_terms: '',
    supplier: '',
    purchase_order: '',
    status: ''
  };

  orderItems: OrderItem[] = [];
  orderAttachments: OrderAttachment[] = [];
  currencyCode: string = 'INR';

  // Activity trail properties
  activityTrail: ActivityLogData[] = [];
  activityTrailLoading: boolean = false;

  // Action options for split button
  severityOptions: any[] = [];

  // Order Items Table Configuration
  orderItemsTableConfig: TableConfig = {
    columns: [
      {
        field: 'item_number',
        header: 'Item Number',
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
        field: 'drawing_ref',
        header: 'Drawing Ref',
        sortable: true,
        filterable: true,
        width: '130px'
      },
      {
        field: 'unit',
        header: 'Unit',
        sortable: true,
        filterable: true,
        width: '80px'
      },
      {
        field: 'quantity',
        header: 'Quantity',
        sortable: true,
        filterable: true,
        width: '100px'
      },
      {
        field: 'current_status',
        header: 'Current Status',
        sortable: true,
        filterable: true,
        isStatus: true,
        width: '140px'
      },
      {
        field: 'rate',
        header: 'Rate',
        sortable: true,
        filterable: true,
        width: '80px'
      }
    ],
    enableSearch: true,
    enableSort: true,
    enableFilter: true,
    enablePagination: true,
    pageSize: 8,
    showActions: false,
    enableColumnResize: true,
  };

  // Button configurations
  printButtonConfig = {
    label: 'Print',
    icon: 'pi pi-print',
    size: 'normal',
    disabled: false,
    loading: false,
    iconPos: 'left',
    style: {
      fontSize: '0.875rem',
      padding: '0.4rem 0.8rem',
      borderRadius: '5px'
    }
  };

  editButtonConfig = {
    label: 'Edit',
    severity: 'primary',
    size: 'normal',
    disabled: false,
    loading: false,
    iconPos: 'left',
    style: {
      fontSize: '0.875rem',
      padding: '0.4rem 0.8rem',
      borderRadius: '5px'
    }
  };

  supplierOrderId: string = '';
  supplierOrderDetails: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
    private sweetAlert: SweetAlertService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orderId = params['id'];
      console.log('Order ID:', this.orderId);
      if (this.orderId) {
        this.accessFirebaseTrigger('Supplier Order', this.orderId);
      }
    });
  }

  accessFirebaseTrigger(doctType_name: string, doctypeId: string) {
    console.log(`🔥 Firebase trigger called for ${doctType_name}`);
    this.commonService.commonFirebaseTrigger(doctType_name, doctypeId).subscribe({
      next: (res: any) => {
        this.loadOrderDetails();
        this.getActionList();
      },
      error: (error) => {
        console.error(`❌ Firebase trigger failed for ${doctType_name}:`, error);
        this.loadOrderDetails(); // Load anyway with fallback data
      }
    });
  }

  getActionList() {
    let obj: any = {
      doctype: 'Supplier Order',
      name: this.orderId
    }
    let params = new HttpParams();
    params = params.append('doc', JSON.stringify(obj));
    let endPoint = `/api/method/frappe.model.workflow.get_transitions`;
    this.commonService.getWefabData(endPoint, params).subscribe((res: any) => {
      let updatedActionList = this.modifyActionList(res.message);
      this.severityOptions = [...updatedActionList];
    });
  }

  modifyActionList(actionList: any) {
    let updatedActionList: any = []
    actionList.forEach((action: any) => {
      let obj: any = {}
      obj['label'] = action.action
      obj['value'] = action.action
      updatedActionList.push(obj)
    })
    return updatedActionList;
  }

  loadOrderDetails() {
    this.loading = true;
    let endpoint = `/api/resource/Supplier Order/${this.orderId}`;
    
    this.commonService.getWefabData(endpoint).subscribe({
      next: (res: any) => {
        console.log('Order details:', res.data);
        if (res.data) {
          this.orderDetails = this.transformApiDataToOrderDetails(res.data);
          this.loadOrderItems();
          this.loadOrderAttachments();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching Order details:', error);
        this.loading = false;
        // Fallback to sample data if API fails
        this.loadSampleData();
      }
    });
  }

  loadOrderItems() {
    // Load order items from API
    let endpoint = `/api/resource/Supplier Order Item?filters=[["parent", "=", "${this.orderId}"]]`;
    
    this.commonService.getWefabData(endpoint).subscribe({
      next: (res: any) => {
        console.log('Order items:', res.data);
        this.orderItems = this.transformApiDataToOrderItems(res.data);
      },
      error: (error) => {
        console.error('Error fetching Order items:', error);
        // Use sample data
        this.loadSampleOrderItems();
      }
    });
  }

  loadOrderAttachments() {
    // Load order attachments from API
    let endpoint = `/api/resource/File?filters=[["attached_to_doctype", "=", "Supplier Order"],["attached_to_name", "=", "${this.orderId}"]]`;
    
    this.commonService.getWefabData(endpoint).subscribe({
      next: (res: any) => {
        console.log('Order attachments:', res.data);
        this.orderAttachments = this.transformApiDataToOrderAttachments(res.data);
      },
      error: (error) => {
        console.error('Error fetching Order attachments:', error);
      }
    });
  }

  // Load sample data for demonstration
  loadSampleData() {
    this.orderDetails = {
      name: 'ORD0000001',
      order_name: 'Precision Components Order',
      description: 'Manufacturing order for precision machined components',
      docstatus: 1,
      creation: '2025-01-15 10:30:00',
      modified: '2025-01-20 14:15:00',
      expected_delivery: '2025-02-15',
      delivery_address: '123 Industrial Park, Manufacturing District, City, State 12345',
      special_instructions: 'Handle with care. Quality inspection required before shipment.',
      total_amount: 15000.00,
      payment_terms: 'Net 30 days',
      delivery_terms: 'FOB Origin',
      supplier: 'Tata Consultancy Services Limited',
      purchase_order: 'PO-2025-001',
      status: 'In Progress'
    };

    this.loadSampleOrderItems();
  }

  loadSampleOrderItems() {
    this.orderItems = [
      {
        name: 'ORD-ITEM-001',
        item_number: '3.2.1',
        item_code: 'COMP-001',
        item_description: 'description',
        drawing_ref: 'drwg-04',
        material: 'Stainless Steel 316',
        specification: 'Dia 50mm x 100mm Length',
        quantity: 26,
        unit: 'Pieces',
        rate: 2,
        amount: 5000.00,
        current_status: 'KWD',
        delivery_date: '2025-02-10',
        notes: 'Surface finish: Ra 0.8',
        cad_file_reference: 'CAD-001.dwg'
      },
      {
        name: 'ORD-ITEM-002',
        item_number: '9.2.1',
        item_code: 'COMP-002',
        item_description: 'description',
        drawing_ref: 'drwg-06',
        material: 'Carbon Steel AISI 4140',
        specification: 'Dia 25mm x 200mm Length',
        quantity: 13,
        unit: 'Sqm',
        rate: 3,
        amount: 4000.00,
        current_status: 'KWD',
        delivery_date: '2025-02-12',
        notes: 'Heat treatment required',
        cad_file_reference: 'CAD-002.dwg'
      },
      {
        name: 'ORD-ITEM-003',
        item_number: '8.2.1',
        item_code: 'COMP-003',
        item_description: 'description',
        drawing_ref: 'drwg-07',
        material: 'Aluminum 6061',
        specification: 'Custom bracket design',
        quantity: 8,
        unit: 'Sqm',
        rate: 1,
        amount: 2400.00,
        current_status: 'KWD',
        delivery_date: '2025-02-08',
        notes: 'Anodized finish',
        cad_file_reference: 'CAD-003.dwg'
      },
      {
        name: 'ORD-ITEM-004',
        item_number: '6.2.1',
        item_code: 'COMP-004',
        item_description: 'description',
        drawing_ref: 'drwg-02',
        material: 'Brass C360',
        specification: 'Threaded connector',
        quantity: 12,
        unit: 'Pieces',
        rate: 4,
        amount: 1800.00,
        current_status: 'KWD',
        delivery_date: '2025-02-14',
        notes: 'High precision threading',
        cad_file_reference: 'CAD-004.dwg'
      },
      {
        name: 'ORD-ITEM-005',
        item_number: '3.2.4',
        item_code: 'COMP-005',
        item_description: 'description',
        drawing_ref: 'drwg-05',
        material: 'Steel A36',
        specification: 'Welded assembly',
        quantity: 14,
        unit: 'Pieces',
        rate: 2,
        amount: 3500.00,
        current_status: 'KWD',
        delivery_date: '2025-02-16',
        notes: 'Powder coating required',
        cad_file_reference: 'CAD-005.dwg'
      },
      {
        name: 'ORD-ITEM-006',
        item_number: '5.2.1',
        item_code: 'COMP-006',
        item_description: 'description',
        drawing_ref: 'drwg-03',
        material: 'Titanium Ti-6Al-4V',
        specification: 'Aerospace grade',
        quantity: 7,
        unit: 'Sqm',
        rate: 1,
        amount: 4200.00,
        current_status: 'KWD',
        delivery_date: '2025-02-18',
        notes: 'Certified material',
        cad_file_reference: 'CAD-006.dwg'
      },
      {
        name: 'ORD-ITEM-007',
        item_number: '3.2.3',
        item_code: 'COMP-007',
        item_description: 'description',
        drawing_ref: 'drwg-08',
        material: 'Copper C101',
        specification: 'Electrical component',
        quantity: 9,
        unit: 'Cm',
        rate: 2,
        amount: 1800.00,
        current_status: 'KWD',
        delivery_date: '2025-02-20',
        notes: 'High conductivity grade',
        cad_file_reference: 'CAD-007.dwg'
      },
      {
        name: 'ORD-ITEM-008',
        item_number: '71.2',
        item_code: 'COMP-008',
        item_description: 'description',
        drawing_ref: 'drw-01',
        material: 'Stainless Steel 304',
        specification: 'Food grade finish',
        quantity: 5,
        unit: 'Pieces',
        rate: 1,
        amount: 2250.00,
        current_status: 'KWD',
        delivery_date: '2025-02-22',
        notes: 'Sanitary finish required',
        cad_file_reference: 'CAD-008.dwg'
      }
    ];
  }

  transformApiDataToOrderDetails(apiData: any): OrderDetails {
    return {
      name: apiData.name || '',
      order_name: apiData.order_name || apiData.title || '',
      description: apiData.description || '',
      docstatus: apiData.docstatus || 0,
      creation: apiData.creation || '',
      modified: apiData.modified || '',
      expected_delivery: apiData.expected_delivery || '',
      delivery_address: apiData.delivery_address || '',
      special_instructions: apiData.special_instructions || '',
      total_amount: apiData.total_amount || apiData.grand_total || 0,
      payment_terms: apiData.payment_terms || '',
      delivery_terms: apiData.delivery_terms || '',
      supplier: apiData.supplier || '',
      purchase_order: apiData.purchase_order || '',
      status: apiData.status || ''
    };
  }

  transformApiDataToOrderItems(apiData: any[]): OrderItem[] {
    if (!apiData || !Array.isArray(apiData)) {
      return [];
    }

    return apiData.map(item => ({
      name: item.name || '',
      item_number: item.item_number || '',
      item_code: item.item_code || '',
      item_description: item.item_description || item.description || '',
      drawing_ref: item.drawing_ref || '',
      material: item.material || '',
      specification: item.specification || '',
      quantity: item.quantity || 0,
      unit: item.unit || '',
      rate: item.rate || 0,
      amount: item.amount || (item.quantity * item.rate) || 0,
      current_status: item.current_status || '',
      delivery_date: item.delivery_date || '',
      notes: item.notes || '',
      cad_file_reference: item.cad_file_reference || ''
    }));
  }

  transformApiDataToOrderAttachments(apiData: any[]): OrderAttachment[] {
    if (!apiData || !Array.isArray(apiData)) {
      return [];
    }

    return apiData.map(attachment => ({
      name: attachment.name || '',
      file: attachment.file_url || '',
      file_url: attachment.file_url || '',
      file_name: attachment.file_name || '',
      file_type: attachment.file_type || '',
      description: attachment.description || '',
      category: attachment.category || '',
      uploaded_on: attachment.creation || ''
    }));
  }

  setActiveTab(tab: 'overview' | 'comment' | 'activity') {
    this.activeTab = tab;
    if (tab === 'activity') {
      this.loadActivityTrail();
    }
  }

  private loadActivityTrail(): void {
    this.activityTrailLoading = true;
    this.commonService.getData('/api/method/wefab.wefab.api.common.engine.trail.activity.get_new_versions_trail?doctype=Supplier Order&docname=' + this.orderId)
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

  goBack() {
    this.router.navigate(['/wefab/supplier/order']);
  }

  printOrder() {
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
    const itemsTableRows = this.orderItems.map(item => `
      <tr>
        <td>${item.item_code}</td>
        <td>${item.item_description}</td>
        <td>${item.quantity}</td>
        <td>${item.unit}</td>
        <td>${this.getFormattedCurrencyAmount(item.rate)}</td>
        <td>${this.getFormattedCurrencyAmount(item.amount)}</td>
        <td>${item.current_status}</td>
        <td>${item.notes}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order - ${this.orderDetails.name}</title>
        <style>
          body {
            margin: 20px;
            font-size: 12px;
            color: #333;
          }
          .print-header {
            border-bottom: 2px solid #1a3a5f;
            padding-bottom: 10px;
            margin-bottom: 20px;
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
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>Order ${this.orderDetails.name}</h1>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTableRows}
          </tbody>
        </table>
        <div style="text-align: right; margin-top: 20px;">
          <strong>Grand Total: ${this.getFormattedCurrencyAmount(this.orderDetails.total_amount)}</strong>
        </div>
      </body>
      </html>
    `;
  }

  editOrder() {
    // Navigate to order edit page
    this.router.navigate(['/wefab/supplier/order/edit', this.orderId]);
  }

  onActionClick(event: any) {
    console.log('Action triggered:', event);
    
    if (!event.option) return;
    
    const actionValue = event.option.value;
    console.log('Action value:', actionValue);

    this.sweetAlert.confirm(
      '',
      `Are you sure you want to ${event.option.label} this order?`,
      'question',
      'Yes, ' + event.option.label,
      'Cancel'
    ).then((result: any) => {
      if (result.isConfirmed) {
        this.updateOrderStatus(actionValue);
      }
    });
  }

  private updateOrderStatus(status: string) {
    console.log('Updating order status to:', status);
    const action = {
      action: status,
      doc: {
        doctype: 'Supplier Order',
        name: this.orderId
      }
    };

    this.commonService.postWefabData('/api/method/frappe.model.workflow.apply_workflow', action).subscribe({
      next: (res: any) => {
        this.sweetAlert.success(`Order ${status} successfully`);
        console.log(`Order ${status} successfully:`, res);
        this.loadOrderDetails();
        this.getActionList();
      },
      error: (error) => {
        this.sweetAlert.error(`Error updating order status to ${status}:`, error);
        console.error(`Error updating order status to ${status}:`, error);
      }
    });
  }

  hasAvailableActions(): boolean {
    return this.severityOptions && this.severityOptions.length > 0;
  }

  getStatusClass(status: any) {
    if (!status) return 'status-draft';
    
    const statusStr = status.toLowerCase();
    
    const statusClasses: { [key: string]: string } = {
      'draft': 'status-draft',
      'open': 'status-open',
      'in progress': 'status-in-progress',
      'processing': 'status-in-progress',
      'completed': 'status-completed',
      'delivered': 'status-completed',
      'cancelled': 'status-cancelled',
      'canceled': 'status-cancelled',
      'on hold': 'status-on-hold',
      'pending': 'status-pending'
    };
    
    return statusClasses[statusStr] || 'status-draft';
  }

  getStatusText(): string {
    const status = this.orderDetails?.status;
    if (!status) return 'Unknown';
    
    const statusMap: { [key: string]: string } = {
      'Draft': 'Draft',
      'Open': 'Open',
      'In Progress': 'In Progress',
      'Processing': 'In Progress',
      'Completed': 'Completed',
      'Delivered': 'Completed',
      'Cancelled': 'Cancelled',
      'Canceled': 'Cancelled',
      'On Hold': 'On Hold',
      'Pending': 'Pending'
    };
    
    return statusMap[status] || status;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  formatApiDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'long' });
      const year = date.getFullYear();
      
      let hours = date.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    } catch {
      return dateString;
    }
  }

  getFormattedCurrencyAmount(amount: number, currency?: string): string {
    const currencyToUse = currency || this.currencyCode;
    const formattedAmount = amount.toLocaleString('en-US');
    return `${currencyToUse} ${formattedAmount}`;
  }

  stripHtmlTags(html: string): string {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  onOrderItemRowClick(event: { event: Event, rowData: any }) {
    console.log('Order item row clicked:', event.rowData);
  }

  onOrderItemLinkClick(event: { rowData: any, column: any }) {
    console.log('Order item link clicked:', event);
  }

  onOrderItemActionClick(event: { action: string, rowData: any }) {
    console.log('Order item action clicked:', event);
  }

  viewAttachment(attachment: OrderAttachment) {
    if (attachment.file_url) {
      window.open(attachment.file_url, '_blank');
    } else {
      console.log('No file URL available for:', attachment.file_name);
    }
  }

  downloadAttachment(attachment: OrderAttachment) {
    if (attachment.file_url) {
      const link = document.createElement('a');
      link.href = attachment.file_url;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.log('No file URL available for download:', attachment.file_name);
    }
  }

  updateDeliveryStatus() {
    console.log('Updating delivery status...');
  }

  trackShipment() {
    console.log('Tracking shipment...');
  }

  getTotalQuantity(): number {
    return this.orderItems.reduce((total, item) => total + (item.quantity || 0), 0);
  }

  // Attachment file type helper methods
  isFileTypePdf(fileName: string): boolean {
    if (!fileName) return false;
    const extension = fileName.toLowerCase().split('.').pop();
    return extension === 'pdf';
  }

  isFileTypeImage(fileName: string): boolean {
    if (!fileName) return false;
    const extension = fileName.toLowerCase().split('.').pop();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    return imageExtensions.includes(extension || '');
  }

  isFileTypeDocument(fileName: string): boolean {
    if (!fileName) return false;
    const extension = fileName.toLowerCase().split('.').pop();
    const documentExtensions = ['doc', 'docx', 'txt', 'rtf', 'odt'];
    return documentExtensions.includes(extension || '');
  }
} 