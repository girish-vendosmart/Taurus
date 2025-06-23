import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../../../../shared/services/common.service';
import { SweetAlertService } from '../../../../shared/services/sweet-alert.service';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextareaModule } from 'primeng/inputtextarea';

export interface ChangeRequestDetails {
  id: string;
  orderId: string;
  changeType: string;
  requestedBy: string;
  urgency: 'High' | 'Medium' | 'Low';
  requestedDate: string;
  submittedDate: string;
  description: string;
  status: string;
  attachments?: ChangeRequestAttachment[];
}

export interface ChangeRequestAttachment {
  name: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
}

export interface CustomerInfo {
  companyName: string;
  contactPerson: string;
  email: string;
}

export interface OriginalOrderDetails {
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  deliveryDate: string;
}

@Component({
  selector: 'app-order-change-request-review',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    RadioButtonModule,
    InputTextareaModule
  ],
  templateUrl: './order-change-request-review.component.html',
  styleUrl: './order-change-request-review.component.scss'
})
export class OrderChangeRequestReviewComponent implements OnInit {
  orderId: string = '';
  changeRequestId: string = '';
  loading: boolean = false;
  
  changeRequestDetails: ChangeRequestDetails = {
    id: '',
    orderId: '',
    changeType: '',
    requestedBy: '',
    urgency: 'Low',
    requestedDate: '',
    submittedDate: '',
    description: '',
    status: ''
  };

  customerInfo: CustomerInfo = {
    companyName: '',
    contactPerson: '',
    email: ''
  };

  originalOrderDetails: OriginalOrderDetails = {
    quantity: 0,
    unitPrice: 0,
    totalAmount: 0,
    deliveryDate: ''
  };

  // Response form data
  selectedResponse: string = '';
  additionalNotes: string = '';
  
  responseOptions = [
    {
      value: 'accept_no_impact',
      label: 'Accept changes with no price/timeline impact',
      description: 'The requested changes can be accommodated without affecting the current quote or delivery schedule'
    },
    {
      value: 'accept_revise_quote',
      label: 'Accept changes but need to revise quote',
      description: 'The changes are possible but will require adjustments to pricing and/or timeline'
    },
    {
      value: 'need_clarification',
      label: 'Need clarification from customer',
      description: 'Additional information is required before providing a response'
    }
  ];

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
      console.log('Order ID:', this.orderId, 'Change Request ID:', this.changeRequestId);
      
      if (this.orderId && this.changeRequestId) {
        this.loadChangeRequestDetails();
      }
    });
  }

  loadChangeRequestDetails() {
    this.loading = true;
    
    // For demo purposes, using sample data
    // In production, this would be API calls
    this.loadSampleData();
    
    this.loading = false;
  }

  loadSampleData() {
    this.changeRequestDetails = {
      id: 'OCR-2025-003',
      orderId: 'ORD-2025-001',
      changeType: 'Quantity',
      requestedBy: 'Fabster Industries',
      urgency: 'High',
      requestedDate: '2025-01-23T14:30:00',
      submittedDate: 'January 23, 2025',
      description: 'We need to increase the quantity from 500 units to 750 units due to increased demand from our client. The specifications and timeline should remain the same if possible. Please let us know if this affects pricing or delivery schedule.',
      status: 'Pending',
      attachments: [
        {
          name: 'updated-specifications.pdf',
          fileName: 'updated-specifications.pdf',
          fileSize: '2.3 MB',
          fileUrl: '#'
        }
      ]
    };

    this.customerInfo = {
      companyName: 'TechCorp Manufacturing',
      contactPerson: 'John Smith',
      email: 'john.smith@techcorp.com'
    };

    this.originalOrderDetails = {
      quantity: 500,
      unitPrice: 24.90,
      totalAmount: 12450.00,
      deliveryDate: 'Feb 28, 2025'
    };
  }

  goBack() {
    this.router.navigate(['/wefab/supplier/order/details', this.orderId]);
  }

  onResponseChange(value: string) {
    this.selectedResponse = value;
  }



  submitResponse() {
    if (!this.selectedResponse) {
      this.sweetAlert.warning('Please select a response option before submitting.');
      return;
    }

    this.sweetAlert.confirm(
      'Submit Response',
      'Are you sure you want to submit this response? This action cannot be undone.',
      'question',
      'Yes, Submit',
      'Cancel'
    ).then((result: any) => {
      if (result.isConfirmed) {
        // Here you would make API call to submit the response
        console.log('Submitting response...', {
          changeRequestId: this.changeRequestId,
          response: this.selectedResponse,
          notes: this.additionalNotes
        });
        
        this.sweetAlert.success('Response submitted successfully!');
        this.goBack();
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  getFormattedCurrencyAmount(amount: number): string {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }

  getUrgencyClass(urgency: string): string {
    const urgencyClasses: { [key: string]: string } = {
      'High': 'status-rejected',
      'Medium': 'status-progress', 
      'Low': 'status-open'
    };
    
    return urgencyClasses[urgency] || 'status-open';
  }

  downloadAttachment(attachment: ChangeRequestAttachment) {
    if (attachment.fileUrl && attachment.fileUrl !== '#') {
      window.open(attachment.fileUrl, '_blank');
    } else {
      console.log('Download:', attachment.fileName);
      this.sweetAlert.info('File download functionality will be implemented here.');
    }
  }
} 