import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

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
  
  constructor(private router: Router) { }
  
  ngOnInit(): void {
    // In a real application, you would fetch the verification status from an API
    // For now, we're setting it to false by default (under review)
    this.checkVerificationStatus();
  }
  
  // In a real implementation, this method would call an API to check the verification status
  checkVerificationStatus(): void {
    // Mock implementation - in a real app, you would retrieve this from your backend
    // For example:
    // this.apiService.getVerificationStatus().subscribe(result => {
    //   this.verificationCurrentStatus = result.isVerified;
    // });
    
    // For demo purposes, we're keeping it as false (under review)
    this.verificationCurrentStatus = false;
  }
  
  // Navigate to the profile review page
  goToReview(): void {
    this.router.navigate(['/wefab/supplier/profile-review?tab=financial']);
  }
  
  // Edit information if needed - navigate to the L3 onboarding form in edit mode
  editInformation(): void {
    this.router.navigate(['/wefab/supplier/supplier-onboarding-l3'], { 
      queryParams: { 
        editMode: true 
      } 
    });
  }
} 