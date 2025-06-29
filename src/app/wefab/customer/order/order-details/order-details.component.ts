import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonTableComponent, TableConfig } from '../../../../shared/components/common-table/common-table.component';
import { CommonService } from '../../../../shared/services/common.service';

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
  currencyCode: string = 'INR';
  
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

  constructor(
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orderId = params['id'];
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
      order_name: 'Automotive Backup Assembly Quote',
      description: 'Manufacturing order for precision machined components based on approved quotation',
      docstatus: 1,
      creation: '2024-01-20T10:30:00',
      modified: '2024-01-20T14:15:00',
      expected_delivery: '2024-02-15T14:00:00',
      delivery_address: 'Factory A - Industrial Blvd',
      special_instructions: 'Handle with care. Quality inspection required before delivery.',
      total_amount: 151000.00,
      payment_terms: 'Net 30 days',
      delivery_terms: '15-20 business days',
      supplier: 'Precision Manufacturing Co.',
      purchase_order: 'PO-2024-001234',
      status: 'In Progress',
      customer: 'Automotive Solutions Ltd.',
      quotation_id: 'QTN0000264'
    };

    this.orderItems = [
      {
        name: 'RFK-001',
        item_code: 'RFK-001',
        item_description: 'Main Support Bracket - CNC Machined Aluminum',
        quantity: 700,
        unit: 'EA',
        rate: 85.50,
        amount: 59850.00,
        current_status: 'In Progress',
        delivery_date: '2024-02-10',
        notes: 'Material: Aluminum 6061-T6, Finish: Anodized',
        material: 'Aluminum 6061-T6',
        specification: 'Anodized Finish',
        drawing_ref: 'DRW-001'
      },
      {
        name: 'RFK-002',
        item_code: 'RFK-002',
        item_description: 'Mounting Plate Assembly',
        quantity: 1000,
        unit: 'EA',
        rate: 45.75,
        amount: 45750.00,
        current_status: 'Pending',
        delivery_date: '2024-02-12',
        notes: 'Material: A36, Powder Coated',
        material: 'Steel A36',
        specification: 'Powder Coated',
        drawing_ref: 'DRW-002'
      }
    ];

    this.orderAttachments = [
      {
        name: 'Technical Drawing',
        file: '/files/technical-drawing.pdf',
        file_url: '/files/technical-drawing.pdf',
        file_name: 'Technical Drawing.pdf',
        file_type: 'application/pdf',
        description: 'Technical specifications and drawings',
        category: 'Technical',
        uploaded_on: '2024-01-20T10:30:00'
      },
      {
        name: 'Quality Requirements',
        file: '/files/quality-requirements.pdf',
        file_url: '/files/quality-requirements.pdf',
        file_name: 'Quality Requirements.pdf',
        file_type: 'application/pdf',
        description: 'Quality requirements and specifications',
        category: 'Quality',
        uploaded_on: '2024-01-20T10:35:00'
      }
    ];
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
      'in progress': 'status-in-progress',
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

  getFormattedCurrencyAmount(amount: number, currency?: string): string {
    const currencyToUse = currency || this.currencyCode;
    return `${currencyToUse} ${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
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
