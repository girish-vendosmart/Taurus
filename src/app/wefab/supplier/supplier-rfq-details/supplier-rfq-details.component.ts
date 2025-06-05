import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonTableComponent, TableConfig, ActionButton } from '../../../shared/components/common-table/common-table.component';
import { CommonService } from '../../../shared/services/common.service';
import { ConversationTrailComponent } from '../../../shared/components/conversation-trail/conversation-trail.component';

export interface RFQDetails {
  name: string;
  rfq_name: string;
  description: string;
  docstatus: number;
  creation: string;
  modified: string;
  target_completion: string;
  expiry_date: string;
  delivery_address: string;
  special_instructions: string;
  total_amount: number;
  payment_terms: string;
  delivery_terms: string;
  supplier: string;
  enquiry: string;
}

export interface RFQItem {
  name: string;
  item_code: string;
  item_description: string;
  material: string;
  specification: string;
  quantity: number;
  unit: string;
  estimated_rate: number;
  process_required: string;
  tolerance: string;
  notes: string;
  cad_file_reference: string;
}

export interface RFQAttachment {
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
  selector: 'app-supplier-rfq-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CommonTableComponent,
    ConversationTrailComponent
  ],
  templateUrl: './supplier-rfq-details.component.html',
  styleUrl: './supplier-rfq-details.component.scss'
})
export class SupplierRfqDetailsComponent implements OnInit {
  rfqId: string = '';
  activeTab: 'overview' | 'comment' | 'resolution' = 'overview';
  loading: boolean = false;
  
  rfqDetails: RFQDetails = {
    name: '',
    rfq_name: '',
    description: '',
    docstatus: 0,
    creation: '',
    modified: '',
    target_completion: '',
    expiry_date: '',
    delivery_address: '',
    special_instructions: '',
    total_amount: 0,
    payment_terms: '',
    delivery_terms: '',
    supplier: '',
    enquiry: ''
  };

  rfqParts: RFQItem[] = [];

  rfqAttachments: RFQAttachment[] = [];

  // Contract modal properties
  showContractModal: boolean = false;
  contractFullyRead: boolean = false;
  contractAccepted: boolean = false;
  pdfLoaded: boolean = false;
  contractPdfUrl: string = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'; // Sample PDF for demonstration

  rfqNewDetails: any;

