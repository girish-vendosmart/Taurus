import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonTableComponent, TableConfig, TableColumn } from '../../../../shared/components/common-table/common-table.component';

@Component({
  selector: 'app-submitted-rfq',
  standalone: true,
  imports: [CommonModule, CommonTableComponent],
  templateUrl: './submitted-rfq.component.html',
  styleUrl: './submitted-rfq.component.scss'
})
export class SubmittedRfqComponent implements OnInit {
  // State management for view all functionality
  showAllLineItems = false;
  showAllAttachments = false;
  
  // Current RFQ ID from route
  currentRfqId: string = '';

  rfqData = {
    rfqNumber: 'RFQ-2024-001847',
    reference: 'Reference this number for all communications',
    projectInfo: {
      projectName: 'Automotive Backup Assembly',
      deliveryDate: 'March 15, 2024',
      deliveryLocation: 'Factory A - Industrial Blvd',
      submitted: 'January 15, 2024, 2:30 PM'
    },
    bomSummary: {
      totalLineItems: 12,
      drawingsUploaded: 5,
      totalQuantity: 2500,
      materials: 'Aluminum, Steel, Plastic'
    },
    allLineItems: [
      {
        partNumber: 'RFK-001',
        description: 'Main Support Bracket',
        quantity: 700,
        material: 'Aluminum 6061',
        unit: 'EA'
      },
      {
        partNumber: 'RFK-002',
        description: 'Mounting Plate',
        quantity: 1000,
        material: 'Steel A36',
        unit: 'EA'
      },
      {
        partNumber: 'RFK-003',
        description: 'Spacer Ring',
        quantity: 1000,
        material: 'Nylon',
        unit: 'EA'
      },
      {
        partNumber: 'RFK-004',
        description: 'Bearing Housing',
        quantity: 400,
        material: 'Aluminum 6061',
        unit: 'EA'
      },
      {
        partNumber: 'RFK-005',
        description: 'Connecting Rod',
        quantity: 800,
        material: 'Steel A36',
        unit: 'EA'
      },
      {
        partNumber: 'RFK-006',
        description: 'Pivot Pin',
        quantity: 1600,
        material: 'Stainless Steel',
        unit: 'EA'
      },
      {
        partNumber: 'RFK-007',
        description: 'Adjustment Screw',
        quantity: 400,
        material: 'Steel A36',
        unit: 'EA'
      },
      {
        partNumber: 'RFK-008',
        description: 'Spring Washer',
        quantity: 2400,
        material: 'Spring Steel',
        unit: 'EA'
      },
      {
        partNumber: 'RFK-009',
        description: 'Rubber Gasket',
        quantity: 800,
        material: 'EPDM Rubber',
        unit: 'EA'
      },
      {
        partNumber: 'RFK-010',
        description: 'Cover Plate',
        quantity: 400,
        material: 'Aluminum 6061',
        unit: 'EA'
      },
      {
        partNumber: 'RFK-011',
        description: 'Lock Nut',
        quantity: 1200,
        material: 'Steel A36',
        unit: 'EA'
      },
      {
        partNumber: 'RFK-012',
        description: 'Assembly Label',
        quantity: 400,
        material: 'Vinyl',
        unit: 'EA'
      }
    ],
    allAttachments: [
      {
        name: 'RFK-001-Drawing.pdf',
        size: '2.1 MB',
        type: 'pdf'
      },
      {
        name: 'BOM-Complete.xlsx',
        size: '1.2 MB',
        type: 'excel'
      },
      {
        name: 'Assembly-Model.step',
        size: '8.9 MB',
        type: 'step'
      },
      {
        name: 'RFK-002-Drawing.pdf',
        size: '1.8 MB',
        type: 'pdf'
      },
      {
        name: 'RFK-003-Drawing.pdf',
        size: '1.5 MB',
        type: 'pdf'
      },
      {
        name: 'RFK-004-Drawing.pdf',
        size: '2.3 MB',
        type: 'pdf'
      },
      {
        name: 'RFK-005-Drawing.pdf',
        size: '1.9 MB',
        type: 'pdf'
      },
      {
        name: 'Material-Specifications.pdf',
        size: '3.2 MB',
        type: 'pdf'
      },
      {
        name: 'Quality-Requirements.docx',
        size: '0.8 MB',
        type: 'doc'
      },
      {
        name: 'Assembly-Instructions.pdf',
        size: '2.7 MB',
        type: 'pdf'
      }
    ]
  };

  // Computed properties for displayed items
  get displayedLineItems() {
    return this.showAllLineItems 
      ? this.rfqData.allLineItems 
      : this.rfqData.allLineItems.slice(0, 3);
  }

  get displayedAttachments() {
    return this.showAllAttachments 
      ? this.rfqData.allAttachments 
      : this.rfqData.allAttachments.slice(0, 5);
  }

  get remainingLineItemsCount() {
    return this.rfqData.allLineItems.length - 3;
  }

  get remainingAttachmentsCount() {
    return this.rfqData.allAttachments.length - 5;
  }

  // Common table configuration for line items
  lineItemsTableConfig: TableConfig = {
    columns: [
      {
        field: 'partNumber',
        header: 'Part Number',
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
        filterable: false,
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
        sortable: false,
        filterable: false,
        width: '80px'
      }
    ],
    enableSearch: false,
    enableSort: true,
    enableFilter: false,
    enablePagination: false,
    pageSize: 10,
    showActions: false,
    enableColumnHide: false,
    enableColumnResize: false,
    actionButtons: []
  };

  downloadAttachment(attachment: any) {
    // Implementation for download functionality
    console.log('Downloading:', attachment.name);
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Extract RFQ ID from route
    this.activatedRoute.params.subscribe((params: any) => {
      this.currentRfqId = params['id'];
      console.log('Current RFQ ID:', this.currentRfqId);
      // Here you can load specific RFQ data based on the ID
      this.loadRfqData(this.currentRfqId);
    });
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
}
