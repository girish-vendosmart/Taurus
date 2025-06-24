import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../../../../shared/services/common.service';
import { SweetAlertService } from '../../../../shared/services/sweet-alert.service';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';

export interface ChangeRequestDetails {
  id: string;
  orderId: string;
  changeType: string;
  urgency: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface CustomerInfo {
  companyName: string;
}

export interface OrderImpactDetails {
  priceImpact: string;
  priceAmount: number;
  timelineImpact: string;
  timelineDate: string;
  newQuantity: number;
  quantityIncrease: number;
}

@Component({
  selector: 'app-order-change-request-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    InputTextareaModule
  ],
  templateUrl: './order-change-request-confirmation.component.html',
  styleUrl: './order-change-request-confirmation.component.scss'
})
export class OrderChangeRequestConfirmationComponent implements OnInit {
  orderId: string = '';
  changeRequestId: string = '';
  loading: boolean = false;
  
  changeRequestDetails: ChangeRequestDetails = {
    id: '',
    orderId: '',
    changeType: '',
    urgency: 'Low',
    description: ''
  };

  customerInfo: CustomerInfo = {
    companyName: ''
  };

  orderImpactDetails: OrderImpactDetails = {
    priceImpact: 'No Change',
    priceAmount: 0,
    timelineImpact: 'No Change',
    timelineDate: '',
    newQuantity: 0,
    quantityIncrease: 0
  };

  implementationNotes: string = '';
  additionalComments: string = '';

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
        this.loadConfirmationDetails();
      }
    });
  }

  loadConfirmationDetails() {
    this.loading = true;
    
    // For demo purposes, using sample data
    this.loadSampleData();
    
    this.loading = false;
  }

  loadSampleData() {
    this.changeRequestDetails = {
      id: 'OCR-2025-003',
      orderId: 'ORD-2025-001',
      changeType: 'Quantity Adjustment',
      urgency: 'Medium',
      description: 'Increase quantity from 500 to 750 units. Same specifications and material requirements.'
    };

    this.customerInfo = {
      companyName: 'Fabster Inc.'
    };

    this.orderImpactDetails = {
      priceImpact: 'No Change',
      priceAmount: 12450.00,
      timelineImpact: 'No Change',
      timelineDate: 'Feb 28, 2025',
      newQuantity: 750,
      quantityIncrease: 250
    };

    this.implementationNotes = 'Order will be updated and production will continue with the new quantity. Our current production capacity allows for this increase without delays.';
    this.additionalComments = 'We have sufficient raw material inventory and production capacity to handle the increased quantity. The additional units will be processed in the same batch to maintain consistency.';
  }

  goBack() {
    this.router.navigate(['/wefab/supplier/order/change-request-review', this.orderId, this.changeRequestId]);
  }

  saveDraft() {
    this.sweetAlert.success('Draft saved successfully!');
  }

  confirmAndUpdateOrder() {
    this.sweetAlert.confirm(
      'Confirm Order Update',
      'Are you sure you want to confirm and update the order? The customer will be notified of the accepted changes.',
      'question',
      'Yes, Confirm',
      'Cancel'
    ).then((result: any) => {
      if (result.isConfirmed) {
        console.log('Confirming order update...', {
          orderId: this.orderId,
          changeRequestId: this.changeRequestId,
          implementationNotes: this.implementationNotes,
          additionalComments: this.additionalComments
        });
        
        this.sweetAlert.success('Order updated successfully! Customer has been notified.');
        this.router.navigate(['/wefab/supplier/order/details', this.orderId]);
      }
    });
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
} 