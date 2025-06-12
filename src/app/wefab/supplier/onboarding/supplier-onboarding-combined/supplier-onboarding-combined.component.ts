import { Component, OnInit, ViewChild, TemplateRef, Inject, PLATFORM_ID, HostListener, Renderer2 } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { Router } from '@angular/router';
import { CommonService } from '../../../../shared/services/common.service';
import { ChangeDetectorRef } from '@angular/core';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { StepsModule } from 'primeng/steps';
import { MenuItem } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { SliderModule } from 'primeng/slider';
import { CheckboxModule } from 'primeng/checkbox';

import { SweetAlertService } from '../../../../shared/services/sweet-alert.service';

// Import Components
import { FileUploadComponent } from '../supplier-onboarding/file-upload.component';
import { MultiFileUploadComponent } from '../supplier-onboarding/multi-file-upload.component';
import { PhoneOtpVerificationComponent } from '../../../../shared/components/phone-otp-verification/phone-otp-verification.component';
import { PMultiSelectGroupComponent } from '../../../../shared/formly-components/p-multiSelect-group.component';
import { GstVerifyFieldComponent } from '../supplier-onboarding/gst-verify-field.component';
import { FormlyFieldGstVerifyComponent } from '../../../../shared/formly-components/gst-verify-type.component';
import { PanVerifyFieldComponent } from '../supplier-onboarding/pan-verify-field.component';
import { FormlyFieldPanVerifyComponent } from '../../../../shared/formly-components/pan-verify-type.component';
import { PDropdownGroupSearchComponent } from '../../../../shared/formly-components/p-dropdown-group-search.component';
import { FormlyFieldPDropdownGroupSearchComponent } from '../../../../shared/formly-components/p-dropdown-group-search-type.component';
import { BankVerifyFieldComponent } from '../supplier-onboarding-l3/bank-verify-field.component';
import { FormlyFieldBankVerifyComponent } from '../../../../shared/formly-components/bank-verify-type.component';
import { FormlyRepeatTypeComponent } from '../../../../shared/formly-components/formly-repeat-type.component';
import { FormlyFieldFileUploadComponent } from '../../../../shared/formly-components/file-upload-type.component';
import { FormlyFieldRangeSliderComponent } from '../../../../shared/formly-components/range-slider-type.component';
import { FormlyFieldDropdownComponent } from '../../../../shared/formly-components/dropdown-type.component';

// GST Validator function
export function gstValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  
  if (!value) {
    return null; // Let required validation handle empty values
  }
  
  const gstPattern = /^[0-9]{2}[A-Za-z0-9]{10}[A-Za-z0-9]{1}Z[A-Za-z0-9]{1}$/;
  
  return gstPattern.test(value) ? null : { 'gstFormat': true };
}

// PAN Validator function
export function panValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  
  if (!value) {
    return null; // Let required validation handle empty values
  }
  
  const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  
  return panPattern.test(value) ? null : { 'panFormat': true };
}

@Component({
  selector: 'app-supplier-onboarding-combined',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormlyModule,
    FormlyBootstrapModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TooltipModule,
    StepsModule,
    ToastModule,
    MultiSelectModule,
    DialogModule,
    InputNumberModule,
    CalendarModule,
    SliderModule,
    CheckboxModule,
    FileUploadComponent,
    MultiFileUploadComponent,
    PhoneOtpVerificationComponent,
    PMultiSelectGroupComponent,
    GstVerifyFieldComponent,
    FormlyFieldGstVerifyComponent,
    PanVerifyFieldComponent,
    FormlyFieldPanVerifyComponent,
    PDropdownGroupSearchComponent,
    FormlyFieldPDropdownGroupSearchComponent,
    FormlyRepeatTypeComponent,
    FormlyFieldFileUploadComponent,
    FormlyFieldRangeSliderComponent,
    FormlyFieldDropdownComponent,
    BankVerifyFieldComponent,
    FormlyFieldBankVerifyComponent
  ],
  providers: [MessageService],
  templateUrl: './supplier-onboarding-combined.component.html',
  styleUrl: './supplier-onboarding-combined.component.scss'
})
export class SupplierOnboardingCombinedComponent implements OnInit {
  form: FormGroup;
  model: any = {
    // L1 Data Structure
    gstinNumber: '',
    panNumber: '',
    noGst: false,
    company_name: '',
    primary_email_id: '',
    registeredAddress: null,
    country: '',
    state: '',
    city: '',
    primaryContactName: '',
    phoneNumber: '',
    primaryManufacturingProcess: [],
    websiteURL: '',
    linkedinURL: '',
    totalEmployees: '',
    foundedYear: '',
    companyDocuments: null,
    
    // L2 Data Structure
    machines: [{}],
    certifications: [{}],
    industries: [],
    productionCapacity: 0,
    facilityPhotos: null,
    
    // L3 Data Structure
    bankDetails: {
      bankName: 'State Bank of India',
      accountNumber: '1234567890123456',
      ifscCode: 'SBIN0001234',
      accountHolderName: 'Example Company Private Limited',
      accountType: 'Current',
      branchName: 'Commercial Street Branch'
    },
    companyFinancials: {
      annualRevenue2024: '',
      annualRevenue2023: '',
      annualRevenue2022: '',
      creditRatingProvider: 'CRISIL',
      taxCompliant: true,
      currency: 'USD'
    },
    insuranceCoverage: {
      generalLiabilityInsurance: '',
      productLiabilityInsurance: ''
    },
    additionalInformation: {
      references: [{
        companyName: '',
        contactName: '',
        email: ''
      }]
    }
  };
  
  // Step-specific data objects
  basicDetails = {};
  contactCapabilities = {};
  machineCapabilities = {};
  facilityVerification = {};
  financialInformation = {};
  additionalInformation = {};
  
  options: FormlyFormOptions = {};
  activeStepIndex = 0;
  totalSteps = 6;
  
  // Create arrays of field configurations for each step
  stepFields: FormlyFieldConfig[][] = [];
  
  isBrowser: boolean;
  isMobile: boolean = false;
  bankVerified = true;
  
  // L1 verification states
  phoneVerified = false;
  gstVerified = false;
  panVerified = false;
  
  // L1 data
  countryList: any = [];
  selectedCountry: any;
  selectedState: any;
  stateList: any = [];
  getCompanyProfile: any;
  stateFieldInitialized = false;
  hasExistingSupplier = false;
  companyName: any;
  
