import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { CommonService } from '../../shared/common.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SweetAlertService } from '../../shared/sweet-alert.service'
import e from 'express';
import { forkJoin, of, BehaviorSubject, Observable } from 'rxjs';
import { map, tap, catchError, finalize, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ActivityTrailComponent, ActivityLogData } from '../../../common-core-component/activity-trail';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

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
    DateFormatPipe
  ],
  providers: [MessageService],
  templateUrl: './supplier-profile-review.component.html',
  styleUrls: ['./supplier-profile-review.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupplierProfileReviewComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private cache = new Map<string, CacheEntry<any>>();
  private readonly CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
  
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

  constructor(
    private router: Router,
    private messageService: MessageService,
    private commonservice: CommonService,
    private sanitizer: DomSanitizer,
    private sweetAlert: SweetAlertService,
    private location: Location,
    private cdr: ChangeDetectorRef,
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

    // Load initial data in parallel
    this.loadInitialData();

    // firebase trigger
    this.accessFirebaseTrigger('wfb_supplier_onboarding_L1', this.supplierId)
    this.accessFirebaseTrigger('wfb_supplier_onboarding_L2', this.supplierId)
    this.accessFirebaseTrigger('wfb_supplier_onboarding_L3', this.supplierId)
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

  private loadInitialData(): void {
    if (!this.supplierId) {
      this.showError('Supplier ID is missing');
      this.dataLoadingSubject.next(false);
      return;
    }

    // Load all data in parallel for profile completeness calculation
    const allRequests = [
      this.getVerificationStatusObservable(this.supplierId),
      this.getL1DataObservable(this.supplierId),
      this.getL2DataObservable(this.supplierId),
      this.getL3DataObservable(this.supplierId)
    ];

    this.subscription.add(
      forkJoin(allRequests).pipe(
        finalize(() => {
          this.dataLoadingSubject.next(false);
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: ([verificationData, l1Data, l2Data, l3Data]) => {
          // Process all data
          this.verificationStatus = verificationData;
          this.processL1Data(l1Data);
          this.processL2Data(l2Data);
          this.processL3Data(l3Data);
          
          // Calculate profile completeness once with all data
          this.calculateProfileCompleteness();
        },
        error: (error) => {
          console.error('Error loading initial data:', error);
          this.showError('Failed to load profile data');
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
      this.commonservice.getData(`/api/resource/wfb_supplier_onboarding_L2/${supplierId}`),
      this.commonservice.getData(`/api/method/proq_buyer.wefab.api.supplier.onboarding.get_onboarding_stage_status?onboarding_stage=L2&supplier_company_id=${supplierId}`)
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
      this.commonservice.getData(`/api/resource/wfb_supplier_onboarding_L3/${supplierId}`),
      this.commonservice.getData(`/api/method/proq_buyer.wefab.api.supplier.onboarding.get_onboarding_stage_status?onboarding_stage=L3&supplier_company_id=${supplierId}`)
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
    
    // Calculate based on current approval status for all levels
    // For Stage 1: Basic Information
    if (this.getCurrentL1DataStatus) {
      if (this.getCurrentL1DataStatus === 'Approved' || 
          this.getCurrentL1DataStatus === 'Under Review' || 
          this.getCurrentL1DataStatus === 'Request to Resubmit') {
        this.completionStatus.basicInformation = 100;
      } else if (this.getCurrentL1DataStatus === 'Rejected') {
        this.completionStatus.basicInformation = 50; // Set to 50% if rejected
      }
    }
    
    // For Stage 2: Manufacturing Capabilities
    if (this.getCurrentL2DataStatus) {
      if (this.getCurrentL2DataStatus === 'Approved' || 
          this.getCurrentL2DataStatus === 'Under Review' || 
          this.getCurrentL2DataStatus === 'Request to Resubmit') {
        this.completionStatus.manufacturingCapabilities = 100;
      } else if (this.getCurrentL2DataStatus === 'Rejected') {
        this.completionStatus.manufacturingCapabilities = 50; // Set to 50% if rejected
      }
    }
    
    // For Stage 3: Financial & Additional
    if (this.getCurrentL3DataStatus) {
      if (this.getCurrentL3DataStatus === 'Approved' || 
          this.getCurrentL3DataStatus === 'Under Review' || 
          this.getCurrentL3DataStatus === 'Request to Resubmit') {
        this.completionStatus.financialAdditional = 100;
      } else if (this.getCurrentL3DataStatus === 'Rejected') {
        this.completionStatus.financialAdditional = 50; // Set to 50% if rejected
      }
    }

    // Update main status after calculating completeness
    this.updateMainStatus();
    
    console.log('Profile completeness calculated:', this.completionStatus);
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
      `/api/method/proq_buyer.wefab.api.supplier.onboarding.get_onboarding_and_verification_status?supplier_company_id=${supplierId}`
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
      this.commonservice.getData(`/api/resource/wfb_supplier_onboarding_L1/${supplierId}`),
      this.commonservice.getData(`/api/method/proq_buyer.wefab.api.supplier.onboarding.get_onboarding_stage_status?onboarding_stage=L1&supplier_company_id=${supplierId}`)
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
    if (result.data) {
      try {
        this.getCompanyProfile = JSON.parse(result.data.company_profile);
        this.gstVerified = this.getCompanyProfile?.gstVerified || false;
        this.phoneVerified = this.getCompanyProfile?.phone_verified || false;
        this.requestToResubmitCommentL1 = result.data.comment || '';
        
        // Count documents
        this.numberOfCompanyDocuments = this.getCompanyProfile?.companyDocuments?.length || 0;
      } catch (error) {
        console.error('Error parsing L1 data:', error);
        this.getCompanyProfile = null;
      }
    }

    if (result.status) {
      this.getCurrentL1DataStatus = result.status.approval_status;
    }
  }

  private processL2Data(result: any): void {
    if (result.data) {
      try {
        this.manufacturingData = JSON.parse(result.data.company_profile);
        this.requestToResubmitCommentL2 = result.data.comment || '';
        
        // Count documents
        this.numberOfMachinePhoto = this.manufacturingData?.machines?.length || 0;
        this.numberOfFacilityPhoto = this.manufacturingData?.facilityPhotos?.length || 0;
        this.numberOfCertificationPhoto = this.manufacturingData?.certifications?.length || 0;

        // Process machine verification in background
        this.processMachineVerificationAsync();
      } catch (error) {
        console.error('Error parsing L2 data:', error);
        this.manufacturingData = null;
      }
    }

    if (result.status) {
      this.getCurrentL2DataStatus = result.status.approval_status;
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
    if (!this.manufacturingData?.machines?.length && !this.manufacturingData?.facilityPhotos?.length) return;

    // Check if machine analysis is already in progress
    if (this.loadingState.machineAnalysis || this.loadingState.facilityAnalysis) return;

    // Prepare machine analysis requests
    const machineRequests: Observable<any>[] = [];
    if (this.manufacturingData?.machines?.length) {
      const needsMachineAnalysis = this.manufacturingData.machines.some((machine: any) => {
        const fileId = machine.machinePhotos?.fileId || machine.machinePhotos?.[0]?.file_id;
        if (!fileId) return false;
        
        const cacheKey = `machine_analysis_${fileId}`;
        const cached = this.getFromCache<MachineAnalysisResult>(cacheKey);
        
        if (cached) {
          machine.machinePhotos.machine_status = cached.machine_status;
          machine.machinePhotos.machine_status_comment = cached.machine_status_comment;
          return false;
        }
        
        return machine.machinePhotos.machine_status === undefined;
      });

      if (needsMachineAnalysis) {
        const machinesToAnalyze = this.manufacturingData.machines.filter((machine: any) => {
          const fileId = machine.machinePhotos?.fileId || machine.machinePhotos?.[0]?.file_id;
          if (!fileId) return false;
          
          const cacheKey = `machine_analysis_${fileId}`;
          const cached = this.getFromCache<MachineAnalysisResult>(cacheKey);
          return !cached && machine.machinePhotos.machine_status === undefined;
        });

        machineRequests.push(...machinesToAnalyze.map((machine: any) => this.analyzeMachine(machine)));
      }
    }

    // Prepare facility analysis requests
    const facilityRequests: Observable<any>[] = [];
    if (this.manufacturingData?.facilityPhotos?.length) {
      const needsFacilityAnalysis = this.manufacturingData.facilityPhotos.some((facility: any) => {
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

      if (needsFacilityAnalysis) {
        const facilitiesToAnalyze = this.manufacturingData.facilityPhotos.filter((facility: any) => {
          if (!facility?.fileId) return false;
          
          const cacheKey = `facility_analysis_${facility.fileId}`;
          const cached = this.getFromCache<FacilityAnalysisResult>(cacheKey);
          return !cached && facility.facility_status === undefined;
        });

        facilityRequests.push(...facilitiesToAnalyze.map((facility: any) => this.analyzeFacility(facility)));
      }
    }

    // If no analysis is needed, return early
    if (machineRequests.length === 0 && facilityRequests.length === 0) {
      console.log('All machines and facilities already analyzed, skipping API calls');
      this.updateFacilityVerificationStatus();
      return;
    }

    // Set loading states
    if (machineRequests.length > 0) this.loadingState.machineAnalysis = true;
    if (facilityRequests.length > 0) this.loadingState.facilityAnalysis = true;

    // Combine all requests and execute in parallel
    const allRequests = [...machineRequests, ...facilityRequests];
    
    console.log(`Starting parallel analysis: ${machineRequests.length} machines and ${facilityRequests.length} facilities`);

    // Execute all requests in parallel
    forkJoin(allRequests.length > 0 ? allRequests : [of(null)]).pipe(
      catchError(error => {
        console.error('Error during parallel analysis:', error);
        return of([]);
      }),
      finalize(() => {
        this.loadingState.machineAnalysis = false;
        this.loadingState.facilityAnalysis = false;
        this.updateFacilityVerificationStatus();
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (results) => {
        console.log(`Parallel analysis completed. Processed ${results.length} items.`);
      },
      error: (error) => {
        console.error('Error in parallel analysis:', error);
      }
    });
  }

  private analyzeMachine(machine: any): Observable<any> {
    if (!machine?.machinePhotos) return of(null);

    const fileId = machine.machinePhotos.fileId || machine.machinePhotos[0]?.file_id;
    if (!fileId) return of(null);

    // Check cache first
    const cacheKey = `machine_analysis_${fileId}`;
    const cached = this.getFromCache<MachineAnalysisResult>(cacheKey);
    
    if (cached) {
      console.log(`Using cached analysis for machine ${fileId}`);
      machine.machinePhotos.machine_status = cached.machine_status;
      machine.machinePhotos.machine_status_comment = cached.machine_status_comment;
      return of(cached);
    }

    // Check if machine already has analysis results
    if (machine.machinePhotos.machine_status !== undefined) {
      console.log(`Machine ${fileId} already analyzed, skipping API call`);
      return of(null);
    }

    const lat = this.getCompanyProfile?.registered_lat;
    const lng = this.getCompanyProfile?.registered_lng;

    console.log(`Analyzing machine image: ${fileId}`);

    return this.commonservice.getData(
      `/api/method/proq_buyer.api.supplier_onboarding.machine_image_verification.machine_identification.analyze_machine_image?file_id=${fileId}&facility_lat=${lat}&facility_lon=${lng}`
    ).pipe(
      tap((res: any) => {
        if (res?.data) {
          const { machine_image, within_facility, verification_comment } = res.data;
          const analysisResult = {
            machine_status: machine_image && within_facility,
            machine_status_comment: verification_comment
          };
          
          // Apply results to machine
          machine.machinePhotos.machine_status = analysisResult.machine_status;
          machine.machinePhotos.machine_status_comment = analysisResult.machine_status_comment;
          
          // Cache the results for future use
          this.setCache(cacheKey, analysisResult);
          
          console.log(`Machine analysis completed for ${fileId}:`, analysisResult);
        }
      }),
      catchError(error => {
        console.error('Error analyzing machine:', error);
        const errorResult = {
          machine_status: false,
          machine_status_comment: 'Error during verification'
        };
        
        machine.machinePhotos.machine_status = errorResult.machine_status;
        machine.machinePhotos.machine_status_comment = errorResult.machine_status_comment;
        
        // Cache the error result to avoid retrying immediately
        this.setCache(cacheKey, errorResult);
        
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
      `/api/method/proq_buyer.api.supplier_onboarding.machine_image_verification.machine_identification.factory_geolocation_verification?file_id=${facility.fileId}&registered_address_lat=${lat}&registered_address_lon=${lng}`
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

  // Optimized tab change methods
  changeLevelTab(tab: string): void {
    if (this.activeLevelTab === tab) return;

    this.activeLevelTab = tab;
    
    // Update URL without navigation
    this.updateUrl({ tab });

    // All data is already loaded during initialization, no need to load again
    this.cdr.detectChanges();
  }

  changeManufacturingTab(tab: string): void {
    this.manufacturingTab = tab;
    this.updateUrl({ tab: this.activeLevelTab, mtab: tab });
  }

  changeFinancialTab(tab: string): void {
    this.financialTab = tab;
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
    const endpoint = `/api/method/proq_buyer.api.core.versioning.get_new_versions_trail?doctype=wfb_supplier_onboarding_L1&docname=SUP-000424`;
    
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
    let currentLevel = level === 'L1' ? 'wfb_supplier_onboarding_L1': level === 'L2' ? 'wfb_supplier_onboarding_L2' : 'wfb_supplier_onboarding_L3';
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
    let currentLevel = level === 'L1' ? 'wfb_supplier_onboarding_L1': level === 'L2' ? 'wfb_supplier_onboarding_L2' : 'wfb_supplier_onboarding_L3';
    const endpoint = `/api/resource/${currentLevel}/${this.supplierId}`
    const data = {
      onboarding_status: 'Rejected'
    };

    this.commonservice.putData(endpoint, data).subscribe({
      next: (res) => {
        this.showSuccess(`Rejected successfully`);
        this.refreshStatusData(level);
      },
      error: (error) => {
        console.error('Error rejecting:', error);
        this.showError('Failed to reject data');
      }
    });
  }

  private refreshStatusData(level: string): void {
    // Clear cache and reload status
    this.cache.delete(`${level.toLowerCase()}_data_${this.supplierId}`);
    
    // Reload all data and recalculate completeness when Firebase triggers update
    this.loadInitialData();
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

    let currentLevel = this.updateRequestLevel === 'L1' ? 'wfb_supplier_onboarding_L1': this.updateRequestLevel === 'L2' ? 'wfb_supplier_onboarding_L2' : 'wfb_supplier_onboarding_L3';

    const endpoint = `/api/resource/${currentLevel}/${this.supplierId}`
    const data = {
      onboarding_status: 'Request to Resubmit',
      comment: this.updateRequestComment
    };

    this.commonservice.postData(endpoint, data).subscribe({
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
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 3000
    });
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  }

  accessFirebaseTrigger(doctType_name: string, doctypeId: string) {
    this.commonservice.commonFirebaseTrigger(doctType_name, doctypeId).subscribe((res: any) => {
       // When Firebase triggers, clear cache and reload all data to recalculate completeness
      this.cache.clear();
      this.loadInitialData();
    });
  }

  // Method to clear analysis cache when machines/facilities are updated
  private clearAnalysisCache(): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((value, key) => {
      if (key.startsWith('machine_analysis_') || key.startsWith('facility_analysis_')) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      console.log(`Cleared analysis cache for: ${key}`);
    });
  }

  // Method to force refresh analysis (useful for testing or manual refresh)
  forceRefreshAnalysis(): void {
    console.log('Forcing refresh of machine and facility analysis');
    this.clearAnalysisCache();
    
    // Reset analysis status for all machines and facilities
    if (this.manufacturingData?.machines) {
      this.manufacturingData.machines.forEach((machine: any) => {
        if (machine.machinePhotos) {
          machine.machinePhotos.machine_status = undefined;
          machine.machinePhotos.machine_status_comment = undefined;
        }
      });
    }
    
    if (this.manufacturingData?.facilityPhotos) {
      this.manufacturingData.facilityPhotos.forEach((facility: any) => {
        facility.facility_status = undefined;
        facility.facility_comment = undefined;
      });
    }
    
    // Restart parallel analysis
    this.processMachineVerificationAsync();
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

  // Navigate to dashboard when all stages are approved
  goToDashboard(): void {
    sessionStorage.setItem('show_supplier_dashboard', 'true');
    sessionStorage.setItem('supplier_onboarding_complete', 'true');
    this.router.navigate(['/wefab/supplier/dashboard']);
  }
} 