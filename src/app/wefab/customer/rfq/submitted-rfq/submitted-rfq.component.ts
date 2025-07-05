import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonTableComponent, TableConfig, TableColumn } from '../../../../shared/components/common-table/common-table.component';
import { CommonService } from '../../../../shared/services/common.service';
import { ConversationTrailComponent } from '../../../../shared/components/conversation-trail/conversation-trail.component';
import { ActivityTrailComponent, ActivityLogData } from '../../../../shared/components/activity-trail/activity-trail.component';
import { SplitButtonComponent } from '../../../../shared/components/split-button/split-button.component';
import { SweetAlertService } from '../../../../shared/services/sweet-alert.service';
import { HttpParams } from '@angular/common/http';

interface RfqAttachment {
  name: string;
  size: string;
  type: string;
  creation: string;
  url: string;
}

interface RfqLineItem {
  partNumber: string;
  description: string;
  quantity: number;
  material: string;
  unit: string;
}

interface ReviewStage {
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
}

@Component({
  selector: 'app-submitted-rfq',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CommonTableComponent, 
    ConversationTrailComponent,
    ActivityTrailComponent,
    SplitButtonComponent
  ],
  templateUrl: './submitted-rfq.component.html',
  styleUrl: './submitted-rfq.component.scss'
})
export class SubmittedRfqComponent implements OnInit {
  // Tab management
  activeTab: string = 'overview';
  
  // Activity trail properties
  activityTrail: ActivityLogData[] = [];
  activityTrailLoading: boolean = false;
  
  // Action button properties
  severityOptions: any[] = [];
  
  // Comments functionality
  newComment: string = '';
  comments: any[] = [
    {
      id: 1,
      author: 'John Smith',
      role: 'Customer',
      roleClass: 'customer-role',
      message: 'Could you please clarify the material specification for part RFK-001? We need to ensure it meets our quality standards.',
      date: new Date('2024-01-16T10:30:00'),
      avatarColor: '#3b82f6',
      canEdit: true
    },
    {
      id: 2,
      author: 'Sarah Johnson',
      role: 'Wefab Engineer',
      roleClass: 'engineer-role',
      message: 'Thank you for your question. Part RFK-001 uses Aluminum 6061-T6 which exceeds standard automotive quality requirements. I\'ve attached the material certification for your review.',
      date: new Date('2024-01-16T14:45:00'),
      avatarColor: '#10b981',
      canEdit: false
    },
    {
      id: 3,
      author: 'John Smith',
      role: 'Customer',
      roleClass: 'customer-role',
      message: 'Perfect, that looks good. One more question - what\'s the expected lead time for the tooling setup?',
      date: new Date('2024-01-17T09:15:00'),
      avatarColor: '#3b82f6',
      canEdit: true
    }
  ];

  // State management for view all functionality
  showAllLineItems = false;
  showAllAttachments = false;
  
  // Current RFQ ID from route
  currentRfqId: string = '';

  // Filter properties
  searchPartNumber: string = '';
  selectedMaterial: string = '';
  selectedUnit: string = '';
  filteredLineItems: RfqLineItem[] = [];
  availableMaterials: string[] = [];
  availableUnits: string[] = [];

  rfqData = {
    rfqNumber: '',
    reference: '',
    projectInfo: {
      projectName: '',
      deliveryDate: '',
      deliveryLocation: '',
      submitted: ''
    },
    bomSummary: {
      totalLineItems: 0,
      drawingsUploaded: 0,
      totalQuantity: 0,
      materials: ''
    },
    reviewStatus: {
      currentStatus: '',
      stages: [] as ReviewStage[]
    },
    allLineItems: [] as RfqLineItem[],
    allAttachments: [] as RfqAttachment[]
  };
  rfqName: any;
  rfqStatus: any;

  // Computed properties for displayed items
  get displayedLineItems() {
    // Use filtered items if any filters are applied
    const itemsToShow = this.hasActiveFilters() ? this.filteredLineItems : this.rfqData.allLineItems;
    return this.showAllLineItems 
      ? itemsToShow 
      : itemsToShow.slice(0, 3);
  }

