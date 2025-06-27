import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonTableComponent, TableConfig, TableColumn } from '../../../../shared/components/common-table/common-table.component';
import { CommonService } from '../../../../shared/services/common.service';

@Component({
  selector: 'app-submitted-rfq',
  standalone: true,
  imports: [CommonModule, FormsModule, CommonTableComponent],
  templateUrl: './submitted-rfq.component.html',
  styleUrl: './submitted-rfq.component.scss'
})
export class SubmittedRfqComponent implements OnInit {
  // State management for view all functionality
  showAllLineItems = false;
  showAllAttachments = false;
  
  // Current RFQ ID from route
  currentRfqId: string = '';

  // Filter properties
  searchPartNumber: string = '';
  selectedMaterial: string = '';
  selectedUnit: string = '';
  filteredLineItems: any[] = [];
  availableMaterials: string[] = [];
  availableUnits: string[] = [];

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
    // Add review status data
    reviewStatus: {
      currentStatus: 'Under Review',
      stages: [
        {
          id: 1,
          title: 'RFQ Received',
          description: 'Your request has been successfully submitted',
          status: 'completed',
          completedDate: 'January 15, 2024 at 2:30 PM',
          icon: 'pi pi-check'
        },
        {
          id: 2,
          title: 'Technical Review Completed',
          description: 'Engineering team has analyzed your requirements',
          status: 'completed',
          completedDate: 'January 17, 2024 at 11:45 AM',
          icon: 'pi pi-check',
          hasReportLink: true,
          reportLinkText: 'View Technical Review Report'
        },
        {
          id: 3,
          title: 'Quote Generation',
          description: 'Pricing and timeline calculation',
          status: 'in-progress',
          estimatedCompletion: 'Estimated completion: 2-3 business days',
          icon: 'pi pi-info-circle'
        },
        {
          id: 4,
          title: 'Quote Delivery',
          description: 'Final quote sent to your email',
          status: 'pending',
          icon: 'pi pi-send'
        }
      ]
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

  get displayedAttachments() {
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

  downloadAttachment(attachment: any) {
    // Implementation for download functionality
    console.log('Downloading:', attachment.name);
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
    private commonService: CommonService
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
    });
  }

  getRfqData(rfqId: string) {
    let apiEndpoint = `/api/resource/Customer Request for Quotation/${rfqId}?fields=["*"]`;
    this.commonService.getData(apiEndpoint).subscribe((res: any) => {
      this.rfqData.rfqNumber = res.data.name;
      this.rfqData.reference = res.data.reference || '----';
      this.rfqData.projectInfo.projectName = res.data.project_name || '----';
      this.rfqData.projectInfo.deliveryDate = res.data.delivery_date || '----';
      
      // Transform line items to match the expected format
      const transformedLineItems = (res.data.line_items || []).map((item: any) => ({
        partNumber: item.name,
        description: item.item_description,
        quantity: item.quantity,
        material: item.surface_finish || '----', // Using surface_finish as material since material isn't in the API response
        unit: item.unit
      }));

      this.rfqData.allLineItems = transformedLineItems;
      this.rfqData.bomSummary.totalLineItems = transformedLineItems.length;
      this.rfqData.bomSummary.drawingsUploaded = res.data.attachments?.length || 0;
      this.rfqData.bomSummary.totalQuantity = transformedLineItems.reduce((acc: number, item: any) => acc + item.quantity, 0);

      // Initialize filters after updating line items
      this.initializeFilters();
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
}
