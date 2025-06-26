import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CommonTableComponent, TableConfig, ActionButton } from '../../../../shared/components/common-table/common-table.component';

interface ReviewMetric {
  value: string;
  label: string;
  type: 'number' | 'percentage' | 'days';
}

interface EngineeringRecommendation {
  title: string;
  description: string;
  status: 'positive' | 'warning' | 'info';
}

interface BOMItem {
  itemCode: string;
  description: string;
  qty: number;
  material: string;
  process: string;
  threeDData: string;
  twoDData: string;
  attachments: string;
  status: string;
  dataCompleteness: string;
}

interface MissingInfoItem {
  itemCode: string;
  description: string;
  missingInfo: string;
  actionLabel?: string;
  canUpload?: boolean;
}

interface QuoteGenerationStep {
  title: string;
  status: 'complete' | 'in-progress' | 'pending';
  statusLabel?: string;
}

interface QuoteGenerationData {
  title: string;
  subtitle: string;
  overallStatus: 'processing' | 'complete' | 'pending';
  overallStatusLabel: string;
  steps: QuoteGenerationStep[];
  estimatedCompletion: {
    title: string;
    description: string;
  };
}

interface MissingInfoSummary {
  title: string;
  items: MissingInfoItem[];
  actions: {
    proceedLabel: string;
    proceedAction: string;
    updateLabel: string;
    updateAction: string;
  };
}

interface TechnicalReviewData {
  rfqNumber: string;
  status: string;
  title: string;
  subtitle: string;
  reviewSummary: {
    status: string;
    statusType: 'complete' | 'pending' | 'in-progress';
  };
  metrics: ReviewMetric[];
  engineeringRecommendations: EngineeringRecommendation[];
}

@Component({
  selector: 'app-technical-review-page',
  standalone: true,
  imports: [CommonModule, CommonTableComponent],
  templateUrl: './technical-review-page.component.html',
  styleUrl: './technical-review-page.component.scss'
})
export class TechnicalReviewPageComponent implements OnInit {
  
  // Current RFQ ID from route
  currentRfqId: string = '';

  // JSON data structure that can be replaced with API data
  reviewData: TechnicalReviewData = {
    rfqNumber: 'RFQ-2024-001847',
    status: 'Technical Review Complete',
    title: 'Technical Review Complete',
    subtitle: 'Your RFQ has been analyzed by our engineering team',
    reviewSummary: {
      status: 'Analysis Complete',
      statusType: 'complete'
    },
    metrics: [
      {
        value: '12',
        label: 'Parts Analyzed',
        type: 'number'
      },
      {
        value: '95%',
        label: 'Manufacturability',
        type: 'percentage'
      },
      {
        value: '3',
        label: 'Optimizations',
        type: 'number'
      },
      {
        value: '5-7',
        label: 'Days Lead Time',
        type: 'days'
      }
    ],
    engineeringRecommendations: [
      {
        title: 'Engineering Recommendation',
        description: 'Your design is well-suited for manufacturing. We\'ve identified 3 minor optimizations that could reduce costs by 12% while maintaining quality standards.',
        status: 'positive'
      }
    ]
  };

  // BOM Analysis Table Configuration
  bomTableConfig: TableConfig = {
    columns: [
      { 
        field: 'itemCode', 
        header: 'Item Code', 
        sortable: true, 
        filterable: true,
        width: '120px'
      },
      { 
        field: 'description', 
        header: 'Description', 
        sortable: true, 
        filterable: true,
        width: '200px'
      },
      { 
        field: 'qty', 
        header: 'Qty', 
        sortable: true, 
        filterable: true,
        width: '80px'
      },
      { 
        field: 'material', 
        header: 'Material', 
        sortable: true, 
        filterable: true,
        width: '140px'
      },
      { 
        field: 'process', 
        header: 'Process', 
        sortable: true, 
        filterable: true,
        width: '140px'
      },
      { 
        field: 'threeDData', 
        header: '3D Data', 
        sortable: false, 
        filterable: false,
        isStatus: true,
        width: '100px'
      },
      { 
        field: 'twoDData', 
        header: '2D Data', 
        sortable: false, 
        filterable: false,
        isStatus: true,
        width: '100px'
      },
      { 
        field: 'attachments', 
        header: 'Attachments', 
        sortable: false, 
        filterable: false,
        isStatus: true,
        width: '120px'
      },
      { 
        field: 'status', 
        header: 'Status', 
        sortable: true, 
        filterable: true, 
        isStatus: true,
        filterType: 'dropdown',
        filterOptions: [
          { label: 'Complete', value: 'Complete' },
          { label: 'Missing Data', value: 'Missing Data' },
          { label: 'Under Review', value: 'Under Review' }
        ],
        width: '120px'
      },
    ],
    enableSearch: false,
    enableSort: true,
    enableFilter: true,
    enablePagination: true,
    pageSize: 10,
    showActions: false,
    enableColumnHide: false,
    enableColumnResize: true,
    actionButtons: [
      { 
        label: 'Add Item', 
        action: 'add', 
        class: 'btn-primary',
        icon: 'pi pi-plus',
        severity: 'primary'
      }
    ]
  };