  // Check if any filters are active
  hasActiveFilters(): boolean {
    return this.searchPartNumber.trim() !== '' || this.selectedMaterial !== '' || this.selectedUnit !== '';
  }

  get displayedAttachments(): RfqAttachment[] {
    return this.showAllAttachments 
      ? this.rfqData.allAttachments 
      : this.rfqData.allAttachments.slice(0, 5);
  }

  get remainingLineItemsCount() {
    const totalItems = this.hasActiveFilters() ? this.filteredLineItems.length : this.rfqData.allLineItems.length;
    return Math.max(0, totalItems - 3);
  }

  get remainingAttachmentsCount() {
    return this.rfqData.allAttachments.length - 5;
  }

  // Common table configuration for line items
  lineItemsTableConfig: TableConfig = {
    columns: [
      {
        field: 'partNumber',
        header: 'Part Name',
        sortable: true,
        filterable: true,
        filterType: 'text',
        width: '150px'
      },
      {
        field: 'description',
        header: 'Description',
        sortable: true,
        filterable: true,
        filterType: 'text',
        width: '300px'
      },
      {
        field: 'quantity',
        header: 'Quantity',
        sortable: true,
        filterable: true,
        filterType: 'text',
        width: '120px'
      },
      {
        field: 'material',
        header: 'Material',
        sortable: true,
        filterable: true,
        filterType: 'text',
        width: '200px'
      },
      {
        field: 'unit',
        header: 'Unit',
        sortable: true,
        filterable: true,
        filterType: 'text',
        width: '80px'
      }
    ],
    enableSearch: true,
    enableSort: true,
    enableFilter: true,
    enablePagination: true,
    pageSize: 10,
    showActions: false,
    enableColumnHide: false,
    enableColumnResize: false,
    actionButtons: []
  };

  downloadAttachment(attachment: RfqAttachment) {
    console.log('Downloading:', attachment.name);
    // Implementation for download functionality
    window.open(attachment.url, '_blank');
  }

  // Filter methods
  initializeFilters() {
    // Initialize filtered data
    this.filteredLineItems = [...this.rfqData.allLineItems];
    
    // Get unique materials and units for filter options
    this.availableMaterials = [...new Set(this.rfqData.allLineItems.map(item => item.material))];
    this.availableUnits = [...new Set(this.rfqData.allLineItems.map(item => item.unit))];
  }

  onSearchPartNumber() {
    this.applyFilters();
  }

  onFilterMaterial() {
    this.applyFilters();
  }

  onFilterUnit() {
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.rfqData.allLineItems];

    // Apply part number search
    if (this.searchPartNumber.trim()) {
      filtered = filtered.filter(item => 
        item.partNumber.toLowerCase().includes(this.searchPartNumber.toLowerCase()) ||
        item.description.toLowerCase().includes(this.searchPartNumber.toLowerCase())
      );
    }

    // Apply material filter
    if (this.selectedMaterial) {
      filtered = filtered.filter(item => item.material === this.selectedMaterial);
    }

    // Apply unit filter
    if (this.selectedUnit) {
      filtered = filtered.filter(item => item.unit === this.selectedUnit);
    }

