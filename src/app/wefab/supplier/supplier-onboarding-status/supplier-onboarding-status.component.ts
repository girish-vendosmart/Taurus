import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'locked';
  progress?: number;
  icon: string;
}

@Component({
  selector: 'app-supplier-onboarding-status',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './supplier-onboarding-status.component.html',
  styleUrl: './supplier-onboarding-status.component.scss'
})
export class SupplierOnboardingStatusComponent {
  overallProgress: number = 0;
  
  onboardingSteps: OnboardingStep[] = [
    {
      id: 1,
      title: 'Basic Information & Financial Information',
      description: 'Company details, contact information, and basic financial data',
      status: 'completed',
      progress: 100,
      icon: 'check'
    },
    {
      id: 2,
      title: 'Manufacturing Capabilities',
      description: 'Production capacity, facilities, and quality certifications',
      status: 'completed',
      progress: 100,
      icon: 'check'
    },
    {
      id: 3,
      title: 'Financial Information',
      description: 'Detailed financial statements and banking information',
      status: 'completed',
      progress: 100,
      icon: 'check'
    }
  ];

  constructor() {
    this.calculateOverallProgress();
  }

  calculateOverallProgress(): void {
    const totalSteps = this.onboardingSteps.length;
    const completedProgress = this.onboardingSteps.reduce(
      (total, step) => total + (step.progress || 0), 0
    );
    this.overallProgress = Math.round(completedProgress / (totalSteps * 100) * 100);
  }

  continueOnboarding(stepId: number): void {
    console.log(`Continuing to step ${stepId}`);
    // Navigate to the appropriate step
    // this.router.navigate(['/supplier/onboarding', stepId]);
  }

  viewDetails(stepId: number): void {
    console.log(`Viewing details for step ${stepId}`);
    // Navigate to view the details of the completed step
    // this.router.navigate(['/supplier/onboarding', stepId, 'details']);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'completed':
        return 'APPROVED';
      case 'in-progress':
        return 'UNDER REVIEW';
      case 'pending':
        return 'NOT STARTED';
      case 'locked':
        return 'LOCKED';
      default:
        return status.toUpperCase();
    }
  }
}
