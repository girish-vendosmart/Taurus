import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CommonService } from '../../../shared/services/common.service';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'locked' | 'rejected' | 'request-to-update';
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
  
  // Add tracking for Firebase triggers
  private firebaseTriggerCount = 0;
  private totalFirebaseTriggers = 3;
  private firebaseTriggersCompleted = false;
  
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
    const supplierId = localStorage.getItem('supplier_id');
    this.supplierCompanyId = supplierId || '';
    
    // Start the API chain to get all statuses
    this.getOnboardingL1Status();

    // firebase trigger
    this.accessFirebaseTrigger('Supplier Onboarding L1', this.supplierCompanyId)
    this.accessFirebaseTrigger('Supplier Onboarding L2', this.supplierCompanyId)
    this.accessFirebaseTrigger('Supplier Onboarding L3', this.supplierCompanyId)

  }

  accessFirebaseTrigger(doctType_name: string, doctypeId: string) {
    this.commonService.commonFirebaseTrigger(doctType_name, doctypeId).subscribe((res: any) => {
       // When Firebase triggers, clear cache and reload all data to recalculate completeness
      this.getOnboardingL1Status();
    });
  }

  supplierCompanyId: string = '';

  getOnboardingL1Status() {
    console.log('Getting L1 status');
    let endPoint = `/api/method/wefab.wefab.api.supplier.onboarding.onboarding.get_onboarding_stage_status?onboarding_stage=L1&supplier_company_id=${this.supplierCompanyId}`;
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
    let endPoint = `/api/method/wefab.wefab.api.supplier.onboarding.onboarding.get_onboarding_stage_status?onboarding_stage=L2&supplier_company_id=${this.supplierCompanyId}`;
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
    let endPoint = `/api/method/wefab.wefab.api.supplier.onboarding.onboarding.get_onboarding_stage_status?onboarding_stage=L3&supplier_company_id=${this.supplierCompanyId}`;
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

  // Updated method to determine the next section to fill with special handling for rejected sections
  determineNextSection() {
    console.log('Determining next section to fill');
    console.log('L1 Status:', this.currentOnboardingL1Status);
    console.log('L2 Status:', this.currentOnboardingL2Status);
    console.log('L3 Status:', this.currentOnboardingL3Status);
    
    // First check if any section is rejected or needs update - if so, only that section can be worked on
    if (this.currentOnboardingL1Status === 'Rejected') {
      this.nextSectionToFill = 1;
      this.currentOnboardingPage = 1;
      console.log('Section 1 is rejected, setting nextSectionToFill to 1');
      return; // Exit early - no other section can be filled until this is fixed
    } 
    
    if (this.currentOnboardingL1Status === 'Request to Resubmit') {
      this.nextSectionToFill = 1;
      this.currentOnboardingPage = 1;
      console.log('Section 1 needs update, setting nextSectionToFill to 1');
      return; // Exit early - no other section can be filled until this is fixed
    }
    
    if (this.currentOnboardingL2Status === 'Rejected') {
      if (this.currentOnboardingL1Status === 'Approved' || this.currentOnboardingL1Status === 'Under Review') {
        this.nextSectionToFill = 2;
        this.currentOnboardingPage = 2;
        console.log('Section 2 is rejected, setting nextSectionToFill to 2');
        return; // Exit early - no section after this can be filled
      } else {
        this.nextSectionToFill = 1;
        this.currentOnboardingPage = 1;
        console.log('Section 2 is rejected but section 1 is not approved, setting nextSectionToFill to 1');
        return;
      }
    }
    
    if (this.currentOnboardingL2Status === 'Request to Resubmit') {
      if (this.currentOnboardingL1Status === 'Approved' || this.currentOnboardingL1Status === 'Under Review') {
        this.nextSectionToFill = 2;
        this.currentOnboardingPage = 2;
        console.log('Section 2 needs update, setting nextSectionToFill to 2');
        return; // Exit early - no section after this can be filled
      } else {
        this.nextSectionToFill = 1;
        this.currentOnboardingPage = 1;
        console.log('Section 2 needs update but section 1 is not approved, setting nextSectionToFill to 1');
        return;
      }
    }
    
    if (this.currentOnboardingL3Status === 'Rejected') {
      if ((this.currentOnboardingL1Status === 'Approved' || this.currentOnboardingL1Status === 'Under Review') &&
          (this.currentOnboardingL2Status === 'Approved' || this.currentOnboardingL2Status === 'Under Review')) {
        this.nextSectionToFill = 3;
        this.currentOnboardingPage = 3;
        console.log('Section 3 is rejected, setting nextSectionToFill to 3');
        return; // Exit early
      } else if (this.currentOnboardingL1Status !== 'Approved' && this.currentOnboardingL1Status !== 'Under Review') {
        this.nextSectionToFill = 1;
        this.currentOnboardingPage = 1;
        console.log('Section 3 is rejected but section 1 is not approved, setting nextSectionToFill to 1');
        return;
      } else {
        this.nextSectionToFill = 2;
        this.currentOnboardingPage = 2;
        console.log('Section 3 is rejected but section 2 is not approved, setting nextSectionToFill to 2');
        return;
      }
    }
    
    if (this.currentOnboardingL3Status === 'Request to Resubmit') {
      if ((this.currentOnboardingL1Status === 'Approved' || this.currentOnboardingL1Status === 'Under Review') &&
          (this.currentOnboardingL2Status === 'Approved' || this.currentOnboardingL2Status === 'Under Review')) {
        this.nextSectionToFill = 3;
        this.currentOnboardingPage = 3;
        console.log('Section 3 needs update, setting nextSectionToFill to 3');
        return; // Exit early
      } else if (this.currentOnboardingL1Status !== 'Approved' && this.currentOnboardingL1Status !== 'Under Review') {
        this.nextSectionToFill = 1;
        this.currentOnboardingPage = 1;
        console.log('Section 3 needs update but section 1 is not approved, setting nextSectionToFill to 1');
        return;
      } else {
        this.nextSectionToFill = 2;
        this.currentOnboardingPage = 2;
        console.log('Section 3 needs update but section 2 is not approved, setting nextSectionToFill to 2');
        return;
      }
    }

    // If no rejections or update requests, proceed with normal flow
    if (this.currentOnboardingL1Status !== 'Approved' && this.currentOnboardingL1Status !== 'Under Review') {
      this.nextSectionToFill = 1;
    } else if (this.currentOnboardingL2Status !== 'Approved' && this.currentOnboardingL2Status !== 'Under Review') {
      this.nextSectionToFill = 2;
    } else if (this.currentOnboardingL3Status !== 'Approved' && this.currentOnboardingL3Status !== 'Under Review') {
      this.nextSectionToFill = 3;
    } else {
      this.nextSectionToFill = null;
    }

    // Set the current page based on the next section to fill
    this.currentOnboardingPage = this.nextSectionToFill;
    
    console.log('Next section to fill:', this.nextSectionToFill);
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
        progress: 100, 
        icon: 'pi pi-times-circle', 
        color: 'rejected' 
      },
      'Request to Resubmit': { 
        status: 'request-to-update', 
        progress: 100, 
        icon: 'pi pi-pencil', 
        color: 'request-to-update' 
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

  // Check if there are any rejected or request-to-update sections in the onboarding process
  hasRejectedSections(): boolean {
    return this.onboardingSteps.some(step => step.status === 'rejected' || step.status === 'request-to-update');
  }

  // Check if any section before this one is rejected
  hasRejectedSectionsBefore(sectionId: number): boolean {
    for (let i = 0; i < sectionId - 1; i++) {
      if (this.onboardingSteps[i].status === 'rejected' || this.onboardingSteps[i].status === 'request-to-update') {
        return true;
      }
    }
    return false;
  }

  // Check if any section before this one is rejected (only rejected, not request-to-update)
  hasPreviousSectionRejected(sectionId: number): boolean {
    for (let i = 0; i < sectionId - 1; i++) {
      if (this.onboardingSteps[i].status === 'rejected') {
        return true;
      }
    }
    return false;
  }

  // Check if a specific section has a rejected or request-to-update status
  isSectionRejected(sectionId: number): boolean {
    return this.onboardingSteps[sectionId - 1].status === 'rejected' || 
           this.onboardingSteps[sectionId - 1].status === 'request-to-update';
  }

  continueOnboarding(stepId: number): void {
    console.log('Continue onboarding for step:', stepId);
    
    // If any previous section is rejected, don't allow continuing
    if (this.hasPreviousSectionRejected(stepId)) {
      console.log('Cannot continue to step', stepId, 'because a previous section is rejected');
      return;
    }
    
    // If any sections are rejected or need update, only allow navigation to those sections
    if (this.hasRejectedSections()) {
      // Find the first rejected or request-to-update section
      const sectionNeedingAction = this.onboardingSteps.find(step => 
        step.status === 'rejected' || step.status === 'request-to-update');
      
      if (sectionNeedingAction && stepId !== sectionNeedingAction.id) {
        console.log('Cannot continue to step', stepId, 'because section', 
          sectionNeedingAction.id, 'is', sectionNeedingAction.status);
        return; // Don't navigate if trying to go to a different section
      }
    }

    // For Under Review status, redirect to the next section for filling
    // For Rejected or Request to Resubmit status, redirect to the same section for re-submission
    if (this.onboardingSteps[stepId - 1].status === 'in-progress') {
      // If current section is Under Review, find the next section to fill
      const nextSection = this.findNextSectionToFill(stepId);
      if (nextSection !== null) {
        console.log('Navigating to next section:', nextSection);
        this.router.navigate([`/wefab/supplier/supplier-onboarding-l${nextSection}`]);
      } else {
        // If no next section, go to profile review
        console.log('No next section, going to profile review');
        this.router.navigate(['/wefab/supplier/profile-review/', this.supplierCompanyId]);
      }
    } else if (this.onboardingSteps[stepId - 1].status === 'rejected' || 
               this.onboardingSteps[stepId - 1].status === 'request-to-update') {
      // If current section is Rejected or Request to Resubmit, redirect to the same section
      console.log('Section is', this.onboardingSteps[stepId - 1].status, ', redirecting to same section');
      if (stepId === 1) {
        this.router.navigate(['/wefab/supplier/supplier-onboarding']);
      } else {
        this.router.navigate([`/wefab/supplier/supplier-onboarding-l${stepId}`]);
      }
    } else {
      // Default behavior - go to the selected section
      console.log('Default behavior, going to selected section');
      if (stepId === 1) {
        this.router.navigate(['/wefab/supplier/supplier-onboarding']);
      } else {
        this.router.navigate([`/wefab/supplier/supplier-onboarding-l${stepId}`]);
      }
    }
  }

  findNextSectionToFill(currentStep: number): number | null {
    // If any section is rejected or needs update, no next section should be available
    if (this.hasRejectedSections()) {
      return null;
    }

    // Find the next section that needs to be filled (Not Started, Rejected, or Request to Resubmit)
    for (let i = currentStep; i < this.onboardingSteps.length; i++) {
      const step = this.onboardingSteps[i];
      if (step.status === 'pending' || step.status === 'rejected' || step.status === 'request-to-update') {
        return step.id;
      }
    }
    return null;
  }

  // Helper method to check if next section is available
  isNextAvailable(currentStepId: number): boolean {
    // If any section is rejected or needs update, no next section should be available
    if (this.hasRejectedSections()) {
      return false;
    }
    
    // Check if there's a next section that's not completed or in progress
    for (let i = currentStepId; i < this.onboardingSteps.length; i++) {
      if (i === this.onboardingSteps.length) break; // Prevent out of bounds
      
      const step = this.onboardingSteps[i]; // Get actual step
      if (step.status === 'pending' || step.status === 'rejected' || step.status === 'request-to-update') {
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
      case 'request-to-update':
        return 'UPDATE REQUESTED';
      default:
        return status.toUpperCase();
    }
  }

  viewDetails(step: any): void {
    console.log('View details for step:', step);
    
    // If any previous section is rejected, don't allow viewing details of this section
    // unless this section itself is rejected or needs update
    if (this.hasPreviousSectionRejected(step.id) && 
        step.status !== 'rejected' && 
        step.status !== 'request-to-update') {
      console.log('Cannot view details for step', step.id, 'because a previous section is rejected');
      return;
    }
    
    try {
      // Navigate to the specific route with mode=edit query parameter
      if (step.id === 1) {
        console.log('Navigating to L0');
        this.router.navigate(['/wefab/supplier/supplier-onboarding'], { queryParams: { mode: 'edit' } });
      } else if (step.id === 2) {
        console.log('Navigating to L2');
        this.router.navigate(['/wefab/supplier/supplier-onboarding-l2'], { queryParams: { mode: 'edit' } });
      } else if (step.id === 3) {
        console.log('Navigating to L3');
        this.router.navigate(['/wefab/supplier/supplier-onboarding-l3'], { queryParams: { mode: 'edit' } });
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }

  goToProfileReview(): void {
    console.log('Going to profile review');
    this.router.navigate(['/wefab/supplier/profile-review/', this.supplierCompanyId]);
  }

  shouldShowProfileReviewButton(): boolean {
    // Show "Go to Profile Review" button if any section is under review
    return this.onboardingSteps.some(step => step.status === 'in-progress' || step.status === 'rejected' || step.status === 'completed' );
  }

  // Check if all stages are approved
  areAllStagesApproved(): boolean {
    return this.currentOnboardingL1Status === 'Approved' && 
           this.currentOnboardingL2Status === 'Approved' && 
           this.currentOnboardingL3Status === 'Approved';
  }

  // Navigate to dashboard when all stages are approved
  goToDashboard(): void {
    console.log('Going to dashboard - all stages approved');
    
    // Set session storage to indicate onboarding is complete
    localStorage.setItem('supplier_onboarding_complete', 'true');
    localStorage.setItem('show_supplier_dashboard', 'true');
    
    // Navigate to the supplier dashboard
    this.router.navigate(['/wefab/supplier/dashboard']);
  }
}