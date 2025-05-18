import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CommonService } from '../../shared/common.service';

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
      title: 'Basic Information',
      description: 'Company details, contact information, and basic financial data',
      status: 'completed',
      progress: 100,
      icon: 'check'
    },
    {
      id: 2,
      title: 'Manufacturing Capabilities',
      description: 'Production capacity, facilities, and quality certifications',
      status: 'in-progress',
      progress: 50,
      icon: 'clock'
    },
    {
      id: 3,
      title: 'Financial Information',
      description: 'Detailed financial statements and banking information',
      status: 'pending',
      progress: 0,
      icon: 'lock'
    }
  ];
  currentOnboardingL1Status: any;
  currentOnboardingL2Status: any;
  currentOnboardingL3Status: any;
  currentOnboardingPage: any;

  constructor(private router: Router, private commonService: CommonService) {
    this.getOnboardingL1Status()
  }

  supplierCompanyId = sessionStorage.getItem('supplier_id')

  getOnboardingL1Status() {
    let endPoint = `/api/method/proq_buyer.wefab.api.supplier.onboarding.get_onboarding_stage_status?onboarding_stage=L1&supplier_company_id=${this.supplierCompanyId}`
    this.commonService.getData(endPoint).subscribe((res: any) => {
      debugger
      console.log(res)
      this.currentOnboardingL1Status = res.data.approval_status
      this.getOnboardingL2Status()
    })
  }

  getOnboardingL2Status() {
    let endPoint = `/api/method/proq_buyer.wefab.api.supplier.onboarding.get_onboarding_stage_status?onboarding_stage=L2&supplier_company_id=${this.supplierCompanyId}`
    this.commonService.getData(endPoint).subscribe((res: any) => {
      this.currentOnboardingL2Status = res.data.approval_status
      this.getOnboardingL3Status()
    })
  }

  getOnboardingL3Status() {
    let endPoint = `/api/method/proq_buyer.wefab.api.supplier.onboarding.get_onboarding_stage_status?onboarding_stage=L3&supplier_company_id=${this.supplierCompanyId}`
    this.commonService.getData(endPoint).subscribe((res: any) => {
      this.currentOnboardingL3Status = res.data.approval_status
      this.underReviewStatus()
      this.updateOnboardingSteps()
    })
  }

  underReviewStatus() {
    if(this.currentOnboardingL3Status === 'Under Review') {
      this.onboardingSteps[2].status = 'in-progress'
      this.onboardingSteps[2].progress = 50
      this.currentOnboardingPage = 3
    }
    else if(this.currentOnboardingL2Status === 'Under Review') {
      this.onboardingSteps[1].status = 'in-progress'
      this.onboardingSteps[1].progress = 50
      this.currentOnboardingPage = 2

    } else if(this.currentOnboardingL1Status === 'Under Review') {
      this.onboardingSteps[0].status = 'in-progress'
      this.onboardingSteps[0].progress = 50
      this.currentOnboardingPage = 1
    }
  }

  updateOnboardingSteps() {
    if(this.currentOnboardingL1Status === 'Not Started') {
      this.onboardingSteps[0].status = 'pending'
      this.onboardingSteps[0].progress = 0
      this.onboardingSteps[0].icon = 'lock'
    }
    if(this.currentOnboardingL2Status === 'Not Started') {
      this.onboardingSteps[1].status = 'pending'
      this.onboardingSteps[1].progress = 0
      this.onboardingSteps[1].icon = 'lock'
    }
    if(this.currentOnboardingL3Status === 'Not Started') {
      this.onboardingSteps[2].status = 'pending'
      this.onboardingSteps[2].progress = 0
      this.onboardingSteps[2].icon = 'lock'
    }
    if(this.currentOnboardingL1Status === 'Under Review') {
      this.onboardingSteps[0].status = 'in-progress'
      this.onboardingSteps[0].progress = 50
      this.onboardingSteps[0].icon = 'clock'
    }
    if(this.currentOnboardingL2Status === 'Under Review') {
      this.onboardingSteps[1].status = 'in-progress'
      this.onboardingSteps[1].progress = 50 
      this.onboardingSteps[1].icon = 'clock'
    }
    if(this.currentOnboardingL3Status === 'Under Review') {
      this.onboardingSteps[2].status = 'in-progress'
      this.onboardingSteps[2].progress = 50
      this.onboardingSteps[2].icon = 'clock'
    } 
    if(this.currentOnboardingL1Status === 'Approved') {
      this.onboardingSteps[0].status = 'completed'
      this.onboardingSteps[0].progress = 100
      this.onboardingSteps[0].icon = 'check'
      this.currentOnboardingPage = 1
    }
    if(this.currentOnboardingL2Status === 'Approved') {
      this.onboardingSteps[1].status = 'completed'
      this.onboardingSteps[1].progress = 100  
      this.onboardingSteps[1].icon = 'check'
      this.currentOnboardingPage = 2
    }
    if(this.currentOnboardingL3Status === 'Approved') {
      this.onboardingSteps[2].status = 'completed'
      this.onboardingSteps[2].progress = 100
      this.onboardingSteps[2].icon = 'check'
      this.currentOnboardingPage = 3
    }
    this.calculateOverallProgress()
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
    let step = stepId + 1
    console.log(step)
    this.router.navigate([`/wefab/supplier/supplier-onboarding-l${step}`]);
  }

  viewDetails(stepId: number): void {
    console.log(`Viewing details for step ${stepId}`);
    // Navigate to view the details of the completed step
    // this.router.navigate(['/supplier/onboarding', stepId, 'details']);
    this.router.navigate(['/wefab/supplier/profile-review']);
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
