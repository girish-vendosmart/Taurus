import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CommonService } from '../../shared/common.service';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'locked' | 'rejected';
  progress?: number;
  icon: string;
  color?: string;
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
      title: 'Basic Information',
      description: 'Company details, contact information, and basic financial data',
      status: 'pending',
      progress: 0,
      icon: 'pi pi-lock',
      color: 'pending'
    },
    {
      id: 2,
      title: 'Manufacturing Capabilities',
      description: 'Production capacity, facilities, and quality certifications',
      status: 'pending',
      progress: 0,
      icon: 'pi pi-lock',
      color: 'pending'
    },
    {
      id: 3,
      title: 'Financial Information',
      description: 'Detailed financial statements and banking information',
      status: 'pending',
      progress: 0,
      icon: 'pi pi-lock',
      color: 'pending'
    }
  ];
  currentOnboardingL1Status: string = '';
  currentOnboardingL2Status: string = '';
  currentOnboardingL3Status: string = '';
  currentOnboardingPage: number | null = null;
  nextSectionToFill: number | null = null;

  constructor(private router: Router, private commonService: CommonService) {
    // Initialize with the supplier ID from session storage
    const supplierId = sessionStorage.getItem('supplier_id');
    this.supplierCompanyId = supplierId || '';
    
    // Start the API chain to get all statuses
    this.getOnboardingL1Status();
  }

  supplierCompanyId: string = '';

  getOnboardingL1Status() {
    console.log('Getting L1 status');
    let endPoint = `/api/method/proq_buyer.wefab.api.supplier.onboarding.get_onboarding_stage_status?onboarding_stage=L1&supplier_company_id=${this.supplierCompanyId}`;
    this.commonService.getData(endPoint).subscribe({
      next: (res: any) => {
        console.log('L1 status response:', res);
        this.currentOnboardingL1Status = res?.data?.approval_status || 'Not Started';
        this.getOnboardingL2Status();
      },
      error: (err) => {
        console.error('Error getting L1 status:', err);
        this.currentOnboardingL1Status = 'Not Started';
        this.getOnboardingL2Status();
      }
    });
  }

  getOnboardingL2Status() {
    console.log('Getting L2 status');
    let endPoint = `/api/method/proq_buyer.wefab.api.supplier.onboarding.get_onboarding_stage_status?onboarding_stage=L2&supplier_company_id=${this.supplierCompanyId}`;
    this.commonService.getData(endPoint).subscribe({
      next: (res: any) => {
        console.log('L2 status response:', res);
        this.currentOnboardingL2Status = res?.data?.approval_status || 'Not Started';
        this.getOnboardingL3Status();
      },
      error: (err) => {
        console.error('Error getting L2 status:', err);
        this.currentOnboardingL2Status = 'Not Started';
        this.getOnboardingL3Status();
      }
    });
  }

  getOnboardingL3Status() {
    console.log('Getting L3 status');
    let endPoint = `/api/method/proq_buyer.wefab.api.supplier.onboarding.get_onboarding_stage_status?onboarding_stage=L3&supplier_company_id=${this.supplierCompanyId}`;
    this.commonService.getData(endPoint).subscribe({
      next: (res: any) => {
        console.log('L3 status response:', res);
        this.currentOnboardingL3Status = res?.data?.approval_status || 'Not Started';
        this.updateOnboardingSteps();
        this.determineNextSection();
      },
      error: (err) => {
        console.error('Error getting L3 status:', err);
        this.currentOnboardingL3Status = 'Not Started';
        this.updateOnboardingSteps();
        this.determineNextSection();
      }
    });
  }

  // Updated method to determine the next section to fill
  determineNextSection() {
    console.log('Determining next section to fill');
    console.log('L1 Status:', this.currentOnboardingL1Status);
    console.log('L2 Status:', this.currentOnboardingL2Status);
    console.log('L3 Status:', this.currentOnboardingL3Status);
    
    // Find the first section that is not Approved or Under Review
    // This will be the next section for the user to complete
    if (this.currentOnboardingL1Status !== 'Approved' && this.currentOnboardingL1Status !== 'Under Review') {
      this.nextSectionToFill = 1;
    } else if (this.currentOnboardingL2Status !== 'Approved' && this.currentOnboardingL2Status !== 'Under Review') {
      this.nextSectionToFill = 2;
    } else if (this.currentOnboardingL3Status !== 'Approved' && this.currentOnboardingL3Status !== 'Under Review') {
      this.nextSectionToFill = 3;
    } else {
      this.nextSectionToFill = null;
    }

    console.log('Next section to fill:', this.nextSectionToFill);
    
    // Set the current page based on status logic
    if (this.currentOnboardingL1Status === 'Rejected') {
      this.currentOnboardingPage = 1;
    } else if (this.currentOnboardingL2Status === 'Rejected') {
      this.currentOnboardingPage = 2;
    } else if (this.currentOnboardingL3Status === 'Rejected') {
      this.currentOnboardingPage = 3;
    } else if (this.nextSectionToFill !== null) {
      this.currentOnboardingPage = this.nextSectionToFill;
    } else {
      this.currentOnboardingPage = null;
    }
    
    console.log('Current onboarding page:', this.currentOnboardingPage);
  }

  updateOnboardingSteps() {
    console.log('Updating onboarding steps');
    
    // Map statuses to icons and colors using WE-FAB style guide
    const statusMap: any = {
      'Not Started': { 
        status: 'pending', 
        progress: 0, 
        icon: 'pi pi-lock', 
        color: 'pending' 
      },
      'Under Review': { 
        status: 'in-progress', 
        progress: 100, // Set to 100% per requirement
        icon: 'pi pi-info-circle', 
        color: 'under-review' 
      },
      'Approved': { 
        status: 'completed', 
        progress: 100, 
        icon: 'pi pi-check-circle', 
        color: 'approved' 
      },
      'Rejected': { 
        status: 'rejected', 
        progress: 0, 
        icon: 'pi pi-times-circle', 
        color: 'rejected' 
      }
    };

    // L1
    const l1 = statusMap[this.currentOnboardingL1Status] || statusMap['Not Started'];
    this.onboardingSteps[0].status = l1.status;
    this.onboardingSteps[0].progress = l1.progress;
    this.onboardingSteps[0].icon = l1.icon;
    this.onboardingSteps[0].color = l1.color;

    // L2
    const l2 = statusMap[this.currentOnboardingL2Status] || statusMap['Not Started'];
    this.onboardingSteps[1].status = l2.status;
    this.onboardingSteps[1].progress = l2.progress;
    this.onboardingSteps[1].icon = l2.icon;
    this.onboardingSteps[1].color = l2.color;

    // L3
    const l3 = statusMap[this.currentOnboardingL3Status] || statusMap['Not Started'];
    this.onboardingSteps[2].status = l3.status;
    this.onboardingSteps[2].progress = l3.progress;
    this.onboardingSteps[2].icon = l3.icon;
    this.onboardingSteps[2].color = l3.color;

    console.log('Updated onboarding steps:', this.onboardingSteps);
    this.calculateOverallProgress();
  }

  calculateOverallProgress(): void {
    // Calculate overall progress based on each section's progress
    // Each section contributes 33.33% to the total when completed or under review
    let completedSections = 0;
    
    // Count each section that has progress
    this.onboardingSteps.forEach(step => {
      if (step.progress === 100) {
        completedSections += 1;
      }
    });
    
    // Calculate overall progress - each section contributes equally
    this.overallProgress = Math.round((completedSections / this.onboardingSteps.length) * 100);
    console.log('Overall progress:', this.overallProgress);
  }

  continueOnboarding(stepId: number): void {
    console.log('Continue onboarding for step:', stepId);
    
    // For Under Review status, redirect to the next section for filling
    // For Rejected status, redirect to the same section for re-submission
    if (this.onboardingSteps[stepId - 1].status === 'in-progress') {
      // If current section is Under Review, find the next section to fill
      const nextSection = this.findNextSectionToFill(stepId);
      if (nextSection !== null) {
        console.log('Navigating to next section:', nextSection);
        this.router.navigate([`/wefab/supplier/supplier-onboarding-l${nextSection}`]);
      } else {
        // If no next section, go to profile review
        console.log('No next section, going to profile review');
        this.router.navigate(['/wefab/supplier/profile-review']);
      }
    } else if (this.onboardingSteps[stepId - 1].status === 'rejected') {
      // If current section is Rejected, redirect to the same section
      console.log('Section is rejected, redirecting to same section');
      this.router.navigate([`/wefab/supplier/supplier-onboarding-l${stepId}`]);
    } else {
      // Default behavior - go to the selected section
      console.log('Default behavior, going to selected section');
      this.router.navigate([`/wefab/supplier/supplier-onboarding-l${stepId}`]);
    }
  }

  findNextSectionToFill(currentStep: number): number | null {
    // Find the next section that needs to be filled (Not Started or Rejected)
    for (let i = currentStep; i < this.onboardingSteps.length; i++) {
      const step = this.onboardingSteps[i];
      if (step.status === 'pending' || step.status === 'rejected') {
        return step.id;
      }
    }
    return null;
  }

  // Helper method to check if next section is available
  isNextAvailable(currentStepId: number): boolean {
    // Check if there's a next section that's not completed or in progress
    for (let i = currentStepId; i < this.onboardingSteps.length; i++) {
      const step = this.onboardingSteps[i - 1]; // Adjust for 0-based array
      if (step.status === 'pending' || step.status === 'rejected') {
        return true;
      }
    }
    return false;
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
      case 'rejected':
        return 'REJECTED';
      default:
        return status.toUpperCase();
    }
  }

  viewDetails(stepId: number): void {
    console.log('View details for step:', stepId);
    
    // Navigate to the specific route with mode=edit query parameter
    if (stepId === 1) {
      this.router.navigate(['/wefab/supplier/supplier-onboarding'], { queryParams: { mode: 'edit' } });
    } else if (stepId === 2) {
      this.router.navigate(['/wefab/supplier/supplier-onboarding-l1'], { queryParams: { mode: 'edit' } });
    } else if (stepId === 3) {
      this.router.navigate(['/wefab/supplier/supplier-onboarding-l2'], { queryParams: { mode: 'edit' } });
    }
  }

  goToProfileReview(): void {
    console.log('Going to profile review');
    this.router.navigate(['/wefab/supplier/profile-review']);
  }

  shouldShowProfileReviewButton(): boolean {
    // Show "Go to Profile Review" button if any section is under review
    return this.onboardingSteps.some(step => step.status === 'in-progress');
  }
}