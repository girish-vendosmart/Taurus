import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CommonService } from '../../shared/common.service';

@Component({
  selector: 'app-supplier-verification',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './supplier-verification.component.html',
  styleUrl: './supplier-verification.component.scss'
})
export class SupplierVerificationComponent implements OnInit {

  verificationCurrentStatus: boolean = false;
  // Initialize all steps to under review
  verificationStatus = {
    credentials: 'under_review',
    contact: 'under_review',
    documents: 'under_review'
  };

  verificationComplete = false;
  verificationError = false;
  supplierId: string | null | undefined;

  constructor(
    private router: Router,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    // Start the verification animation sequence
    this.supplierId = sessionStorage.getItem('supplier_id');
    this.getL1Verification();
    // this.simulateVerification();
  }

  getL1Verification() {
    let endPoint = `/api/method/proq_buyer.wefab.api.supplier.onboarding.get_onboarding_stage_status?onboarding_stage=L1&supplier_company_id=${this.supplierId}`
    this.commonService.getData(endPoint).subscribe((res: any) => {
      this.verificationCurrentStatus = res.data.approval_status === 'Under Review' ? true : false;
      this.simulateVerification()
    })
  }

  simulateVerification(): void {
    if (this.verificationCurrentStatus) {
      // If verification is successful, simulate the steps
      setTimeout(() => {
        this.verificationStatus.credentials = 'completed';
        
        setTimeout(() => {
          this.verificationStatus.contact = 'completed';
          
          setTimeout(() => {
            this.verificationStatus.documents = 'completed';
            this.verificationComplete = true;
          }, 3000);
        }, 3000);
      }, 2000);
    } else {
      // If verification is not successful, keep all steps under review
      this.verificationStatus = {
        credentials: 'under_review',
        contact: 'under_review',
        documents: 'under_review'
      };
      this.verificationError = true;
    }
  }

  continueAnyway(): void {
    if (this.verificationCurrentStatus) {
      this.router.navigate(['/wefab/supplier/supplier-onboarding-l2']);
    } else {
      // Show message that they can't proceed
      alert('Your verification is still under review. Please wait for the review to complete.');
    }
  }

  viewReviewPage(): void {
    this.router.navigate(['/wefab/supplier/profile-review']);
  }

  editVerification(): void {
    // Navigate to the form with edit mode
    this.router.navigate(['/wefab/supplier/supplier-onboarding'], {
      queryParams: { mode: 'edit' }
    });
  }
} 