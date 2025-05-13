import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { CommonService } from '../../shared/common.service';
import e from 'express';

interface DocumentSummary {
  companyDocuments: number;
  machinePhotos: number;
  facilityPhotos: number;
  certifications: number;
}

interface CompletionStatus {
  basicInformation: number;
  manufacturingCapabilities: number;
  financialAdditional: number;
}

@Component({
  selector: 'app-supplier-profile-review',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ToastModule,
    RippleModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './supplier-profile-review.component.html',
  styleUrls: ['./supplier-profile-review.component.scss']
})
export class SupplierProfileReviewComponent implements OnInit {
  status: string = 'Pending';
  lastUpdated: Date = new Date(2025, 4, 8); // May 8, 2025
  supplierId: any = sessionStorage.getItem('supplier_id');
  userType: any = sessionStorage.getItem('user_type');
  
  // Contact information
  contactEmail: string = 'contact@wefabsolutions.com';
  primaryContactName: string = 'Rajesh Kumar';
  phoneNumber: string = '+91 9876543210';
  primaryManufacturingProcess: string = 'CNC Machining';
  websiteUrl: string = 'https://techfab.example.com';
  linkedinUrl: string = 'https://linkedin.com/company/techfab';
  
  // Company information
  companyName: string = 'TechFab Industries';
  gstin: string = '22AAAAA0000A1Z5';
  country: string = 'India';
  registeredAddress: string = '123 Manufacturing Lane, Industrial Area, Mumbai 400001';
  manufacturingAddress: string = '123 Manufacturing Lane, Industrial Area, Mumbai 400001';
  hasGST: boolean = true; // True if they have GST, false if they don't
  isSameAddress: boolean = true; // True if manufacturing address is same as registered
  
  // Level tabs and section tabs
  activeLevelTab: string = 'basic'; // 'basic', 'manufacturing', 'financial'
  activeTab: string = 'revenue'; // 'revenue', 'credit', 'compliance', etc.
  basicInfoTab: string = 'company'; // Only 'company' and 'contact' now
  manufacturingTab: string = 'machines'; // 'machines', 'facility', 
  // 'certifications', 'capacity'

  // Financial Tab
  financialTab: string = 'financial'; // 'financial', 'additional'

  // Completion Status
  completionStatus: CompletionStatus = {
    basicInformation: 100,
    manufacturingCapabilities: 90,
    financialAdditional: 75
  };
  
  // Document Summary
  documentSummary: DocumentSummary = {
    companyDocuments: 0,
    machinePhotos: 0,
    facilityPhotos: 0,
    certifications: 1
  };
  
  // Verification Status
  verificationStatus: any = {}
  
  // Financial Data
  financialData = {
    year2024Revenue: '₹5,00,00,000',
    year2023Revenue: '₹4,50,00,000',
    year2022Revenue: '₹4,00,00,000'
  };
  
  // Manufacturing data
  productionCapacity: number = 75; // percentage
  industriesServed: string[] = ['Automotive', 'Aerospace', 'Medical Devices'];
  
  // Machine details
  machines = [
    
  ];
  
  // Certification details
  certifications = [
    
  ];
  
  // Facility photos
  facilityPhotos = [
    
  ];
  
  // Flag to check if running in browser environment
  private isBrowser: boolean;
  getCompanyProfile: any;
  manufacturingData: any;
  newFinancialData: any;
  getL1CurrentDataStatus: any;
  getCurrentDataStatus: any;
  getCurrentL1DataStatus: any;
  getCurrentL2DataStatus: any;
  getCurrentL3DataStatus: any;
  getDocumentSummaryData: any;
  numberOfMachinePhoto: number = 0
  numberOfFacilityPhoto: number = 0
  numberOfCertificationPhoto: number = 0
  getDocumentSummaryL1Data: any;
  phoneVerifiedStatus: any = false
  numberOfCompanyDocuments: number = 0
  mainCurrentDataStatusTrack: string = ''

