import { Component } from '@angular/core';
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
export class SupplierOnboardingCompleteComponent {
  
  constructor(private router: Router) { }
  
  // Navigate to the profile review page
  goToReview(): void {
    this.router.navigate(['/wefab/supplier/profile-review']);
  }
  
  // Edit information if needed
  editInformation(): void {
    this.router.navigate(['/wefab/supplier/supplier-onboarding-review']);
  }
} 