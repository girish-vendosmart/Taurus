import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonTableComponent, TableConfig, ActionButton, FilterOption } from '../../../../shared/components/common-table/common-table.component';
import { ConversationTrailComponent } from '../../../../shared/components/conversation-trail/conversation-trail.component';
import { ConfigurableButtonComponent } from '../../../../shared/components/configurable-button/configurable-button.component';
import { ApprovalWorkflowComponent } from '../../../../shared/components/approval-workflow/approval-workflow.component';

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
  customer: string;
  quotation_id: string;
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

export interface DeliveryStatus {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  completedDate?: string;
  estimatedCompletion?: string;
  icon: string;
  hasTrackingLink?: boolean;
  trackingLinkText?: string;
}

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CommonTableComponent,
    ConversationTrailComponent,
    ConfigurableButtonComponent,
    ApprovalWorkflowComponent
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent implements OnInit {
  orderId: string = '';
  activeTab: 'overview' | 'comment' = 'overview';
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
    status: '',
    customer: '',
    quotation_id: ''
  };

  orderItems: OrderItem[] = [];
  orderAttachments: OrderAttachment[] = [];
  currencyCode: string = 'INR';

  // State management for view all functionality
  showAllItems = false;
  showAllAttachments = false;

  // Delivery tracking
  deliveryStatus: DeliveryStatus[] = [];

  // Delivery workflow for approval workflow component
  deliveryWorkflowSteps: any[] = [];

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
        field: 'rate',
        header: 'Rate',
        sortable: true,
        filterable: true,
        width: '100px'
      },
      {
        field: 'amount',
        header: 'Amount',
        sortable: true,
        filterable: true,
        width: '120px'
      },
      {
        field: 'current_status',
        header: 'Status',
        sortable: true,
        filterable: true,
        isStatus: true,
        width: '120px'
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

  // Button configurations
  printButtonConfig = {
    label: 'Print',
    icon: 'pi pi-print',
    size: 'small',
    disabled: false,
    loading: false,
    iconPos: 'left'
  };

  downloadButtonConfig = {
    label: 'Download',
    icon: 'pi pi-download',
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

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orderId = params['id'];
      console.log('Order ID:', this.orderId);
      if (this.orderId) {
        this.loadOrderDetails();
      }
    });
  }

  loadOrderDetails() {
    this.loading = true;
    
    // For now, load sample data - replace with actual API call
    setTimeout(() => {
      this.loadSampleData();
      this.loading = false;
    }, 1000);
  }

  loadSampleData() {
    this.orderDetails = {
      name: this.orderId || 'ORD0000245',
      order_name: 'Precision Manufacturing Order',
      description: 'Manufacturing order for precision machined components based on approved quotation',
      docstatus: 1,
      creation: '2025-01-15T10:30:00',
      modified: '2025-01-20T14:15:00',
      expected_delivery: '2025-02-15T14:00:00',
      delivery_address: '123 Manufacturing District, Industrial Park, City, State 12345',
      special_instructions: 'Handle with care. Quality inspection required before delivery. All components must meet specified tolerances.',
      total_amount: 65000.00,
      payment_terms: 'Net 30 days',
      delivery_terms: 'FOB Destination',
      supplier: 'Precision Manufacturing Solutions Ltd.',
      purchase_order: 'PO-2025-001234',
      status: 'In Progress',
      customer: 'ABC Manufacturing Corp.',
      quotation_id: 'QTN0000367'
    };

    this.orderItems = [
      {
        name: 'ORD-ITEM-001',
        item_number: '3.2.1',
        item_code: 'COMP-001',
        item_description: 'Precision Shaft Assembly',
        drawing_ref: 'DRW-001',
        material: 'Stainless Steel 316',
        specification: 'Dia 50mm x 100mm Length, Ra 0.8 finish',
        quantity: 25,
        unit: 'Pieces',
        rate: 2500.00,
        amount: 62500.00,
        current_status: 'In Progress',
        delivery_date: '2025-02-10',
        notes: 'Critical tolerance: ±0.02mm',
        cad_file_reference: 'CAD-001.dwg'
      },
      {
        name: 'ORD-ITEM-002',
        item_number: '3.2.2',
        item_code: 'COMP-002',
        item_description: 'Mounting Bracket',
        drawing_ref: 'DRW-002',
        material: 'Aluminum 6061-T6',
        specification: 'Custom bracket with anodized finish',
        quantity: 50,
        unit: 'Pieces',
        rate: 150.00,
        amount: 7500.00,
        current_status: 'Completed',
        delivery_date: '2025-02-05',
        notes: 'Blue anodized finish required',
        cad_file_reference: 'CAD-002.dwg'
      },
      {
        name: 'ORD-ITEM-003',
        item_number: '3.2.3',
        item_code: 'COMP-003',
        item_description: 'Connector Housing',
        drawing_ref: 'DRW-003',
        material: 'Brass C360',
        specification: 'Threaded connector with sealing groove',
        quantity: 100,
        unit: 'Pieces',
        rate: 75.00,
        amount: 7500.00,
        current_status: 'Pending',
        delivery_date: '2025-02-12',
        notes: 'Material certification required',
        cad_file_reference: 'CAD-003.dwg'
      }
    ];

    this.orderAttachments = [
      {
        name: 'ORDER-DOCS-001',
        file: '/files/order-confirmation.pdf',
        file_url: '/files/order-confirmation.pdf',
        file_name: 'Order Confirmation.pdf',
        file_type: 'application/pdf',
        description: 'Official order confirmation document',
        category: 'Documentation',
        uploaded_on: '2025-01-15T10:30:00'
      },
      {
        name: 'ORDER-SPECS-001',
        file: '/files/technical-specifications.pdf',
        file_url: '/files/technical-specifications.pdf',
        file_name: 'Technical Specifications.pdf',
        file_type: 'application/pdf',
        description: 'Detailed technical specifications and requirements',
        category: 'Technical',
        uploaded_on: '2025-01-15T11:00:00'
      },
      {
        name: 'ORDER-CAD-001',
        file: '/files/assembly-drawings.zip',
        file_url: '/files/assembly-drawings.zip',
        file_name: 'Assembly Drawings.zip',
        file_type: 'application/zip',
        description: 'Complete set of CAD drawings and assembly instructions',
        category: 'CAD Files',
        uploaded_on: '2025-01-15T11:30:00'
      },
      {
        name: 'ORDER-QUALITY-001',
        file: '/files/quality-certificate.pdf',
        file_url: '/files/quality-certificate.pdf',
        file_name: 'Quality Certificate.pdf',
        file_type: 'application/pdf',
        description: 'Quality assurance certificate',
        category: 'Quality',
        uploaded_on: '2025-01-16T09:15:00'
      },
      {
        name: 'ORDER-MATERIAL-001',
        file: '/files/material-test-report.pdf',
        file_url: '/files/material-test-report.pdf',
        file_name: 'Material Test Report.pdf',
        file_type: 'application/pdf',
        description: 'Material testing and certification report',
        category: 'Testing',
        uploaded_on: '2025-01-16T14:20:00'
      },
      {
        name: 'ORDER-IMAGES-001',
        file: '/files/production-images.zip',
        file_url: '/files/production-images.zip',
        file_name: 'Production Images.zip',
        file_type: 'application/zip',
        description: 'Photos from production process',
        category: 'Images',
        uploaded_on: '2025-01-17T10:45:00'
      },
      {
        name: 'ORDER-INVOICE-001',
        file: '/files/invoice-details.pdf',
        file_url: '/files/invoice-details.pdf',
        file_name: 'Invoice Details.pdf',
        file_type: 'application/pdf',
        description: 'Detailed invoice breakdown',
        category: 'Financial',
        uploaded_on: '2025-01-18T11:30:00'
      },
      {
        name: 'ORDER-SHIPPING-001',
        file: '/files/shipping-manifest.pdf',
        file_url: '/files/shipping-manifest.pdf',
        file_name: 'Shipping Manifest.pdf',
        file_type: 'application/pdf',
        description: 'Shipping documentation and manifest',
        category: 'Shipping',
        uploaded_on: '2025-01-19T08:15:00'
      },
      {
        name: 'ORDER-WARRANTY-001',
        file: '/files/warranty-information.pdf',
        file_url: '/files/warranty-information.pdf',
        file_name: 'Warranty Information.pdf',
        file_type: 'application/pdf',
        description: 'Product warranty details and terms',
        category: 'Warranty',
        uploaded_on: '2025-01-19T15:30:00'
      }
    ];

    this.deliveryStatus = [
      {
        id: 1,
        title: 'Order Confirmed',
        description: 'Your order has been confirmed and is being prepared',
        status: 'completed',
        completedDate: 'January 15, 2025 at 10:30 AM',
        icon: 'pi pi-check'
      },
      {
        id: 2,
        title: 'Production Started',
        description: 'Manufacturing process has begun',
        status: 'completed',
        completedDate: 'January 18, 2025 at 8:00 AM',
        icon: 'pi pi-cog'
      },
      {
        id: 3,
        title: 'In Progress',
        description: 'Items are currently being manufactured',
        status: 'in-progress',
        estimatedCompletion: 'Estimated completion: February 10, 2025',
        icon: 'pi pi-clock'
      },
      {
        id: 4,
        title: 'Quality Inspection',
        description: 'Final quality check and testing',
        status: 'pending',
        icon: 'pi pi-search'
      },
      {
        id: 5,
        title: 'Ready for Delivery',
        description: 'Order packed and ready for shipment',
        status: 'pending',
        icon: 'pi pi-box'
      },
      {
        id: 6,
        title: 'Delivered',
        description: 'Order successfully delivered to destination',
        status: 'pending',
        icon: 'pi pi-check-circle',
        hasTrackingLink: true,
        trackingLinkText: 'Track Shipment'
      }
    ];

    // Setup delivery workflow for approval workflow component
    this.deliveryWorkflowSteps = [
      {
        id: 'order-confirmed',
        title: 'Order Confirmed',
        description: 'Your order has been confirmed and is being prepared',
        status: 'complete',
        completedDate: new Date('2025-01-15T10:30:00'),
        completedBy: 'System',
        allowCompletion: false,
        isOpenDialog: false
      },
      {
        id: 'production-started',
        title: 'Production Started',
        description: 'Manufacturing process has begun',
        status: 'complete',
        completedDate: new Date('2025-01-18T08:00:00'),
        completedBy: 'Production Team',
        allowCompletion: false,
        isOpenDialog: false
      },
      {
        id: 'in-progress',
        title: 'Manufacturing in Progress',
        description: 'Items are currently being manufactured - estimated completion: February 10, 2025',
        status: 'in-progress',
        allowCompletion: true,
        requiresPhotos: true,
        requiresComments: true,
        isOpenDialog: true
      },
      {
        id: 'quality-inspection',
        title: 'Quality Inspection',
        description: 'Final quality check and testing required',
        status: 'waiting',
        allowCompletion: true,
        requiresPhotos: true,
        requiresComments: false,
        isOpenDialog: true
      },
      {
        id: 'ready-delivery',
        title: 'Ready for Delivery',
        description: 'Order packed and ready for shipment',
        status: 'waiting',
        allowCompletion: true,
        requiresPhotos: true,
        requiresComments: false,
        isOpenDialog: true
      },
      {
        id: 'delivered',
        title: 'Delivered',
        description: 'Order successfully delivered to destination',
        status: 'waiting',
        allowCompletion: true,
        requiresPhotos: true,
        requiresComments: true,
        isOpenDialog: true
      }
    ];
  }

  get displayedItems() {
    return this.showAllItems ? this.orderItems : this.orderItems.slice(0, 5);
  }

  get displayedAttachments() {
    return this.showAllAttachments ? this.orderAttachments : this.orderAttachments.slice(0, 5);
  }

  get remainingItemsCount() {
    return Math.max(0, this.orderItems.length - 5);
  }

  get remainingAttachmentsCount() {
    return Math.max(0, this.orderAttachments.length - 5);
  }

  setActiveTab(tab: 'overview' | 'comment') {
    this.activeTab = tab;
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

  viewAllItems() {
    this.showAllItems = !this.showAllItems;
  }

  viewAllAttachments() {
    this.showAllAttachments = !this.showAllAttachments;
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

  viewAttachment(attachment: OrderAttachment) {
    if (attachment.file_url) {
      window.open(attachment.file_url, '_blank');
    } else {
      console.log('No file URL available for:', attachment.file_name);
    }
  }

  printOrder() {
    const printContent = this.generatePrintContent();
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  }

  downloadOrder() {
    // Implement download functionality
    console.log('Downloading order summary...');
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
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order - ${this.orderDetails.name}</title>
        <style>
          body { margin: 20px; font-size: 12px; color: #333; }
          .print-header { border-bottom: 2px solid #1a3a5f; padding-bottom: 10px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f8f9fa; font-weight: bold; color: #1a3a5f; }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>Order ${this.orderDetails.name}</h1>
          <p>Order Name: ${this.orderDetails.order_name}</p>
          <p>Customer: ${this.orderDetails.customer}</p>
          <p>Supplier: ${this.orderDetails.supplier}</p>
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

  getStatusClass(status: any) {
    if (!status) return 'status-draft';
    
    const statusStr = status.toLowerCase();
    
    const statusClasses: { [key: string]: string } = {
      'draft': 'status-draft',
      'confirmed': 'status-confirmed',
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
    return status;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
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
    const formattedAmount = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${currencyToUse} ${formattedAmount}`;
  }

  getTotalQuantity(): number {
    return this.orderItems.reduce((total, item) => total + (item.quantity || 0), 0);
  }

  getCurrentDeliveryStep(): DeliveryStatus | null {
    return this.deliveryStatus.find(step => 
      step.status === 'in-progress'
    ) || null;
  }

  getDeliveryCompletionPercentage(): number {
    const completedSteps = this.deliveryStatus.filter(step => step.status === 'completed').length;
    return Math.round((completedSteps / this.deliveryStatus.length) * 100);
  }

  trackShipment() {
    console.log('Opening shipment tracking...');
    // Implement shipment tracking functionality
  }

  // Handle delivery workflow step completion
  onDeliveryStepCompleted(completionData: any) {
    console.log('Delivery step completed:', completionData);
    
    // Find and update the step
    const stepIndex = this.deliveryWorkflowSteps.findIndex(step => step.id === completionData.stepId);
    if (stepIndex !== -1) {
      this.deliveryWorkflowSteps[stepIndex].status = 'complete';
      this.deliveryWorkflowSteps[stepIndex].completedDate = new Date();
      this.deliveryWorkflowSteps[stepIndex].completedBy = 'Supplier';
      this.deliveryWorkflowSteps[stepIndex].comments = completionData.comments;
      
      // Move to next step if available
      if (stepIndex + 1 < this.deliveryWorkflowSteps.length) {
        this.deliveryWorkflowSteps[stepIndex + 1].status = 'ready';
      }
      
      // Here you would typically make an API call to update the backend
      // this.orderService.updateDeliveryStep(completionData);
    }
  }

  // File type helper methods
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

  isFileTypeArchive(fileName: string): boolean {
    if (!fileName) return false;
    const extension = fileName.toLowerCase().split('.').pop();
    const archiveExtensions = ['zip', 'rar', '7z', 'tar', 'gz'];
    return archiveExtensions.includes(extension || '');
  }

  // Helper method to truncate filename for display
  getTruncatedFileName(fileName: string): string {
    if (!fileName) return '';
    const maxLength = 16;
    if (fileName.length <= maxLength) return fileName;
    
    const extension = fileName.split('.').pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension!.length - 4);
    return `${truncatedName}...${extension}`;
  }

  // Helper method to format file date
  getFormattedFileDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
        'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      
      const day = date.getDate();
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      let hours = date.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${month} ${day}, ${year}, ${hours}:${minutes} ${ampm}`;
    } catch {
      return dateString;
    }
  }
}
