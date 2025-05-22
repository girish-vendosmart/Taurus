import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { CommonService } from '../../shared/common.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import e from 'express';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

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

// New interface for activity trail
interface ActivityItem {
  id: string;
  date: Date;
  action: 'Approved' | 'Rejected' | 'Updated' | 'Submitted' | 'Created';
  title: string;
  description: string;
  user: string;
  level?: string;
  section?: string;
  time_since?: string;
}

// New interface for activity trail based on the provided data format
interface ActivityLogItem {
  name: number;
  user: string;
  creation: string;
  time_since: string;
  data: {
    changed: string[];
  };
}

@Component({
  selector: 'app-supplier-profile-review',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  
  private subscription: Subscription = new Subscription();
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
  // Removing basicInfoTab as we'll now show all info in one view
  basicInfoTab: string = 'company'; // Only 'company' and 'contact' now
  manufacturingTab: string = 'machines'; // 'machines', 'facility', 'certifications', 'capacity'

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

  // Add new properties for document preview
  previewDocument: string | null = null;
  registeredLng: any;
  registeredLat: any;
  
  // Activity Trail UI state
  showActivityTrail: boolean = false;
  
  // Sample activity trail data - in real implementation, this would be loaded from an API
  activityTrail: ActivityItem[] = [
    {
      id: '1',
      date: new Date(2023, 11, 20, 15, 30),
      action: 'Created',
      title: 'Profile Created',
      description: 'Supplier profile was created in the system',
      user: 'Rajesh Kumar'
    },
    {
      id: '2',
      date: new Date(2023, 11, 21, 10, 15),
      action: 'Submitted',
      title: 'Basic Information Submitted',
      description: 'L1: Basic company information was submitted for review',
      user: 'Rajesh Kumar',
      level: 'L1',
      section: 'Basic Information'
    },
    {
      id: '3',
      date: new Date(2023, 11, 22, 11, 45),
      action: 'Approved',
      title: 'Basic Information Approved',
      description: 'L1: Basic company information was approved',
      user: 'WeFab Admin',
      level: 'L1',
      section: 'Basic Information'
    },
    {
      id: '4',
      date: new Date(2023, 11, 25, 9, 30),
      action: 'Submitted',
      title: 'Manufacturing Capabilities Submitted',
      description: 'L2: Manufacturing capabilities information was submitted for review',
      user: 'Rajesh Kumar',
      level: 'L2',
      section: 'Manufacturing Capabilities'
    },
    {
      id: '5',
      date: new Date(2023, 12, 1, 14, 0),
      action: 'Updated',
      title: 'Manufacturing Capabilities Updated',
      description: 'Added new machine details and certifications',
      user: 'Rajesh Kumar',
      level: 'L2',
      section: 'Manufacturing Capabilities'
    },
    {
      id: '6',
      date: new Date(2023, 12, 2, 16, 20),
      action: 'Approved',
      title: 'Manufacturing Capabilities Approved',
      description: 'L2: Manufacturing capabilities were verified and approved',
      user: 'WeFab Admin',
      level: 'L2',
      section: 'Manufacturing Capabilities'
    },
    {
      id: '7',
      date: new Date(2023, 12, 10, 11, 0),
      action: 'Submitted',
      title: 'Financial Information Submitted',
      description: 'L3: Financial information was submitted for review',
      user: 'Rajesh Kumar',
      level: 'L3',
      section: 'Financial Information'
    },
    {
      id: '8',
      date: new Date(2023, 12, 12, 15, 45),
      action: 'Rejected',
      title: 'Financial Information Rejected',
      description: 'L3: Financial information was rejected. Missing insurance details.',
      user: 'WeFab Admin',
      level: 'L3',
      section: 'Financial Information'
    },
    {
      id: '9',
      date: new Date(2023, 12, 15, 10, 30),
      action: 'Updated',
      title: 'Financial Information Updated',
      description: 'Added missing insurance documentation and updated credit information',
      user: 'Rajesh Kumar',
      level: 'L3',
      section: 'Financial Information'
    },
    {
      id: '10',
      date: new Date(2023, 12, 18, 14, 15),
      action: 'Approved',
      title: 'Financial Information Approved',
      description: 'L3: Financial information was verified and approved',
      user: 'WeFab Admin',
      level: 'L3',
      section: 'Financial Information'
    }
  ];

  ngOnDestroy() {
    // Cleanup all subscriptions at once
    this.subscription.unsubscribe();
  }

  
  // First, let's add a method to update the completion status based on approval status
  updateCompletionStatus(): void {
    // Reset completion status
    this.completionStatus = {
      basicInformation: 0,
      manufacturingCapabilities: 0,
      financialAdditional: 0
    };
    
    // Update based on current approval status
    // For Stage 1: Under Review or Approved = 100% complete
    if (this.getCurrentL1DataStatus === 'Approved' || this.getCurrentL1DataStatus === 'Under Review') {
      this.completionStatus.basicInformation = 100;
    }
    
    // For Stage 2: Under Review or Approved = 100% complete
    if (this.getCurrentL2DataStatus === 'Approved' || this.getCurrentL2DataStatus === 'Under Review') {
      this.completionStatus.manufacturingCapabilities = 100;
    }
    
    // For Stage 3: Under Review or Approved = 100% complete
    if (this.getCurrentL3DataStatus === 'Approved' || this.getCurrentL3DataStatus === 'Under Review') {
      this.completionStatus.financialAdditional = 100;
    }
  }
  
  // Overall completion percentage
  get completionPercentage(): number {
    const total = this.completionStatus.basicInformation + 
                  this.completionStatus.manufacturingCapabilities + 
                  this.completionStatus.financialAdditional;
    return Math.round(total / 3);
  }
  
  // Add this property to track which dropdown is visible
  dropdownVisible: { [key: string]: boolean } = {
    'L1': false,
    'L2': false,
    'L3': false
  };

  // Add these properties to the component
  showUpdateDialog: boolean = false;
  updateRequestLevel: string = '';
  updateRequestComment: string = '';

  // Add isArray method for use in the template
  isArray = Array.isArray;

  constructor(
    private router: Router,
    private messageService: MessageService,
    private commonservice: CommonService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.getL1Data(this.supplierId)
    this.getDocumentSummary(this.supplierId)
    this.getL1DocumentSummary(this.supplierId)
    
    // Add click listener to close dropdowns when clicking outside
    if (this.isBrowser) {
      document.addEventListener('click', () => {
        Object.keys(this.dropdownVisible).forEach(key => {
          this.dropdownVisible[key] = false;
        });
      });
    }
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
      
      // Check for manufacturing tab
      if (this.activeLevelTab === 'manufacturing') {
        const mtab = urlParams.get('mtab');
        if (mtab && ['machines', 'facility', 'certifications', 'capacity'].includes(mtab)) {
          this.changeManufacturingTab(mtab);
        }
      }

      this.getVerificationStatus(this.supplierId)
      this.accessCommonFirebaseTrigger()
    }
  }

  accessCommonFirebaseTrigger() {
    //  Clear Existing subscription
    this.subscription.unsubscribe()

    this.subscription = this.commonservice.commonFirebaseTrigger('wfb_supplier_onboarding_L3', this.supplierId).subscribe((doc) => {
      alert('Firebase Trigger')
      // this.getL1Data(this.supplierId)
      // this.getL1DataStatus(this.supplierId)
    })
  }

  getVerificationStatus(supplierId: string): void {
    this.commonservice.getData('/api/method/proq_buyer.wefab.api.supplier.onboarding.get_onboarding_and_verification_status?supplier_company_id=' + supplierId).subscribe((res: any) => {
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
          this.numberOfCompanyDocuments = this.getDocumentSummaryL1Data.companyDocuments.length
          console.log(this.numberOfCompanyDocuments)
          console.log(this.getDocumentSummaryData)
        })
      }

  getL1Data(supplierId:any) {
    let endPoint = '/api/resource/wfb_supplier_onboarding_L1/' + supplierId
      this.commonservice.getData(endPoint).subscribe((res: any) => {
        console.log("L1 Data ", res)
        this.getCompanyProfile = JSON.parse(res.data.company_profile)
        console.log("L1 Data ", this.getCompanyProfile)
        this.registeredLat = this.getCompanyProfile.registered_lat;
        this.registeredLng = this.getCompanyProfile.registered_lng;
        this.getL1DataStatus(this.supplierId)
      })
    }

    updateMachineData() {
      this.manufacturingData.machines.forEach((machine: any) => {
        console.log('machine', machine)
        let fileId = machine.machinePhotos.fileId
        console.log('fileId', fileId)
        console.log('registeredLat', this.registeredLat)
        console.log('registeredLng', this.registeredLng)
        let endPoint = `/api/method/proq_buyer.api.supplier_onboarding.machine_image_verification.machine_identification.analyze_machine_image?file_id=${fileId}&facility_lat=${this.registeredLat}&facility_lon=${this.registeredLng}`
        this.commonservice.getData(endPoint).subscribe((res: any) => {
          console.log("Machine Analysis ", res)
          if (!res.data.machine_image && !res.data.within_facility) {
            machine.machinePhotos.machine_status = false
            machine.machinePhotos.machine_status_comment = res.data.verification_comment
          } else if (res.data.machine_image && !res.data.within_facility) {
            machine.machinePhotos.machine_status = false
            machine.machinePhotos.machine_status_comment = res.data.verification_comment
          } else if (res.data.machine_image && res.data.within_facility) {
            machine.machinePhotos.machine_status = true
            machine.machinePhotos.machine_status_comment = res.data.verification_comment
          }
        })
        this.updateFacilityData()
      })
    }

    updateFacilityData() {
      this.manufacturingData.facilityPhotos.forEach((facility: any) => {
        let fileId = facility.fileId
        console.log('fileId', fileId)
        let endpoint = `/api/method/proq_buyer.api.supplier_onboarding.machine_image_verification.machine_identification.factory_geolocation_verification?file_id=${fileId}&registered_address_lat=${this.registeredLat}&registered_address_lon=${this.registeredLng}`
        this.commonservice.getData(endpoint).subscribe((res: any) => {
          if(res.data.verification_status) {
             facility.facility_status = true;
             facility.facility_comment = res.data.verification_comment
          } else {  
            facility.facility_status = false;
            facility.facility_comment = res.data.verification_comment
          }
        })
      })
    }

    getL2Data(supplierId:any) {
      let endPoint = '/api/resource/wfb_supplier_onboarding_L2/' + supplierId
        this.commonservice.getData(endPoint).subscribe((res: any) => {
          this.manufacturingData = JSON.parse(res.data.company_profile)
          console.log("Manufacturing data ", this.manufacturingData)
          this.updateMachineData()
          this.getL2DataStatus(supplierId)
        })
      }

      getL3Data(supplierId:any) {
        let endPoint = '/api/resource/wfb_supplier_onboarding_L3/' + supplierId
          this.commonservice.getData(endPoint).subscribe((res: any) => {
            this.newFinancialData = JSON.parse(res.data.company_profile)
            this.getL3DataStatus(supplierId)
          })
        }

        getL1DataStatus(supplierId:any) {
          let endPoint = '/api/method/proq_buyer.wefab.api.supplier.onboarding.get_onboarding_stage_status?onboarding_stage=L1&supplier_company_id=' + supplierId
            this.commonservice.getData(endPoint).subscribe((res: any) => {
              this.getCurrentDataStatus = res.data.approval_status
              this.getCurrentL1DataStatus = res.data.approval_status
              this.getL2Data(supplierId)
            })
        }

        getL2DataStatus(supplierId:any) {
          let endPoint = '/api/method/proq_buyer.wefab.api.supplier.onboarding.get_onboarding_stage_status?onboarding_stage=L2&supplier_company_id=' + supplierId
            this.commonservice.getData(endPoint).subscribe((res: any) => {
              this.getCurrentDataStatus = res.data.approval_status
              this.getCurrentL2DataStatus = res.data.approval_status
              this.getL3Data(supplierId)
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
             this.mainCurrentDataStatusTrack = 'Stage 1: Under Review'
          }
          else if(this.getCurrentL2DataStatus === 'Under Review') {
            this.mainCurrentDataStatusTrack = 'Stage 2: Under Review'
          }
          else if(this.getCurrentL3DataStatus === 'Under Review') {
            this.mainCurrentDataStatusTrack = 'Stage 3: Under Review'
          } else if(this.getCurrentL2DataStatus === 'Rejected') {
            this.mainCurrentDataStatusTrack = 'Stage 2: Rejected'
          } else if(this.getCurrentL3DataStatus === 'Rejected') {
            this.mainCurrentDataStatusTrack = 'Stage 3: Rejected'
          } else if(this.getCurrentL1DataStatus === 'Rejected') {
            this.mainCurrentDataStatusTrack = 'Stage 1: Rejected'
          } 
          else if(this.getCurrentL3DataStatus === 'Approved') {
            this.mainCurrentDataStatusTrack = 'Stage 3: Approved'
          } else if(this.getCurrentL2DataStatus === 'Approved') {
            this.mainCurrentDataStatusTrack = 'Stage 2: Approved'
          } else if(this.getCurrentL1DataStatus === 'Approved') {
            this.mainCurrentDataStatusTrack = 'Stage 1: Approved'
          }
        }

        formatProcessName(process: string): string {
          // Convert snake_case or kebab-case to Title Case
          return process
            .replace(/[_-]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
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
        

        approve(level: string) {
          let endPoint = '/api/resource/wfb_supplier_onboarding_' + level + '/' + this.supplierId;
          let payload = {
            "onboarding_status": "Approved"
          };
          this.commonservice.putData(endPoint, payload).subscribe({
            next: (res: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: level === 'L1' ? 'Basic Information has been approved' : level === 'L2' ? 'Manufacturing Capabilities has been approved' : 'Financial & Additional has been approved',
                life: 3000
              });
              this.getStatusForm(level, this.supplierId)
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: level === 'L1' ? 'Failed to approve Basic Information' : level === 'L2' ? 'Failed to approve Manufacturing Capabilities' : 'Failed to approve Financial & Additional',
                life: 3000
              });
            }
          });
        }

        getStatusForm(level:string, supplierId:any) {
          if(level === 'L1') {
            this.getL1DataStatus(supplierId)
          } else if(level === 'L2') {
            this.getL2DataStatus(supplierId)
          } else if(level === 'L3') {
            this.getL3DataStatus(supplierId)
          }
        }

        reject(level: string) {
          let endPoint = '/api/resource/wfb_supplier_onboarding_' + level + '/' + this.supplierId;
          let payload = {
            "onboarding_status": "Rejected"
          };
          this.commonservice.putData(endPoint, payload).subscribe({
            next: (res: any) => {
              this.getL1DataStatus(this.supplierId);
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: level === 'L1' ? 'Basic Information has been rejected' : level === 'L2' ? 'Manufacturing Capabilities has been rejected' : 'Financial & Additional has been rejected',
                life: 3000
              });
              this.getStatusForm(level, this.supplierId)
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: level === 'L1' ? 'Failed to reject Basic Information' : level === 'L2' ? 'Failed to reject Manufacturing Capabilities' : 'Failed to reject Financial & Additional',
                life: 3000
              });
            }
          });
        }

        requestUpdate(level: string) {
          let endPoint = '/api/resource/wfb_supplier_onboarding_' + level + '/' + this.supplierId;
          let payload = {
            "onboarding_status": "Update Required"
          };
          this.commonservice.putData(endPoint, payload).subscribe({
            next: (res: any) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: level === 'L1' ? 'Basic Information update has been requested' : level === 'L2' ? 'Manufacturing Capabilities update has been requested' : 'Financial & Additional update has been requested',
                life: 3000
              });
              this.getStatusForm(level, this.supplierId)
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: level === 'L1' ? 'Failed to request update for Basic Information' : level === 'L2' ? 'Failed to request update for Manufacturing Capabilities' : 'Failed to request update for Financial & Additional',
                life: 3000
              });
            }
          });
        }

  /**
   * View a document in the preview overlay
   */
  viewDocument(url: string, event: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    if (!url) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Document URL is not available'
      });
      return;
    }
    
    this.previewDocument = url;
  }
  
  /**
   * Close the document preview overlay
   */
  closeDocumentPreview(): void {
    this.previewDocument = null;
  }
  
  /**
   * Download a document
   */
  downloadDocument(url: string, event: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    if (!url) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Document URL is not available'
      });
      return;
    }
    
    // Create a temporary anchor element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    
    // Extract filename from URL
    const filename = this.getDocumentName(url);
    link.download = filename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Document download started'
    });
  }
  
  /**
   * Sanitize a URL for safe use in iframes
   */
  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Toggle between profile review and activity trail views
   */
  toggleActivityTrail(): void {
    this.showActivityTrail = !this.showActivityTrail;
    
    if (this.showActivityTrail) {
      this.loadActivityTrail();
    }
  }
  
  /**
   * Load activity trail data from API
   */
  loadActivityTrail(): void {
    // In a real implementation, you'd fetch from API
    // For now, using mock data from the provided format
    this.commonservice.getData(`/api/method/proq_buyer.api.core.versioning.get_new_versions_trail?doctype=wfb_supplier_onboarding_L1&docname=${this.supplierId}`)
      .subscribe({
        next: (res: any) => {
          if (res && res.message && Array.isArray(res.message)) {
            this.activityLogs = res.message;
            // Convert raw activity logs to displayed activity items
            this.activityTrail = this.parseActivityLogs(this.activityLogs);
          } else {
            // Fallback to demo data
            this.activityLogs = this.getDemoActivityLogs();
            this.activityTrail = this.parseActivityLogs(this.activityLogs);
          }
        },
        error: (error) => {
          console.error('Error loading activity trail:', error);
          // Fallback to demo data
          this.activityLogs = this.getDemoActivityLogs();
          this.activityTrail = this.parseActivityLogs(this.activityLogs);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load activity trail data',
            life: 3000
          });
        }
      });
  }
  
  /**
   * Get demo activity logs in the provided format
   */
  getDemoActivityLogs(): ActivityLogItem[] {
    return [
      {
        name: 986,
        user: "David",
        creation: "2025-05-21 16:51:27.753543",
        time_since: "20 hours ago",
        data: {
          changed: [
            "Company Profile changed from {...} to {...}"  // Shortened for readability
          ]
        }
      },
      {
        name: 985,
        user: "David",
        creation: "2025-05-21 16:12:53.774990",
        time_since: "20 hours ago",
        data: {
          changed: [
            "Company Profile changed from {...} to {...}"  // Shortened for readability
          ]
        }
      },
      {
        name: 984,
        user: "Admin",
        creation: "2025-05-21 15:30:27.123456",
        time_since: "21 hours ago",
        data: {
          changed: [
            "Profile Status changed from 'Under Review' to 'Approved'"
          ]
        }
      },
      {
        name: 983,
        user: "System",
        creation: "2025-05-20 14:22:11.334455",
        time_since: "2 days ago",
        data: {
          changed: [
            "Verified Machine Photos"
          ]
        }
      },
      {
        name: 982,
        user: "Rajesh Kumar",
        creation: "2025-05-20 10:15:32.112233",
        time_since: "2 days ago",
        data: {
          changed: [
            "Added new manufacturing capability (5-axis CNC)"
          ]
        }
      }
    ];
  }
  
  /**
   * Parse the raw activity logs into displayable activity items
   */
  parseActivityLogs(logs: ActivityLogItem[]): ActivityItem[] {
    return logs.map(log => {
      // Default values
      let action: 'Approved' | 'Rejected' | 'Updated' | 'Submitted' | 'Created' = 'Updated';
      let title = 'Profile Updated';
      let description = log.data.changed[0] || 'Changes made to profile';
      
      // Determine action and title based on the description
      if (description.includes('changed from') && description.includes('to')) {
        action = 'Updated';
        
        // Extract what was changed from the description
        const changedField = description.split('changed from')[0].trim();
        title = `${changedField} Updated`;
        
        // Create a cleaner description
        if (changedField === 'Company Profile') {
          if (description.includes('machinePhotos')) {
            description = 'Updated machine details or photos';
          } else if (description.includes('facilityPhotos')) {
            description = 'Updated facility photos';
          } else if (description.includes('certifications')) {
            description = 'Updated certification information';
          } else if (description.includes('companyDocuments')) {
            description = 'Updated company documents';
          } else {
            description = 'Updated company profile information';
          }
        }
      } else if (description.includes('changed from') && description.includes('Approved')) {
        action = 'Approved';
        title = 'Profile Approved';
        description = 'Profile status was approved';
      } else if (description.includes('changed from') && description.includes('Rejected')) {
        action = 'Rejected';
        title = 'Profile Rejected';
        description = 'Profile status was rejected';
      } else if (description.includes('Verified')) {
        action = 'Approved';
        title = 'Verification Complete';
        description = 'Verification process was completed';
      } else if (description.includes('Added new')) {
        action = 'Created';
        title = 'New Item Added';
      }
      
      // Create the activity item
      return {
        id: log.name.toString(),
        date: new Date(log.creation),
        action,
        title,
        description,
        user: log.user,
        time_since: log.time_since
      };
    });
  }

  // Add activityLogs property to store raw log data
  activityLogs: ActivityLogItem[] = [];

  /**
   * Get CSS class for status badge based on action type
   */
  getStatusColorClass(action: string): string {
    switch(action) {
      case 'Approved':
        return 'status-approved';
      case 'Rejected':
        return 'status-rejected';
      case 'Updated':
        return 'status-updated';
      case 'Submitted':
        return 'status-submitted';
      case 'Created':
        return 'status-created';
      default:
        return '';
    }
  }

  /**
   * Get appropriate icon for action type
   */
  getStatusIcon(action: string): string {
    switch(action) {
      case 'Approved':
        return 'pi-check-circle';
      case 'Rejected':
        return 'pi-times-circle';
      case 'Updated':
        return 'pi-refresh';
      case 'Submitted':
        return 'pi-send';
      case 'Created':
        return 'pi-plus-circle';
      default:
        return 'pi-info-circle';
    }
  }

  // Add this method to toggle dropdown visibility
  toggleDropdown(level: string, event: Event): void {
    event.stopPropagation();
    // Close all other dropdowns
    Object.keys(this.dropdownVisible).forEach(key => {
      if (key !== level) {
        this.dropdownVisible[key] = false;
      }
    });
    // Toggle the current dropdown
    this.dropdownVisible[level] = !this.dropdownVisible[level];
  }

  // Add these methods to the component
  showUpdateRequestDialog(level: string): void {
    // Close any open dropdowns
    Object.keys(this.dropdownVisible).forEach(key => {
      this.dropdownVisible[key] = false;
    });
    
    this.updateRequestLevel = level;
    this.updateRequestComment = '';
    this.showUpdateDialog = true;
  }

  cancelUpdateRequest(): void {
    this.showUpdateDialog = false;
    this.updateRequestLevel = '';
    this.updateRequestComment = '';
  }

  sendUpdateRequest(): void {
    if (!this.updateRequestComment.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please provide a comment for the update request',
        life: 3000
      });
      return;
    }
    
    const level = this.updateRequestLevel;
    let endPoint = '/api/resource/wfb_supplier_onboarding_' + level + '/' + this.supplierId;
    let payload = {
      "onboarding_status": "Update Required",
      "update_request_comment": this.updateRequestComment
    };
    
    this.commonservice.putData(endPoint, payload).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: level === 'L1' ? 'Basic Information update has been requested' : level === 'L2' ? 'Manufacturing Capabilities update has been requested' : 'Financial & Additional update has been requested',
          life: 3000
        });
        this.getStatusForm(level, this.supplierId);
        this.showUpdateDialog = false;
        this.updateRequestLevel = '';
        this.updateRequestComment = '';
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: level === 'L1' ? 'Failed to request update for Basic Information' : level === 'L2' ? 'Failed to request update for Manufacturing Capabilities' : 'Failed to request update for Financial & Additional',
          life: 3000
        });
      }
    });
  }
} 