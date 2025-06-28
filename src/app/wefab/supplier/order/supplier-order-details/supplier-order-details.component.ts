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
import { WorkflowStep, WorkflowCompletionData } from '../../../../shared/components/approval-workflow/approval-workflow.component';
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
  rfq_id: string;
  quotation_id: string;
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
    InputTextModule,
    ApprovalWorkflowComponent
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
    rfq_id: '',
    quotation_id: '',
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

  workflowSteps: WorkflowStep[] = [
    {
      id: 'confirmation',
      title: 'Confirmation',
      status: 'ready',
      description: '',
      allowCompletion: true,
      isOpenDialog: false,
    },
    {
      id: 'preparation',
      title: 'Preparation',
      status: 'waiting',
      description: '',
      allowCompletion: true,
      isOpenDialog: true,
      requiresPhotos: false,
      requiresComments: false,
    },
    {
      id: 'work-in-progress',
      title: 'Work In Progress',
      status: 'waiting',
      description: '',
      allowCompletion: true,
      isOpenDialog: true,
      requiresPhotos: true,
      requiresComments: true,
    },
    {
      id: 'finishing',
      title: 'Finishing',
      status: 'waiting',
      description: '',
      allowCompletion: true,
      requiresPhotos: true,
      requiresComments: true,
    },
    {
      id: 'inspection',
      title: 'Inspection',
      status: 'waiting',
      description: '',
      allowCompletion: true,
      requiresPhotos: true,
      requiresComments: true,
    },
    {
      id: 'dispatch',
      title: 'Dispatch In Progress',
      status: 'waiting',
      description: '',
      allowCompletion: true,
      requiresPhotos: true,
      requiresComments: true
    }
  ];

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orderId = params['id'];
      console.log('Order ID:', this.orderId);
      if (this.orderId) {
        this.accessFirebaseTrigger('Purchase Order', this.orderId);
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
      doctype: 'Purchase Order',
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
    let endpoint = `/api/resource/Purchase Order/${this.orderId}`;
    
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
      }
    });
  }

  loadOrderItems() {
    // Load order items from API
    let endpoint = `/api/resource/Purchase Order Item?filters=[["parent", "=", "${this.orderId}"]]`;
    
    this.commonService.getWefabData(endpoint).subscribe({
      next: (res: any) => {
        console.log('Order items:', res.data);
        this.orderItems = this.transformApiDataToOrderItems(res.data);
      },
      error: (error) => {
        console.error('Error fetching Order items:', error);
      }
    });
  }

  loadOrderAttachments() {
    // Load order attachments from API
    let endpoint = `/api/resource/File?filters=[["attached_to_doctype", "=", "Purchase Order"],["attached_to_name", "=", "${this.orderId}"]]`;
    
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

  transformApiDataToOrderDetails(apiData: any): OrderDetails {
    return {
      name: apiData.name || '',
      order_name: apiData.po_name || apiData.title || '',
      description: apiData.description || '',
      docstatus: apiData.docstatus || 0,
      creation: apiData.creation || '',
      modified: apiData.modified || '',
      expected_delivery: apiData.actual_delivery_date || '',
      delivery_address: apiData.delivery_address || '',
      special_instructions: apiData.special_instructions || '',
      total_amount: apiData.total_amount || apiData.grand_total || 0,
      payment_terms: apiData.payment_terms || '',
      delivery_terms: apiData.delivery_terms || '',
      supplier: apiData.supplier || '',
      purchase_order: apiData.purchase_order || '',
      rfq_id: apiData.rfq_reference || '',
      quotation_id: apiData.supplier_quotation || '',
      status: apiData.po_status || ''
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
        doctype: 'Purchase Order',
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

   // 
   getStatusClass(status:any) {
    console.log('RFQ Details page status', status);
    switch (status) {
      case 'Supplier Confirmation':
        return 'status-open';
      case 'Submitted':
        return 'status-awarded';
      case 'Cancelled':
        return 'status-rejected';
      case 'Draft':
        return 'status-draft';
      case 'Opened': 
        return 'status-open';
      case 'Not Opened':
        return 'status-open';
      case 'Paused':
        return 'status-paused';
      case 'Deactivate':
        return 'status-deactivate';
      case 'Closed':
        return 'status-closed';
      case 'Quoted':
        return 'status-awarded';
      case 'Not Opened':
        return 'status-open';
      case 'In Progress':
        return 'status-progress';
      default:
        return 'status-default';
    }
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

  onWorkflowStepCompleted(data: WorkflowCompletionData): void {
    console.log('Workflow step completed:', data);
    
    // Find the completed step
    const completedStepIndex = this.workflowSteps.findIndex(step => step.id === data.stepId);
    if (completedStepIndex === -1) {
      console.error('Step not found:', data.stepId);
      return;
    }

    // Update the completed step
    this.workflowSteps[completedStepIndex] = {
      ...this.workflowSteps[completedStepIndex],
      status: 'complete',
      completedDate: new Date(),
      completedBy: 'Current User', // You can get this from auth service
      comments: data.comments || '',
      photos: data.photos ? data.photos.map(file => file.name) : []
    };

    // Activate the next step if it exists
    if (completedStepIndex + 1 < this.workflowSteps.length) {
      this.workflowSteps[completedStepIndex + 1] = {
        ...this.workflowSteps[completedStepIndex + 1],
        status: 'ready',
        description: 'Ready to Start'
      };
    }

    // Show success message
    this.sweetAlert.success(
      `${this.workflowSteps[completedStepIndex].title} has been completed successfully.`
    );

    // Handle photo uploads if any
    if (data.photos && data.photos.length > 0) {
      this.handlePhotoUploads(data.stepId, data.photos);
    }

    // Save the workflow progress (you might want to call an API here)
    this.saveWorkflowProgress(data);
    
    console.log('Updated workflow steps:', this.workflowSteps);
  }

  onWorkflowStepClicked(step: WorkflowStep): void {
    debugger
    console.log('Workflow step clicked:', step);
    
    // Handle different actions based on step status
    switch (step.status) {
      case 'complete':
        // Show step details for completed steps
        this.showStepDetails(step);
        break;
        
      case 'in-progress':
      case 'ready':
        // For active steps, the workflow component will handle the completion modal
        console.log(`Step ${step.title} is ready for completion`);
        break;
        
      case 'waiting':
        // Show info that previous steps need to be completed first
        this.sweetAlert.info(
          `Please complete the previous steps before starting "${step.title}".`
        );
        break;
        
      default:
        console.log('Unknown step status:', step.status);
    }
  }

  /**
   * Handle photo uploads for completed workflow steps
   */
  private handlePhotoUploads(stepId: string, photos: File[]): void {
    console.log('Handling photo uploads for step:', stepId, photos);
    
    // Here you would typically upload photos to your server
    // For now, we'll just log the action
    photos.forEach((photo, index) => {
      console.log(`Photo ${index + 1} for step ${stepId}:`, photo.name, photo.size);
    });
    
    // You might want to use your file upload service here
    // this.fileUploadService.uploadFiles(photos, stepId).subscribe(...)
  }

  /**
   * Save workflow progress to the server
   */
  private saveWorkflowProgress(completionData: WorkflowCompletionData): void {
    console.log('Saving workflow progress:', completionData);
    
    // Prepare the data for API call
    const workflowData = {
      orderId: this.orderId,
      stepId: completionData.stepId,
      comments: completionData.comments,
      completedDate: new Date().toISOString(),
      photos: completionData.photos ? completionData.photos.map(f => f.name) : []
    };

    // Here you would make an API call to save the workflow progress
    // Example:
    // this.commonService.postWefabData('/api/method/your.workflow.update', workflowData)
    //   .subscribe({
    //     next: (response) => {
    //       console.log('Workflow progress saved:', response);
    //     },
    //     error: (error) => {
    //       console.error('Error saving workflow progress:', error);
    //       this.sweetAlert.error('Error', 'Failed to save workflow progress. Please try again.');
    //     }
    //   });
    
    console.log('Workflow data to save:', workflowData);
  }

  /**
   * Show details of a completed step
   */
  private showStepDetails(step: WorkflowStep): void {
    const stepDetails = `
      <div style="text-align: left;">
        <p><strong>Status:</strong> ${step.status}</p>
        ${step.completedDate ? `<p><strong>Completed:</strong> ${this.formatDate(step.completedDate.toISOString())}</p>` : ''}
        ${step.completedBy ? `<p><strong>Completed By:</strong> ${step.completedBy}</p>` : ''}
        ${step.comments ? `<p><strong>Comments:</strong> ${step.comments}</p>` : ''}
        ${step.photos && step.photos.length > 0 ? `<p><strong>Photos:</strong> ${step.photos.length} file(s) attached</p>` : ''}
      </div>
    `;

    this.sweetAlert.htmlContent(
      `${step.title} Details`,
      stepDetails,
      'info'
    );
  }

  /**
   * Get the current active step
   */
  getCurrentActiveStep(): WorkflowStep | null {
    return this.workflowSteps.find(step => 
      step.status === 'in-progress' || step.status === 'ready'
    ) || null;
  }

  /**
   * Get workflow completion percentage
   */
  getWorkflowCompletionPercentage(): number {
    const completedSteps = this.workflowSteps.filter(step => step.status === 'complete').length;
    return Math.round((completedSteps / this.workflowSteps.length) * 100);
  }

  /**
   * Check if all workflow steps are completed
   */
  isWorkflowCompleted(): boolean {
    return this.workflowSteps.every(step => step.status === 'complete');
  }
} 