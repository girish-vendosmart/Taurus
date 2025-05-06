import { Component, OnInit, ViewChild, TemplateRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { Router } from '@angular/router';

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
        website: '',
        linkedinUrl: ''
      },
      onlineMarketplaces: [],
      marketplaceProfiles: [],
      otherDigitalFootprints: [],
      totalEmployees: '',
      foundedYear: '',
      annualProductionCapacity: '',
      capacityUnit: '',
      productionFacilities: [{}],
      averageOrderFulfillmentTime: '',
      qualityControlProcess: '',
      certifications: [],
      qualityStandards: [],
      environmentalComplianceCertifications: [],
      sustainabilityInitiatives: [],
      socialResponsibilityInitiatives: [],
      diversityInclusion: [],
      sustainabilityReport: false,
      sustainabilityReportUrl: '',
      preferredPaymentTerms: '',
      paymentMethods: [],
      returnPolicy: '',
      warrantyPeriod: '',
      bulkDiscounts: false,
      bulkDiscountTiers: [],
      leadTime: '',
      minimumOrderQuantity: 0,
      references: [{}],
      shippingCapabilities: []
    },
    termsAndConditions: {
      acceptTerms: false,
      acceptPrivacyPolicy: false
    }
  };
  options: FormlyFormOptions = {};
  
  activeStepIndex = 0;
  steps: MenuItem[] = [];
  
  // Active tab index for Additional Information subtabs
  additionalInfoTabIndex = 0;
  
  // Create arrays of field configurations for each step
  stepFields: FormlyFieldConfig[][] = [];
  
  isBrowser: boolean;
  
  constructor(
    private fb: FormBuilder, 
    private messageService: MessageService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.form = this.fb.group({});
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
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
          <p class="text-machine-gray mb-4">Share your financial details to improve matching with potential clients</p>
        `
      },
      // Info section
      {
        template: `
          <div class="info-container mb-4">
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
        template: '<h4 class="financial-overview-title mb-3">Financial Overview</h4>'
      },
      {
        template: '<h6 class="annual-revenue-title mb-2">Annual Revenue (Last 3 Years)</h6>'
      },
      // Annual Revenue 2024 and 2023 in one row
      {
        fieldGroupClassName: 'row mb-3',
        fieldGroup: [
          {
            className: 'col-md-6',
            key: 'companyFinancials.annualRevenue2024',
            type: 'input',
            templateOptions: {
              label: 'Annual Revenue (2024) (USD) *',
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
              label: 'Annual Revenue (2023) (USD) *',
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
        template: '<small class="text-muted d-block mb-3">Enter the exact amount in your local currency</small>'
      },
      // Annual Revenue 2022 and Credit Rating Provider in one row
      {
        fieldGroupClassName: 'row mb-3',
        fieldGroup: [
          {
            className: 'col-md-6',
            key: 'companyFinancials.annualRevenue2022',
            type: 'input',
            templateOptions: {
              label: 'Annual Revenue (2022) (USD) *',
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
        template: '<small class="text-muted d-block mb-4">Enter the exact amount in your local currency / Select your credit rating provider, if any</small>'
      },
      
      // Tax Compliance
      {
        key: 'companyFinancials.taxCompliant',
        type: 'checkbox',
        className: 'mb-4',
        templateOptions: {
          label: 'We are compliant with all applicable tax regulations',
          required: true
        }
      },
      
      // Insurance Coverage Section
      {
        template: '<h4 class="insurance-title mt-4 mb-3">Insurance Coverage</h4>'
      },
      // Row with General Liability and Product Liability Insurance
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-6 mb-3',
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
            className: 'col-md-6 mb-3',
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
        template: '<small class="text-muted d-block mb-3">Coverage amount</small>'
      }
    ] as FormlyFieldConfig[];
  }

  getAdditionalInformationFields(): FormlyFieldConfig[] {
    return [
      {
        fieldGroupClassName: 'mt-2',
        fieldGroup: [
          {
            template: `
              <h3 class="form-section-title">Additional Information</h3>
              <p class="form-section-description">Please provide additional details about your company to help us understand your business better.</p>
            `
          },
          {
            key: 'additionalInformation',
            type: 'primeng-custom',
            wrappers: ['card-wrapper'],
            templateOptions: {
              label: 'Additional Details',
            },
            fieldGroup: [
              {
                template: `
                  <div class="additional-info-tabs">
                    <p-tabView [(activeIndex)]="additionalInfoTabIndex">
                      <p-tabPanel header="Digital Presence">
                        <div class="tab-content-wrapper">
                          <h4 class="tab-content-title">Digital Presence</h4>
                          <div class="digital-presence-section">
                            <formly-field [field]="field.fieldGroup[1]"></formly-field>
                            <formly-field [field]="field.fieldGroup[2]"></formly-field>
                            <formly-field [field]="field.fieldGroup[3]"></formly-field>
                          </div>
                        </div>
                      </p-tabPanel>
                      <p-tabPanel header="Operational Metrics">
                        <div class="tab-content-wrapper">
                          <h4 class="tab-content-title">Operational Metrics</h4>
                          <div class="operational-metrics-section">
                            <formly-field [field]="field.fieldGroup[4]"></formly-field>
                            <formly-field [field]="field.fieldGroup[5]"></formly-field>
                          </div>
                        </div>
                      </p-tabPanel>
                      <p-tabPanel header="ESG & Quality">
                        <div class="tab-content-wrapper">
                          <h4 class="tab-content-title">ESG & Quality Standards</h4>
                          <div class="esg-quality-section">
                            <formly-field [field]="field.fieldGroup[6]"></formly-field>
                            <formly-field [field]="field.fieldGroup[7]"></formly-field>
                            <formly-field [field]="field.fieldGroup[8]"></formly-field>
                          </div>
                        </div>
                      </p-tabPanel>
                      <p-tabPanel header="Business Terms">
                        <div class="tab-content-wrapper">
                          <h4 class="tab-content-title">Business Terms</h4>
                          <div class="business-terms-section">
                            <formly-field [field]="field.fieldGroup[9]"></formly-field>
                            <formly-field [field]="field.fieldGroup[10]"></formly-field>
                            <formly-field [field]="field.fieldGroup[11]"></formly-field>
                            <formly-field [field]="field.fieldGroup[12]"></formly-field>
                            <formly-field [field]="field.fieldGroup[13]"></formly-field>
                          </div>
                        </div>
                      </p-tabPanel>
                    </p-tabView>
                  </div>
                `
              },
              // Digital Presence tab content
              {
                key: 'additionalInformation.websites',
                fieldGroupClassName: 'row',
                fieldGroup: [
                  {
                    className: 'col-md-6',
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
                  },
                  {
                    className: 'col-md-6',
                    key: 'linkedinUrl',
                    type: 'input',
                    templateOptions: {
                      label: 'LinkedIn URL',
                      placeholder: 'Enter your company LinkedIn URL',
                      required: false
                    }
                  }
                ]
              },
              {
                fieldGroupClassName: 'row',
                fieldGroup: [
                  {
                    className: 'col-md-6',
                    key: 'additionalInformation.onlineMarketplaces',
                    type: 'multicheckbox',
                    templateOptions: {
                      label: 'Online Marketplaces',
                      options: [
                        { label: 'Amazon', value: 'amazon' },
                        { label: 'Alibaba', value: 'alibaba' },
                        { label: 'eBay', value: 'ebay' },
                        { label: 'Indiamart', value: 'indiamart' },
                        { label: 'TradeIndia', value: 'tradeindia' },
                        { label: 'Other', value: 'other' }
                      ],
                      required: false
                    }
                  },
                  {
                    className: 'col-md-6',
                    key: 'additionalInformation.marketplaceProfiles',
                    type: 'repeat',
                    templateOptions: {
                      addText: '+ Add Marketplace Profile',
                      min: 0
                    },
                    hideExpression: (model) => !model.additionalInformation.onlineMarketplaces || model.additionalInformation.onlineMarketplaces.length === 0,
                    fieldArray: {
                      fieldGroupClassName: 'row',
                      fieldGroup: [
                        {
                          className: 'col-md-6',
                          key: 'marketplace',
                          type: 'select',
                          templateOptions: {
                            label: 'Marketplace',
                            options: [
                              { label: 'Amazon', value: 'amazon' },
                              { label: 'Alibaba', value: 'alibaba' },
                              { label: 'eBay', value: 'ebay' },
                              { label: 'Indiamart', value: 'indiamart' },
                              { label: 'TradeIndia', value: 'tradeindia' },
                              { label: 'Other', value: 'other' }
                            ],
                            required: true
                          }
                        },
                        {
                          className: 'col-md-6',
                          key: 'profileUrl',
                          type: 'input',
                          templateOptions: {
                            label: 'Profile URL',
                            placeholder: 'Enter marketplace profile URL',
                            required: true
                          }
                        }
                      ]
                    }
                  }
                ]
              },
              {
                template: `
                  <div class="mt-4 mb-2">
                    <h5>Other Digital Footprints</h5>
                    <p class="text-muted small">Add any other social media profiles or digital platforms where your company is present</p>
                  </div>
                `
              },
              {
                key: 'additionalInformation.otherDigitalFootprints',
                type: 'repeat',
                templateOptions: {
                  addText: '+ Add Digital Footprint',
                  min: 0
                },
                fieldArray: {
                  fieldGroupClassName: 'row align-items-center',
                  fieldGroup: [
                    {
                      className: 'col-md-4',
                      key: 'platform',
                      type: 'select',
                      templateOptions: {
                        label: 'Platform',
                        options: [
                          { label: 'Facebook', value: 'facebook' },
                          { label: 'Twitter', value: 'twitter' },
                          { label: 'Instagram', value: 'instagram' },
                          { label: 'YouTube', value: 'youtube' },
                          { label: 'Other', value: 'other' }
                        ],
                        required: true
                      }
                    },
                    {
                      className: 'col-md-8',
                      key: 'url',
                      type: 'input',
                      templateOptions: {
                        label: 'URL',
                        placeholder: 'Enter URL',
                        required: true
                      }
                    }
                  ]
                }
              },
              
              // Operational Metrics tab content
              {
                fieldGroupClassName: 'row',
                fieldGroup: [
                  {
                    className: 'col-md-6',
                    key: 'additionalInformation.totalEmployees',
                    type: 'input',
                    templateOptions: {
                      type: 'number',
                      label: 'Total Number of Employees',
                      placeholder: 'Enter number of employees',
                      min: 1,
                      required: true
                    }
                  },
                  {
                    className: 'col-md-6',
                    key: 'additionalInformation.foundedYear',
                    type: 'input',
                    templateOptions: {
                      type: 'number',
                      label: 'Year Founded',
                      placeholder: 'Enter year company was founded',
                      min: 1900,
                      max: new Date().getFullYear(),
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
                    key: 'additionalInformation.annualProductionCapacity',
                    type: 'input',
                    templateOptions: {
                      type: 'number',
                      label: 'Annual Production Capacity',
                      placeholder: 'Enter annual production capacity',
                      min: 0,
                      required: true
                    }
                  },
                  {
                    className: 'col-md-6',
                    key: 'additionalInformation.capacityUnit',
                    type: 'select',
                    templateOptions: {
                      label: 'Capacity Unit',
                      options: [
                        { label: 'Units', value: 'units' },
                        { label: 'Tons', value: 'tons' },
                        { label: 'Kilograms', value: 'kg' },
                        { label: 'Meters', value: 'meters' },
                        { label: 'Square Meters', value: 'sqm' }
                      ],
                      required: true
                    },
                    hideExpression: (model) => !model.additionalInformation.annualProductionCapacity
                  }
                ]
              },
              {
                template: `
                  <div class="mt-4 mb-3">
                    <h5>Production Facilities</h5>
                    <p class="text-muted small">Add information about your production facilities</p>
                  </div>
                `
              },
              {
                key: 'additionalInformation.productionFacilities',
                type: 'repeat',
                templateOptions: {
                  addText: '+ Add Production Facility',
                  min: 1
                },
                fieldArray: {
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
                      }
                    },
                    {
                      className: 'col-md-6',
                      key: 'facilitySize',
                      type: 'input',
                      templateOptions: {
                        type: 'number',
                        label: 'Facility Size (sq. m)',
                        placeholder: 'Enter facility size in square meters',
                        min: 1,
                        required: true
                      }
                    },
                    {
                      className: 'col-md-6',
                      key: 'employeeCount',
                      type: 'input',
                      templateOptions: {
                        type: 'number',
                        label: 'Number of Employees',
                        placeholder: 'Enter number of employees at this facility',
                        min: 1,
                        required: true
                      }
                    }
                  ]
                }
              },
              {
                fieldGroupClassName: 'row',
                fieldGroup: [
                  {
                    className: 'col-md-6',
                    key: 'additionalInformation.averageOrderFulfillmentTime',
                    type: 'input',
                    templateOptions: {
                      type: 'number',
                      label: 'Average Order Fulfillment Time (Days)',
                      placeholder: 'Enter average days to fulfill an order',
                      min: 1,
                      required: true
                    }
                  },
                  {
                    className: 'col-md-6',
                    key: 'additionalInformation.qualityControlProcess',
                    type: 'select',
                    templateOptions: {
                      label: 'Quality Control Process',
                      options: [
                        { label: 'In-house QC Team', value: 'inhouse' },
                        { label: 'Third-party QC', value: 'thirdparty' },
                        { label: 'Both In-house and Third-party', value: 'both' },
                        { label: 'Automated QC Systems', value: 'automated' },
                        { label: 'Other', value: 'other' }
                      ],
                      required: true
                    }
                  }
                ]
              },
              
              // ESG & Quality tab content
              {
                fieldGroupClassName: 'row',
                fieldGroup: [
                  {
                    className: 'col-md-6',
                    key: 'additionalInformation.certifications',
                    type: 'multicheckbox',
                    templateOptions: {
                      label: 'Quality Certifications',
                      options: [
                        { label: 'ISO 9001', value: 'iso9001' },
                        { label: 'ISO 14001', value: 'iso14001' },
                        { label: 'OHSAS 18001', value: 'ohsas18001' },
                        { label: 'TS 16949', value: 'ts16949' },
                        { label: 'AS9100', value: 'as9100' }
                      ],
                      required: false
                    }
                  },
                  {
                    className: 'col-md-6',
                    key: 'additionalInformation.qualityStandards',
                    type: 'multicheckbox',
                    templateOptions: {
                      label: 'Quality Standards',
                      options: [
                        { label: 'Six Sigma', value: 'sixSigma' },
                        { label: 'Lean Manufacturing', value: 'lean' },
                        { label: 'Total Quality Management', value: 'tqm' },
                        { label: 'Kaizen', value: 'kaizen' },
                        { label: '5S Methodology', value: '5s' }
                      ],
                      required: false
                    }
                  }
                ]
              },
              {
                fieldGroupClassName: 'row',
                fieldGroup: [
                  {
                    className: 'col-md-6',
                    key: 'additionalInformation.environmentalComplianceCertifications',
                    type: 'multicheckbox',
                    templateOptions: {
                      label: 'Environmental Compliance',
                      options: [
                        { label: 'ISO 14001', value: 'iso14001' },
                        { label: 'EMAS', value: 'emas' },
                        { label: 'Carbon Trust Standard', value: 'carbontrust' },
                        { label: 'Forest Stewardship Council', value: 'fsc' },
                        { label: 'Rainforest Alliance', value: 'rainforest' },
                        { label: 'Green Seal', value: 'greenseal' }
                      ],
                      required: false
                    }
                  },
                  {
                    className: 'col-md-6',
                    key: 'additionalInformation.sustainabilityInitiatives',
                    type: 'multicheckbox',
                    templateOptions: {
                      label: 'Sustainability Initiatives',
                      options: [
                        { label: 'Carbon Footprint Reduction', value: 'carbonReduction' },
                        { label: 'Waste Management', value: 'wasteManagement' },
                        { label: 'Water Conservation', value: 'waterConservation' },
                        { label: 'Renewable Energy', value: 'renewableEnergy' },
                        { label: 'Sustainable Sourcing', value: 'sustainableSourcing' }
                      ],
                      required: false
                    }
                  }
                ]
              },
              {
                fieldGroupClassName: 'row',
                fieldGroup: [
                  {
                    className: 'col-md-6',
                    key: 'additionalInformation.socialResponsibilityInitiatives',
                    type: 'multicheckbox',
                    templateOptions: {
                      label: 'Social Responsibility',
                      options: [
                        { label: 'Fair Trade Practices', value: 'fairTrade' },
                        { label: 'Ethical Labor Practices', value: 'ethicalLabor' },
                        { label: 'Community Development', value: 'communityDev' },
                        { label: 'Education Programs', value: 'education' },
                        { label: 'Health Initiatives', value: 'health' }
                      ],
                      required: false
                    }
                  },
                  {
                    className: 'col-md-6',
                    key: 'additionalInformation.diversityInclusion',
                    type: 'multicheckbox',
                    templateOptions: {
                      label: 'Diversity & Inclusion',
                      options: [
                        { label: 'Gender Equality', value: 'gender' },
                        { label: 'Diverse Workforce', value: 'diverse' },
                        { label: 'Disability Inclusion', value: 'disability' },
                        { label: 'Minority-Owned Business', value: 'minority' },
                        { label: 'Veteran-Owned Business', value: 'veteran' }
                      ],
                      required: false
                    }
                  }
                ]
              },
              {
                fieldGroupClassName: 'row',
                fieldGroup: [
                  {
                    className: 'col-12',
                    key: 'additionalInformation.sustainabilityReport',
                    type: 'toggle',
                    templateOptions: {
                      label: 'Do you publish a sustainability report?',
                      labelPosition: 'before',
                      required: false
                    }
                  },
                  {
                    className: 'col-12 mt-3',
                    key: 'additionalInformation.sustainabilityReportUrl',
                    type: 'input',
                    templateOptions: {
                      label: 'Sustainability Report URL',
                      placeholder: 'Enter URL of your latest sustainability report',
                      required: false
                    },
                    hideExpression: (model) => !model.additionalInformation.sustainabilityReport
                  }
                ]
              },
              
              // Business Terms tab content
              {
                fieldGroupClassName: 'row',
                fieldGroup: [
                  {
                    className: 'col-md-6',
                    key: 'additionalInformation.leadTime',
                    type: 'input',
                    templateOptions: {
                      type: 'number',
                      label: 'Average Lead Time (Days)',
                      placeholder: 'Enter average production lead time in days',
                      min: 1,
                      required: true
                    }
                  },
                  {
                    className: 'col-md-6',
                    key: 'additionalInformation.minimumOrderQuantity',
                    type: 'input',
                    templateOptions: {
                      type: 'number',
                      label: 'Minimum Order Quantity',
                      placeholder: 'Enter minimum order quantity',
                      min: 1,
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
                    key: 'additionalInformation.preferredPaymentTerms',
                    type: 'select',
                    templateOptions: {
                      label: 'Preferred Payment Terms',
                      options: [
                        { label: 'Net 30', value: 'net30' },
                        { label: 'Net 60', value: 'net60' },
                        { label: 'Net 90', value: 'net90' },
                        { label: 'Advance Payment', value: 'advance' },
                        { label: 'Letter of Credit', value: 'loc' },
                        { label: 'Other', value: 'other' }
                      ],
                      required: true
                    }
                  },
                  {
                    className: 'col-md-6',
                    key: 'additionalInformation.paymentMethods',
                    type: 'multicheckbox',
                    templateOptions: {
                      label: 'Accepted Payment Methods',
                      options: [
                        { label: 'Bank Transfer', value: 'bankTransfer' },
                        { label: 'Credit Card', value: 'creditCard' },
                        { label: 'PayPal', value: 'paypal' },
                        { label: 'Letter of Credit', value: 'loc' },
                        { label: 'Escrow', value: 'escrow' }
                      ],
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
                    key: 'additionalInformation.returnPolicy',
                    type: 'select',
                    templateOptions: {
                      label: 'Return Policy',
                      options: [
                        { label: 'No returns accepted', value: 'noReturns' },
                        { label: 'Returns accepted with conditions', value: 'conditional' },
                        { label: 'Returns accepted within 30 days', value: '30days' },
                        { label: 'Case-by-case basis', value: 'caseByCase' }
                      ],
                      required: true
                    }
                  },
                  {
                    className: 'col-md-6',
                    key: 'additionalInformation.warrantyPeriod',
                    type: 'select',
                    templateOptions: {
                      label: 'Warranty Period',
                      options: [
                        { label: 'No warranty', value: 'none' },
                        { label: '3 months', value: '3months' },
                        { label: '6 months', value: '6months' },
                        { label: '1 year', value: '1year' },
                        { label: '2 years', value: '2years' },
                        { label: '3+ years', value: '3+years' }
                      ],
                      required: true
                    }
                  }
                ]
              },
              {
                fieldGroupClassName: 'row',
                fieldGroup: [
                  {
                    className: 'col-md-12',
                    key: 'additionalInformation.bulkDiscounts',
                    type: 'toggle',
                    templateOptions: {
                      label: 'Do you offer bulk order discounts?',
                      labelPosition: 'before',
                      required: false
                    }
                  }
                ]
              },
              {
                key: 'additionalInformation.bulkDiscountTiers',
                type: 'repeat',
                templateOptions: {
                  addText: '+ Add Discount Tier',
                  min: 0
                },
                hideExpression: (model) => !model.additionalInformation.bulkDiscounts,
                fieldArray: {
                  fieldGroupClassName: 'row',
                  fieldGroup: [
                    {
                      className: 'col-md-4',
                      key: 'quantity',
                      type: 'input',
                      templateOptions: {
                        type: 'number',
                        label: 'Quantity Threshold',
                        placeholder: 'Enter quantity',
                        min: 1,
                        required: true
                      }
                    },
                    {
                      className: 'col-md-4',
                      key: 'discountPercentage',
                      type: 'input',
                      templateOptions: {
                        type: 'number',
                        label: 'Discount (%)',
                        placeholder: 'Enter discount percentage',
                        min: 1,
                        max: 100,
                        required: true
                      }
                    },
                    {
                      className: 'col-md-4',
                      key: 'conditions',
                      type: 'input',
                      templateOptions: {
                        label: 'Conditions (Optional)',
                        placeholder: 'Any conditions for this tier',
                        required: false
                      }
                    }
                  ]
                }
              },
              {
                key: 'additionalInformation.shippingCapabilities',
                type: 'multicheckbox',
                templateOptions: {
                  label: 'Shipping Capabilities',
                  options: [
                    { label: 'Air Freight', value: 'air' },
                    { label: 'Ocean Freight', value: 'ocean' },
                    { label: 'Road Transport', value: 'road' },
                    { label: 'Rail Transport', value: 'rail' },
                    { label: 'Express Delivery', value: 'express' }
                  ],
                  required: true
                }
              },
              {
                template: `
                  <div class="mt-4 mb-2">
                    <h5>Business References</h5>
                    <p class="text-muted small">Provide references from current or past clients/partners</p>
                  </div>
                `
              },
              {
                key: 'additionalInformation.references',
                type: 'repeat',
                templateOptions: {
                  addText: '+ Add Reference',
                  min: 1
                },
                fieldArray: {
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
                    },
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
                    },
                    {
                      className: 'col-md-6',
                      key: 'phone',
                      type: 'input',
                      templateOptions: {
                        label: 'Phone',
                        placeholder: 'Enter contact phone number',
                        required: false
                      }
                    },
                    {
                      className: 'col-md-12',
                      key: 'relationship',
                      type: 'textarea',
                      templateOptions: {
                        label: 'Relationship Description',
                        placeholder: 'Describe your business relationship with this reference',
                        rows: 3,
                        required: false
                      }
                    }
                  ]
                }
              }
            ]
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
      if (this.isStepValid(this.currentFields)) {
        this.activeStepIndex++;
      } else {
        this.markFieldsAsTouched(this.currentFields);
        this.messageService.add({
          severity: 'error', 
          summary: 'Validation Error', 
          detail: 'Please fill in all required fields correctly before proceeding.'
        });
      }
    } else {
      this.submit();
    }
  }

  markFieldsAsTouched(fields: FormlyFieldConfig[]): void {
    if (fields) {
      fields.forEach(field => {
        if (field.fieldGroup) {
          this.markFieldsAsTouched(field.fieldGroup);
        } else {
          if (field.key) {
            const control = this.form.get(field.key as string);
            if (control) {
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
        const control = this.form.get(field.key as string);
        if (control && (control.invalid && (control.touched || control.dirty))) {
          valid = false;
        }
      }
    };
    
    fields.forEach(markAndCheck);
    return valid;
  }

  submit() {
    if (this.form.valid) {
      // In a real application, you would send the form data to a server here
      console.log('Form submitted:', this.model);
      
      this.messageService.add({
        severity: 'success', 
        summary: 'Onboarding Complete', 
        detail: 'Thank you! Your supplier onboarding process has been completed successfully. We will review your information and contact you shortly.'
      });
      
      // Here you might redirect to a supplier dashboard or confirmation page
      setTimeout(() => {
        this.router.navigate(['/wefab/supplier']);
      }, 3000);
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