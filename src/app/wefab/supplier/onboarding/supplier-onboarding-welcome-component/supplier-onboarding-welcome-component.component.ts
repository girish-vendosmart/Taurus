import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-supplier-onboarding-welcome-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './supplier-onboarding-welcome-component.component.html',
  styleUrl: './supplier-onboarding-welcome-component.component.scss'
})
export class SupplierOnboardingWelcomeComponentComponent {
  supplierName: string = '';

  constructor(private router: Router) {
    // You might want to get the supplier name from a service or route parameter
    this.supplierName = localStorage.getItem('supplier_company_name') || '';
  }

  startOnboarding(): void {
    // Navigate to the first onboarding step
    console.log('Starting onboarding process');
    this.router.navigate(['/wefab/supplier/supplier-onboarding']);
    // You would typically use Router to navigate
    // this.router.navigate(['/supplier/onboarding/step1']);
  }
}