  // First, let's add a method to update the completion status based on approval status
  updateCompletionStatus(): void {
    // Reset completion status
    this.completionStatus = {
      basicInformation: 0,
      manufacturingCapabilities: 0,
      financialAdditional: 0
    };
    
    // Update based on current approval status
    if (this.getCurrentL1DataStatus === 'Approved') {
      this.completionStatus.basicInformation = 100;
    } else if (this.getCurrentL1DataStatus === 'Under Review') {
      this.completionStatus.basicInformation = 50;
    }
    
    if (this.getCurrentL2DataStatus === 'Approved') {
      this.completionStatus.manufacturingCapabilities = 100;
    } else if (this.getCurrentL2DataStatus === 'Under Review') {
      this.completionStatus.manufacturingCapabilities = 50;
    }
    
    if (this.getCurrentL3DataStatus === 'Approved') {
      this.completionStatus.financialAdditional = 100;
    } else if (this.getCurrentL3DataStatus === 'Under Review') {
      this.completionStatus.financialAdditional = 50;
    }
  }
  
  // Overall completion percentage
  get completionPercentage(): number {
    const total = this.completionStatus.basicInformation + 
                  this.completionStatus.manufacturingCapabilities + 
                  this.completionStatus.financialAdditional;
    return Math.round(total / 3);
  }
  
  constructor(
    private router: Router,
    private messageService: MessageService,
    private commonservice: CommonService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.getL1Data(this.supplierId)
    this.getL1DataStatus(this.supplierId)
    this.getDocumentSummary(this.supplierId)
    this.getL1DocumentSummary(this.supplierId)
  }