  // Step titles and descriptions
  stepInfo = [
    {
      title: 'Basic Details',
      description: 'Company information and verification details.'
    },
    {
      title: 'Contact & Capabilities',
      description: 'Contact details and manufacturing capabilities.'
    },
    {
      title: '',
      description: ''
    },
    {
      title: '',
      description: ''
    },
    {
      title: 'Financial Information',
      description: 'Share your financial details and banking information.'
    },
    {
      title: '',
      description: ''
    }
  ];
  
  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private renderer: Renderer2,
    private router: Router,
    private commonService: CommonService,
    private sweetAlert: SweetAlertService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({});
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    if (this.isBrowser) {
      this.isMobile = window.innerWidth < 768;
    }
  }

  ngOnInit(): void {
    this.checkScreenSize();
    
    // Load country list first, then initialize form
    this.getCountryListAndInitializeForm();
    
    // Check if supplier_id exists
    if (this.isBrowser) {
      const supplierId = localStorage.getItem('supplier_id');
      if (supplierId) {
        this.hasExistingSupplier = true;
        this.loadExistingData(supplierId);
      }
      this.patchEmailId();
    }
    
    // Set static bank verification data
    this.setStaticBankData();
  }

  // New method to load countries then initialize form
  getCountryListAndInitializeForm() {
    let endPoint = '/api/resource/Country?limit=300';
    this.commonService.getData(endPoint).subscribe((res: any) => {
      // Store country list
      this.countryList = res.data || [];
      
      console.log('Country list loaded:', this.countryList.length);
      
      // Initialize step fields - combining all L1, L2 and L3 steps
      this.stepFields = [
        this.getBasicDetailsFields(),              // Step 1: From L1
        this.getContactCapabilitiesFields(),       // Step 2: From L1
        this.getManufacturingCapabilitiesFields(), // Step 3: From L2
        this.getFacilityVerificationFields(),      // Step 4: From L2
        this.getFinancialInformationFields(),      // Step 5: From L3
        this.getAdditionalInformationFields()      // Step 6: From L3
      ];
    }, error => {
      console.error('Error loading country list:', error);
      // Initialize with empty country list if there's an error
      this.countryList = [];
      this.stepFields = [
        this.getBasicDetailsFields(),
        this.getContactCapabilitiesFields(),
        this.getManufacturingCapabilitiesFields(),
        this.getFacilityVerificationFields(),
        this.getFinancialInformationFields(),
        this.getAdditionalInformationFields()
      ];
    });
  }

  patchEmailId() {
    this.model.primary_email_id = localStorage.getItem('primary_email_id');
    
    setTimeout(() => {
      this.form.markAsPristine();
    }, 1000);
  }

  loadExistingData(supplierId: string) {
    // Load L1 data first
    this.commonService.getData(`/api/resource/Supplier Onboarding L1/${supplierId}`)
      .subscribe((l1Response: any) => {
        if (l1Response && l1Response.data && l1Response.data.company_profile) {
          const l1Data = JSON.parse(l1Response.data.company_profile);
          this.mergeL1Data(l1Data);
          this.phoneVerified = l1Data.phone_verified || false;
          this.gstVerified = l1Data.gstVerified || l1Response.data.gst_verified || false;
          this.panVerified = l1Data.panVerified || l1Response.data.pan_verified || false;
        }
        
        // Load L2 data
        this.commonService.getData(`/api/resource/Supplier Onboarding L2/${supplierId}`)
          .subscribe((l2Response: any) => {
            if (l2Response && l2Response.data && l2Response.data.company_profile) {
              const l2Data = JSON.parse(l2Response.data.company_profile);
              this.mergeL2Data(l2Data);
            }
            
            // Load L3 data
            this.commonService.getData(`/api/resource/Supplier Onboarding L3/${supplierId}`)
              .subscribe((l3Response: any) => {
                if (l3Response && l3Response.data && l3Response.data.company_profile) {
                  const l3Data = JSON.parse(l3Response.data.company_profile);
                  this.mergeL3Data(l3Data);
                  this.bankVerified = l3Data.bank_verified || false;
                }
                this.patchFormValues();
              }, (error) => {
                console.log('L3 data not found, continuing with L1 and L2 data');
                this.patchFormValues();
              });
          }, (error) => {
            console.log('L2 data not found, continuing with L1 data only');
            this.patchFormValues();
          });
      }, (error) => {
        console.log('L1 data not found, starting fresh');
      });
  }

  mergeL1Data(l1Data: any) {
    // Merge L1 specific fields
    Object.keys(l1Data).forEach(key => {
      if (key in this.model) {
        this.model[key] = l1Data[key];
      }
    });
    
    // Handle address data specially
    if (l1Data.registeredAddress) {
      this.model.registeredAddress = l1Data.registeredAddress;
    }
    if (l1Data.country) {
      this.selectedCountry = l1Data.country;
      this.model.country = l1Data.country;
    }
    if (l1Data.state) {
      this.selectedState = l1Data.state;
      this.model.state = l1Data.state;
    }
  }

  mergeL2Data(l2Data: any) {
    // Merge L2 specific fields
    if (l2Data.machines) this.model.machines = l2Data.machines;
    if (l2Data.certifications) this.model.certifications = l2Data.certifications;
    if (l2Data.industries) this.model.industries = l2Data.industries;
    if (l2Data.productionCapacity !== undefined) this.model.productionCapacity = l2Data.productionCapacity;
    if (l2Data.facilityPhotos) this.model.facilityPhotos = l2Data.facilityPhotos;
  }

  mergeL3Data(l3Data: any) {
    // Merge L3 specific fields
    if (l3Data.bankDetails) this.model.bankDetails = l3Data.bankDetails;
    if (l3Data.companyFinancials) this.model.companyFinancials = l3Data.companyFinancials;
    if (l3Data.insuranceCoverage) this.model.insuranceCoverage = l3Data.insuranceCoverage;
    if (l3Data.additionalInformation) this.model.additionalInformation = l3Data.additionalInformation;
  }

  patchFormValues() {
    // Process file uploads and format numbers as needed
    this.processFileUploads();
    this.formatCurrencyFields();
    
    // Handle address and states if country is selected
    if (this.selectedCountry) {
      this.getStates(this.selectedCountry);
    }
    
    setTimeout(() => {
      this.form.patchValue(this.model);
      this.form.markAsPristine();
      
      // Update verification statuses after form patch
      this.updateGstFieldVerificationStatus();
      this.updatePanFieldVerificationStatus();
    }, 1000);
  }

  processFileUploads() {
    // Process machine photos
    if (this.model.machines && Array.isArray(this.model.machines)) {
      this.model.machines.forEach((machine: any) => {
        if (machine.machinePhotos) {
          machine.machinePhotos = this.convertFilesToObjects(machine.machinePhotos);
        }
      });
    }

    // Process facility photos
    if (this.model.facilityPhotos) {
      this.model.facilityPhotos = this.convertFilesToObjects(this.model.facilityPhotos);
    }

    // Process certification documents
    if (this.model.certifications && Array.isArray(this.model.certifications)) {
      this.model.certifications.forEach((cert: any) => {
        if (cert.certificateDocument) {
          cert.certificateDocument = this.convertFilesToObjects(cert.certificateDocument);
        }
      });
    }
  }

  convertFilesToObjects(fileData: any): any {
    if (!fileData) return null;
    
    if (Array.isArray(fileData)) {
      return fileData.map(file => this.convertSingleFileToObject(file));
    } else {
      return [this.convertSingleFileToObject(fileData)];
    }
  }

  convertSingleFileToObject(fileData: any): any {
    if (typeof fileData === 'string') {
      return {
        name: this.getFileNameFromUrl(fileData),
        url: fileData,
        size: 0,
        type: this.getFileTypeFromUrl(fileData)
      };
    } else if (typeof fileData === 'object') {
      return {
        name: fileData.name || fileData.fileName || 'document',
        url: fileData.url || fileData.file_url || '',
        size: fileData.size || 0,
        type: fileData.type || fileData.fileType || 'application/octet-stream',
        fileId: fileData.fileId || fileData.file_id || ''
      };
    }
    return fileData;
  }

  getFileNameFromUrl(url: string): string {
    if (!url) return 'File';
    const urlParts = url.split('/');
    let fileName = urlParts[urlParts.length - 1];
    if (fileName.includes('?')) {
      fileName = fileName.split('?')[0];
    }
    try {
      return decodeURIComponent(fileName) || 'File';
    } catch (e) {
      return 'File';
    }
  }

  getFileTypeFromUrl(fileName: string): string {
    if (!fileName) return 'application/octet-stream';
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  }

  formatCurrencyFields() {
    // Format currency fields for display
    if (this.model.companyFinancials) {
      ['annualRevenue2024', 'annualRevenue2023', 'annualRevenue2022'].forEach(field => {
        if (this.model.companyFinancials[field]) {
          this.model.companyFinancials[field] = this.formatIndianCurrency(Number(this.model.companyFinancials[field]));
        }
      });
    }

    if (this.model.insuranceCoverage) {
      ['generalLiabilityInsurance', 'productLiabilityInsurance'].forEach(field => {
        if (this.model.insuranceCoverage[field]) {
          this.model.insuranceCoverage[field] = this.formatIndianCurrency(Number(this.model.insuranceCoverage[field]));
        }
      });
    }
  }

  formatIndianCurrency(num: number): string {
    const numStr = num.toString();
    const [integerPart, decimalPart] = numStr.split('.');
    
    if (integerPart.length <= 3) {
      return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
    }
    
    const lastThree = integerPart.slice(-3);
    const remaining = integerPart.slice(0, -3);
    const formattedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    const result = formattedRemaining + ',' + lastThree;
    return decimalPart ? `${result}.${decimalPart}` : result;
  }

  parseFormattedNumber(value: string): string {
    if (!value) return '';
    return value.replace(/,/g, '');
  }

  get currentFields(): FormlyFieldConfig[] {
    return this.stepFields[this.activeStepIndex] || [];
  }

  getCurrentStepTitle(): string {
    return this.stepInfo[this.activeStepIndex]?.title || '';
  }

  getCurrentStepDescription(): string {
    return this.stepInfo[this.activeStepIndex]?.description || '';
  }

  getCurrentMainStepTitle(): string {
    // Group steps into main sections like original design
    if (this.activeStepIndex <= 1) {
      return 'Basic Information';
    } else if (this.activeStepIndex <= 3) {
      return 'Manufacturing Capabilities';
    } else {
      return 'Financial & Additional Details';
    }
  }

  getDisplayStepNumber(): number {
    return this.activeStepIndex + 1;
  }

  getDisplayTotalSteps(): number {
    return this.totalSteps;
  }

  goToStep(stepIndex: number) {
    if (stepIndex >= 0 && stepIndex < this.totalSteps) {
      // Update current step object before changing step
      this.updateCurrentStepObject();
      
      this.activeStepIndex = stepIndex;
      
      // Console log the step object after changing step
      this.logCurrentStepObject();
    }
  }

  prevStep() {
    if (this.activeStepIndex > 0) {
      // Update current step object before going back
      this.updateCurrentStepObject();
      
      this.activeStepIndex--;
      
      // Console log the step object after changing step
      this.logCurrentStepObject();
    }
  }

  nextStep() {
    if (this.isStepValid(this.currentFields)) {
      // Update current step object before proceeding
      this.updateCurrentStepObject();
      
      // Additional validations for specific steps
      if (this.activeStepIndex === 0 && !this.model.noGst && !this.gstVerified) {
        this.sweetAlert.error('Please verify your GSTIN before proceeding.');
        return;
      }
      if (this.activeStepIndex === 0 && this.model.noGst && !this.panVerified) {
        this.sweetAlert.error('Please verify your PAN before proceeding.');
        return;
      }
      if (this.activeStepIndex === 1 && !this.phoneVerified) {
        this.sweetAlert.error('Please verify your phone number before proceeding.');
        return;
      }
      
      // Call appropriate API based on current step before moving to next step
      if (this.activeStepIndex === 1) {
        // Moving from Contact & Capabilities to Machine Capabilities - Save L1 data
        this.saveL1Data();
      } else if (this.activeStepIndex === 3) {
        // Moving from Facility Verification to Financial Information - Save L2 data
        this.saveL2Data();
      } else if (this.activeStepIndex < this.totalSteps - 1) {
        // Regular step progression without API call
        this.activeStepIndex++;
        
        // Console log the step object after changing step
        this.logCurrentStepObject();
      } else {
        // Final step - Save L3 data and complete onboarding
        this.saveL3DataAndComplete();
      }
    } else {
      this.markFieldsAsTouched(this.currentFields);
      const errorMessages: { [key: number]: string } = {
        0: 'Please fill in all required basic details and complete verification.',
        1: 'Please complete all required contact details and verify your phone.',
        2: 'Please add at least one complete machine with all required details.',
        3: 'Please upload at least 3 facility photos.',
        4: 'Please complete all required financial information.',
        5: 'Please provide at least one complete business reference.'
      };
      
      this.sweetAlert.error(errorMessages[this.activeStepIndex] || 'Please fill all required fields correctly.');
    }
  }

  isStepValid(fields: FormlyFieldConfig[]): boolean {
    let isValid = true;
    
    fields.forEach(field => {
      if (field.fieldGroup) {
        if (!this.isStepValid(field.fieldGroup)) {
          isValid = false;
        }
      } else if (field.key) {
        const control = this.form.get(field.key as string);
        if (control && control.invalid) {
          isValid = false;
        }
      }
    });
    
    // Additional custom validations based on step
    switch (this.activeStepIndex) {
      case 0: // Basic Details
        // Check GST/PAN verification
        if (!this.model.noGst && !this.gstVerified) {
          isValid = false;
        }
        if (this.model.noGst && !this.panVerified) {
          isValid = false;
        }
        break;
      case 1: // Contact & Capabilities
        if (!this.phoneVerified) {
          isValid = false;
        }
        break;
      case 2: // Machine Capabilities
        if (!this.isAtLeastOneMachineComplete()) {
          isValid = false;
        }
        break;
      case 3: // Facility Verification
        if (!this.model.facilityPhotos || (Array.isArray(this.model.facilityPhotos) && this.model.facilityPhotos.length < 3)) {
          isValid = false;
        }
        break;
      case 4: // Financial Information
        if (!this.model.bankDetails.bankName || !this.model.companyFinancials.annualRevenue2024) {
          isValid = false;
        }
        break;
      case 5: // Additional Information
        if (!this.isAtLeastOneReferenceComplete()) {
          isValid = false;
        }
        break;
    }
    
    return isValid;
  }

  isAtLeastOneMachineComplete(): boolean {
    const machines = this.model.machines || [];
    return machines.some((machine: any) => {
      return machine.make && 
             machine.model && 
             machine.specifications && 
             machine.quantity && 
             machine.machinePhotos && 
             (Array.isArray(machine.machinePhotos) ? machine.machinePhotos.length > 0 : machine.machinePhotos);
    });
  }

  isAtLeastOneReferenceComplete(): boolean {
    const references = this.model.additionalInformation?.references || [];
    return references.some((ref: any) => {
      return ref.companyName && ref.contactName && ref.email;
    });
  }

  markFieldsAsTouched(fields: FormlyFieldConfig[]): void {
    fields.forEach(field => {
      if (field.fieldGroup) {
        this.markFieldsAsTouched(field.fieldGroup);
      } else if (field.key) {
        const control = this.form.get(field.key as string);
        if (control) {
          control.markAsTouched();
        }
      }
    });
  }

  submit() {
    if (this.form.valid && this.isAllStepsValid()) {
      // Update current step object before submitting
      this.updateCurrentStepObject();
      
      // At final step, save L3 data and complete onboarding
      this.saveL3DataAndComplete();
    } else {
      this.sweetAlert.error('Please complete all required fields in all steps before submitting.');
    }
  }

  isAllStepsValid(): boolean {
    for (let i = 0; i < this.totalSteps; i++) {
      const originalStepIndex = this.activeStepIndex;
      this.activeStepIndex = i;
      if (!this.isStepValid(this.stepFields[i])) {
        this.activeStepIndex = originalStepIndex;
        return false;
      }
      this.activeStepIndex = originalStepIndex;
    }
    return true;
  }

  onBankVerified(verified: boolean): void {
    // Override with static verification - always set to true
    this.bankVerified = true;
    
    // Set static bank details if not already set
    if (!this.model.bankDetails.bankName) {
      this.model.bankDetails = {
        bankName: 'State Bank of India',
        accountNumber: '1234567890123456',
        ifscCode: 'SBIN0001234',
        accountHolderName: 'Example Company Private Limited',
        accountType: 'Current',
        branchName: 'Commercial Street Branch'
      };
    }
    
    console.log('🏦 Bank Verified with Static Data:', this.bankVerified);
    console.log('📋 Bank Details:', this.model.bankDetails);
    
    // Update form with static data
    setTimeout(() => {
      this.form.patchValue({
        bankDetails: this.model.bankDetails
      });
      this.form.markAsDirty();
    }, 100);
  }

  // L1 Methods - Country and State handling
  getStates(country: any) {
    if (!country) return;
    
    let endPoint = `/api/resource/City?fields=["country_title", "state_title", "city_title"]&filters=[["country_title", "=", "${country}"]]`;
    console.log('Fetching states for country:', country);
    
    this.commonService.getData(endPoint).subscribe((res: any) => {
      console.log('States API response:', res);
      if (res && res.data) {
        // Extract unique states from the response
        const states = [...new Set(res.data.map((item: any) => item.state_title))];
        
        this.stateList = states.map((state: any) => ({
          label: state,
          value: state
        }));
        
        console.log('State list updated:', this.stateList);
        
        // After state list is loaded, set the selected state if we have one
        if (this.selectedState) {
          setTimeout(() => {
            this.updateStateDropdownOptions(true);
          }, 200);
        }
        
        this.updateStateDropdownOptions(false);
      } else {
        this.stateList = [];
      }
    }, error => {
      console.error('Error fetching states:', error);
      this.stateList = [];
    });
  }

  updateStateDropdownOptions(forceSelection: boolean = false) {
    // Find the state field in the form and update options
    if (this.stepFields && this.stepFields.length > 0) {
      const basicDetailsFields = this.stepFields[0];
      
      // Find the row containing country, state, city fields
      const addressRow = basicDetailsFields.find((fieldGroup: any) => 
        fieldGroup.fieldGroup && 
        fieldGroup.fieldGroup.some((field: any) => field.key === 'country')
      );
      
      if (addressRow && addressRow.fieldGroup) {
        const stateField = addressRow.fieldGroup.find((field: any) => field.key === 'state');
        
        if (stateField && stateField.templateOptions) {
          stateField.templateOptions.options = this.stateList;
          
          if (forceSelection && this.selectedState && stateField.formControl) {
            stateField.formControl.setValue(this.selectedState);
            stateField.formControl.markAsDirty();
            stateField.formControl.updateValueAndValidity();
          }
          
          setTimeout(() => {
            if (stateField.formControl) {
              stateField.formControl.updateValueAndValidity();
            }
            this.cdr.detectChanges();
          }, 50);
        }
      }
    }
  }

  // L1 Event Handlers
  onPhoneVerified(verified: boolean): void {
    this.phoneVerified = verified;
    console.log('Phone verification status:', verified);
  }

  onGstVerified(verified: boolean): void {
    this.gstVerified = verified;
    console.log('GST verification status:', verified);
  }

  onPanVerified(verified: boolean): void {
    this.panVerified = verified;
    console.log('PAN verification status:', verified);
  }

  onAddressDetailsAccepted(addressData: any): void {
    console.log('GST Address details accepted:', addressData);
    
    if (addressData) {
      this.model.registeredAddress = addressData;
      
      if (addressData.country) {
        this.model.country = addressData.country;
        this.selectedCountry = addressData.country;
        this.getStates(addressData.country);
      }
      
      if (addressData.state) {
        this.model.state = addressData.state;
        this.selectedState = addressData.state;
      }
      
      if (addressData.city) {
        this.model.city = addressData.city;
      }
      
      setTimeout(() => {
        this.form.patchValue({
          registeredAddress: addressData,
          country: addressData.country,
          state: addressData.state,
          city: addressData.city
        });
        
        setTimeout(() => {
          this.updateStateDropdownOptions(true);
          this.cdr.detectChanges();
          this.form.markAsDirty();
        }, 1000);
      }, 500);
    }
  }

  onCompanyNameChanged(companyName: string) {
    console.log('onCompanyNameChanged called with:', companyName);
    this.companyName = companyName;
    
    if (companyName && (this.gstVerified || this.panVerified)) {
      this.model.company_name = companyName;
      
      this.form.patchValue({
        company_name: companyName
      });

      this.form.get('company_name')?.disable({ emitEvent: false });
      
      console.log('Company name updated to:', this.model.company_name);
      this.cdr.detectChanges();

      setTimeout(() => {
        this.form.markAsPristine();
      }, 1000);
    }
  }

  updateGstFieldVerificationStatus() {
    // Implementation to update GST verification status
  }

  updatePanFieldVerificationStatus() {
    // Implementation to update PAN verification status
  }

  // L1 API Methods (extracted from supplier-onboarding.component.ts)
  updateL1Data(data: any) {
    console.log('Preparing L1 data for submission:', data);
    let body = {
      company_name: data.company_name,
      primary_email_id: data.primary_email_id,
      onboarding_status: 'Under Review',
      registered_lat: data.registeredAddress?.location?.lat || 0,
      registered_lng: data.registeredAddress?.location?.lng || 0,
      phone_verified: this.phoneVerified,
      gst_verified: this.gstVerified,
      pan_verified: this.panVerified,
      company_profile: JSON.stringify({
        gstinNumber: data.gstinNumber,
        panNumber: data.panNumber,
        noGst: data.noGst,
        company_name: data.company_name,
        primary_email_id: data.primary_email_id,
        registeredAddress: data.registeredAddress,
        country: data.country,
        state: data.state,
        city: data.city,
        primaryContactName: data.primaryContactName,
        phoneNumber: data.phoneNumber,
        primaryManufacturingProcess: data.primaryManufacturingProcess,
        websiteURL: data.websiteURL,
        linkedinURL: data.linkedinURL,
        totalEmployees: data.totalEmployees,
        foundedYear: data.foundedYear,
        companyDocuments: data.companyDocuments,
        phone_verified: this.phoneVerified,
        gstVerified: this.gstVerified,
        panVerified: this.panVerified
      })
    };
    return body;
  }

  postL1DataFunction(endPoint: any, body: any) {
    this.commonService.postData(endPoint, body).subscribe((res: any) => {
      localStorage.setItem('supplier_id', res.data.name);
      this.hasExistingSupplier = true;
      this.sweetAlert.success('Basic information saved successfully. Proceeding to manufacturing capabilities.');
      // Move to next step after successful save
      this.activeStepIndex++;
      // Log the next step object
      this.logCurrentStepObject();
    }, (err) => {
      console.error('Error saving L1 data:', err);
      this.sweetAlert.error('Error saving basic information. Please try again.');
    });
  }

  putL1DataFunction(endPoint: any, body: any) {
    this.commonService.putData(endPoint, body).subscribe((res: any) => {
      this.sweetAlert.success('Basic information updated successfully. Proceeding to manufacturing capabilities.');
      // Move to next step after successful update
      this.activeStepIndex++;
      // Log the next step object
      this.logCurrentStepObject();
    }, (err) => {
      console.error('Error updating L1 data:', err);
      this.sweetAlert.error('Error updating basic information. Please try again.');
    });
  }

  saveL1Data() {
    // Update step objects before saving
    this.updateCurrentStepObject();
    
    // Get current form values and merge with model
    const formValues = this.form.getRawValue();
    const l1Data = { ...this.model, ...formValues };
    
    // Extract city, state, and country from the registeredAddress if it has the new format
    if (l1Data.registeredAddress && typeof l1Data.registeredAddress === 'object') {
      const addressData = l1Data.registeredAddress;
      
      if (!l1Data.city && addressData.city) {
        l1Data.city = addressData.city;
      }
      if (!l1Data.state && addressData.state) {
        l1Data.state = addressData.state;
      }
      if (!l1Data.country && addressData.country) {
        l1Data.country = addressData.country;
      }
    }
    
    console.log('💾 Saving L1 data:', l1Data);
    console.log('📋 Basic Details Object at Save:', this.basicDetails);
    console.log('📞 Contact & Capabilities Object at Save:', this.contactCapabilities);
    
    // Instead of calling API, just console log all step objects and move to next step
    console.log('🔍 All Step Objects Overview:', {
      basicDetails: this.basicDetails,
      contactCapabilities: this.contactCapabilities,
      machineCapabilities: this.machineCapabilities,
      facilityVerification: this.facilityVerification,
      financialInformation: this.financialInformation,
      additionalInformation: this.additionalInformation
    });
    
    // Show success message and move to next step
    this.sweetAlert.success('Basic information processed successfully. Proceeding to manufacturing capabilities.');
    this.activeStepIndex++;
    this.logCurrentStepObject();
    
    // Original API code commented out
    /*
    let endPoint = '/api/resource/Supplier Onboarding L1';
    let supplier_id = localStorage.getItem('supplier_id');
    let body = this.updateL1Data(l1Data);
    
    if (supplier_id) {
      endPoint = '/api/resource/Supplier Onboarding L1/' + supplier_id;
      this.putL1DataFunction(endPoint, body);
    } else {
      this.postL1DataFunction(endPoint, body);
    }
    */
  }

  // L2 API Methods (extracted from supplier-onboarding-l2.component.ts)
  updateL2Data(data: any) {
    console.log('Preparing L2 data for submission:', data);
    let supplier_id = localStorage.getItem('supplier_id');
    let body = {
      supplier_company_id: supplier_id,
      onboarding_status: 'Under Review',
      company_profile: JSON.stringify({
        machines: data.machines,
        certifications: data.certifications,
        industries: data.industries,
        productionCapacity: data.productionCapacity,
        facilityPhotos: data.facilityPhotos
      })
    };
    return body;
  }

  postL2DataFunction(endPoint: string, body: any) {
    this.commonService.postData(endPoint, body).subscribe((res: any) => {
      this.sweetAlert.success('Manufacturing capabilities saved successfully. Proceeding to financial information.');
      // Move to next step after successful save
      this.activeStepIndex++;
      // Log the next step object
      this.logCurrentStepObject();
    }, (err) => {
      console.error('Error saving L2 data:', err);
      this.sweetAlert.error('Error saving manufacturing capabilities. Please try again.');
    });
  }

  putL2DataFunction(endPoint: string, body: any) {
    this.commonService.putData(endPoint, body).subscribe((res: any) => {
      this.sweetAlert.success('Manufacturing capabilities updated successfully. Proceeding to financial information.');
      // Move to next step after successful update
      this.activeStepIndex++;
      // Log the next step object
      this.logCurrentStepObject();
    }, (err) => {
      console.error('Error updating L2 data:', err);
      this.sweetAlert.error('Error updating manufacturing capabilities. Please try again.');
    });
  }

  saveL2Data() {
    // Update step objects before saving
    this.updateCurrentStepObject();
    
    // Get current form values and merge with model
    const formValues = this.form.getRawValue();
    const l2Data = { ...this.model, ...formValues };
    
    console.log('💾 Saving L2 data:', l2Data);
    console.log('⚙️ Machine Capabilities Object at Save:', this.machineCapabilities);
    console.log('🏭 Facility Verification Object at Save:', this.facilityVerification);
    
    // Instead of calling API, just console log all step objects and move to next step
    console.log('🔍 All Step Objects Overview:', {
      basicDetails: this.basicDetails,
      contactCapabilities: this.contactCapabilities,
      machineCapabilities: this.machineCapabilities,
      facilityVerification: this.facilityVerification,
      financialInformation: this.financialInformation,
      additionalInformation: this.additionalInformation
    });
    
    // Show success message and move to next step
    this.sweetAlert.success('Manufacturing capabilities processed successfully. Proceeding to financial information.');
    this.activeStepIndex++;
    this.logCurrentStepObject();
    
    // Original API code commented out
    /*
    let endPoint = '/api/resource/Supplier Onboarding L2';
    let supplier_id = localStorage.getItem('supplier_id');
    let body = this.updateL2Data(l2Data);
    
    if (supplier_id) {
      // Try to update existing L2 record
      endPoint = '/api/resource/Supplier Onboarding L2/' + supplier_id;
      this.putL2DataFunction(endPoint, body);
    } else {
      // If no supplier_id, then post the L2 Data
      this.postL2DataFunction(endPoint, body);
    }
    */
  }

  // L3 API Methods (extracted from supplier-onboarding-l3.component.ts)
  updateL3Data(data: any) {
    console.log('Preparing L3 data for submission:', data);
    let supplier_id = localStorage.getItem('supplier_id');
    
    // Parse formatted currency values back to numbers
    const financialData = { ...data.companyFinancials };
    if (financialData.annualRevenue2024) {
      financialData.annualRevenue2024 = this.parseFormattedNumber(financialData.annualRevenue2024);
    }
    if (financialData.annualRevenue2023) {
      financialData.annualRevenue2023 = this.parseFormattedNumber(financialData.annualRevenue2023);
    }
    if (financialData.annualRevenue2022) {
      financialData.annualRevenue2022 = this.parseFormattedNumber(financialData.annualRevenue2022);
    }

    const insuranceData = { ...data.insuranceCoverage };
    if (insuranceData.generalLiabilityInsurance) {
      insuranceData.generalLiabilityInsurance = this.parseFormattedNumber(insuranceData.generalLiabilityInsurance);
    }
    if (insuranceData.productLiabilityInsurance) {
      insuranceData.productLiabilityInsurance = this.parseFormattedNumber(insuranceData.productLiabilityInsurance);
    }
    
    let body = {
      supplier_company_id: supplier_id,
      onboarding_status: 'Under Review',
      bank_verified: this.bankVerified,
      company_profile: JSON.stringify({
        bankDetails: data.bankDetails,
        companyFinancials: financialData,
        insuranceCoverage: insuranceData,
        additionalInformation: data.additionalInformation,
        bank_verified: this.bankVerified
      })
    };
    return body;
  }

  postL3DataFunction(endPoint: string, body: any) {
    this.commonService.postData(endPoint, body).subscribe((res: any) => {
      this.sweetAlert.success('Congratulations! Your supplier onboarding has been completed successfully. We will review your information and contact you shortly.');
      setTimeout(() => {
        this.router.navigate(['/wefab/supplier/supplier-onboarding-complete']);
      }, 3000);
    }, (err) => {
      console.error('Error saving L3 data:', err);
      this.sweetAlert.error('Error completing onboarding. Please try again.');
    });
  }

  putL3DataFunction(endPoint: string, body: any) {
    this.commonService.putData(endPoint, body).subscribe((res: any) => {
      this.sweetAlert.success('Congratulations! Your supplier onboarding has been completed successfully. We will review your information and contact you shortly.');
      setTimeout(() => {
        this.router.navigate(['/wefab/supplier/supplier-onboarding-complete']);
      }, 3000);
    }, (err) => {
      console.error('Error updating L3 data:', err);
      this.sweetAlert.error('Error completing onboarding. Please try again.');
    });
  }

  saveL3DataAndComplete() {
    // Update step objects before saving
    this.updateCurrentStepObject();
    
    // Get current form values and merge with model
    const formValues = this.form.getRawValue();
    const l3Data = { ...this.model, ...formValues };
    
    console.log('💾 Saving L3 data and completing onboarding:', l3Data);
    console.log('💰 Financial Information Object at Save:', this.financialInformation);
    console.log('ℹ️ Additional Information Object at Save:', this.additionalInformation);
    
    // Instead of calling API, just console log all step objects
    console.log('🔍 All Step Objects Overview:', {
      basicDetails: this.basicDetails,
      contactCapabilities: this.contactCapabilities,
      machineCapabilities: this.machineCapabilities,
      facilityVerification: this.facilityVerification,
      financialInformation: this.financialInformation,
      additionalInformation: this.additionalInformation
    });
    
    // Show completion message
    this.sweetAlert.success('Congratulations! Your supplier onboarding data has been processed successfully. All step objects have been logged to console.');
    
    // Optional: Navigate to completion page after a delay
    // setTimeout(() => {
    //   this.router.navigate(['/wefab/supplier/supplier-onboarding-complete']);
    // }, 3000);
    
    // Original API code commented out
    /*
    let endPoint = '/api/resource/Supplier Onboarding L3';
    let supplier_id = localStorage.getItem('supplier_id');
    let body = this.updateL3Data(l3Data);
    
    if (supplier_id) {
      // Try to update existing L3 record
      endPoint = '/api/resource/Supplier Onboarding L3/' + supplier_id;
      this.putL3DataFunction(endPoint, body);
    } else {
      // If no supplier_id, this shouldn't happen at L3 stage
      this.postL3DataFunction(endPoint, body);
    }
    */
  }

  // Field configuration methods (from L2 and L3 components)
  getManufacturingCapabilitiesFields(): FormlyFieldConfig[] {
    // Implementation from L2 component - Machine capabilities step
    return [
      // Machine Details Section
      {
        fieldGroupClassName: 'mb-2',
        fieldGroup: [
          {
            template: `
              <div class="section-header mb-2">
                <h4 class="">Machine Details</h4>
                <p class="text-muted">Add details about your manufacturing machines.</p>
              </div>
            `
          },
          {
            key: 'machines',
            type: 'repeat',
            fieldArray: {
              fieldGroup: [
                {
                  fieldGroupClassName: 'row',
                  fieldGroup: [
                    {
                      className: 'col-md-6 mb-2',
                      key: 'make',
                      type: 'input',
                      templateOptions: {
                        label: 'Make',
                        placeholder: 'Manufacturer name',
                        required: true
                      }
                    },
                    {
                      className: 'col-md-6 mb-2',
                      key: 'model',
                      type: 'input',
                      templateOptions: {
                        label: 'Model',
                        placeholder: 'Model number',
                        required: true
                      }
                    }
                  ]
                },
                {
                  fieldGroupClassName: 'row',
                  fieldGroup: [
                    {
                      className: 'col-md-6 mb-2',
                      key: 'specifications',
                      type: 'input',
                      templateOptions: {
                        label: 'Specifications',
                        placeholder: 'Key specifications',
                        required: true
                      }
                    },
                    {
                      className: 'col-md-6 mb-2',
                      key: 'quantity',
                      type: 'input',
                      templateOptions: {
                        label: 'Quantity',
                        type: 'number',
                        min: 1,
                        required: true
                      }
                    }
                  ]
                },
                {
                  key: 'machinePhotos',
                  type: 'file-upload',
                  className: 'col-12 mb-2',
                  templateOptions: {
                    label: 'Machine Photos',
                    description: 'Upload photos of this machine',
                    required: true,
                    acceptedTypes: '.png,.jpg,.jpeg'
                  }
                }
              ]
            }
          }
        ]
      },
      
      // Certifications Section
      {
        fieldGroupClassName: 'mb-2 mt-3',
        fieldGroup: [
          {
            template: `
              <div class="section-header mb-2">
                <h4 class="">Certifications</h4>
                <p class="text-muted">Add details about your certifications.</p>
              </div>
            `
          },
          {
            key: 'certifications',
            type: 'repeat',
            fieldArray: {
              fieldGroup: [
                {
                  fieldGroupClassName: 'row',
                  fieldGroup: [
                    {
                      className: 'col-md-6 mb-2',
                      key: 'certificationName',
                      type: 'input',
                      templateOptions: {
                        label: 'Certification Name',
                        placeholder: 'e.g. ISO 9001'
                      }
                    },
                    {
                      className: 'col-md-6 mb-2',
                      key: 'certifyingBody',
                      type: 'input',
                      templateOptions: {
                        label: 'Certifying Body',
                        placeholder: 'e.g. Bureau Veritas'
                      }
                    }
                  ]
                },
                {
                  fieldGroupClassName: 'row',
                  fieldGroup: [
                    {
                      className: 'col-md-6 mb-2',
                      key: 'expirationDate',
                      type: 'input',
                      templateOptions: {
                        label: 'Expiration Date',
                        type: 'date'
                      }
                    },
                    {
                      className: 'col-md-6 mb-2',
                      key: 'certificateDocument',
                      type: 'file-upload',
                      templateOptions: {
                        label: 'Certificate Document',
                        acceptedTypes: '.png,.jpg,.jpeg'
                      }
                    }
                  ]
                }
              ]
            }
          }
        ]
      },
      
      // Production & Industries Section
      {
        fieldGroupClassName: 'mb-2 mt-3',
        fieldGroup: [
          {
            template: `
              <div class="section-header mb-2">
                <h4 class="">Production & Industries</h4>
                <p class="text-muted">Provide details about your production capacity and industries served.</p>
              </div>
            `
          },
          {
            fieldGroupClassName: 'row',
            fieldGroup: [
              {
                className: 'col-md-6 mb-2',
                key: 'productionCapacity',
                type: 'range-slider',
                templateOptions: {
                  label: 'Production Capacity',
                  description: 'Current facility utilization',
                  min: 0,
                  max: 100,
                  step: 1,
                  unit: '%',
                  required: true
                }
              },
              {
                className: 'col-md-6 mb-2',
                key: 'industries',
                type: 'p-multiselect',
                templateOptions: {
                  label: 'Industries Served',
                  options: [
                    { label: 'Aerospace', value: 'aerospace' },
                    { label: 'Automotive', value: 'automotive' },
                    { label: 'Consumer Electronics', value: 'consumer_electronics' },
                    { label: 'Defense', value: 'defense' },
                    { label: 'Healthcare', value: 'healthcare' },
                    { label: 'Industrial', value: 'industrial' },
                    { label: 'Medical Devices', value: 'medical_devices' },
                    { label: 'Robotics', value: 'robotics' },
                    { label: 'Telecommunications', value: 'telecommunications' }
                  ],
                  required: true
                }
              }
            ]
          }
        ]
      }
    ];
  }

  getFacilityVerificationFields(): FormlyFieldConfig[] {
    return [
      {
        template: `
          <div class="section-header mb-2">
            <h4 class="">Facility Verification</h4>
            <p class="text-muted mb-2">Upload geotagged photos of your manufacturing facility.</p>
          </div>
        `
      },
      {
        key: 'facilityPhotos',
        type: 'file-upload',
        className: 'col-12 mb-2',
        templateOptions: {
          label: 'Facility Photos',
          required: true,
          multiple: true,
          acceptedTypes: '.png,.jpg,.jpeg',
          description: 'Upload at least 3 photos of your facility'
        }
      }
    ];
  }

  getFinancialInformationFields(): FormlyFieldConfig[] {
    return [
      // Bank Details Section
      {
        template: '<h4 class="bank-details-title mb-2 mt-4">Bank Details</h4>'
      },
      // Bank Verification Section
      {
        template: '<h5 class="bank-verification-title mb-2 mt-3">Account Verification</h5>'
      },
      {
        key: 'bankDetails.verification',
        type: 'bank-verify',
        templateOptions: {
          parentComponent: this,
          isVerified: true, // Always show as verified for static data
          staticMode: true, // Add flag to indicate static mode
          staticBankDetails: {
            bankName: 'State Bank of India',
            accountNumber: '1234567890123456',
            ifscCode: 'SBIN0001234',
            accountHolderName: 'Example Company Private Limited',
            accountType: 'Current',
            branchName: 'Commercial Street Branch'
          }
        }
      },
      
      // Financial Overview Section
      {
        template: '<h4 class="financial-overview-title mb-2 mt-4">Financial Overview (Last 3 Years)</h4>'
      },
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-4',
            key: 'companyFinancials.annualRevenue2024',
            type: 'input',
            templateOptions: {
              label: 'Annual Revenue (This Year) (INR)',
              required: true,
              type: 'text',
              placeholder: 'Enter current year revenue'
            }
          },
          {
            className: 'col-md-4',
            key: 'companyFinancials.annualRevenue2023',
            type: 'input',
            templateOptions: {
              label: 'Annual Revenue (Last Year) (INR)',
              required: true,
              type: 'text',
              placeholder: 'Enter last year revenue'
            }
          },
          {
            className: 'col-md-4',
            key: 'companyFinancials.annualRevenue2022',
            type: 'input',
            templateOptions: {
              label: 'Annual Revenue (Two Years Ago) (INR)',
              required: true,
              type: 'text',
              placeholder: 'Enter two years ago revenue'
            }
          }
        ]
      },
      
      // Tax Compliance
      {
        key: 'companyFinancials.taxCompliant',
        type: 'checkbox',
        className: 'mb-3',
        templateOptions: {
          label: 'We are compliant with all applicable tax regulations',
          required: true
        }
      },
      
      // Insurance Coverage Section
      {
        template: '<h4 class="insurance-title mt-3 mb-2">Insurance Coverage</h4>'
      },
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-6',
            key: 'insuranceCoverage.generalLiabilityInsurance',
            type: 'input',
            templateOptions: {
              label: 'General Liability Insurance (INR)',
              placeholder: 'Enter General Liability Insurance Amount',
              type: 'text'
            }
          },
          {
            className: 'col-md-6',
            key: 'insuranceCoverage.productLiabilityInsurance',
            type: 'input',
            templateOptions: {
              label: 'Product Liability Insurance (INR)',
              placeholder: 'Enter Product Liability Insurance Amount',
              type: 'text'
            }
          }
        ]
      }
    ];
  }

  getAdditionalInformationFields(): FormlyFieldConfig[] {
    return [
      {
        key: 'additionalInformation',
        fieldGroup: [
          {
            template: `
              <div class="mt-3 mb-2">
                <h4 class="section-title">Business References</h4>
                <p class="text-muted small">Provide at least one reference from current or past clients/partners</p>
              </div>
            `
          },
          {
            key: 'references',
            type: 'repeat',
            templateOptions: {
              addText: '+ Add Item',
              min: 1
            },
            fieldArray: {
              fieldGroup: [
                {
                  fieldGroupClassName: 'row',
                  fieldGroup: [
                    {
                      className: 'col-md-6',
                      key: 'companyName',
                      type: 'input',
                      templateOptions: {
                        label: 'Company Name',
                        placeholder: 'Enter company name',
                        required: true
                      }
                    },
                    {
                      className: 'col-md-6',
                      key: 'contactName',
                      type: 'input',
                      templateOptions: {
                        label: 'Contact Name',
                        placeholder: 'Enter contact person name',
                        required: true
                      }
                    }
                  ]
                },
                {
                  fieldGroupClassName: 'row',
                  fieldGroup: [
                    {
                      className: 'col-md-6',
                      key: 'email',
                      type: 'input',
                      templateOptions: {
                        type: 'email',
                        label: 'Email',
                        placeholder: 'Enter contact email',
                        required: true
                      }
                    }
                  ]
                }
              ]
            }
          }
        ]
      }
    ];
  }

  // L1 Field Configurations
  getBasicDetailsFields(): FormlyFieldConfig[] {
    return [
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-6 mb-3',
            fieldGroup: [
              {
                key: 'gstinNumber',
                type: 'gst-verify',
                templateOptions: {
                  label: 'GSTIN',
                  placeholder: '22AAAAA0000A1Z5',
                  required: true,
                  description: '',
                  parentComponent: this,
                  isVerified: this.gstVerified
                },
                expressionProperties: {
                  'templateOptions.required': (model: any) => !model.noGst,
                  'templateOptions.isVerified': () => this.gstVerified,
                  'hide': (model: any) => model.noGst
                },
                validators: {
                  validation: [gstValidator]
                },
                validation: {
                  messages: {
                    required: 'Please enter your GSTIN number',
                    gstFormat: 'Invalid GSTIN format'
                  }
                }
              },
              {
                key: 'panNumber',
                type: 'pan-verify',
                className: 'mb-2',
                templateOptions: {
                  label: 'PAN',
                  placeholder: 'ABCDE1234F',
                  required: false,
                  description: 'Enter 10-character PAN (e.g., ABCDE1234F)',
                  parentComponent: this,
                  isVerified: this.panVerified
                },
                expressionProperties: {
                  'hide': (model: any) => !model.noGst,
                  'templateOptions.required': (model: any) => model.noGst,
                  'templateOptions.isVerified': () => this.panVerified,
                  'templateOptions.disabled': (model: any) => !model.noGst
                },
                validators: {
                  validation: [panValidator]
                },
                validation: {
                  messages: {
                    required: 'Please enter your PAN number',
                    panFormat: 'Invalid PAN format. Please enter a valid 10-character PAN (e.g., ABCDE1234F)'
                  }
                }
              },
              {
                key: 'noGst',
                type: 'checkbox',
                defaultValue: false,
                templateOptions: {
                  label: 'We don\'t have GST'
                },
                hooks: {
                  onInit: (field) => {
                    field.formControl?.valueChanges.subscribe(value => {
                      const gstinField = field.form?.get('gstinNumber');
                      const panField = field.form?.get('panNumber');
                      
                      if (value && gstinField) {
                        gstinField.setErrors(null);
                        gstinField.setValue('');
                      }
                      
                      if (!value && panField) {
                        panField.setValue('');
                        panField.setErrors(null);
                      }
                      
                      this.model.noGst = value;
                      
                      setTimeout(() => {
                        this.model = { ...this.model };
                        this.cdr.detectChanges();
                        
                        if (panField) {
                          panField.updateValueAndValidity();
                        }
                        if (gstinField) {
                          gstinField.updateValueAndValidity();
                        }
                      }, 0);
                    });
                  }
                }
              }
            ]
          },
          {
            className: 'col-md-6 mb-2',
            key: 'company_name',
            type: 'input',
            templateOptions: {
              label: 'Legal Business Name',
              placeholder: 'Your company\'s registered name',
              required: true
            },
            validation: {
              messages: {
                required: 'Please enter legal business name'
              }
            }
          }
        ]
      },
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-6 mb-2',
            key: 'primary_email_id',
            type: 'input',
            templateOptions: {
              label: 'Email Id',
              placeholder: 'Please enter your email id',
              required: true,
              disabled: true
            },
            validation: {
              messages: {
                required: 'Please enter your email id'
              }
            }
          },
          {
            className: 'col-md-6 mb-3',
            key: 'registeredAddress',
            type: 'google-places',
            defaultValue: this.getCompanyProfile?.registeredAddress || null,
            templateOptions: {
              label: 'Registered Address',
              placeholder: 'Search for your registered address',
              required: true,
              updateFields: {
                'country': 'country',
                'state': 'state', 
                'city': 'city'
              }
            },
            validation: {
              messages: {
                required: 'Please select a registered address'
              }
            }
          }
        ]
      },
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-4 mb-2',
            key: 'country',
            type: 'searchable-select',
            templateOptions: {
              label: 'Country',
              required: true,
              placeholder: 'Select country',
              options: this.countryList.map((country: any) => ({
                label: country.name,
                value: country.name
              }))
            },
            hooks: {
              onInit: (field) => {
                field.formControl?.valueChanges.subscribe(selectedCountry => {
                  if (selectedCountry) {
                    this.selectedCountry = selectedCountry;
                    
                    if (field.form?.get('state')) {
                      field.form.get('state')!.setValue(null);
                    }
                    
                    this.getStates(selectedCountry);
                  }
                });
              }
            },
            validation: {
              messages: {
                required: 'Please select a country'
              }
            }
          },
          {
            className: 'col-md-4 mb-2',
            key: 'state',
            type: 'searchable-select',
            templateOptions: {
              label: 'State',
              required: true,
              placeholder: 'Select state',
              options: this.stateList || []
            },
            hooks: {
              onInit: (field) => {
                field.formControl?.valueChanges.subscribe(selectedState => {
                  if (selectedState) {
                    this.selectedState = selectedState;
                  }
                });
              }
            },
            validation: {
              messages: {
                required: 'Please select a state'
              }
            },
            expressionProperties: {
              'templateOptions.disabled': '!model.country'
            }
          },
          {
            className: 'col-md-4 mb-2',
            key: 'city',
            type: 'input',
            templateOptions: {
              label: 'City',
              placeholder: 'Please enter your city',
              required: true
            },
            validation: {
              messages: {
                required: 'Please enter city name'
              }
            },
            expressionProperties: {
              'templateOptions.disabled': '!model.state'
            }
          }
        ]
      }
    ];
  }

  getContactCapabilitiesFields(): FormlyFieldConfig[] {
    return [
      {
        fieldGroupClassName: 'row align-items-end',
        fieldGroup: [
          {
            className: 'col-md-6 mb-2',
            key: 'primaryContactName',
            type: 'input',
            templateOptions: {
              label: 'Primary Contact Name',
              placeholder: 'Full name of primary contact person',
              required: true
            },
            validation: {
              messages: {
                required: 'Please enter primary contact name'
              }
            }
          },
          {
            className: 'col-md-6 mb-2',
            key: 'phoneNumber',
            type: 'phone-otp',
            defaultValue: this.model.phoneNumber,
            templateOptions: {
              label: 'Phone Number',
              required: true,
              placeholder: 'Enter phone number',
              countryCode: '91',
              parentComponent: this,
              isVerified: this.phoneVerified
            },
            hooks: {
              onInit: (field) => {
                if (this.phoneVerified) {
                  field.templateOptions!['isVerified'] = true;
                }
              }
            },
            validation: {
              messages: {
                required: 'Please enter your phone number'
              }
            }
          },
          {
            className: 'col-md-6 mb-2',
            key: 'primaryManufacturingProcess',
            type: 'p-dropdown-group-search',
            defaultValue: [],
            templateOptions: {
              label: 'Primary Manufacturing Process',
              placeholder: 'Select your manufacturing processes',
              required: true,
              filterPlaceholder: 'Search manufacturing processes...',
              multiselect: true,
              maxSelectedLabels: 100,
              showDebugInfo: false,
              options: [
                {
                  label: 'Precision Machining',
                  items: [
                    { value: "3axis", label: "3-axis Milling" },
                    { value: "4axis", label: "4-axis Milling" },
                    { value: "5axis", label: "5-axis Milling" },
                    { value: "turning", label: "Turning/Lathe" },
                    { value: "drilling", label: "Drilling" },
                    { value: "boring", label: "Boring" },
                    { value: "grinding", label: "Grinding" },
                    { value: "wireedm", label: "Wire EDM" },
                    { value: "sinkeredm", label: "Sinker/Ram EDM" },
                    { value: "polishing", label: "Polishing" },
                    { value: "lapping", label: "Lapping" },
                    { value: "honing", label: "Honing" },
                    { value: "ultrasonic", label: "Ultrasonic Machining" },
                    { value: "electrochemical", label: "Electrochemical Machining" },
                    { value: "waterjet", label: "Waterjet Cutting" }
                  ]
                },
                {
                  label: '3D Printing',
                  items: [
                    { value: "dmls", label: "DMLS" },
                    { value: "slm", label: "SLM" },
                    { value: "ebm", label: "EBM" },
                    { value: "binderjet", label: "Binder Jetting" },
                    { value: "ded", label: "DED" },
                    { value: "fdm", label: "FDM" },
                    { value: "sla", label: "SLA" },
                    { value: "sls", label: "SLS" },
                    { value: "polyjet", label: "Material Jetting/PolyJet" },
                    { value: "dlp", label: "DLP" },
                    { value: "clip", label: "CLIP" }
                  ]
                },
                {
                  label: 'Sheet Metal Works',
                  items: [
                    { value: "lasercut", label: "Laser Cutting" },
                    { value: "plasmacut", label: "Plasma Cutting" },
                    { value: "waterjetcut", label: "Waterjet Cutting" },
                    { value: "punching", label: "Punching" },
                    { value: "blanking", label: "Blanking/Shearing" },
                    { value: "bending", label: "Bending/Press Brake" },
                    { value: "rolling", label: "Rolling" },
                    { value: "stamping", label: "Stamping" },
                    { value: "deepdraw", label: "Deep Drawing" },
                    { value: "spinning", label: "Spinning" }
                  ]
                }
              ],
              description: 'Select all manufacturing capabilities that apply to your business'
            },
            validation: {
              messages: {
                required: 'Please select at least one manufacturing capability'
              }
            }
          }
        ]
      },
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-6 mb-2',
            key: 'websiteURL',
            type: 'input',
            templateOptions: {
              label: 'Company Website URL',
              placeholder: 'https://yourcompany.com',
              required: false
            }
          },
          {
            className: 'col-md-6 mb-2',
            key: 'linkedinURL',
            type: 'input',
            templateOptions: {
              label: 'LinkedIn URL',
              placeholder: 'https://linkedin.com/company/yourcompany',
              required: false
            }
          }
        ]
      },
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-6 mb-2',
            key: 'totalEmployees',
            type: 'input',
            templateOptions: {
              type: 'number',
              label: 'Total Number of Employees',
              placeholder: 'Enter number of employees',
              min: 1,
              required: true
            },
            validation: {
              messages: {
                required: 'Number of employees is required'
              }
            }
          },
          {
            className: 'col-md-6 mb-2',
            key: 'foundedYear',
            type: 'input',
            templateOptions: {
              type: 'number',
              label: 'Year Founded',
              placeholder: 'Enter year company was founded',
              min: 1900,
              max: new Date().getFullYear(),
              required: true
            },
            validation: {
              messages: {
                required: 'Year founded is required'
              }
            }
          }
        ]
      },
      {
        key: 'companyDocuments',
        type: 'file-upload',
        className: 'col-12 mb-2',
        templateOptions: {
          label: 'Company Documents',
          description: 'Upload documents that will help us evaluate your profile more accurately and expedite decision-making',
          required: true,
          acceptedTypes: '.pdf',
          multiple: true
        },
        validation: {
          messages: {
            required: 'Please upload documents'
          }
        }
      }
    ];
  }

  // New method to update current step object with form data
  updateCurrentStepObject() {
    const formValues = this.form.getRawValue();
    const combinedData = { ...this.model, ...formValues };
    
    switch (this.activeStepIndex) {
      case 0: // Basic Details
        this.basicDetails = {
          gstinNumber: combinedData.gstinNumber,
          panNumber: combinedData.panNumber,
          noGst: combinedData.noGst,
          company_name: combinedData.company_name,
          primary_email_id: combinedData.primary_email_id,
          registeredAddress: combinedData.registeredAddress,
          country: combinedData.country,
          state: combinedData.state,
          city: combinedData.city,
          gstVerified: this.gstVerified,
          panVerified: this.panVerified
        };
        break;
        
      case 1: // Contact & Capabilities
        this.contactCapabilities = {
          primaryContactName: combinedData.primaryContactName,
          phoneNumber: combinedData.phoneNumber,
          primaryManufacturingProcess: combinedData.primaryManufacturingProcess,
          websiteURL: combinedData.websiteURL,
          linkedinURL: combinedData.linkedinURL,
          totalEmployees: combinedData.totalEmployees,
          foundedYear: combinedData.foundedYear,
          companyDocuments: combinedData.companyDocuments,
          phoneVerified: this.phoneVerified
        };
        break;
        
      case 2: // Machine Capabilities
        this.machineCapabilities = {
          machines: combinedData.machines,
          certifications: combinedData.certifications,
          industries: combinedData.industries,
          productionCapacity: combinedData.productionCapacity
        };
        break;
        
      case 3: // Facility Verification
        this.facilityVerification = {
          facilityPhotos: combinedData.facilityPhotos
        };
        break;
        
      case 4: // Financial Information
        this.financialInformation = {
          bankDetails: combinedData.bankDetails,
          companyFinancials: combinedData.companyFinancials,
          insuranceCoverage: combinedData.insuranceCoverage,
          bankVerified: this.bankVerified
        };
        break;
        
      case 5: // Additional Information
        this.additionalInformation = {
          references: combinedData.additionalInformation?.references || []
        };
        break;
    }
  }

  // New method to log current step object
  logCurrentStepObject() {
    switch (this.activeStepIndex) {
      case 0:
        console.log('📋 Basic Details Step Object:', this.basicDetails);
        break;
      case 1:
        console.log('📞 Contact & Capabilities Step Object:', this.contactCapabilities);
        break;
      case 2:
        console.log('⚙️ Machine Capabilities Step Object:', this.machineCapabilities);
        break;
      case 3:
        console.log('🏭 Facility Verification Step Object:', this.facilityVerification);
        break;
      case 4:
        console.log('💰 Financial Information Step Object:', this.financialInformation);
        break;
      case 5:
        console.log('ℹ️ Additional Information Step Object:', this.additionalInformation);
        break;
    }
    
    // Also log all step objects for complete overview
    console.log('🔍 All Step Objects Overview:', {
      basicDetails: this.basicDetails,
      contactCapabilities: this.contactCapabilities,
      machineCapabilities: this.machineCapabilities,
      facilityVerification: this.facilityVerification,
      financialInformation: this.financialInformation,
      additionalInformation: this.additionalInformation
    });
  }

  // New method to set static bank verification data
  setStaticBankData() {
    // Set static verified bank details
    this.model.bankDetails = {
      bankName: 'State Bank of India',
      accountNumber: '1234567890123456',
      ifscCode: 'SBIN0001234',
      accountHolderName: 'Example Company Private Limited',
      accountType: 'Current',
      branchName: 'Commercial Street Branch'
    };
    
    // Set bank as verified
    this.bankVerified = true;
    
    console.log('🏦 Static Bank Data Set:', this.model.bankDetails);
    console.log('✅ Bank Verification Status:', this.bankVerified);
  }
} 