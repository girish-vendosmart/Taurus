import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonTableComponent, TableConfig } from '../../../../shared/components/common-table/common-table.component';
import { ApprovalWorkflowComponent, WorkflowStep, WorkflowCompletionData } from '../../../../shared/components/approval-workflow/approval-workflow.component';

interface MetricData {
  value: string;
  label: string;
}

interface ProcessItem {
  name: string;
  details?: string;
}

interface MaterialItem {
  name: string;
}

interface BOMItem {
  itemCode: string;
  description: string;
  qty: number;
  material: string;
  process: string;
  threeDData: string;
  twoDData: string;
  pdf: string;
  status: string;
}

interface FeatureHighlight {
  icon: string;
  title: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-ai-analysis-summary-pages',
  standalone: true,
  imports: [CommonModule, CommonTableComponent, ApprovalWorkflowComponent],
  templateUrl: './ai-analysis-summary-pages.component.html',
  styleUrl: './ai-analysis-summary-pages.component.scss'
})
export class AiAnalysisSummaryPagesComponent {
  
  rfqId = 'RFQ-2024-001234';
  
  projectOverview = {
    title: 'Industrial Pump Assembly Components',
    description: 'Your RFQ "Industrial Pump Assembly Components" contains 8 unique parts requiring multiple manufacturing processes. The project involves precision machined components primarily in aluminum and steel materials. Based on the uploaded drawings and specifications, this appears to be a medium complexity manufacturing project suitable for CNC machining and assembly operations.'
  };

  metrics: MetricData[] = [
    {
      value: '8',
      label: 'Total Parts'
    },
    {
      value: '85%',
      label: 'Information Complete'
    },
    {
      value: '3-4',
      label: 'Estimated Weeks'
    }
  ];

  manufacturingProcesses: ProcessItem[] = [
    {
      name: 'CNC Milling',
      details: '(8 parts)'
    },
    {
      name: 'CNC Turning',
      details: '(4 parts)'
    },
    {
      name: 'Surface Treatment'
    }
  ];

  materialsRequired: MaterialItem[] = [
    {
      name: 'Aluminum 6061'
    },
    {
      name: 'Steel'
    },
    {
      name: 'Stainless Steel 304'
    }
  ];

  // Manufacturing Process Timeline Data
  timelineSteps: WorkflowStep[] = [
    {
      id: 'complete-missing-info',
      title: 'Complete Missing Information',
      status: 'in-progress',
      description: 'Provide any required specifications above to ensure accurate quoting and optimal manufacturing planning.',
      allowCompletion: true,
      isOpenDialog: false,
      requiresPhotos: false,
      requiresComments: false,
      comments: 'Complete now to proceed'
    },
    {
      id: 'ai-quote-generation',
      title: 'AI Quote Generation',
      status: 'ready',
      description: 'Our advanced AI system analyzes your requirements, materials, and processes to generate preliminary quotes with high accuracy.',
      allowCompletion: false,
      isOpenDialog: false,
      requiresPhotos: false,
      requiresComments: false,
      comments: '2-4 hours after completion'
    },
    {
      id: 'expert-review',
      title: 'Expert Review & Optimization',
      status: 'waiting',
      description: 'Manufacturing specialists review AI recommendations, optimize processes, and validate feasibility for maximum quality and efficiency.',
      allowCompletion: false,
      isOpenDialog: false,
      requiresPhotos: false,
      requiresComments: false,
      comments: '1-2 business days'
    },
    {
      id: 'final-quote-delivery',
      title: 'Final Quote Delivery',
      status: 'waiting',
      description: 'Receive comprehensive quotes with detailed pricing, timeline, quality specifications, and complete manufacturing plan.',
      allowCompletion: false,
      isOpenDialog: false,
      requiresPhotos: false,
      requiresComments: false,
      comments: '2-3 business days total'
    }
  ];

  // Feature Highlights
  featureHighlights: FeatureHighlight[] = [
    {
      icon: 'pi pi-check-circle',
      title: 'Fast',
      description: 'AI powered analysis',
      color: '#10b981'
    },
    {
      icon: 'pi pi-bullseye',
      title: 'Accurate',
      description: 'Expert validation',
      color: '#3b82f6'
    },
    {
      icon: 'pi pi-shield',
      title: 'Reliable',
      description: 'Quality guaranteed',
      color: '#f59e0b'
    }
  ];

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
        field: 'pdf', 
        header: 'PDF', 
        sortable: false, 
        filterable: false,
        isStatus: true,
        width: '100px'
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
          { label: 'Missing Data', value: 'Missing Data' }
        ],
        width: '120px'
      },
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
      pdf: 'Complete',
      status: 'Complete'
    },
    {
      itemCode: 'P002-SHF',
      description: 'Drive Shaft',
      qty: 1,
      material: 'Steel 1045',
      process: 'CNC Turning',
      threeDData: 'Missing Data',
      twoDData: 'Complete',
      pdf: 'Complete',
      status: 'Missing Data'
    },
    {
      itemCode: 'P003-IMP',
      description: 'Impeller',
      qty: 1,
      material: 'SS 316L',
      process: '5-Axis Milling',
      threeDData: 'Complete',
      twoDData: 'Complete',
      pdf: 'Complete',
      status: 'Complete'
    },
    {
      itemCode: 'P004-CVR',
      description: 'End Cover',
      qty: 2,
      material: 'Aluminum 6061-T6',
      process: 'CNC Milling',
      threeDData: 'Complete',
      twoDData: 'Missing Data',
      pdf: 'Missing Data',
      status: 'Missing Data'
    }
  ];

  // Handle table events
  onBomRowClick(event: any) {
    console.log('BOM Row clicked:', event);
  }

  onBomLinkClick(event: any) {
    console.log('BOM Link clicked:', event);
  }

  onBomActionClick(event: any) {
    console.log('BOM Action clicked:', event);
  }

  // Handle timeline events
  onTimelineStepCompleted(completionData: WorkflowCompletionData) {
    console.log('Timeline step completed:', completionData);
    
    // Find and update the step status
    const stepIndex = this.timelineSteps.findIndex(step => step.id === completionData.stepId);
    if (stepIndex !== -1) {
      this.timelineSteps[stepIndex].status = 'complete';
      
      // Update next step status if applicable
      if (stepIndex + 1 < this.timelineSteps.length) {
        this.timelineSteps[stepIndex + 1].status = 'in-progress';
      }
    }
  }

  onTimelineStepClicked(step: WorkflowStep) {
    console.log('Timeline step clicked:', step);
  }
}