  // RFQ Items Table Configuration
  rfqItemsTableConfig: TableConfig = {
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
        field: 'material',
        header: 'Material',
        sortable: true,
        filterable: true,
      },
      {
        field: 'specification',
        header: 'Specification',
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
        field: 'process_required',
        header: 'Process Required',
        sortable: true,
        filterable: true,
      },
      {
        field: 'tolerance',
        header: 'Tolerance',
        sortable: true,
        filterable: true,
      },
      {
        field: 'notes',
        header: 'Notes',
        sortable: true,
        filterable: true,
      }
    ],
    enableSearch: true,
    enableSort: true,
    enableFilter: true,
    enablePagination: true,
    pageSize: 10,
    showActions: false
  };
  supplierRfqId: string = '';
  supplierRfqDetails: any;
  supplierQuotationId: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.rfqId = params['id'];
      
      console.log(this.rfqId)
      this.supplierRfqId = localStorage.getItem('supplier_rfq_id') || '';

      this.accessFirebaseTrigger('Supplier Request for Quotation', this.rfqId)
    });


  }

  accessFirebaseTrigger(doctType_name: string, doctypeId: string) {
    console.log(`🔥 Firebase trigger called for ${doctType_name}`);
    this.commonService.commonFirebaseTrigger(doctType_name, doctypeId).subscribe({
      next: (res: any) => {
        this.loadSupplierDetails();
      },
      error: (error) => {
        console.error(`❌ Firebase trigger failed for ${doctType_name}:`, error);
      }
    });
  }

  loadSupplierDetails() {
    let endPoint = `/api/resource/Supplier Request for Quotation/${this.rfqId}-${this.supplierRfqId}`;
    this.commonService.getWefabData(endPoint).subscribe((res: any) => {
      if(res.data.status === 'Not Opened') {
        this.updateRFQStatus();
      } else {
        this.supplierRfqDetails = res.data;
        this.supplierQuotationId = res.data.quotation_id
        this.loadRFQDetails();  
      }
    });
  }

  updateRFQStatus() {
    let apiEndpoint = `/api/resource/Supplier Request for Quotation/${this.rfqId}-${this.supplierRfqId}`;
    this.commonService.putWefabData(apiEndpoint, {
      status: 'Opened'
    }).subscribe((res: any) => {
      console.log('Update RFQ Status', res);
      this.loadSupplierDetails();
    });
  }

  loadRFQDetails() {
    this.loading = true;
    this.commonService.getWefabData(`/api/resource/Request for Quotation/${this.rfqId}`).subscribe((res: any) => {
      this.rfqNewDetails = res.data;
      
      // Map API response to rfqDetails
      if (this.rfqNewDetails) {
        this.rfqDetails = {
          name: this.rfqNewDetails.name || '',
          rfq_name: this.rfqNewDetails.rfq_name || '',
          description: this.rfqNewDetails.description || '',
          docstatus: this.rfqNewDetails.docstatus || 0,
          creation: this.rfqNewDetails.creation || '',
          modified: this.rfqNewDetails.modified || '',
          target_completion: this.rfqNewDetails.target_completion || '',
          expiry_date: this.rfqNewDetails.expiry_date || '',
          delivery_address: this.rfqNewDetails.delivery_address || '',
          special_instructions: this.rfqNewDetails.special_instructions || '',
          total_amount: this.rfqNewDetails.total_amount || 0,
          payment_terms: this.rfqNewDetails.payment_terms || '',
          delivery_terms: this.rfqNewDetails.delivery_terms || '',
          supplier: this.rfqNewDetails.supplier || '',
          enquiry: this.rfqNewDetails.enquiry || ''
        };

        // Map API response items to rfqParts
        if (this.rfqNewDetails.items && this.rfqNewDetails.items.length > 0) {
          this.rfqParts = this.rfqNewDetails.items.map((item: any) => ({
            name: item.name || '',
            item_code: item.item_code || '',
            item_description: item.item_description || '',
            material: item.material || '',
            specification: item.specification || '',
            quantity: item.quantity || 0,
            unit: item.unit || '',
            estimated_rate: item.estimated_rate || 0,
            process_required: item.process_required || '',
            tolerance: item.tolerance || '',
            notes: item.notes || '',
            cad_file_reference: item.cad_file_reference || ''
          }));
        }

        // Map API response attachments to rfqAttachments
        if (this.rfqNewDetails.attachments && this.rfqNewDetails.attachments.length > 0) {
          this.rfqAttachments = this.rfqNewDetails.attachments.map((attachment: any) => ({
            name: attachment.name || '',
            file: attachment.file || '',
            file_name: attachment.file_name || '',
            file_type: attachment.file_url.split('.').pop().toLowerCase(),
            file_url: attachment.file_url || '',
            description: attachment.description || '',
            category: attachment.category || '',
            uploaded_on: attachment.uploaded_on || ''
          }));
        }
      }
      
      this.loading = false;
      console.log('RFQ Details loaded:', this.rfqDetails);
      console.log('RFQ Parts loaded:', this.rfqParts);
      console.log('RFQ Attachments loaded:', this.rfqAttachments);
    }, (error) => {
      this.loading = false;
      console.error('Error loading RFQ details:', error);
    });
  }

  setActiveTab(tab: 'overview' | 'comment' | 'resolution') {
    this.activeTab = tab;
  }

  goBack() {
    this.router.navigate(['/wefab/supplier/rfq']);
  }

  createQuotation() {
    // Navigate to create quotation page with rfqId as query parameter
    this.router.navigate(['/wefab/supplier/create-quotation'], {
      queryParams: { rfqId: this.rfqDetails.name }
    });
  }

  viewContract() {
    // Open the contract modal
    this.showContractModal = true;
    this.contractFullyRead = false;
    this.contractAccepted = false;
    this.pdfLoaded = true;
    
    // For demo purposes, we'll simulate PDF loading and enable checkbox after 3 seconds
    // In a real application, you would detect when the user has scrolled through the PDF
    setTimeout(() => {
      this.contractFullyRead = true;
    }, 3000);
  }

  closeContractModal() {
    this.showContractModal = false;
    this.contractFullyRead = false;
    this.contractAccepted = false;
    this.pdfLoaded = false;
  }

  onPdfLoad() {
    this.pdfLoaded = true;
  }

  onContractScroll(event: Event) {
    const element = event.target as HTMLElement;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    
    // Check if user has scrolled to the bottom (with a small tolerance)
    const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10;
    
    if (scrolledToBottom && !this.contractFullyRead) {
      this.contractFullyRead = true;
    }
  }

  acceptContract() {
    if (this.contractAccepted && this.contractFullyRead) {
      // Implement contract acceptance logic
      console.log('Contract accepted for RFQ:', this.rfqId);
      
      // You can add additional logic here such as:
      // - API call to save contract acceptance
      // - Update RFQ status
      // - Show success message
      
      this.closeContractModal();
      
      // Optional: Show success notification
      alert('Contract has been accepted successfully!');
    }
  }

  downloadFile() {
    // Implement file download functionality for contract
    console.log('Downloading file for RFQ:', this.rfqId);
  }

  getStatusClass(status:any) {
    console.log('RFQ Details page status', status);
    switch (status) {
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

  getStatusText(): string {
    switch (this.supplierRfqDetails.docstatus) {
      case 1:
        return 'Published';
      case 0:
        return 'Draft';
      case 2:
        return 'Closed';
      default:
        return 'Unknown';
    }
  }

  // Helper method to format date
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  }

  // Helper method to strip HTML tags from description
  stripHtmlTags(html: string): string {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  // Common Table Event Handlers
  onRfqItemRowClick(event: { event: Event, rowData: any }) {
    console.log('RFQ Item row clicked:', event.rowData);
  }

  onRfqItemLinkClick(event: { rowData: any, column: any }) {
    console.log('RFQ Item link clicked:', event.rowData, event.column);
  }

  onRfqItemActionClick(event: { action: string, rowData: any }) {
    console.log('RFQ Item action clicked:', event.action, event.rowData);
  }

  // Attachment methods
  viewAttachment(attachment: RFQAttachment) {
    // Open attachment in new window/tab
    if (attachment.file_url) {
      window.open(attachment.file_url, '_blank');
    }
  }

  downloadAttachment(attachment: RFQAttachment) {
    // Implement attachment download functionality
    if (attachment.file_url) {
      const link = document.createElement('a');
      link.href = attachment.file_url;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  viewQuotation() {
    this.router.navigateByUrl(`/wefab/supplier/quotation/details/${this.supplierQuotationId}`);
  }
}