    this.filteredLineItems = filtered;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
    private sweetAlertService: SweetAlertService
  ) {}

  ngOnInit() {
    // Extract RFQ ID from route
    this.activatedRoute.params.subscribe((params: any) => {
      this.currentRfqId = params['id'];
      console.log('Current RFQ ID:', this.currentRfqId);
      // Here you can load specific RFQ data based on the ID
      this.getRfqData(this.currentRfqId);
      this.loadRfqData(this.currentRfqId);
      // Initialize filters after data is loaded
      this.initializeFilters();
      // Action list will be loaded after RFQ data is fetched
    });
  }

  getRfqData(rfqId: string) {
    let apiEndpoint = `/api/resource/Customer Request for Quotation/${rfqId}?fields=["*"]`;
    this.commonService.getData(apiEndpoint).subscribe((res: any) => {
      this.rfqName = res.data.customer_rfq_name;
      this.rfqStatus = res.data.workflow_state;
      this.rfqData.rfqNumber = res.data.name;
      this.rfqData.reference = res.data.reference || '----';
      this.rfqData.projectInfo.projectName = res.data.project || '----';
      this.rfqData.projectInfo.deliveryDate = res.data.required_by_date || '----';
      this.rfqData.projectInfo.deliveryLocation = res.data.full_delivery_address || '----';
      
      // Transform line items
      const transformedLineItems = (res.data.line_items || []).map((item: any) => ({
        partNumber: item.item_name,
        description: item.item_description,
        quantity: item.quantity,
        material: item.surface_finish || '----',
        unit: item.unit
      }));

      this.rfqData.allLineItems = transformedLineItems;
      this.rfqData.bomSummary.totalLineItems = transformedLineItems.length;
      
      // Transform attachments with proper typing
      this.rfqData.allAttachments = (res.data.attachments || []).map((attachment: any): RfqAttachment => ({
        name: attachment.file_name || attachment.name,
        size: attachment.file_size || '0 KB',
        url: attachment.file_url || '----',
        type: this.getFileType(attachment.file_name || attachment.name),
        creation: attachment.creation || new Date().toISOString()
      }));
      
      this.rfqData.bomSummary.drawingsUploaded = this.rfqData.allAttachments.length;
      this.rfqData.bomSummary.totalQuantity = transformedLineItems.reduce((acc: number, item: any) => acc + item.quantity, 0);

      // Set up order tracking stages
      this.rfqData.reviewStatus.stages = [
        {
          title: 'Supplier Confirmation',
          status: 'completed'
        },
        {
          title: 'Preparation',
          status: 'completed'
        },
        {
          title: 'Work in Progress',
          status: 'completed'
        },
        {
          title: 'Finishing',
          status: 'in-progress'
        },
        {
          title: 'Quality Inspection',
          status: 'pending'
        },
        {
          title: 'Dispatch',
          status: 'pending'
        },
        {
          title: 'Order Complete',
          status: 'pending'
        }
      ];

      // Initialize filters after updating line items
      this.initializeFilters();
      
      // Get action list after RFQ data is loaded
      this.getActionList();
    });
  }

  // Add helper method to determine file type
  private getFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'doc';
      case 'xls':
      case 'xlsx':
        return 'excel';
      default:
        return 'file';
    }
  }

  private loadRfqData(rfqId: string) {
    // Implementation to load RFQ data based on ID
    // This would typically involve calling a service to fetch data from backend
    console.log('Loading RFQ data for ID:', rfqId);
    
    // For now, you can update the static data to reflect the current RFQ ID
    // In a real implementation, you would fetch this data from a service
    this.rfqData.rfqNumber = rfqId;
  }

  viewAllItems() {
    // Toggle view all line items
    this.showAllLineItems = !this.showAllLineItems;
  }

  viewAllAttachments() {
    // Toggle view all attachments
    this.showAllAttachments = !this.showAllAttachments;
  }

  // Handle table events
  onLineItemRowClick(event: any) {
    console.log('Line item clicked:', event.rowData);
  }

  onLineItemLinkClick(event: any) {
    console.log('Line item link clicked:', event);
  }

  onLineItemActionClick(event: any) {
    console.log('Line item action clicked:', event);
  }

  // New action button methods
  copyRfqNumber() {
    // Copy RFQ number to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.rfqData.rfqNumber).then(() => {
        console.log('RFQ number copied to clipboard:', this.rfqData.rfqNumber);
        // You can add a toast notification here
      }).catch(err => {
        console.error('Failed to copy RFQ number:', err);
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = this.rfqData.rfqNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      console.log('RFQ number copied to clipboard (fallback):', this.rfqData.rfqNumber);
    }
  }

  downloadRfqSummary() {
    // Implementation for downloading RFQ summary
    console.log('Downloading RFQ summary for:', this.rfqData.rfqNumber);
    // Here you would typically trigger a download or API call
  }

  createNewRfq() {
    // Implementation for creating new RFQ
    console.log('Creating new RFQ');
    // Here you would typically navigate to create RFQ page
  }

  goToDashboard() {
    // Implementation for navigating to dashboard
    console.log('Navigating to dashboard');
    // Here you would typically navigate to dashboard page
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'activity') {
      this.loadActivityTrail();
    }
  }

  private loadActivityTrail(): void {
    this.activityTrailLoading = true;
    this.commonService.getData('/api/method/wefab.wefab.api.common.engine.trail.activity.get_new_versions_trail?doctype=Customer Request for Quotation&docname=' + this.currentRfqId)
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

  // Navigate back to RFQ list
  goBack() {
    console.log('Navigating back to RFQ list');
    this.router.navigate(['/wefab/customer/rfq-list']);
  }

  // Handle technical review report link click
  viewTechnicalReviewReport() {
    const rfqId = this.rfqData.rfqNumber; // Use current RFQ number
    this.router.navigate(['/wefab/customer/technical-review-page', rfqId]);
  }

  getStatusClass(status: string): string {
    
    // Convert to lowercase and replace spaces with hyphens
    status = status.toLowerCase().replace(/\s+/g, '-');
    
    switch (status) {
      case 'missing-data':
        return 'status-review';
      case 'complete':
        return 'status-approved'
      case 'not-opened':
        return 'status-draft';
      case 'published':
        return 'status-approved';
      case 'deactivated':
        return 'status-paused'; 
      case 'invited':
        return 'status-open';
      case 'not-started':
        return 'status-draft';
      case 'under-review':
        return 'status-review';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'draft':
        return 'status-draft';
      case 'open':
        return 'status-open';
      case 'in-progress':
        return 'status-progress';
      case 'closed':
        return 'status-closed';
      case 'awarded':
        return 'status-awarded';
      case 'quoted':
        return 'status-awarded';
      case 'opened':
        return 'status-open';
      case 'cancelled':
        return 'status-rejected';
      case 'deactivate':
        return 'status-deactivate';
      case 'paused':
        return 'status-paused';
      case 'submitted':
        return 'status-awarded';
      case 'pending':
        return 'status-pending';
      case 'review':
        return 'status-review';
      case 'not-started':
        return 'status-draft';
      default:
        return 'status-default';
    }
  }

  // Action List - Get available workflow actions
  getActionList() {
    if (!this.currentRfqId) {
      console.warn('Cannot get action list: RFQ ID is missing');
      return;
    }

    console.log('Getting action list for RFQ:', this.currentRfqId);
    
    let obj: any = {
      doctype: 'Customer Request for Quotation',
      name: this.currentRfqId
    }
    let params = new HttpParams();
    params = params.append('doc', JSON.stringify(obj));
    let endPoint = `/api/method/frappe.model.workflow.get_transitions`;
    
    console.log('Action list endpoint:', endPoint);
    console.log('Action list params:', params.toString());
    
    this.commonService.getWefabData(endPoint, params).subscribe({
      next: (res: any) => {
        console.log('Action List Response:', res);
        if (res && res.message) {
          let updatedActionList = this.modifyActionList(res.message);
          this.severityOptions = [...updatedActionList];
          console.log('Updated severity options:', this.severityOptions);
        } else {
          console.warn('No actions available or invalid response format');
          this.severityOptions = [];
        }
      },
      error: (error) => {
        console.error('Error fetching action list:', error);
        this.severityOptions = [];
      }
    });
  }

  // Modify action list to match component format
  modifyActionList(actionList: any) {
    if (!Array.isArray(actionList)) {
      console.warn('Action list is not an array:', actionList);
      return [];
    }

    let updatedActionList: any = []

    actionList.forEach((action: any) => {
      let obj: any = {}
      obj['label'] = action.action || action.name || action.label
      obj['value'] = action.action || action.name || action.value
      updatedActionList.push(obj)
    })

    console.log('Modified action list:', updatedActionList);
    return updatedActionList;
  }

  // Test method to manually trigger an action (for debugging)
  testAction() {
    console.log('Testing action functionality');
    console.log('Current severityOptions:', this.severityOptions);
    console.log('Current RFQ ID:', this.currentRfqId);
    
    if (this.severityOptions.length > 0) {
      const testEvent = {
        option: this.severityOptions[0]
      };
      console.log('Triggering test action:', testEvent);
      this.onActionClick(testEvent);
    } else {
      console.log('No actions available to test');
    }
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
          // Now fetch the actual RFQ details
          this.getRfqData(docName);
          this.loadActivityTrail();
        }
      },
      error: (error) => {
        console.error('Error accessing firebase trigger:', error);
        // Try to fetch details anyway
        this.getRfqData(docName);
        this.loadActivityTrail();
      }
    });
  }

  // Handle action click from split button
  onActionClick(event: any) {
    console.log('Action triggered:', event);
    
    // Handle different event structures
    let selectedOption;
    if (event.option) {
      selectedOption = event.option;
    } else if (event.value) {
      selectedOption = event;
    } else {
      console.error('Invalid event structure:', event);
      return;
    }
    
    const actionValue = selectedOption.value || selectedOption.label;
    const actionLabel = selectedOption.label || selectedOption.value;
    
    console.log('Action value:', actionValue);
    console.log('Action label:', actionLabel);

    // Show confirmation dialog using SweetAlert
    this.sweetAlertService.confirm(
      'Confirm Action',
      `Are you sure you want to ${actionLabel.toLowerCase()} this RFQ?`,
      'question',
      'Yes, ' + actionLabel,
      'Cancel'
    ).then((result: any) => {
      if (result.isConfirmed) {
        console.log('User confirmed action:', actionValue);
        this.performRfqAction(actionValue);
      } else {
        console.log('User cancelled action');
      }
    }).catch((error: any) => {
      console.error('Error in confirmation dialog:', error);
    });
  }

  // Perform RFQ action
  private performRfqAction(action: string) {
    console.log('Performing RFQ action:', action);
    console.log('Current RFQ ID:', this.currentRfqId);
    
    if (!this.currentRfqId) {
      this.sweetAlertService.error('RFQ ID is missing. Please refresh the page and try again.');
      return;
    }

    const actionPayload = {
      action: action,
      doc: {
        doctype: 'Customer Request for Quotation',
        name: this.currentRfqId
      }
    };

    console.log('Action payload:', actionPayload);

    // Try the standard workflow API first
    this.commonService.postWefabData(`/api/method/frappe.model.workflow.apply_workflow`, actionPayload).subscribe({
      next: (res: any) => {
        console.log(`RFQ ${action} response:`, res);
        
        if (res && (res.message || res.data)) {
          this.sweetAlertService.success(`The RFQ has been ${action.toLowerCase()}ed successfully.`);
          // Refresh the RFQ details
          this.getRfqData(this.currentRfqId);
        } else {
          console.warn('Unexpected response format:', res);
          this.sweetAlertService.success(`Action ${action} completed.`);
          // Still refresh data
          this.getRfqData(this.currentRfqId);
        }
      },
      error: (error) => {
        console.error(`Error ${action.toLowerCase()}ing RFQ:`, error);
        
        // Try alternative API if the standard one fails
        this.performRfqActionAlternative(action);
      }
    });
  }

  // Alternative method to perform RFQ action
  private performRfqActionAlternative(action: string) {
    console.log('Trying alternative workflow API for action:', action);
    
    const alternativePayload = {
      doctype: 'Customer Request for Quotation',
      name: this.currentRfqId,
      action: action
    };

    // Try alternative endpoint
    this.commonService.postWefabData(`/api/method/frappe.client.set_value`, {
      doctype: 'Customer Request for Quotation',
      name: this.currentRfqId,
      fieldname: 'workflow_state',
      value: action
    }).subscribe({
      next: (res: any) => {
        console.log(`Alternative RFQ ${action} response:`, res);
        this.sweetAlertService.success(`The RFQ has been ${action.toLowerCase()}ed successfully.`);
        // Refresh the RFQ details
        this.getRfqData(this.currentRfqId);
      },
      error: (error) => {
        console.error(`Error with alternative ${action.toLowerCase()}ing RFQ:`, error);
        let errorMessage = `Failed to ${action.toLowerCase()} the RFQ. Please try again.`;
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.sweetAlertService.error(errorMessage);
      }
    });
  }

  // Check if there are any actions available for the split button
  hasAvailableActionsList(): boolean {
    return this.severityOptions && this.severityOptions.length > 0;
  }
}
