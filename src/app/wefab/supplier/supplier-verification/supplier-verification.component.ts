import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

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
  // Initialize all steps to verifying
  verificationStatus = {
    credentials: 'verifying',
    contact: 'verifying',
    documents: 'verifying'
  };

  verificationComplete = false;
  verificationError = false;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    // Start the verification animation sequence
    this.simulateVerification();
  }

  simulateVerification(): void {
    // Step 1: Complete credentials verification after 2 seconds
    setTimeout(() => {
      this.verificationStatus.credentials = 'completed';
      
      // Step 2: Complete contact verification after 3 more seconds
      setTimeout(() => {
        this.verificationStatus.contact = 'completed';
        
        // Step 3: Complete documents verification after 3 more seconds
        setTimeout(() => {
          this.verificationStatus.documents = 'completed';
          this.verificationComplete = true;
        }, 3000);
      }, 3000);
    }, 2000);
  }

  continueAnyway(): void {
    this.router.navigate(['/wefab/supplier/supplier-onboarding-l2']);
  }

  viewReviewPage(): void {
    this.router.navigate(['/wefab/supplier/review']);
  }
} 