  // BOM Analysis Sample Data
  bomData: BOMItem[] = [
    {
      itemCode: 'P001-HSG',
      description: 'Main Housing Assembly',
      qty: 2,
      material: 'Aluminum 6061-T6',
      process: 'CNC Milling',
      threeDData: 'Complete',
      twoDData: 'Complete',
      attachments: 'Complete',
      status: 'Complete',
      dataCompleteness: '100%'
    },
    {
      itemCode: 'P002-SHF',
      description: 'Drive Shaft',
      qty: 1,
      material: 'Steel 1045',
      process: 'CNC Turning',
      threeDData: 'Missing Data',
      twoDData: 'Complete',
      attachments: 'Complete',
      status: 'Missing Data',
      dataCompleteness: '75%'
    },
    {
      itemCode: 'P003-IMP',
      description: 'Impeller',
      qty: 1,
      material: 'SS 316L',
      process: '5-Axis Milling',
      threeDData: 'Complete',
      twoDData: 'Missing Data',
      attachments: 'Complete',
      status: 'Missing Data',
      dataCompleteness: '66%'
    },
    {
      itemCode: 'P004-CVR',
      description: 'End Cover',
      qty: 2,
      material: 'Aluminum 6061-T6',
      process: 'CNC Milling',
      threeDData: 'Complete',
      twoDData: 'Missing Data',
      attachments: 'Missing Data',
      status: 'Missing Data',
      dataCompleteness: '33%'
    },
    {
      itemCode: 'P005-GSK',
      description: 'Gasket Set',
      qty: 1,
      material: 'Viton FKM',
      process: 'Die Cutting',
      threeDData: 'Complete',
      twoDData: 'Complete',
      attachments: 'Complete',
      status: 'Complete',
      dataCompleteness: '100%'
    },
    {
      itemCode: 'P006-BLT',
      description: 'Mounting Bolts',
      qty: 12,
      material: 'SS 316',
      process: 'Standard Part',
      threeDData: 'Complete',
      twoDData: 'Complete',
      attachments: 'Complete',
      status: 'Complete',
      dataCompleteness: '100%'
    },
    {
      itemCode: 'P007-BRG',
      description: 'Bearing Assembly',
      qty: 2,
      material: 'Steel',
      process: 'Purchased Part',
      threeDData: 'Complete',
      twoDData: 'Complete',
      attachments: 'Missing Data',
      status: 'Missing Data',
      dataCompleteness: '66%'
    },
    {
      itemCode: 'P008-PLG',
      description: 'Drain Plug',
      qty: 1,
      material: 'Brass',
      process: 'CNC Turning',
      threeDData: 'Complete',
      twoDData: 'Complete',
      attachments: 'Complete',
      status: 'Complete',
      dataCompleteness: '100%'
    }
  ];

  constructor(private route: ActivatedRoute) {}

  // Missing Information Summary Data
  missingInfoData: MissingInfoSummary = {
    title: 'Missing Information Summary',
    items: [
      {
        itemCode: 'P002-SHF',
        description: 'Drive Shaft',
        missingInfo: 'Missing 3D CAD file for accurate machining setup',
        actionLabel: 'Upload',
        canUpload: true
      },
      {
        itemCode: 'P004-CVR',
        description: 'End Cover',
        missingInfo: 'Missing 2D technical drawing with dimensions and tolerances',
        actionLabel: 'Upload',
        canUpload: true
      }
    ],
    actions: {
      proceedLabel: 'Proceed with Missing Data',
      proceedAction: 'proceed-missing',
      updateLabel: 'Update Missing Information',
      updateAction: 'update-missing'
    }
  };

  // Quote Generation Data
  quoteGenerationData: QuoteGenerationData = {
    title: 'Quote Generation',
    subtitle: 'Finalizing pricing and delivery timeline',
    overallStatus: 'processing',
    overallStatusLabel: 'Processing',
    steps: [
      {
        title: 'Material cost calculation',
        status: 'complete',
        statusLabel: 'Complete'
      },
      {
        title: 'Manufacturing process optimization',
        status: 'complete',
        statusLabel: 'Complete'
      },
      {
        title: 'Supplier network pricing',
        status: 'in-progress',
        statusLabel: 'In Progress'
      },
      {
        title: 'Final quote generation',
        status: 'pending',
        statusLabel: 'Pending'
      }
    ],
    estimatedCompletion: {
      title: 'Estimated Completion',
      description: 'Your detailed quote will be ready within 2-4 hours'
    }
  };

  // Handle table events
  onBomRowClick(event: any) {
    console.log('BOM Row clicked:', event);
  }

  onBomLinkClick(event: any) {
    console.log('BOM Link clicked:', event);
  }

  onBomActionClick(event: any) {
    console.log('BOM Action clicked:', event);
    if (event.action === 'add') {
      // Handle add item action
      console.log('Adding new item for:', event.rowData);
    }
  }

  // Handle missing info actions
  onUploadFile(item: MissingInfoItem) {
    console.log('Upload file for:', item);
    // Handle file upload logic
  }

  onMissingInfoAction(action: string) {
    console.log('Missing info action:', action);
    if (action === 'proceed-missing') {
      // Handle proceed with missing data
    } else if (action === 'update-missing') {
      // Handle update missing information
    }
  }

  ngOnInit() {
    // Extract RFQ ID from route
    this.route.params.subscribe(params => {
      this.currentRfqId = params['id'];
      console.log('Current RFQ ID:', this.currentRfqId);
      // Load RFQ-specific data based on the ID
      this.loadTechnicalReviewData(this.currentRfqId);
    });
  }

  private loadTechnicalReviewData(rfqId: string) {
    // Implementation to load technical review data based on RFQ ID
    // This would typically involve calling a service to fetch data from backend
    console.log('Loading technical review data for RFQ ID:', rfqId);
    
    // Update the review data with the current RFQ ID
    this.reviewData.rfqNumber = rfqId;
    
    // In a real implementation, you would fetch this data from a service
    // For now, we'll use the static data but with the correct RFQ number
  }
}
