import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CommonService } from '../../shared/common.service';

@Component({
  selector: 'app-manufacturing-verification',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './manufacturing-verification.component.html',
  styleUrl: './manufacturing-verification.component.scss'
})
export class ManufacturingVerificationComponent implements OnInit {
  // Initialize all steps to verifying for the active verification process
  verificationStatus = {
    geolocation: 'verifying',
    capability: 'verifying',
    machineDetection: 'verifying'
  };

  verificationComplete = false;
  supplierId: any;
  verificationCurrentStatus: boolean = false;

  constructor(
    private router: Router,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    // Get supplier ID and verification status
    this.supplierId = sessionStorage.getItem('supplier_id');
    this.getL2Verification();
  }

  getL2Verification() {
    let endPoint = `/api/method/proq_buyer.wefab.api.supplier.onboarding.get_onboarding_stage_status?onboarding_stage=L2&supplier_company_id=${this.supplierId}`;
    this.commonService.getData(endPoint).subscribe((res: any) => {
      this.verificationCurrentStatus = res.data.approval_status === 'Under Review' ? false : true;
      
      // Only simulate verification if not approved
      if (!this.verificationCurrentStatus) {
        this.simulateVerification();
      } else {
        // If verification is approved, set all steps to completed
        this.verificationStatus = {
          geolocation: 'completed',
          capability: 'completed',
          machineDetection: 'completed'
        };
        this.verificationComplete = true;
      }
    });
  }

  simulateVerification(): void {
    // Reset all to verifying state
    this.verificationStatus = {
      geolocation: 'verifying',
      capability: 'verifying',
      machineDetection: 'verifying'
    };
    this.verificationComplete = false;
    
    // Step 1: Complete geolocation verification after 2 seconds
    setTimeout(() => {
      this.verificationStatus.geolocation = 'completed';
      
      // Step 2: Complete capability verification after 2 more seconds
      setTimeout(() => {
        this.verificationStatus.capability = 'completed';
        
        // Step 3: Complete machine detection verification after 2 more seconds
        setTimeout(() => {
          this.verificationStatus.machineDetection = 'completed';
          this.verificationComplete = true;
        }, 2000);
      }, 2000);
    }, 2000);
  }

  // Navigate to the onboarding L3 form
  continue() {
    this.router.navigate(['/wefab/supplier/supplier-onboarding-l3']);
  }

  // Navigate to L2 form in edit mode
  editL2Form() {
    this.router.navigate(['/wefab/supplier/supplier-onboarding-l2'], { 
      queryParams: { 
        editMode: true 
      } 
    });
  }

  // Navigate to L2 review form
  reviewL2Form() {
    this.router.navigate(['/wefab/supplier/profile-review'], { 
      queryParams: { 
        tab : 'manufacturing'
      } 
    });
  }
} 