  ngOnInit(): void {
    // Check for route params to determine which tab to display
    // Example: route like /profile-review?tab=manufacturing
    if (this.isBrowser) {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab) {
        this.changeLevelTab(tab);
      }
      
      // Check for secondary tab in URL
      const secondaryTab = urlParams.get('secondaryTab');
      if (secondaryTab && this.activeLevelTab === 'basic') {
        if (secondaryTab === 'company' || secondaryTab === 'contact') {
          this.changeBasicInfoTab(secondaryTab);
        }
      }
      
      // Check for manufacturing tab
      if (this.activeLevelTab === 'manufacturing') {
        const mtab = urlParams.get('mtab');
        if (mtab && ['machines', 'facility', 'certifications', 'capacity'].includes(mtab)) {
          this.changeManufacturingTab(mtab);
        }
      }

      this.getVerificationStatus(this.supplierId)
    }
  }

  getVerificationStatus(supplierId: string): void {
    this.commonservice.getData('/api/method/proq_buyer.wefab.api.supplier.onboarding.get_verification_status?supplier_company_id=SUP-000314' + supplierId).subscribe((res: any) => {
      debugger
      this.verificationStatus = res.data
    })
  }
  
  navigateToEdit(): void {
    
    // Navigate to appropriate edit page based on active tab
    switch (this.activeLevelTab) {
      case 'basic':
        this.router.navigate(['/wefab/supplier/supplier-onboarding'], {
          queryParams: { mode: 'edit' }
        });
        break;
      case 'manufacturing':
        this.router.navigate(['/wefab/supplier/supplier-onboarding-l2'], {
      queryParams: { mode: 'edit' }
    });
        break;
      case 'financial':
        this.router.navigate(['/wefab/supplier/supplier-onboarding-l3'], {
      queryParams: { mode: 'edit' }
    });
        break;
      default:
        this.router.navigate(['/wefab/supplier/supplier-onboarding']);
    }
  }
  
  returnToForm(): void {
    this.router.navigate(['/wefab/supplier/supplier-onboarding']);
  }
  
  printProfile(): void {
    if (this.isBrowser) {
      window.print();
    }
  }
  
  exportProfile(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Export',
      detail: 'Profile exported successfully',
      life: 3000
    });
  }
  
  changeLevelTab(tab: string): void {
    this.activeLevelTab = tab;
    
    // Reset the secondary tab when changing level tabs
    if (tab === 'financial') {
      this.activeTab = 'revenue';
      this.getL3Data(this.supplierId)
      this.getL3DataStatus(this.supplierId)
    }
    
    // Update URL with the active tab without navigation - only if in browser
    if (this.isBrowser) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.replaceState({}, '', url.toString());
      } catch (error) {
        console.error('Error updating URL:', error);
      }
    }

    if(tab === 'basic') {
      this.getL1Data(this.supplierId)
      this.getL1DataStatus(this.supplierId)
    }

    if(tab === 'manufacturing') {
      this.getL2Data(this.supplierId)
      this.getL2DataStatus(this.supplierId)
    }
    
    // Show toast for tab change
    this.messageService.add({
      severity: 'info',
      summary: 'Tab Changed',
      detail: `Viewing ${this.getTabDisplayName(tab)} information`,
      life: 2000
    });
  }
  
  changeTab(tab: string): void {
    this.activeTab = tab;
  }
  
  getTabDisplayName(tab: string): string {
    switch (tab) {
      case 'basic': return 'Basic Information';
      case 'manufacturing': return 'Manufacturing Capabilities';
      case 'financial': return 'Financial & Additional';
      default: return tab.charAt(0).toUpperCase() + tab.slice(1);
    }
  }
  
  approveProfile(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Approved',
      detail: 'Profile has been approved successfully',
      life: 3000
    });
    
    // Update status
    this.status = 'Approved';
  }
  
  rejectProfile(): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Rejected',
      detail: 'Profile has been rejected',
      life: 3000
    });
    
    // Update status
    this.status = 'Rejected';
  }
  
  changeBasicInfoTab(tab: string): void {
    this.basicInfoTab = tab;
    
    // Update URL with the active tabs without navigation - only if in browser
    if (this.isBrowser) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', this.activeLevelTab);
        url.searchParams.set('secondaryTab', tab);
        window.history.replaceState({}, '', url.toString());
      } catch (error) {
        console.error('Error updating URL:', error);
      }
    }
    
    // Show toast for tab change
    this.messageService.add({
      severity: 'info',
      summary: 'Tab Changed',
      detail: `Viewing ${tab === 'company' ? 'Company Details' : 'Contact Information'}`,
      life: 2000
    });
  }
  
  changeManufacturingTab(tab: string): void {
    this.manufacturingTab = tab;
    
    // Update URL with the active tabs without navigation - only if in browser
    if (this.isBrowser) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', this.activeLevelTab);
        url.searchParams.set('mtab', tab);
        window.history.replaceState({}, '', url.toString());
      } catch (error) {
        console.error('Error updating URL:', error);
      }
    }
    
    // Show toast for tab change
    this.messageService.add({
      severity: 'info',
      summary: 'Tab Changed',
      detail: `Viewing ${this.getManufacturingTabName(tab)}`,
      life: 2000
    });
  }
  
  getManufacturingTabName(tab: string): string {
    switch (tab) {
      case 'machines': return 'Machine Details';
      case 'facility': return 'Facility Verification';
      case 'certifications': return 'Certifications';
      case 'capacity': return 'Production Capacity';
      default: return tab.charAt(0).toUpperCase() + tab.slice(1);
    }
  }

  changeFinancialTab(tab: string): void {
    this.financialTab = tab;
  }

  getDocumentSummary(supplierId:any) {
    let endPoint = '/api/resource/wfb_supplier_onboarding_L2/' + supplierId
      this.commonservice.getData(endPoint).subscribe((res: any) => {
        this.getDocumentSummaryData = JSON.parse(res.data.company_profile)
        this.numberOfMachinePhoto = this.getDocumentSummaryData.machines.length
        this.numberOfFacilityPhoto = this.getDocumentSummaryData.facilityPhotos.length
        this.numberOfCertificationPhoto = this.getDocumentSummaryData.certifications.length
        console.log(this.getDocumentSummaryData)
      })
    }

    getL1DocumentSummary(supplierId:any) {
      let endPoint = '/api/resource/wfb_supplier_onboarding_L1/' + supplierId
        this.commonservice.getData(endPoint).subscribe((res: any) => {
          this.getDocumentSummaryL1Data = JSON.parse(res.data.company_profile)
          this.phoneVerifiedStatus = this.getDocumentSummaryL1Data.phone_verified
          this.numberOfCompanyDocuments = 1
          console.log(this.getDocumentSummaryData)
        })
      }

  getL1Data(supplierId:any) {
    let endPoint = '/api/resource/wfb_supplier_onboarding_L1/' + supplierId
      this.commonservice.getData(endPoint).subscribe((res: any) => {
        this.getCompanyProfile = JSON.parse(res.data.company_profile)
        console.log(this.getCompanyProfile)
      })
    }

    getL2Data(supplierId:any) {
      let endPoint = '/api/resource/wfb_supplier_onboarding_L2/' + supplierId
        this.commonservice.getData(endPoint).subscribe((res: any) => {
          this.manufacturingData = JSON.parse(res.data.company_profile)
        })
      }

      getL3Data(supplierId:any) {
        let endPoint = '/api/resource/wfb_supplier_onboarding_L3/' + supplierId
          this.commonservice.getData(endPoint).subscribe((res: any) => {
            this.newFinancialData = JSON.parse(res.data.company_profile)
            console.log(this.newFinancialData)
          })
        }

        getL1DataStatus(supplierId:any) {
          let endPoint = '/api/method/proq_buyer.wefab.api.supplier.onboarding.get_onboarding_stage_status?onboarding_stage=L1&supplier_company_id=' + supplierId
            this.commonservice.getData(endPoint).subscribe((res: any) => {
              this.getCurrentDataStatus = res.data.approval_status
              this.getCurrentL1DataStatus = res.data.approval_status
              this.mainCurrentDataStatus()
              this.updateCompletionStatus()
              if(this.getCurrentL1DataStatus === 'Approved') {
                this.getL2DataStatus(supplierId)
              }
            })
        }

        getL2DataStatus(supplierId:any) {
          let endPoint = '/api/method/proq_buyer.wefab.api.supplier.onboarding.get_onboarding_stage_status?onboarding_stage=L2&supplier_company_id=' + supplierId
            this.commonservice.getData(endPoint).subscribe((res: any) => {
              this.getCurrentDataStatus = res.data.approval_status
              this.getCurrentL2DataStatus = res.data.approval_status
              this.mainCurrentDataStatus()
              this.updateCompletionStatus()
              if(this.getCurrentL2DataStatus === 'Approved') {
                this.getL3DataStatus(supplierId)
              }
            })
        }

        getL3DataStatus(supplierId:any) {
          let endPoint = '/api/method/proq_buyer.wefab.api.supplier.onboarding.get_onboarding_stage_status?onboarding_stage=L3&supplier_company_id=' + supplierId
            this.commonservice.getData(endPoint).subscribe((res: any) => {
              this.getCurrentDataStatus = res.data.approval_status
              this.getCurrentL3DataStatus = res.data.approval_status
              this.mainCurrentDataStatus()
              this.updateCompletionStatus()
            })
        }

        mainCurrentDataStatus() {
          if(this.getCurrentL1DataStatus === 'Under Review') {
             this.mainCurrentDataStatusTrack = 'L1 Under Review'
          }
          else if(this.getCurrentL2DataStatus === 'Under Review') {
            this.mainCurrentDataStatusTrack = 'L2 Under Review'
          }
          else if(this.getCurrentL3DataStatus === 'Under Review') {
            this.mainCurrentDataStatusTrack = 'L3 Under Review'
          } else if(this.getCurrentL2DataStatus === 'Rejected') {
            this.mainCurrentDataStatusTrack = 'L2 Rejected'
          } else if(this.getCurrentL3DataStatus === 'Rejected') {
            this.mainCurrentDataStatusTrack = 'L3 Rejected'
          } else if(this.getCurrentL1DataStatus === 'Rejected') {
            this.mainCurrentDataStatusTrack = 'L1 Rejected'
          } 
          else if(this.getCurrentL3DataStatus === 'Approved') {
            this.mainCurrentDataStatusTrack = 'L3 Approved'
          } else if(this.getCurrentL2DataStatus === 'Approved') {
            this.mainCurrentDataStatusTrack = 'L2 Approved'
          } else if(this.getCurrentL1DataStatus === 'Approved') {
            this.mainCurrentDataStatusTrack = 'L1 Approved'
          }
        }

        isArray(value: any): boolean {
          return Array.isArray(value);
        }
        
        formatProcessName(process: string): string {
          // Convert snake_case or kebab-case to Title Case
          return process
            .replace(/[_-]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }

        isCertificateDocumentArray(cert: any): boolean {
          return Array.isArray(cert.certificateDocument);
        }

        isMachineDocumentArray(machine: any): boolean {
          return Array.isArray(machine.machinePhotos);
        }

        isImageFile(url: string): boolean {
          return /\.(jpeg|jpg|gif|png|webp|bmp)$/i.test(url);
        }
        
        isPdfFile(url: string): boolean {
          return /\.pdf$/i.test(url);
        }
        
        isDocFile(url: string): boolean {
          return /\.(doc|docx)$/i.test(url);
        }
        
        isOtherFile(url: string): boolean {
          return !this.isImageFile(url) && !this.isPdfFile(url) && !this.isDocFile(url);
        }
        
        getDocumentName(url: string): string {
          // Extract filename from URL
          const parts = url.split('/');
          const filename = parts[parts.length - 1];
          // Remove extension and decode URL
          return decodeURIComponent(filename.split('.')[0]);
        }
        
        getDocumentType(url: string): string {
          // Extract extension from URL
          const parts = url.split('.');
          return parts[parts.length - 1].toUpperCase();
        }
        
} 