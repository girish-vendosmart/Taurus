import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { CommonService } from '../../../../shared/services/common.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SweetAlertService } from '../../../../shared/services/sweet-alert.service'
import e from 'express';
import { forkJoin, of, BehaviorSubject, Observable } from 'rxjs';
import { map, tap, catchError, finalize, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ActivityTrailComponent, ActivityLogData } from '../../../../shared/components/activity-trail/activity-trail.component';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { ConfigurableButtonComponent } from '../../../../shared/components/configurable-button/configurable-button.component';

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

interface LoadingState {
  l1Data: boolean;
  l2Data: boolean;
  l3Data: boolean;
  verification: boolean;
  machineAnalysis: boolean;
  facilityAnalysis: boolean;
}

interface MachineAnalysisResult {
  machine_status: boolean;
  machine_status_comment: string;
}

interface FacilityAnalysisResult {
  facility_status: boolean;
  facility_comment: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
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
    TooltipModule,
    ActivityTrailComponent,
    DateFormatPipe,
    ConfigurableButtonComponent
  ],
  providers: [MessageService],
  templateUrl: './supplier-profile-review.component.html',
  styleUrls: ['./supplier-profile-review.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupplierProfileReviewComponent implements OnInit, OnDestroy {

  // activityTrailButtonConfig = {
  //   label: 'View Activity Trail',
  //   icon: 'pi pi-history',
  //   styleClass: 'btn-view-activity',
  //   iconPos: 'left'
  // };

  activityTrailButtonConfig = {
    label: 'View Activity Trail',
    icon: 'pi pi-history',
    severity: 'primary',
    iconPos: 'left',
    style: {
      fontSize: '0.875rem',
      padding: '0.4rem 0.8rem',
      borderRadius: '5px'
    }
  };

  backButtonConfig = {
    label: 'Back',
    icon: 'pi pi-arrow-left',
    severity: 'primary',
    iconPos: 'left',
    style: {
      fontSize: '0.875rem',
      padding: '0.4rem 0.8rem',
      borderRadius: '5px'
    }
  };
  
  private subscription: Subscription = new Subscription();
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_EXPIRY = 10 * 60 * 1000; // Increased to 10 minutes for better caching
  
  // Loading states
  loadingState: LoadingState = {
    l1Data: false,
    l2Data: false,
    l3Data: false,
    verification: false,
    machineAnalysis: false,
    facilityAnalysis: false
  };

  // Core properties
  status: string = 'Pending';
  lastUpdated: Date = new Date(2025, 4, 8); // May 8, 2025
  supplierId: any = ''
  userType: any = localStorage.getItem('user_type');
  
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

  // Financial Tab - No longer needed since we removed sub-tabs
  // financialTab: string = 'financial'; // 'financial', 'additional'

  // Completion Status
  completionStatus: CompletionStatus = {
    basicInformation: 0,
    manufacturingCapabilities: 0,
    financialAdditional: 0
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
  
  // Request to resubmit comments
  requestToResubmitCommentL1: string = '';
  requestToResubmitCommentL2: string = '';
  requestToResubmitCommentL3: string = '';
  
  // Feedback summary controls
  showFeedbackSummary: boolean = false;
  
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
  mainCurrentDataStatusTrack: string = 'Pending';

  // Add new properties for document preview
  previewDocument: string | null = null;
  registeredLng: any;
  registeredLat: any;
  
  // Activity Trail UI state
  showActivityTrail: boolean = false;
  
  // Activity trail data - loaded from API
  activityTrail: ActivityLogData[] = [];
  
  // Activity trail loading state
  activityTrailLoading: boolean = false;
  gstVerified: any = false;
  phoneVerified: any = false;
  facilityVerified: any = false;

  // Add isArray method for use in the template
  isArray = Array.isArray;

  // Observables for reactive data loading
  private dataLoadingSubject = new BehaviorSubject<boolean>(false);
  public dataLoading$ = this.dataLoadingSubject.asObservable();
  panVerified: any;

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

  // Add lazy loading flags
  private hasLoadedMachineAnalysis = false;
  private hasLoadedFacilityAnalysis = false;
  private isInitialLoad = true;

  constructor(
    private router: Router,
    private messageService: MessageService,
    private commonservice: CommonService,
    private sanitizer: DomSanitizer,
    private sweetAlert: SweetAlertService,
    private location: Location,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.mainCurrentDataStatusTrack = 'Pending'; // Initialize with a default value
    
    // Add click listener to close dropdowns when clicking outside
    if (this.isBrowser) {
      document.addEventListener('click', () => {
        Object.keys(this.dropdownVisible).forEach(key => {
          this.dropdownVisible[key] = false;
        });
      });
    }

    // Getting supplier Id from url
    this.route.params.subscribe((params: any) => {
      this.supplierId = params['id'];
    });
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.cache.clear();
  }

  private initializeComponent(): void {
    // Show loading state
    this.dataLoadingSubject.next(true);

    // Handle URL parameters
    this.handleUrlParameters();

    // Load only essential data initially
    this.loadEssentialData();

    // Remove automatic Firebase triggers - only call when needed
    this.accessFirebaseTrigger('Supplier Onboarding L1', this.supplierId)
    this.accessFirebaseTrigger('Supplier Onboarding L2', this.supplierId)
    this.accessFirebaseTrigger('Supplier Onboarding L3', this.supplierId)
  }

  private handleUrlParameters(): void {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      
      if (tab && ['basic', 'manufacturing', 'financial'].includes(tab)) {
        this.activeLevelTab = tab;
      }

      if (this.activeLevelTab === 'manufacturing') {
        const mtab = urlParams.get('mtab');
        if (mtab && ['machines', 'facility', 'certifications', 'capacity'].includes(mtab)) {
          this.manufacturingTab = mtab;
        }
      }
    } catch (error) {
      console.error('Error handling URL parameters:', error);
    }
  }

  private loadEssentialData(): void {
    if (!this.supplierId) {
      this.showError('Supplier ID is missing');
      this.dataLoadingSubject.next(false);
      return;
    }

    // Load basic data, verification status, ALL status data, and document summary for one-shot calculation
    const essentialRequests = [
      this.getVerificationStatusObservable(this.supplierId),
      this.getL1DataObservable(this.supplierId),
      this.getL2StatusObservable(this.supplierId), // Only status, not full data
      this.getL3StatusObservable(this.supplierId), // Only status, not full data
      this.getDocumentSummaryObservable(this.supplierId) // New: Document summary in one shot
    ];

    this.subscription.add(
      forkJoin(essentialRequests).pipe(
        finalize(() => {
          this.dataLoadingSubject.next(false);
          this.isInitialLoad = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: ([verificationData, l1Data, l2Status, l3Status, docSummary]) => {
          // Process essential data
          this.verificationStatus = verificationData;
          this.processL1Data(l1Data);
          
          // Store status data for profile completeness
          this.getCurrentL2DataStatus = l2Status?.approval_status;
          this.getCurrentL3DataStatus = l3Status?.approval_status;
          
          // Process document summary in one shot
          this.processDocumentSummary(docSummary);
          
          // Calculate profile completeness with ALL status data at once
          this.calculateProfileCompleteness();
          
          // Load additional data based on active tab (content only, not status or counts)
          this.loadDataForActiveTab();
        },
        error: (error) => {
          console.error('Error loading essential data:', error);
          this.showError('Failed to load profile data');
        }
      })
    );
  }

  private loadDataForActiveTab(): void {
    // Load data lazily based on the active tab
    switch (this.activeLevelTab) {
      case 'manufacturing':
        this.loadManufacturingData();
        
        // If manufacturing data is already available, trigger analysis immediately
        if (this.manufacturingData) {
          console.log('🔄 Manufacturing tab active with existing data, triggering analysis...');
          setTimeout(() => {
            this.triggerMachineAnalysisForManufacturingTab();
          }, 100);
        }
        break;
      case 'financial':
        this.loadFinancialData();
        break;
      // Basic data is already loaded
    }
  }

  private loadManufacturingData(): void {
    if (this.manufacturingData) return; // Already loaded

    this.loadingState.l2Data = true;
    this.subscription.add(
      this.getL2DataObservable(this.supplierId).pipe(
        finalize(() => {
          this.loadingState.l2Data = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: (l2Data) => {
          this.processL2Data(l2Data);
          // Don't recalculate profile completeness here - it's already calculated
          
          // If user is currently on manufacturing tab, auto-trigger analysis
          if (this.activeLevelTab === 'manufacturing') {
            console.log('📊 Manufacturing data loaded, auto-triggering analysis...');
            // Small delay to ensure data is fully processed
            setTimeout(() => {
              this.triggerMachineAnalysisForManufacturingTab();
            }, 100);
          }
        },
        error: (error) => {
          console.error('Error loading manufacturing data:', error);
          this.showError('Failed to load manufacturing data');
        }
      })
    );
  }

  private loadFinancialData(): void {
    if (this.newFinancialData) return; // Already loaded

    this.loadingState.l3Data = true;
    this.subscription.add(
      this.getL3DataObservable(this.supplierId).pipe(
        finalize(() => {
          this.loadingState.l3Data = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: (l3Data) => {
          this.processL3Data(l3Data);
          // Don't recalculate profile completeness here - it's already calculated
        },
        error: (error) => {
          console.error('Error loading financial data:', error);
          this.showError('Failed to load financial data');
        }
      })
    );
  }

  private getL2DataObservable(supplierId: string): Observable<any> {
    const cacheKey = `l2_data_${supplierId}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return of(cached);
    }

    return forkJoin([
      this.commonservice.getData(`/api/resource/Supplier Onboarding L2/${supplierId}`),
      this.commonservice.getData(`/api/method/wefab.wefab.api.supplier.onboarding.onboarding.get_onboarding_stage_status?onboarding_stage=L2&supplier_company_id=${supplierId}`)
    ]).pipe(
      map(([dataRes, statusRes]: [any, any]) => ({
        data: dataRes?.data || null,
        status: statusRes?.data || null
      })),
      tap(result => this.setCache(cacheKey, result)),
      catchError(error => {
        console.error('Error fetching L2 data:', error);
        return of({ data: null, status: null });
      })
    );
  }

  private getL3DataObservable(supplierId: string): Observable<any> {
    const cacheKey = `l3_data_${supplierId}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return of(cached);
    }

    return forkJoin([
      this.commonservice.getData(`/api/resource/Supplier Onboarding L3/${supplierId}`),
      this.commonservice.getData(`/api/method/wefab.wefab.api.supplier.onboarding.onboarding.get_onboarding_stage_status?onboarding_stage=L3&supplier_company_id=${supplierId}`)
    ]).pipe(
      map(([dataRes, statusRes]: [any, any]) => ({
        data: dataRes?.data || null,
        status: statusRes?.data || null
      })),
      tap(result => this.setCache(cacheKey, result)),
      catchError(error => {
        console.error('Error fetching L3 data:', error);
        return of({ data: null, status: null });
      })
    );
  }

  private calculateProfileCompleteness(): void {
    // Reset completion status initially to 0
    this.completionStatus = {
      basicInformation: 0,
      manufacturingCapabilities: 0,
      financialAdditional: 0
    };
    
    console.log('🧮 Calculating profile completeness with all status data:');
    console.log('L1 Status:', this.getCurrentL1DataStatus);
    console.log('L2 Status:', this.getCurrentL2DataStatus);
    console.log('L3 Status:', this.getCurrentL3DataStatus);
    
    // Calculate based on current approval status for all levels
    // For Stage 1: Basic Information
    if (this.getCurrentL1DataStatus) {
      if (this.getCurrentL1DataStatus === 'Approved' || 
          this.getCurrentL1DataStatus === 'Under Review' || this.getCurrentL1DataStatus === 'Rejected' ||
          this.getCurrentL1DataStatus === 'Request to Resubmit') {
        this.completionStatus.basicInformation = 100;
      }
    }
    
    // For Stage 2: Manufacturing Capabilities
    if (this.getCurrentL2DataStatus) {
      if (this.getCurrentL2DataStatus === 'Approved' || 
          this.getCurrentL2DataStatus === 'Under Review' || this.getCurrentL2DataStatus === 'Rejected' ||
          this.getCurrentL2DataStatus === 'Request to Resubmit') {
        this.completionStatus.manufacturingCapabilities = 100;
      }
    }
    
    // For Stage 3: Financial & Additional
    if (this.getCurrentL3DataStatus) {
      if (this.getCurrentL3DataStatus === 'Approved' || 
          this.getCurrentL3DataStatus === 'Under Review' || this.getCurrentL3DataStatus === 'Rejected' ||
          this.getCurrentL3DataStatus === 'Request to Resubmit') {
        this.completionStatus.financialAdditional = 100;
      }
    }

    // Update main status after calculating completeness
    this.updateMainStatus();
    
    console.log('✅ Profile completeness calculated ONCE:', this.completionStatus);
    console.log('📊 Overall completion percentage:', this.completionPercentage);
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.timestamp + entry.expiry) {
      return entry.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: this.CACHE_EXPIRY
    });
  }

  private getVerificationStatusObservable(supplierId: string): Observable<any> {
    const cacheKey = `verification_${supplierId}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return of(cached);
    }

    this.loadingState.verification = true;
    
    return this.commonservice.getData(
      `/api/method/wefab.wefab.api.supplier.onboarding.onboarding.get_onboarding_and_verification_status?supplier_company_id=${supplierId}`
    ).pipe(
      map((res: any) => res?.data || {}),
      tap(data => this.setCache(cacheKey, data)),
      catchError(error => {
        console.error('Error fetching verification status:', error);
        return of({});
      }),
      finalize(() => {
        this.loadingState.verification = false;
        this.cdr.detectChanges();
      })
    );
  }

  private getL1DataObservable(supplierId: string): Observable<any> {
    const cacheKey = `l1_data_${supplierId}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return of(cached);
    }

    this.loadingState.l1Data = true;

    return forkJoin([
      this.commonservice.getData(`/api/resource/Supplier Onboarding L1/${supplierId}`),
      this.commonservice.getData(`/api/method/wefab.wefab.api.supplier.onboarding.onboarding.get_onboarding_stage_status?onboarding_stage=L1&supplier_company_id=${supplierId}`)
    ]).pipe(
      map(([dataRes, statusRes]: [any, any]) => ({
        data: dataRes?.data || null,
        status: statusRes?.data || null
      })),
      tap(result => this.setCache(cacheKey, result)),
      catchError(error => {
        console.error('Error fetching L1 data:', error);
        return of({ data: null, status: null });
      }),
      finalize(() => {
        this.loadingState.l1Data = false;
        this.cdr.detectChanges();
      })
    );
  }

  private processL1Data(result: any): void {
    console.log('🔍 processL1Data called with result:', result);
    
    if (result.data) {
      try {
        this.getCompanyProfile = JSON.parse(result.data.company_profile);
        this.gstVerified = this.getCompanyProfile?.gstVerified || false;
        this.panVerified = this.getCompanyProfile?.panVerified || false;
        this.phoneVerified = this.getCompanyProfile?.phone_verified || false;
        this.requestToResubmitCommentL1 = result.data.comment || '';
        
        console.log('✅ L1 data processed, document count already handled in summary');
      } catch (error) {
        console.error('Error parsing L1 data:', error);
        this.getCompanyProfile = null;
      }
    }

    if (result.status) {
      this.getCurrentL1DataStatus = result.status.approval_status;
      console.log('📊 L1 Status set to:', this.getCurrentL1DataStatus);
    }
  }

  private processL2Data(result: any): void {
    console.log('🔍 processL2Data called with result:', result);
    
    if (result.data) {
      try {
        this.manufacturingData = JSON.parse(result.data.company_profile);
        this.requestToResubmitCommentL2 = result.data.comment || '';
        
        console.log('✅ Manufacturing data parsed successfully:', this.manufacturingData);
        console.log('🔧 Machines available:', this.manufacturingData?.machines?.length || 0);
        console.log('🏭 Facilities available:', this.manufacturingData?.facilityPhotos?.length || 0);
        
        console.log('✅ L2 data processed, document counts already handled in summary');

        // Log machine structure for debugging
        if (this.manufacturingData?.machines?.length) {
          console.log('🔍 First machine structure:', this.manufacturingData.machines[0]);
        }
        
      } catch (error) {
        console.error('Error parsing L2 data:', error);
        this.manufacturingData = null;
      }
    }

    if (result.status) {
      this.getCurrentL2DataStatus = result.status.approval_status;
      console.log('📊 L2 Status set to:', this.getCurrentL2DataStatus);
    }
  }

  private processL3Data(result: any): void {
    if (result.data) {
      try {
        this.newFinancialData = JSON.parse(result.data.company_profile);
        this.requestToResubmitCommentL3 = result.data.comment || '';
      } catch (error) {
        console.error('Error parsing L3 data:', error);
        this.newFinancialData = null;
      }
    }

    if (result.status) {
      this.getCurrentL3DataStatus = result.status.approval_status;
    }
  }

  private processMachineVerificationAsync(): void {
    console.log('🔄 processMachineVerificationAsync called');
    
    if (!this.manufacturingData?.machines?.length) {
      console.log('❌ No machines to analyze');
      return;
    }

    // Check if machine analysis is already in progress
    if (this.loadingState.machineAnalysis) {
      console.log('⏳ Machine analysis already in progress, skipping');
      return;
    }

    // Prepare machine analysis requests
    const machineRequests: Observable<any>[] = [];
    
    const machinesToAnalyze = this.manufacturingData.machines.filter((machine: any) => {
      const fileId = machine.machinePhotos?.fileId || machine.machinePhotos?.[0]?.file_id;
      if (!fileId) return false;
      
      const cacheKey = `machine_analysis_${fileId}`;
      const cached = this.getFromCache<MachineAnalysisResult>(cacheKey);
      
      if (cached) {
        // Apply cached results
        if (Array.isArray(machine.machinePhotos)) {
          machine.machinePhotos[0].machine_status = cached.machine_status;
          machine.machinePhotos[0].machine_status_comment = cached.machine_status_comment;
        } else {
          machine.machinePhotos.machine_status = cached.machine_status;
          machine.machinePhotos.machine_status_comment = cached.machine_status_comment;
        }
        return false;
      }
      
      return machine.machinePhotos.machine_status === undefined;
    });

    if (machinesToAnalyze.length === 0) {
      console.log('✅ All machines already analyzed, skipping API calls');
      return;
    }

    console.log(`🚀 Starting analysis for ${machinesToAnalyze.length} machines`);
    this.loadingState.machineAnalysis = true;
    machineRequests.push(...machinesToAnalyze.map((machine: any) => this.analyzeMachine(machine)));

    // Execute all requests in parallel
    forkJoin(machineRequests).pipe(
      catchError(error => {
        console.error('💥 Error during machine analysis:', error);
        return of([]);
      }),
      finalize(() => {
        console.log('🏁 Machine analysis completed');
        this.loadingState.machineAnalysis = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (results) => {
        console.log(`✅ Machine analysis completed. Processed ${results.length} machines.`);
      }
    });
  }

  private analyzeMachine(machine: any): Observable<any> {
    console.log('🔍 analyzeMachine called for machine:', machine);
    
    if (!machine?.machinePhotos) {
      console.log('❌ No machinePhotos found');
      return of(null);
    }

    // Handle both array and object structures
    let machinePhoto: any;
    let fileId: string;
    
    if (Array.isArray(machine.machinePhotos)) {
      machinePhoto = machine.machinePhotos[0];
      fileId = machinePhoto?.file_id || machinePhoto?.fileId;
      console.log('📦 Array structure - machinePhoto:', machinePhoto);
    } else {
      machinePhoto = machine.machinePhotos;
      fileId = machinePhoto.fileId || machinePhoto.file_id;
      console.log('📦 Object structure - machinePhoto:', machinePhoto);
    }
    
    console.log('🆔 Extracted fileId:', fileId);
    
    if (!fileId) {
      console.log('❌ No fileId found');
      return of(null);
    }

    // Check cache first
    const cacheKey = `machine_analysis_${fileId}`;
    const cached = this.getFromCache<MachineAnalysisResult>(cacheKey);
    
    if (cached) {
      console.log(`💾 Using cached analysis for machine ${fileId}:`, cached);
      // Apply to the correct object structure
      if (Array.isArray(machine.machinePhotos)) {
        machine.machinePhotos[0].machine_status = cached.machine_status;
        machine.machinePhotos[0].machine_status_comment = cached.machine_status_comment;
      } else {
        machine.machinePhotos.machine_status = cached.machine_status;
        machine.machinePhotos.machine_status_comment = cached.machine_status_comment;
      }
      this.cdr.detectChanges();
      return of(cached);
    }

    // Check if machine already has analysis results
    if (machinePhoto.machine_status !== undefined) {
      console.log(`✅ Machine ${fileId} already analyzed, current status:`, machinePhoto.machine_status);
      return of(null);
    }

    const lat = this.getCompanyProfile?.registered_lat;
    const lng = this.getCompanyProfile?.registered_lng;

    console.log(`🌍 Coordinates: lat=${lat}, lng=${lng}`);
    console.log(`🚀 Starting API call for machine image: ${fileId}`);

    const apiUrl = `/api/method/wefab.wefab.api.supplier.onboarding.machine_image_verification.machine_identification.analyze_machine_image?file_id=${fileId}&facility_lat=${lat}&facility_lon=${lng}`;
    console.log('📡 API URL:', apiUrl);

    return this.commonservice.getData(apiUrl).pipe(
      tap((res: any) => {
        console.log('📥 Raw API response:', res);
        
        if (res?.data) {
          const { machine_image, within_facility, verification_comment } = res.data;
          console.log("🔍 Machine Verification Result:");
          console.log("  - machine_image:", machine_image);
          console.log("  - within_facility:", within_facility);
          console.log("  - verification_comment:", verification_comment);
          
          const analysisResult = {
            machine_status: machine_image && within_facility,
            machine_status_comment: verification_comment
          };
          
          console.log("📋 Final analysisResult:", analysisResult);
          
          // Apply results to the correct structure and trigger change detection
          if (Array.isArray(machine.machinePhotos)) {
            console.log('📝 Applying to array structure');
            machine.machinePhotos[0].machine_status = analysisResult.machine_status;
            machine.machinePhotos[0].machine_status_comment = analysisResult.machine_status_comment;
            console.log('✅ Updated array machine:', machine.machinePhotos[0]);
          } else {
            console.log('📝 Applying to object structure');
            machine.machinePhotos.machine_status = analysisResult.machine_status;
            machine.machinePhotos.machine_status_comment = analysisResult.machine_status_comment;
            console.log('✅ Updated object machine:', machine.machinePhotos);
          }

          console.log("🔄 Updated Machine Object:", machine);
          console.log(`✅ Machine analysis completed for ${fileId}`);
          
          // Cache the results for future use
          this.setCache(cacheKey, analysisResult);
          
          // Trigger change detection immediately after setting the properties
          console.log('🔄 Triggering change detection...');
          this.cdr.detectChanges();
          console.log('✅ Change detection triggered');
        } else {
          console.log('❌ No data in API response');
        }
      }),
      catchError(error => {
        console.error('💥 Error analyzing machine:', error);
        const errorResult = {
          machine_status: false,
          machine_status_comment: 'Error during verification'
        };
        
        console.log('📝 Applying error result:', errorResult);
        
        // Apply error results to the correct structure
        if (Array.isArray(machine.machinePhotos)) {
          machine.machinePhotos[0].machine_status = errorResult.machine_status;
          machine.machinePhotos[0].machine_status_comment = errorResult.machine_status_comment;
        } else {
          machine.machinePhotos.machine_status = errorResult.machine_status;
          machine.machinePhotos.machine_status_comment = errorResult.machine_status_comment;
        }
        
        // Cache the error result to avoid retrying immediately
        this.setCache(cacheKey, errorResult);
        
        // Trigger change detection for error case too
        console.log('🔄 Triggering change detection for error...');
        this.cdr.detectChanges();
        
        return of(null);
      })
    );
  }

  private analyzeFacility(facility: any): Observable<any> {
    if (!facility?.fileId) return of(null);

    // Check cache first
    const cacheKey = `facility_analysis_${facility.fileId}`;
    const cached = this.getFromCache<FacilityAnalysisResult>(cacheKey);
    
    if (cached) {
      console.log(`Using cached analysis for facility ${facility.fileId}`);
      facility.facility_status = cached.facility_status;
      facility.facility_comment = cached.facility_comment;
      return of(cached);
    }

    // Check if facility already has analysis results
    if (facility.facility_status !== undefined) {
      console.log(`Facility ${facility.fileId} already analyzed, skipping API call`);
      return of(null);
    }

    const lat = this.getCompanyProfile?.registered_lat;
    const lng = this.getCompanyProfile?.registered_lng;

    console.log(`Analyzing facility: ${facility.fileId}`);

    return this.commonservice.getData(
      `/api/method/wefab.wefab.api.supplier.onboarding.machine_image_verification.machine_identification.factory_geolocation_verification?file_id=${facility.fileId}&registered_address_lat=${lat}&registered_address_lon=${lng}`
    ).pipe(
      tap((res: any) => {
        if (res?.data) {
          const analysisResult: FacilityAnalysisResult = {
            facility_status: res.data.verification_status,
            facility_comment: res.data.verification_comment
          };
          
          // Apply results to facility
          facility.facility_status = analysisResult.facility_status;
          facility.facility_comment = analysisResult.facility_comment;
          
          // Cache the results for future use
          this.setCache(cacheKey, analysisResult);
          
          console.log(`Facility analysis completed for ${facility.fileId}:`, analysisResult);
        }
      }),
      catchError(error => {
        console.error('Error verifying facility:', error);
        const errorResult: FacilityAnalysisResult = {
          facility_status: false,
          facility_comment: 'Error during verification'
        };
        
        facility.facility_status = errorResult.facility_status;
        facility.facility_comment = errorResult.facility_comment;
        
        // Cache the error result to avoid retrying immediately
        this.setCache(cacheKey, errorResult);
        
        return of(null);
      })
    );
  }

  private updateFacilityVerificationStatus(): void {
    if (!this.manufacturingData?.facilityPhotos?.length) {
      this.facilityVerified = false;
      return;
    }

    this.facilityVerified = this.manufacturingData.facilityPhotos.some(
      (facility: any) => facility.facility_status
    );
  }

  private updateMainStatus(): void {
    if (this.getCurrentL3DataStatus && this.getCurrentL3DataStatus !== 'Pending') {
      this.mainCurrentDataStatusTrack = this.getCurrentL3DataStatus;
    } else if (this.getCurrentL2DataStatus && this.getCurrentL2DataStatus !== 'Pending') {
      this.mainCurrentDataStatusTrack = this.getCurrentL2DataStatus;
    } else if (this.getCurrentL1DataStatus && this.getCurrentL1DataStatus !== 'Pending') {
      this.mainCurrentDataStatusTrack = this.getCurrentL1DataStatus;
    } else {
      this.mainCurrentDataStatusTrack = 'Pending';
    }
  }

  // Optimized tab change methods with lazy loading
  changeLevelTab(tab: string): void {
    if (this.activeLevelTab === tab) return;

    this.activeLevelTab = tab;

    if(this.activeLevelTab === 'manufacturing'){
      this.changeManufacturingTab('machines');
    }
    
    // Update URL without navigation
    this.updateUrl({ tab });

    // Load data for the new tab if not already loaded
    this.loadDataForActiveTab();

    this.cdr.detectChanges();
  }

  // New method to trigger machine analysis when Manufacturing tab is selected
  private triggerMachineAnalysisForManufacturingTab(): void {
    console.log('🔄 triggerMachineAnalysisForManufacturingTab called');
    console.log('📋 Current state check:');
    console.log('  - manufacturingData exists:', !!this.manufacturingData);
    console.log('  - hasLoadedMachineAnalysis:', this.hasLoadedMachineAnalysis);
    console.log('  - hasLoadedFacilityAnalysis:', this.hasLoadedFacilityAnalysis);
    console.log('  - activeLevelTab:', this.activeLevelTab);
    console.log('  - manufacturingTab:', this.manufacturingTab);
    
    if (!this.manufacturingData) {
      console.log('⚠️ Manufacturing data not yet loaded, cannot trigger analysis');
      return;
    }

    console.log('📊 Manufacturing data available:', this.manufacturingData);
    console.log('🏭 Machines count:', this.manufacturingData?.machines?.length || 0);
    console.log('🏭 Facilities count:', this.manufacturingData?.facilityPhotos?.length || 0);
    
    // Trigger machine analysis if there are machines and not already loaded
    if (!this.hasLoadedMachineAnalysis && this.manufacturingData?.machines?.length) {
      console.log('🚀 Starting machine analysis automatically...');
      this.hasLoadedMachineAnalysis = true;
      
      // Add extra debugging for machine analysis
      console.log('🔍 About to call processMachineVerificationAsync...');
      this.processMachineVerificationAsync();
    } else {
      if (this.hasLoadedMachineAnalysis) {
        console.log('⏭️ Machine analysis already loaded');
      } else {
        console.log('⏭️ No machines available for analysis');
      }
    }
    
    // Trigger facility analysis if there are facilities and not already loaded
    if (!this.hasLoadedFacilityAnalysis && this.manufacturingData?.facilityPhotos?.length) {
      console.log('🏭 Starting facility analysis automatically...');
      this.hasLoadedFacilityAnalysis = true;
      this.processFacilityVerificationAsync();
    } else {
      if (this.hasLoadedFacilityAnalysis) {
        console.log('⏭️ Facility analysis already loaded');
      } else {
        console.log('⏭️ No facilities available for analysis');
      }
    }

    // If both analyses are already done, log that
    if (this.hasLoadedMachineAnalysis && this.hasLoadedFacilityAnalysis) {
      console.log('✅ Machine and facility analyses already completed');
    }
  }

  changeManufacturingTab(tab: string): void {
    this.manufacturingTab = tab;
    this.updateUrl({ tab: this.activeLevelTab, mtab: tab });

    // Keep the existing logic for individual tab triggers
    // This handles when user specifically clicks on machine/facility tabs
    if (tab === 'machines' && !this.hasLoadedMachineAnalysis && this.manufacturingData?.machines?.length) {
      this.loadMachineAnalysis();
    } else if (tab === 'facility' && !this.hasLoadedFacilityAnalysis && this.manufacturingData?.facilityPhotos?.length) {
      this.loadFacilityAnalysis();
    }
  }

  // New method to load machine analysis only when needed
  private loadMachineAnalysis(): void {
    if (this.hasLoadedMachineAnalysis || this.loadingState.machineAnalysis) return;
    
    console.log('🔍 Loading machine analysis on demand...');
    this.hasLoadedMachineAnalysis = true;
    this.processMachineVerificationAsync();
  }

  // New method to load facility analysis only when needed
  private loadFacilityAnalysis(): void {
    if (this.hasLoadedFacilityAnalysis || this.loadingState.facilityAnalysis) return;
    
    console.log('🏭 Loading facility analysis on demand...');
    this.hasLoadedFacilityAnalysis = true;
    this.processFacilityVerificationAsync();
  }

  // Separate method for facility verification
  private processFacilityVerificationAsync(): void {
    if (!this.manufacturingData?.facilityPhotos?.length) {
      console.log('❌ No facility photos to analyze');
      return;
    }

    if (this.loadingState.facilityAnalysis) {
      console.log('⏳ Facility analysis already in progress');
      return;
    }

    const facilityRequests: Observable<any>[] = [];
    
    const facilitiesToAnalyze = this.manufacturingData.facilityPhotos.filter((facility: any) => {
      if (!facility?.fileId) return false;
      
      const cacheKey = `facility_analysis_${facility.fileId}`;
      const cached = this.getFromCache<FacilityAnalysisResult>(cacheKey);
      
      if (cached) {
        facility.facility_status = cached.facility_status;
        facility.facility_comment = cached.facility_comment;
        return false;
      }
      
      return facility.facility_status === undefined;
    });

    if (facilitiesToAnalyze.length === 0) {
      console.log('✅ All facilities already analyzed');
      this.updateFacilityVerificationStatus();
      return;
    }

    this.loadingState.facilityAnalysis = true;
    facilityRequests.push(...facilitiesToAnalyze.map((facility: any) => this.analyzeFacility(facility)));

    forkJoin(facilityRequests).pipe(
      catchError(error => {
        console.error('💥 Error during facility analysis:', error);
        return of([]);
      }),
      finalize(() => {
        this.loadingState.facilityAnalysis = false;
        this.updateFacilityVerificationStatus();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (results) => {
        console.log(`✅ Facility analysis completed. Processed ${results.length} facilities.`);
      }
    });
  }

  private updateUrl(params: { [key: string]: string }): void {
    if (!this.isBrowser) return;

    try {
      const url = new URL(window.location.href);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.error('Error updating URL:', error);
    }
  }

  // Utility methods
  formatProcessName(process: string): string {
    return process.replace(/([A-Z])/g, ' $1').trim();
  }

  // Method to mask account number for security
  maskAccountNumber(accountNumber: string): string {
    if (!accountNumber) return 'Not provided';
    
    // Show only last 4 digits, mask the rest
    if (accountNumber.length <= 4) {
      return '*'.repeat(accountNumber.length);
    }
    
    const lastFour = accountNumber.slice(-4);
    const maskedPart = '*'.repeat(accountNumber.length - 4);
    return maskedPart + lastFour;
  }

  // Method to format currency in Indian format with comma separation
  formatCurrency(value: string | number): string {
    if (!value || value === 'Not provided' || value === '') return 'Not provided';
    
    // Convert to string and remove any existing formatting
    let numericValue = value.toString().replace(/[^\d.]/g, '');
    
    // Convert to number
    const number = parseFloat(numericValue);
    if (isNaN(number)) return 'Not provided';
    
    // Format with Indian locale (en-IN) for comma separation
    const formatted = number.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return formatted;
  }

  // Alternative method for simple number formatting without currency symbol
  formatNumber(value: string | number): string {
    if (!value || value === 'Not provided' || value === '') return 'Not provided';
    
    // Convert to string and remove any existing formatting
    let numericValue = value.toString().replace(/[^\d.]/g, '');
    
    // Convert to number
    const number = parseFloat(numericValue);
    if (isNaN(number)) return 'Not provided';
    
    // Format with Indian locale (en-IN) for comma separation
    return number.toLocaleString('en-IN');
  }

  isImageFile(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
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
    return url.split('/').pop()?.split('?')[0] || 'Document';
  }

  getDocumentType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    return extension || 'file';
  }

  // Navigation methods
  navigateToEdit(): void {
    const routes = {
      basic: '/wefab/supplier/supplier-onboarding',
      manufacturing: '/wefab/supplier/supplier-onboarding-l2',
      financial: '/wefab/supplier/supplier-onboarding-l3'
    };

    const route = routes[this.activeLevelTab as keyof typeof routes] || routes.basic;
    this.router.navigate([route], { queryParams: { mode: 'edit' } });
  }

  goBack(): void {
    this.location.back();
  }

  // Document preview methods
  viewDocument(url: string, event: Event): void {
    event.stopPropagation();
    this.previewDocument = url;
  }

  closeDocumentPreview(): void {
    this.previewDocument = null;
  }

  downloadDocument(url: string, event: Event): void {
    event.stopPropagation();
    
    if (this.isBrowser) {
      const link = document.createElement('a');
      link.href = url;
      link.download = this.getDocumentName(url);
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Activity trail methods
  toggleActivityTrail(): void {
    this.showActivityTrail = !this.showActivityTrail;
    
    if (this.showActivityTrail) {
      this.loadActivityTrail();
    }
  }

  private loadActivityTrail(): void {
    if (!this.supplierId) {
      console.error('Supplier ID is missing for activity trail');
      return;
    }

    // Set loading state
    this.activityTrailLoading = true;

    // Load real activity trail data from API
    const endpoint = `/api/method/wefab.wefab.api.common.engine.trail.activity.get_new_versions_trail?doctype=Supplier Onboarding L1&docname=${this.supplierId}`;
    
    this.commonservice.getData(endpoint).subscribe({
      next: (response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          // Store raw data - let ActivityTrailComponent handle processing
          this.activityTrail = response.data;
        } else {
          console.log('No activity logs found');
          this.activityTrail = [];
        }
        this.activityTrailLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading activity trail:', error);
        this.activityTrail = [];
        this.activityTrailLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Remove the old processing methods since ActivityTrailComponent handles this
  private getDemoActivityLogs(): ActivityLogData[] {
    // Remove demo data - this method is no longer used
    return [];
  }

  // TrackBy function for activity trail
  trackByActivityId(index: number, activity: ActivityLogData): string {
    return activity.name.toString();
  }

  // Approval methods
  approve(level: string): void {
    ;
    console.log(level);
    this.sweetAlert.confirm(
      '',
      `Are you sure you want to approve this stage?`,
      'question',
      'Yes, Approve',
      'Cancel'
    ).then((result: any) => {
      if (result.isConfirmed) {
        this.processApproval(level);
      }
    });
  }

  private processApproval(level: string): void {
    let currentLevel = level === 'L1' ? 'Supplier Onboarding L1': level === 'L2' ? 'Supplier Onboarding L2' : 'Supplier Onboarding L3';
    const endpoint = `/api/resource/${currentLevel}/${this.supplierId}`
    const data = {
      onboarding_status: 'Approved'
    };

    this.commonservice.putData(endpoint, data).subscribe({
      next: (res) => {
        this.showSuccess(`Approved successfully`);
        this.refreshStatusData(level);
      },
      error: (error) => {
        console.error('Error approving:', error);
        this.showError('Failed to approve data');
      }
    });
  }

  reject(level: string): void {
    this.sweetAlert.confirm(
      '',
      `Are you sure you want to reject this stage?`,
      'question',
      'Yes, Reject',
      'Cancel'
    ).then((result: any) => {
      if (result.isConfirmed) {
        this.processRejection(level);
      }
    });
  }

  private processRejection(level: string): void {
    let currentLevel = level === 'L1' ? 'Supplier Onboarding L1': level === 'L2' ? 'Supplier Onboarding L2' : 'Supplier Onboarding L3';
    const endpoint = `/api/resource/${currentLevel}/${this.supplierId}`
    const data = {
      onboarding_status: 'Rejected'
    };

    this.commonservice.putData(endpoint, data).subscribe({
      next: (res) => {
        this.showSuccess('Rejected successfully');
        this.refreshStatusData(level);
      },
      error: (error) => {
        console.error('Error rejecting:', error);
        this.showError('Failed to reject data');
      }
    });
  }

  private refreshStatusData(level: string): void {
    // Clear both data and status caches
    this.clearSpecificCache(`Supplier Onboarding ${level}`);
    
    // Trigger Firebase and reload data
    this.accessFirebaseTrigger(`Supplier Onboarding ${level}`, this.supplierId);
  }

  // Update request methods
  showUpdateRequestDialog(level: string): void {
    this.updateRequestLevel = level;
    this.updateRequestComment = '';
    this.showUpdateDialog = true;
    this.closeAllDropdowns();
  }

  cancelUpdateRequest(): void {
    this.showUpdateDialog = false;
    this.updateRequestLevel = '';
    this.updateRequestComment = '';
  }

  sendUpdateRequest(): void {
    if (!this.updateRequestComment.trim()) return;

    let currentLevel = this.updateRequestLevel === 'L1' ? 'Supplier Onboarding L1': this.updateRequestLevel === 'L2' ? 'Supplier Onboarding L2' : 'Supplier Onboarding L3';

    const endpoint = `/api/resource/${currentLevel}/${this.supplierId}`
    const data = {
      onboarding_status: 'Request to Resubmit',
      comment: this.updateRequestComment
    };

    this.commonservice.putData(endpoint, data).subscribe({
      next: (res) => {
        this.showSuccess('Update request sent successfully');
        this.cancelUpdateRequest();
        this.refreshStatusData(this.updateRequestLevel);
      },
      error: (error) => {
        console.error('Error sending update request:', error);
        this.showError('Failed to send update request');
      }
    });
  }

  // Dropdown methods
  toggleDropdown(level: string, event: Event): void {
    event.stopPropagation();
    
    // Close all other dropdowns
    Object.keys(this.dropdownVisible).forEach(key => {
      this.dropdownVisible[key] = key === level ? !this.dropdownVisible[key] : false;
    });

    // Add click listener to close dropdown when clicking outside
    if (this.dropdownVisible[level]) {
      setTimeout(() => {
        document.addEventListener('click', this.closeAllDropdowns.bind(this), { once: true });
      });
    }
  }

  private closeAllDropdowns(): void {
    Object.keys(this.dropdownVisible).forEach(key => {
      this.dropdownVisible[key] = false;
    });
  }

  // Utility methods for error handling
  private showSuccess(message: string): void {
    this.sweetAlert.success(message);
  }

  private showError(message: string): void {
    this.sweetAlert.error(message);
  }

  accessFirebaseTrigger(doctType_name: string, doctypeId: string) {
    console.log(`🔥 Firebase trigger called for ${doctType_name}`);
    this.commonservice.commonFirebaseTrigger(doctType_name, doctypeId).subscribe({
      next: (res: any) => {
        console.log(`✅ Firebase trigger completed for ${doctType_name}`);
        // Only clear specific cache entries, not entire cache
        this.clearSpecificCache(doctType_name);
        // Reload only the specific data that changed
        this.reloadSpecificData(doctType_name);
      },
      error: (error) => {
        console.error(`❌ Firebase trigger failed for ${doctType_name}:`, error);
      }
    });
  }

  private clearSpecificCache(docType: string): void {
    const level = docType.includes('L1') ? 'l1' : docType.includes('L2') ? 'l2' : 'l3';
    const dataKey = `${level}_data_${this.supplierId}`;
    const statusKey = `${level}_status_${this.supplierId}`;
    const docSummaryKey = `doc_summary_${this.supplierId}`;
    
    // Clear both data and status caches
    this.cache.delete(dataKey);
    this.cache.delete(statusKey);
    
    // Clear document summary cache when any level data changes
    // This ensures document counts are recalculated on next load
    this.cache.delete(docSummaryKey);
    
    console.log(`🗑️ Cleared cache for ${level} data, status, and document summary`);
  }

  private reloadSpecificData(docType: string): void {
    if (docType.includes('L1')) {
      this.reloadL1DataAndStatus();
    } else if (docType.includes('L2')) {
      this.reloadL2Status();
    } else if (docType.includes('L3')) {
      this.reloadL3Status();
    }
  }

  // New method to reload L1 data and recalculate completeness
  private reloadL1DataAndStatus(): void {
    this.subscription.add(
      forkJoin([
        this.getL1DataObservable(this.supplierId),
        this.getDocumentSummaryObservable(this.supplierId) // Reload document summary too
      ]).subscribe({
        next: ([l1Data, docSummary]) => {
          this.processL1Data(l1Data);
          this.processDocumentSummary(docSummary); // Update document counts
          // Recalculate completeness since L1 status changed
          this.calculateProfileCompleteness();
          console.log('🔄 L1 data and document summary reloaded');

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error reloading L1 data:', error);
        }
      })
    );
  }

  // New method to reload only L2 status and recalculate completeness
  private reloadL2Status(): void {
    this.subscription.add(
      forkJoin([
        this.getL2StatusObservable(this.supplierId),
        this.getDocumentSummaryObservable(this.supplierId) // Reload document summary too
      ]).subscribe({
        next: ([l2Status, docSummary]) => {
          this.getCurrentL2DataStatus = l2Status?.approval_status;
          this.processDocumentSummary(docSummary); // Update document counts
          // Recalculate completeness since L2 status changed
          this.calculateProfileCompleteness();
          
          // If manufacturing data is currently loaded and displayed, reload it too
          if (this.manufacturingData && this.activeLevelTab === 'manufacturing') {
            this.loadManufacturingData();
          }
          console.log('🔄 L2 status and document summary reloaded');

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error reloading L2 status:', error);
        }
      })
    );
  }

  // New method to reload only L3 status and recalculate completeness
  private reloadL3Status(): void {
    this.subscription.add(
      this.getL3StatusObservable(this.supplierId).subscribe({
        next: (l3Status) => {
          this.getCurrentL3DataStatus = l3Status?.approval_status;
          // Recalculate completeness since L3 status changed
          this.calculateProfileCompleteness();
          
          // If financial data is currently loaded and displayed, reload it too
          if (this.newFinancialData && this.activeLevelTab === 'financial') {
            this.loadFinancialData();
          }

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error reloading L3 status:', error);
        }
      })
    );
  }

  // Modified method - remove auto-triggering and cache bypass
  forceAnalyzeAllMachines(): void {
    console.log('🔄 === MANUAL FORCE ANALYZE TRIGGERED ===');
    
    if (!this.manufacturingData) {
      console.log('❌ No manufacturing data available');
      return;
    }

    // Only clear cache and reset status if user specifically requests it
    // This method should only be called on user action, not automatically
    
    let hasItems = false;

    // Process machines
    if (this.manufacturingData.machines?.length) {
      hasItems = true;
      this.manufacturingData.machines.forEach((machine: any) => {
        const fileId = machine.machinePhotos?.fileId || machine.machinePhotos?.[0]?.file_id;
        if (fileId) {
          const cacheKey = `machine_analysis_${fileId}`;
          this.cache.delete(cacheKey);
        }
        
        // Clear existing status to force new analysis
        if (Array.isArray(machine.machinePhotos)) {
          delete machine.machinePhotos[0].machine_status;
          delete machine.machinePhotos[0].machine_status_comment;
        } else {
          delete machine.machinePhotos.machine_status;
          delete machine.machinePhotos.machine_status_comment;
        }
      });
    }

    // Process facility photos
    if (this.manufacturingData.facilityPhotos?.length) {
      hasItems = true;
      this.manufacturingData.facilityPhotos.forEach((facility: any) => {
        if (facility.fileId) {
          const cacheKey = `facility_analysis_${facility.fileId}`;
          this.cache.delete(cacheKey);
        }
        
        delete facility.facility_status;
        delete facility.facility_comment;
      });
    }

    if (!hasItems) {
      console.log('❌ No machines or facilities to analyze');
      return;
    }

    // Reset flags to allow re-analysis
    this.hasLoadedMachineAnalysis = false;
    this.hasLoadedFacilityAnalysis = false;

    // Force new analysis
    this.processMachineVerificationAsync();
    this.processFacilityVerificationAsync();
  }

  // Getter methods for template
  get isLoading(): boolean {
    return Object.values(this.loadingState).some(loading => loading);
  }

  get dataLoading(): boolean {
    return this.activityTrailLoading || this.dataLoadingSubject.value;
  }

  get hasBasicData(): boolean {
    return !!this.getCompanyProfile;
  }

  get hasManufacturingData(): boolean {
    return !!this.manufacturingData;
  }

  get hasFinancialData(): boolean {
    return !!this.newFinancialData;
  }

  // Check if all three stages are approved
  get areAllStagesApproved(): boolean {
    return this.getCurrentL1DataStatus === 'Approved' && 
           this.getCurrentL2DataStatus === 'Approved' && 
           this.getCurrentL3DataStatus === 'Approved';
  }

  hasValidCertifications(): boolean {
    return this.manufacturingData?.certifications && 
           this.manufacturingData.certifications.length > 0 && 
           this.manufacturingData.certifications.every((cert: any) => cert && Object.keys(cert).length > 0);
  }

  // Helper methods for template to safely access machine properties
  getMachineStatus(machinePhotos: any): boolean {
    if (Array.isArray(machinePhotos)) {
      return machinePhotos[0]?.machine_status || false;
    }
    return machinePhotos?.machine_status || false;
  }

  getMachineComment(machinePhotos: any): string {
    if (Array.isArray(machinePhotos)) {
      return machinePhotos[0]?.machine_status_comment || '';
    }
    return machinePhotos?.machine_status_comment || '';
  }

  getMachineUrl(machinePhotos: any): string {
    if (Array.isArray(machinePhotos)) {
      return machinePhotos[0]?.url || '';
    }
    return machinePhotos?.url || '';
  }

  // Navigate to dashboard when all stages are approved
  goToDashboard(): void {
    localStorage.setItem('show_supplier_dashboard', 'true');
    localStorage.setItem('supplier_onboarding_complete', 'true');
    this.router.navigate(['/wefab/supplier/dashboard']);
  }

  // New method to get only L2 status (lightweight)
  private getL2StatusObservable(supplierId: string): Observable<any> {
    const cacheKey = `l2_status_${supplierId}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return of(cached);
    }

    return this.commonservice.getData(
      `/api/method/wefab.wefab.api.supplier.onboarding.onboarding.get_onboarding_stage_status?onboarding_stage=L2&supplier_company_id=${supplierId}`
    ).pipe(
      map((statusRes: any) => statusRes?.data || null),
      tap(result => this.setCache(cacheKey, result)),
      catchError(error => {
        console.error('Error fetching L2 status:', error);
        return of(null);
      })
    );
  }

  // New method to get only L3 status (lightweight)
  private getL3StatusObservable(supplierId: string): Observable<any> {
    const cacheKey = `l3_status_${supplierId}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return of(cached);
    }

    return this.commonservice.getData(
      `/api/method/wefab.wefab.api.supplier.onboarding.onboarding.get_onboarding_stage_status?onboarding_stage=L3&supplier_company_id=${supplierId}`
    ).pipe(
      map((statusRes: any) => statusRes?.data || null),
      tap(result => this.setCache(cacheKey, result)),
      catchError(error => {
        console.error('Error fetching L3 status:', error);
        return of(null);
      })
    );
  }

  // New method to get document summary without loading full data
  private getDocumentSummaryObservable(supplierId: string): Observable<any> {
    const cacheKey = `doc_summary_${supplierId}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return of(cached);
    }

    // Use lightweight API calls to get document counts
    const summaryRequests = [
      // Get L1 data for company documents count (we need this data anyway)
      this.commonservice.getData(`/api/resource/Supplier Onboarding L1/${supplierId}`).pipe(
        map((res: any) => {
          try {
            const profile = JSON.parse(res?.data?.company_profile || '{}');
            return {
              companyDocuments: profile?.companyDocuments?.length || 0
            };
          } catch {
            return { companyDocuments: 0 };
          }
        }),
        catchError(() => of({ companyDocuments: 0 }))
      ),
      
      // Get L2 data summary for manufacturing counts
      this.commonservice.getData(`/api/resource/Supplier Onboarding L2/${supplierId}`).pipe(
        map((res: any) => {
          try {
            const profile = JSON.parse(res?.data?.company_profile || '{}');
            return {
              machinePhotos: profile?.machines?.length || 0,
              facilityPhotos: profile?.facilityPhotos?.length || 0,
              certifications: profile?.certifications?.length || 0
            };
          } catch {
            return { machinePhotos: 0, facilityPhotos: 0, certifications: 0 };
          }
        }),
        catchError(() => of({ machinePhotos: 0, facilityPhotos: 0, certifications: 0 }))
      )
    ];

    return forkJoin(summaryRequests).pipe(
      map(([l1Summary, l2Summary]) => ({
        ...l1Summary,
        ...l2Summary
      })),
      tap(result => this.setCache(cacheKey, result)),
      catchError(error => {
        console.error('Error fetching document summary:', error);
        return of({ companyDocuments: 0, machinePhotos: 0, facilityPhotos: 0, certifications: 0 });
      })
    );
  }

  // New method to process document summary
  private processDocumentSummary(summary: any): void {
    console.log('📊 Processing document summary in one shot:', summary);
    
    // Set all document counts at once
    this.numberOfCompanyDocuments = summary?.companyDocuments || 0;
    this.numberOfMachinePhoto = summary?.machinePhotos || 0;
    this.numberOfFacilityPhoto = summary?.facilityPhotos || 0;
    this.numberOfCertificationPhoto = summary?.certifications || 0;
    
    // Update the documentSummary object for consistency
    this.documentSummary = {
      companyDocuments: this.numberOfCompanyDocuments,
      machinePhotos: this.numberOfMachinePhoto,
      facilityPhotos: this.numberOfFacilityPhoto,
      certifications: this.numberOfCertificationPhoto
    };
    
    console.log('✅ Document summary calculated:', {
      companyDocuments: this.numberOfCompanyDocuments,
      machinePhotos: this.numberOfMachinePhoto,
      facilityPhotos: this.numberOfFacilityPhoto,
      certifications: this.numberOfCertificationPhoto
    });
  }
}