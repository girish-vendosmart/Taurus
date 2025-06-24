import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../../../../shared/services/common.service';
import { SweetAlertService } from '../../../../shared/services/sweet-alert.service';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';

export interface OrderDetails {
  orderId: string;
  companyName: string;
  status: string;
  originalQuantity: number;
  material: string;
  deliveryDate: string;
}

export interface ChangeRequestDetails {
  changeType: string;
  urgency: 'High' | 'Medium' | 'Low';
  description: string;
  attachedFiles: AttachedFile[];
  requestDate: string;
}

export interface AttachedFile {
  fileName: string;
  fileSize: string;
}

@Component({
  selector: 'app-supplier-clarification-request',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    InputTextareaModule
  ],
  templateUrl: './supplier-clarification-request.component.html',
  styleUrl: './supplier-clarification-request.component.scss'
})
export class SupplierClarificationRequestComponent implements OnInit {
  orderId: string = '';
  changeRequestId: string = '';
  loading: boolean = false;

  orderDetails: OrderDetails = {
    orderId: '',
    companyName: '',
    status: '',
    originalQuantity: 0,
    material: '',
    deliveryDate: ''
  };

  changeRequestDetails: ChangeRequestDetails = {
    changeType: '',
    urgency: 'Low',
    description: '',
    attachedFiles: [],
    requestDate: ''
  };

  clarificationQuestions: string = '';
  additionalNotes: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commonService: CommonService,
    private sweetAlert: SweetAlertService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orderId = params['orderId'];
      this.changeRequestId = params['changeRequestId'];
      
      if (this.orderId && this.changeRequestId) {
        this.loadClarificationData();
      }
    });
  }

  loadClarificationData() {
    this.loading = true;
    
    // For demo purposes, using sample data
    this.loadSampleData();
    
    this.loading = false;
  }

  loadSampleData() {
    this.orderDetails = {
      orderId: 'ORD-2025-001',
      companyName: 'Precision Manufacturing Co.',
      status: 'Change Request Pending',
      originalQuantity: 500,
      material: 'Aluminum 6061-T6',
      deliveryDate: 'Feb 28, 2025'
    };

    this.changeRequestDetails = {
      changeType: 'Specifications',
      urgency: 'High',
      description: 'Need to modify the tolerance requirements for critical dimensions. The current ±0.1mm tolerance needs to be tightened to ±0.05mm for parts A, B, and C. Also need to add anodizing finish requirement.',
      attachedFiles: [
        {
          fileName: 'revised-specifications-v2.pdf',
          fileSize: '2.3 MB'
        }
      ],
      requestDate: 'January 23, 2025 at 2:30 PM'
    };

    this.clarificationQuestions = `We need clarification on the following points: 1. Tolerance Requirements: - Which specific dimensions require the ±0.05mm tolerance? - Do you have updated technical drawings showing these critical dimensions? 2. Anodizing Specifications: - What type of anodizing finish is required (Type II or Type III)? - What color specification do you need? - Do all parts require anodizing or only specific components? 3. Timeline Impact: - Are you aware this change may extend delivery time by 5-7 business days? - Is the current delivery date of Feb 28, 2025 still acceptable with these changes? 4. Cost Impact: - The tighter tolerances and anodizing will increase costs. Should we provide a revised quote? Please provide detailed specifications for items 1-2 above so we can proceed with accurate pricing and scheduling.`;
  }

  goBack() {
    this.router.navigate(['/wefab/supplier/order/change-request-review', this.orderId, this.changeRequestId]);
  }

  saveDraft() {
    this.sweetAlert.success('Draft saved successfully!');
  }

  sendClarificationRequest() {
    if (!this.clarificationQuestions.trim()) {
      this.sweetAlert.warning('Please enter clarification questions before sending the request.');
      return;
    }

    this.sweetAlert.confirm(
      'Send Clarification Request',
      'Are you sure you want to send this clarification request to the customer?',
      'question',
      'Yes, Send Request',
      'Cancel'
    ).then((result: any) => {
      if (result.isConfirmed) {
        console.log('Sending clarification request...', {
          orderId: this.orderId,
          changeRequestId: this.changeRequestId,
          clarificationQuestions: this.clarificationQuestions,
          additionalNotes: this.additionalNotes
        });
        
        this.sweetAlert.success('Clarification request sent successfully! The customer will be notified.');
        this.router.navigate(['/wefab/supplier/order/details', this.orderId]);
      }
    });
  }

  getUrgencyClass(urgency: string): string {
    const urgencyClasses: { [key: string]: string } = {
      'High': 'status-rejected',
      'Medium': 'status-progress', 
      'Low': 'status-open'
    };
    
    return urgencyClasses[urgency] || 'status-open';
  }

  downloadAttachment(file: AttachedFile) {
    console.log('Download:', file.fileName);
    this.sweetAlert.info('File download functionality will be implemented here.');
  }
} 