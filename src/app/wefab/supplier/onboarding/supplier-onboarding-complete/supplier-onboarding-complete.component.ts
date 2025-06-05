import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CommonService } from '../../../../shared/services/common.service';

@Component({
  selector: 'app-supplier-onboarding-complete',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    RippleModule
  ],
  templateUrl: './supplier-onboarding-complete.component.html',
  styleUrls: ['./supplier-onboarding-complete.component.scss']
  
})
export class SupplierOnboardingCompleteComponent implements OnInit {
  // Flag to determine whether verification is complete or under review
  verificationCurrentStatus: boolean = false;
  supplierId: any = localStorage.getItem('supplier_id');
  isRejected: boolean = false
  
  constructor(private router: Router, private commonService: CommonService) { }
  
  ngOnInit(): void {
    // In a real application, you would fetch the verification status from an API
    // For now, we're setting it to false by default (under review)
    this.checkVerificationStatus();
  }
  
  // In a real implementation, this method would call an API to check the verification status
  checkVerificationStatus(): void {
    // // Mock implementation - in a real app, you would retrieve this from your backend
    // // For example:
    // // this.apiService.getVerificationStatus().subscribe(result => {
    // //   this.verificationCurrentStatus = result.isVerified;
    // // });
    
    // // For demo purposes, we're keeping it as false (under review)
    // this.verificationCurrentStatus = false;

    let endPoint = `/api/method/wefab.wefab.api.supplier.onboarding.onboarding.get_onboarding_stage_status?onboarding_stage=L3&supplier_company_id=${this.supplierId}`;
    this.commonService.getData(endPoint).subscribe((res: any) => {
      this.verificationCurrentStatus = res.data.approval_status === 'Under Review' ? false : true;

      this.isRejected = res.data.approval_status === 'Rejected';
      
      // Only simulate verification if not approved
      // if (!this.verificationCurrentStatus) {
      //   this.simulateVerification();
      // } else {
      //   // If verification is approved, set all steps to completed
      //   this.verificationStatus = {
      //     geolocation: 'completed',
      //     capability: 'completed',
      //     machineDetection: 'completed'
      //   };
      //   this.verificationComplete = true;
      // }
    });
  }
  
  // Navigate to the profile review page
  viewReviewPage(): void {
    this.router.navigate(['/wefab/supplier/profile-review/', this.supplierId]);
  }
  
  // Edit information if needed - navigate to the L3 onboarding form in edit mode
  editVerification(): void {
    this.router.navigate(['/wefab/supplier/supplier-onboarding-l3'], { 
      queryParams: { 
        mode: 'edit'
      } 
    });
  }
} 