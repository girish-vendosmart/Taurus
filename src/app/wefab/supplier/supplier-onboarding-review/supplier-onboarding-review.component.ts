import { Component, OnInit, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { ToolbarModule } from 'primeng/toolbar';
import { AccordionModule } from 'primeng/accordion';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { CommonService } from '../../shared/common.service';
// You might need to import models if you have defined them
// import { L1DataModel, L2DataModel, L3DataModel } from './your-data-models'; // Example

@Component({
  selector: 'app-supplier-onboarding-review',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ToastModule,
    ProgressBarModule,
    DividerModule,
    RippleModule,
    ToolbarModule,
    AccordionModule,
    TabViewModule,
    TooltipModule
  ],
  providers: [MessageService], // Ensure MessageService is provided here or at a higher level
  templateUrl: './supplier-onboarding-review.component.html',
  styleUrls: ['./supplier-onboarding-review.component.scss']
})
export class SupplierOnboardingReviewComponent implements OnInit {
  // Data for each form level
  l1Data: any = {};
  l2Data: any = {};
  l3Data: any = {};

  // Tracking values for UI state
  loading: boolean = true;
  activeIndex: number = 0;
  completionStatus: { l1: boolean; l2: boolean; l3: boolean } = {
    l1: false,
    l2: false,
    l3: false
  };
  allDataLoaded: boolean = false;
  submissionInProgress: boolean = false;
  currentTab: number = 0;
  
  // Animation flags for better UX
  animateCard: boolean = false;
  showSuccessBanner: boolean = false;
  
  // Browser detection
  isBrowser: boolean = false;
  
  constructor(
    private router: Router,
    private messageService: MessageService,
    private commonService: CommonService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Check if running in browser environment
    if (!this.isBrowser) {
      console.log('Running on server, skipping initialization with timeouts');
      return;
    }
    
    // Add a small delay to simulate data loading and allow for animations
    setTimeout(() => {
      // Use static data instead of API calls
      this.loadStaticData();
      this.loading = false;
      
      // Trigger card animation
      setTimeout(() => {
        this.animateCard = true;
      }, 300);
    }, 800);
  }

  /**
   * Loads static mock data for demonstration
   */
  loadStaticData(): void {
    // Static L1 Data
    this.l1Data = {
      legalBusinessName: "WeFab Manufacturing Solutions Pvt Ltd",
      gstinNumber: "27AABCW1234A1Z5",
      noGst: false,
      panNumber: "AABCW1234A",
      country: "India",
      state: "Maharashtra",
      city: "Mumbai",
      registeredAddress: "123 Business Park, Andheri East, Mumbai 400093",
      manufacturingFacilityAddress: "456 Industrial Area, Navi Mumbai 400705",
      sameAsRegistered: false,
      primaryContactName: "Rajesh Kumar",
      phoneNumber: "+91 9876543210",
      phoneVerified: true,
      primaryManufacturingProcess: "CNC Machining",
      websiteURL: "https://wefabsolutions.com",
      linkedinURL: "https://linkedin.com/company/wefab-solutions",
      companyDocuments: ["doc1.pdf", "doc2.pdf"],
      email: "contact@wefabsolutions.com"
    };
    this.completionStatus.l1 = true;
    
    // Static L2 Data
    this.l2Data = {
      machines: [
        {
          make: "DMG MORI",
          model: "DMU 50",
          specifications: "5-axis CNC milling machine, working area 500x450x400mm",
          quantity: 2,
          machinePhotos: ["machine1.jpg", "machine2.jpg"]
        },
        {
          make: "HAAS",
          model: "VF-2",
          specifications: "3-axis CNC milling center, 30x16x20 inch travel",
          quantity: 3,
          machinePhotos: ["machine3.jpg"]
        }
      ],
      certifications: [
        {
          certificationName: "ISO 9001:2015",
          certifyingBody: "TUV Nord",
          expirationDate: "2025-06-30",
          certificateDocument: ["iso9001.pdf"]
        },
        {
          certificationName: "AS9100 Rev D",
          certifyingBody: "Bureau Veritas",
          expirationDate: "2024-12-15",
          certificateDocument: ["as9100.pdf"]
        }
      ],
      productionCapacity: 75,
      industries: [
        { label: "Aerospace", value: "aerospace" },
        { label: "Automotive", value: "automotive" },
        { label: "Medical Devices", value: "medical" }
      ],
      facilityPhotos: ["facility1.jpg", "facility2.jpg"],
      facilityAddress: "456 Industrial Area, Navi Mumbai 400705",
      gpsCoordinates: "19.0760° N, 72.8777° E",
      floorArea: 15000
    };
    this.completionStatus.l2 = true;
    
    // Static L3 Data
    this.l3Data = {
      companyFinancials: {
        currency: "INR",
        annualRevenue2024: "15,00,00,000",
        annualRevenue2023: "12,50,00,000",
        annualRevenue2022: "9,75,00,000",
        creditRatingProvider: "CRISIL",
        taxCompliant: true
      },
      insuranceCoverage: {
        generalLiabilityInsurance: "₹5,00,00,000",
        productLiabilityInsurance: "₹2,50,00,000"
      },
      additionalInformation: {
        websites: {
          website: "https://wefabsolutions.com"
        },
        totalEmployees: "75-100",
        foundedYear: "2010",
        leadTime: "14",
        minimumOrderQuantity: "50 units",
        productionFacilities: [
          {
            facilityName: "WeFab Main Plant",
            facilityLocation: "Mumbai, India"
          },
          {
            facilityName: "WeFab R&D Center",
            facilityLocation: "Pune, India"
          }
        ],
        references: [
          {
            companyName: "Tata Motors",
            contactName: "Sunil Mehta",
            email: "sunil.mehta@example.com"
          },
          {
            companyName: "Mahindra Aerospace",
            contactName: "Priya Sharma",
            email: "priya.sharma@example.com"
          }
        ]
      },
      termsAndConditions: {
        acceptTerms: true,
        acceptPrivacyPolicy: true
      }
    };
    this.completionStatus.l3 = true;
    
    // Set all data as loaded
    this.allDataLoaded = true;
    this.showSuccessBanner = true;
  }

