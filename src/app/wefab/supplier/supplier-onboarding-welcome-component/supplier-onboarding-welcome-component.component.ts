import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-supplier-onboarding-welcome-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './supplier-onboarding-welcome-component.component.html',
  styleUrl: './supplier-onboarding-welcome-component.component.scss'
})
export class SupplierOnboardingWelcomeComponentComponent {
  supplierName: string = '';

  constructor() {
    // You might want to get the supplier name from a service or route parameter
    this.supplierName = 'Supplier';
  }

  startOnboarding(): void {
    // Navigate to the first onboarding step
    console.log('Starting onboarding process');
    // You would typically use Router to navigate
    // this.router.navigate(['/supplier/onboarding/step1']);
  }
}
