import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'locked';
  progress: number;
  icon: string;
  borderColor: string;
}

@Component({
  selector: 'app-supplier-onboarding-status',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './supplier-onboarding-status.component.html',
  styleUrl: './supplier-onboarding-status.component.scss'
})
export class SupplierOnboardingStatusComponent {
  overallProgress: number = 55;
  
  onboardingSteps: OnboardingStep[] = [
    {
      id: 1,
      title: 'Basic Information & Financial Information',
      description: 'Company details, contact information, and basic financial data',
      status: 'completed',
      progress: 100,
      icon: 'check_circle',
      borderColor: '#10b981' // green color
    },
    {
      id: 2,
      title: 'Manufacturing Capabilities',
      description: 'Production capacity, facilities, and quality certifications',
      status: 'in-progress',
      progress: 65,
      icon: 'timer',
      borderColor: '#3b82f6' // blue color
    },
    {
      id: 3,
      title: 'Financial Information',
      description: 'Detailed financial statements and banking information',
      status: 'pending',
      progress: 0,
      icon: '3',
      borderColor: '#cbd5e1' // gray color
    }
  ];

  constructor() {}

  getStatusText(status: string): string {
    switch(status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'locked': return 'Locked';
      default: return '';
    }
  }

  calculateOverallProgress(): number {
    const totalSteps = this.onboardingSteps.length;
    const completedStepsWeight = this.onboardingSteps.filter(step => step.status === 'completed').length;
    const inProgressStepsWeight = this.onboardingSteps.filter(step => step.status === 'in-progress').length * 0.5;
    
    return Math.round(((completedStepsWeight + inProgressStepsWeight) / totalSteps) * 100);
  }

  continueOnboarding(stepId: number): void {
    console.log(`Continuing to step ${stepId}`);
    // Navigate to the specific step
    // this.router.navigate(['/supplier/onboarding/step', stepId]);
  }

  viewStepDetails(stepId: number): void {
    console.log(`Viewing details for step ${stepId}`);
    // Navigate to the step details page
    // this.router.navigate(['/supplier/onboarding/step', stepId, 'details']);
  }
}