  /**
   * Show error toast message
   */
  showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  }

  /**
   * Navigate to edit a specific section
   */
  editSection(section: 'l1' | 'l2' | 'l3'): void {
    let route = '/wefab/supplier/';
    let sectionName = '';
    
    switch (section) {
      case 'l1':
        route += 'supplier-onboarding';
        sectionName = 'Basic Details';
        break;
      case 'l2':
        route += 'supplier-onboarding-l2';
        sectionName = 'Manufacturing Capabilities';
        break;
      case 'l3':
        route += 'supplier-onboarding-l3';
        sectionName = 'Financial Information';
        break;
    }
    
    this.router.navigate([route], { queryParams: { editMode: true, fromReview: true } });
    
    this.messageService.add({
      severity: 'info',
      summary: `Editing ${sectionName}`,
      detail: `You are now editing the ${section.toUpperCase()} details. After saving, return to the review page.`,
      life: 3000
    });
  }

  /**
   * Final submission of all onboarding data
   */
  confirmAndSubmit(): void {
    if (!this.allDataLoaded) {
      this.showError('Please complete all onboarding forms before final submission.');
      return;
    }
    
    this.submissionInProgress = true;
    
    // Simulate successful submission immediately
    setTimeout(() => {
      this.submissionInProgress = false;
      
      this.messageService.add({
        severity: 'success',
        summary: 'Onboarding Complete',
        detail: 'Congratulations! Your supplier onboarding is now complete. We will review your information and contact you shortly.',
        life: 5000
      });
      
      // Navigate to the completion page
      setTimeout(() => {
        this.router.navigate(['/wefab/supplier/onboarding-complete']);
      }, 3000);
    }, 1000); // Reduced to 1 second for faster demo
  }

  /**
   * Helper to display array data nicely, e.g., for industries
   */
  formatArrayDisplay(arr: any[] | undefined): string {
    if (!arr || arr.length === 0) {
      return 'N/A';
    }
    
    if (typeof arr[0] === 'object' && arr[0] !== null) {
      if (arr[0].label) {
        return arr.map(item => item.label).join(', ');
      } else if (arr[0].value) {
        return arr.map(item => item.value).join(', ');
      }
    }
    
    return arr.join(', ');
  }

  /**
   * Check if a file is uploaded
   */
  isUploaded(fileData: any): string {
    if (Array.isArray(fileData) && fileData.length > 0) return 'Uploaded';
    if (!Array.isArray(fileData) && fileData) return 'Uploaded';
    return 'Not Uploaded';
  }
  
  /**
   * Get completion percentage
   */
  getCompletionPercentage(): number {
    let completed = 0;
    if (this.completionStatus.l1) completed++;
    if (this.completionStatus.l2) completed++;
    if (this.completionStatus.l3) completed++;
    
    return (completed / 3) * 100;
  }
  
  /**
   * Change the active tab
   */
  onTabChange(event: any): void {
    this.currentTab = event.index;
  }
  
  /**
   * Print the review page
   */
  printReview(): void {
    if (this.isBrowser) {
      window.print();
    }
  }
  
  /**
   * Convert boolean to Yes/No string
   */
  boolToYesNo(value: boolean | undefined | null): string {
    if (value === undefined || value === null) return 'N/A';
    return value ? 'Yes' : 'No';
  }
  
  /**
   * Check if an object is empty (has no own properties)
   */
  isEmpty(obj: any): boolean {
    if (!obj) return true;
    return Object.keys(obj).length === 0;
  }
} 