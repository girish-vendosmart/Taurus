import { Component, OnInit, ViewChild, TemplateRef, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { Router } from '@angular/router';
import { CommonService } from '../../shared/common.service';

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
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TabViewModule } from 'primeng/tabview';
import { TabMenuModule } from 'primeng/tabmenu';

// Import Components
import { FileUploadComponent } from '../supplier-onboarding/file-upload.component';
import { FormlyRepeatTypeComponent } from '../../../../app/formly-repeat-type.component';
import { FormlyFieldFileUploadComponent } from '../../../../app/file-upload-type.component';
import { FormlyFieldRangeSliderComponent } from '../../../../app/range-slider-type.component';
import { FormlyFieldDropdownComponent } from '../../../../app/dropdown-type.component';

@Component({
  selector: 'app-supplier-onboarding-l3',
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
    InputGroupModule,
    InputGroupAddonModule,
    TabViewModule,
    TabMenuModule,
    FileUploadComponent,
    FormlyRepeatTypeComponent,
    FormlyFieldFileUploadComponent,
    FormlyFieldRangeSliderComponent,
    FormlyFieldDropdownComponent
  ],
  providers: [MessageService],
  templateUrl: './supplier-onboarding-l3.component.html',
  styleUrl: './supplier-onboarding-l3.component.scss'
})
export class SupplierOnboardingL3Component implements OnInit {
  form: FormGroup;
  model: any = {
    companyFinancials: {
      annualRevenue2024: '',
      annualRevenue2023: '',
      annualRevenue2022: '',
      creditRatingProvider: 'CRISIL',
      taxCompliant: true,
      currency: 'USD'
    },
    insuranceCoverage: {
      generalLiabilityInsurance: 'i-0987',
      productLiabilityInsurance: '0987'
    },
    additionalInformation: {
      websites: {
        website: ''
      },
      totalEmployees: '',
      foundedYear: '',
      productionFacilities: [{
        facilityName: '',
        facilityLocation: ''
      }],
      leadTime: '',
      minimumOrderQuantity: 0,
      references: [{
        companyName: '',
        contactName: '',
        email: ''
      }]
    },
    termsAndConditions: {
      acceptTerms: false,
      acceptPrivacyPolicy: false
    }
  };
  options: FormlyFormOptions = {};
  
  activeStepIndex = 0;
  steps: MenuItem[] = [];
  
  // Create arrays of field configurations for each step
  stepFields: FormlyFieldConfig[][] = [];
  
  isBrowser: boolean;
  isMobile: boolean = false;
  getFinancialData: any;
  
