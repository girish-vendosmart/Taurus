import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

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

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    // Activate the verification animation by default
    this.simulateVerification();
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

  // Navigate back to the onboarding L2 form
  goBack() {
    this.router.navigate(['/wefab/supplier/supplier-onboarding-l2']);
  }
} 