  constructor(
    private fb: FormBuilder, 
    private messageService: MessageService,
    private router: Router,
    private commonService: CommonService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.form = this.fb.group({});
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnInit(): void {
    // Check screen size on init
    if (this.isBrowser) {
      this.checkScreenSize();
    }
    
    // Initialize step fields
    this.stepFields = [
      this.getFinancialInformationFields(),
      this.getAdditionalInformationFields()
    ];
    
    this.steps = [
      {
        label: 'Financial Information',
        command: () => {
          this.activeStepIndex = 0;
        }
      },
      {
        label: 'Additional Information',
        command: () => {
          this.activeStepIndex = 1;
        }
      }
    ];
    
    // Ensure all model objects are properly initialized
    if (!this.model.additionalInformation) {
      this.model.additionalInformation = {};
    }
    
    // Initialize nested objects to prevent errors
    if (!this.model.additionalInformation.websites) {
      this.model.additionalInformation.websites = { website: '' };
    }
    
    if (!this.model.additionalInformation.productionFacilities || 
        !this.model.additionalInformation.productionFacilities.length) {
      this.model.additionalInformation.productionFacilities = [{
        facilityName: '',
        facilityLocation: ''
      }];
    }
    
    if (!this.model.additionalInformation.references || 
        !this.model.additionalInformation.references.length) {
      this.model.additionalInformation.references = [{
        companyName: '',
        contactName: '',
        email: ''
      }];
    }
    
    // Initialize arrays
    const arrayFields = [
      'onlineMarketplaces', 'marketplaceProfiles', 'otherDigitalFootprints', 
      'certifications', 'qualityStandards', 'environmentalComplianceCertifications',
      'sustainabilityInitiatives', 'socialResponsibilityInitiatives', 'diversityInclusion',
      'paymentMethods', 'bulkDiscountTiers', 'shippingCapabilities',
      // New array fields
      'rawMaterialSources', 'traceabilityMethods', 'backupSuppliers', 'industryRegulations'
    ];
    
    arrayFields.forEach(field => {
      if (!this.model.additionalInformation[field]) {
        this.model.additionalInformation[field] = [];
      }
    });
    
    // Apply the sticky position based on the screen size
    this.updateStickyNavigation();

    // Check if we're in edit mode
    const route = this.router.url;
    if (route.includes('mode=edit')) {
      const supplierId = sessionStorage.getItem('supplier_id');
      if (supplierId) {
        
        this.getL3Data(supplierId);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Supplier ID not found. Please try again.',
          life: 3000
        });
        this.router.navigate(['/wefab/supplier/supplier-verification']);
      }
    }
  }

  getL3Data(supplierId:any) {
    let endPoint = '/api/resource/wfb_supplier_onboarding_L3/' + supplierId
      this.commonService.getData(endPoint).subscribe((res: any) => {
        
        this.getFinancialData = JSON.parse(res.data.company_profile)
        console.log(this.getFinancialData)
        this.patchValueForm()
      })
  }

  patchValueForm() {
    if (!this.getFinancialData) {
      return;
    }
    
    // Update the model with the values from getFinancialData
    this.model = {
      ...this.getFinancialData
    };
    
    // Ensure arrays are properly initialized
    if (!this.model.additionalInformation.productionFacilities || 
        !Array.isArray(this.model.additionalInformation.productionFacilities) || 
        this.model.additionalInformation.productionFacilities.length === 0) {
      this.model.additionalInformation.productionFacilities = [{
        facilityName: '',
        facilityLocation: ''
      }];
    }
    
    if (!this.model.additionalInformation.references || 
        !Array.isArray(this.model.additionalInformation.references) || 
        this.model.additionalInformation.references.length === 0) {
      this.model.additionalInformation.references = [{
        companyName: '',
        contactName: '',
        email: ''
      }];
    }
    
    // Mark form as pristine after patching values
    setTimeout(() => {
      this.form.markAsPristine();
      console.log('Form patched with stored data:', this.model);
    });
  }

  // Added method to update sticky navigation based on screen size
  updateStickyNavigation() {
    if (this.isBrowser) {
      const leftPanel = document.querySelector('.supplier-onboarding-content .col-md-3') as HTMLElement;
      if (leftPanel) {
        if (this.isMobile) {
          leftPanel.style.position = 'relative';
          leftPanel.style.top = '0';
        } else {
          leftPanel.style.position = 'sticky';
          leftPanel.style.top = '20px';
        }
      }
    }
  }

  // Getter to make accessing the current step's fields easy in template
  get currentFields(): FormlyFieldConfig[] {
    return this.stepFields[this.activeStepIndex] || [];
  }

  getFinancialInformationFields(): FormlyFieldConfig[] {
    return [
      // Header
      {
        template: `
          <h3 class="text-blueprint-blue mb-2">Financial Information</h3>
          <p class="text-machine-gray mb-3">Share your financial details to improve matching with potential clients</p>
        `
      },
      // Info section
      {
        template: `
          <div class="info-container mb-6">
            <div class="info-icon">
              <i class="pi pi-info-circle"></i>
            </div>
            <div class="info-content">
              <h5 class="info-title">Why provide financial information?</h5>
              <p class="info-text">Sharing your financial information helps us match you with appropriate clients and projects. This information is securely stored and only shared with verified clients when necessary. Suppliers who complete this section receive priority in our matching algorithm.</p>
            </div>
          </div>
        `
      },
      {
        template: '<h4 class="financial-overview-title mb-2 mt-4">Financial Overview</h4>'
      },
      {
        template: '<h6 class="annual-revenue-title mb-1">Annual Revenue (Last 3 Years)</h6>'
      },
      // Annual Revenue 2024 and 2023 in one row
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-6',
            key: 'companyFinancials.annualRevenue2024',
            type: 'input',
            templateOptions: {
              label: 'Annual Revenue (This Year) (INR)',
              required: true,
              type: 'text',
              placeholder: '12359'
            },
            validation: {
              messages: {
                required: 'Annual revenue is required'
              }
            }
          },
          {
            className: 'col-md-6',
            key: 'companyFinancials.annualRevenue2023',
            type: 'input',
            templateOptions: {
              label: 'Annual Revenue (Last Year) (INR)',
              required: true,
              type: 'text',
              placeholder: '9876'
            },
            validation: {
              messages: {
                required: 'Annual revenue is required'
              }
            }
          }
        ]
      },
      {
        template: '<small class="text-muted d-block mb-2">Enter the exact amount in your local currency</small>'
      },
      // Annual Revenue 2022 and Credit Rating Provider in one row
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-6',
            key: 'companyFinancials.annualRevenue2022',
            type: 'input',
            templateOptions: {
              label: 'Annual Revenue (Two Years Ago) (INR)',
              required: true,
              type: 'text',
              placeholder: '09876r'
            },
            validation: {
              messages: {
                required: 'Annual revenue is required'
              }
            }
          },
          {
            className: 'col-md-6',
            key: 'companyFinancials.creditRatingProvider',
            type: 'select',
            templateOptions: {
              label: 'Credit Rating Provider',
              options: [
                { label: 'CRISIL', value: 'CRISIL' },
                { label: 'Dun & Bradstreet', value: 'D&B' },
                { label: 'Moody\'s', value: 'Moodys' },
                { label: 'Standard & Poor\'s', value: 'S&P' },
                { label: 'Fitch', value: 'Fitch' },
                { label: 'Other', value: 'Other' },
                { label: 'None', value: 'None' }
              ],
              placeholder: 'Select credit rating provider'
            }
          }
        ]
      },
      {
        template: '<small class="text-muted d-block mb-3">Enter the exact amount in your local currency / Select your credit rating provider, if any</small>'
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
        template: '<h4 class="insurance-title mt-3 mb-2 mt-6">Insurance Coverage</h4>'
      },
      // Row with General Liability and Product Liability Insurance
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-6',
            key: 'insuranceCoverage.generalLiabilityInsurance',
            type: 'input',
            templateOptions: {
              label: 'General Liability Insurance',
              placeholder: 'i-0987',
              required: true
            },
            validation: {
              messages: {
                required: 'General liability insurance coverage is required'
              }
            }
          },
          {
            className: 'col-md-6',
            key: 'insuranceCoverage.productLiabilityInsurance',
            type: 'input',
            templateOptions: {
              label: 'Product Liability Insurance',
              placeholder: '0987',
              required: true
            },
            validation: {
              messages: {
                required: 'Product liability insurance coverage is required'
              }
            }
          }
        ]
      },
      {
        template: '<small class="text-muted d-block mb-2">Coverage amount</small>'
      }
    ] as FormlyFieldConfig[];
  }

  getAdditionalInformationFields(): FormlyFieldConfig[] {
    return [
      {
        key: 'additionalInformation',
        fieldGroup: [
          // Digital Presence Section
          {
            template: `
              <div class="mt-3 mb-2">
                <h4 class="section-title">Digital Presence</h4>
              </div>
            `
          },
          {
            key: 'websites',
            fieldGroupClassName: 'row',
            fieldGroup: [
              {
                className: 'col-md-12',
                key: 'website',
                type: 'input',
                templateOptions: {
                  label: 'Company Website',
                  placeholder: 'Enter company website URL',
                  required: true
                },
                validation: {
                  messages: {
                    required: 'Company website is required'
                  }
                }
              }
            ]
          },
          
          // Operational Metrics Section
          {
            template: `
              <div class="mt-3 mb-2">
                <h4 class="section-title">Operational Metrics</h4>
              </div>
            `
          },
          {
            fieldGroupClassName: 'row',
            fieldGroup: [
              {
                className: 'col-md-6',
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
                className: 'col-md-6',
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
          
          // Production Facility
          {
            key: 'productionFacilities',
            type: 'repeat',
            templateOptions: {
              label: 'Production Facilities',
              addText: '+ Add Facility',
              min: 1
            },
            fieldArray: {
              fieldGroup: [
                {
                  expressionProperties: {
                    'template': 'return "<div class=\'mt-3 mb-1\'><h6>Facility " + (field.parent.index + 1) + "</h6></div>";'
                  }
                },
                {
                  fieldGroupClassName: 'row',
                  fieldGroup: [
                    {
                      className: 'col-md-6',
                      key: 'facilityName',
                      type: 'input',
                      templateOptions: {
                        label: 'Facility Name',
                        placeholder: 'Enter facility name',
                        required: true
                      },
                      validation: {
                        messages: {
                          required: 'Facility name is required'
                        }
                      }
                    },
                    {
                      className: 'col-md-6',
                      key: 'facilityLocation',
                      type: 'input',
                      templateOptions: {
                        label: 'Location',
                        placeholder: 'Enter facility location',
                        required: true
                      },
                      validation: {
                        messages: {
                          required: 'Facility location is required'
                        }
                      }
                    }
                  ]
                }
              ]
            }
          },
          
          // Business Terms Section
          {
            template: `
              <div class="mt-3 mb-2">
                <h4 class="section-title">Business Terms</h4>
              </div>
            `
          },
          {
            fieldGroupClassName: 'row',
            fieldGroup: [
              {
                className: 'col-md-6',
                key: 'leadTime',
                type: 'input',
                templateOptions: {
                  type: 'number',
                  label: 'Average Lead Time (Days)',
                  placeholder: 'Enter average production lead time in days',
                  min: 1,
                  required: true
                },
                validation: {
                  messages: {
                    required: 'Average lead time is required'
                  }
                }
              },
              {
                className: 'col-md-6',
                key: 'minimumOrderQuantity',
                type: 'input',
                templateOptions: {
                  type: 'number',
                  label: 'Minimum Order Quantity',
                  placeholder: 'Enter minimum order quantity',
                  min: 0,
                  required: true
                },
                validation: {
                  messages: {
                    required: 'Minimum order quantity is required'
                  }
                }
              }
            ]
          },
          
          // References Section
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
                  expressionProperties: {
                    'template': 'return "<div class=\'mt-3 mb-1\'><h6>Item " + (field.parent.index + 1) + "</h6></div>";'
                  }
                },
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
                      },
                      validation: {
                        messages: {
                          required: 'Company name is required'
                        }
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
                      },
                      validation: {
                        messages: {
                          required: 'Contact name is required'
                        }
                      }
                    }
                  ]
                },
                {
                  fieldGroupClassName: 'row',
                  fieldGroup: [
                    {
                      className: 'col-md-12',
                      key: 'email',
                      type: 'input',
                      templateOptions: {
                        type: 'email',
                        label: 'Email',
                        placeholder: 'Enter contact email',
                        required: true
                      },
                      validation: {
                        messages: {
                          required: 'Email is required'
                        }
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

  prevStep() {
    this.activeStepIndex = Math.max(0, this.activeStepIndex - 1);
  }
  
  nextStep() {
    if (this.activeStepIndex < this.steps.length - 1) {
      // First try to validate the current step
      if (this.isStepValid(this.currentFields)) {
        // If validation passes, move to the next step
        this.activeStepIndex++;
        
        // Scroll to top of form when changing steps for better UX
        if (this.isBrowser) {
          setTimeout(() => {
            const formElement = document.querySelector('.col-md-9 .card');
            if (formElement) {
              formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        }
      } else {
        // If validation fails, mark all required fields as touched to show errors
        this.markFieldsAsTouched(this.currentFields);
        
        // Show error message to user
        this.messageService.add({
          severity: 'error', 
          summary: 'Validation Error', 
          detail: 'Please fill in all required fields correctly before proceeding.'
        });
      }
    } else {
      // If this is the last step, submit the form
      this.submit();
    }
  }

  // Helper method to get a control by a possibly nested key
  getControlByKey(key: string): AbstractControl | null {
    // Handle nested keys like 'additionalInformation.websites.website'
    const path = key.toString().split('.');
    let control = this.form.get(path[0]);
    
    // Navigate through the nested form structure
    for (let i = 1; i < path.length; i++) {
      if (control && control.get) {
        control = control.get(path[i]);
      } else {
        return null;
      }
    }
    
    return control;
  }

  markFieldsAsTouched(fields: FormlyFieldConfig[]): void {
    if (fields) {
      fields.forEach(field => {
        if (field.fieldGroup) {
          this.markFieldsAsTouched(field.fieldGroup);
        } else {
          if (field.key) {
            const control = this.getControlByKey(field.key as string);
            const isRequired = field.templateOptions && field.templateOptions.required;
            if (control && isRequired) {
              control.markAsTouched();
              control.markAsDirty();
            }
          }
        }
      });
    }
  }

  isStepValid(fields: FormlyFieldConfig[]): boolean {
    let valid = true;
    const markAndCheck = (field: FormlyFieldConfig) => {
      if (field.fieldGroup) {
        field.fieldGroup.forEach(markAndCheck);
      } else if (field.key) {
        const control = this.getControlByKey(field.key as string);
        if (control) {
          // Check if a required field is empty (invalid) or if any touched field is invalid
          const isRequired = field.templateOptions && field.templateOptions.required;
          if ((isRequired && control.invalid) || 
              ((control.touched || control.dirty) && control.invalid)) {
            valid = false;
          }
        }
      }
    };
    
    fields.forEach(markAndCheck);
    return valid;
  }

  updateData(data:any) {
    // Make sure arrays are preserved in the data
    const formData = { ...data };
    
    if (!formData.additionalInformation) {
      formData.additionalInformation = {};
    }
    
    // Ensure these are arrays
    const repeatingFields = ['productionFacilities', 'references'];
    repeatingFields.forEach(field => {
      if (!Array.isArray(formData.additionalInformation[field])) {
        formData.additionalInformation[field] = 
          this.model.additionalInformation[field] || [];
      }
    });
    
    // Create final body to send
    let body = {
      supplier_company_id: sessionStorage.getItem('supplier_id'),
      onboarding_status: 'Under Review',
      company_profile: JSON.stringify(formData)
    }
    
    return body;
  }

  submit() {
    if (this.form.valid) {
      debugger
      console.log(this.model)
      // Get complete form data before submission
      const formValues = this.form.getRawValue();
      
      // Get original form model and preserve array structures
      debugger
      const fullModel = { ...this.model };
      
      // Merge with form values to ensure all data is captured
      // This will pull in the arrays properly
      const mergedData = this.mergeDeep(fullModel, formValues);
      
      console.log('Form submitted:', mergedData);
      
      let body = this.updateData(mergedData);

      // Use the existing POST or PUT methods as needed
      this.commonService.postData('/api/resource/wfb_supplier_onboarding_L3', body).subscribe((res: any) => {
        this.messageService.add({
          severity: 'success', 
          summary: 'Onboarding Complete', 
          detail: 'Thank you! Your supplier onboarding process has been completed successfully. We will review your information and contact you shortly.'
        });
        
        // Here you might redirect to a supplier dashboard or confirmation page
        setTimeout(() => {
          this.router.navigate(['/wefab/supplier/onboarding-complete']);
        }, 3000);
      }, (err: any) => {
        this.putSupplierOnboardingL3()
      });
    } else {
      this.markFieldsAsTouched(this.stepFields.flat());
      this.messageService.add({
        severity: 'error', 
        summary: 'Validation Error', 
        detail: 'Please fill in all required fields correctly.'
      });
    }
  }

  // Helper method to deeply merge objects while preserving arrays
  mergeDeep(target: any, source: any) {
    const isObject = (obj: any) => obj && typeof obj === 'object';
    
    if (!isObject(target) || !isObject(source)) {
      return source;
    }
    
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        this.mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    });
    
    return target;
  }

  putSupplierOnboardingL3() {
    if (this.form.valid) {
      // Get complete form data before submission
      const formValues = this.form.getRawValue();
      
      // Get original form model and preserve array structures
      const fullModel = { ...this.model };
      
      // Merge with form values to ensure all data is captured
      const mergedData = this.mergeDeep(fullModel, formValues);
      
      console.log('Form updated:', mergedData);
      
      let body = this.updateData(mergedData);

      this.commonService.putData('/api/resource/wfb_supplier_onboarding_L3', body).subscribe((res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Update Successful',
          detail: 'Your data has been updated successfully. We will review the changes and get back to you if necessary.'
        });
        
        // Here you might redirect to a supplier dashboard or confirmation page
        setTimeout(() => {
          this.router.navigate(['/wefab/supplier/onboarding-complete']);
        }, 3000);
      }, (err: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Submission Error',
          detail: err.error?.message || 'An error occurred while submitting the form. Please try again later.',
          life: 5000
        });
      });
    } else {
      this.markFieldsAsTouched(this.stepFields.flat());
      this.messageService.add({
        severity: 'error', 
        summary: 'Validation Error', 
        detail: 'Please fill in all required fields correctly.'
      });
    }
  }
}