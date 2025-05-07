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
      onlineMarketplaces: '',
      marketplaceProfiles: [],
      otherDigitalFootprints: [],
      totalEmployees: '',
      foundedYear: '',
      annualProductionCapacity: '',
      capacityUnit: '',
      productionFacilities: [{}],
      averageOrderFulfillmentTime: '',
      qualityControlProcess: '',
      certifications: '',
      qualityStandards: '',
      environmentalComplianceCertifications: [],
      sustainabilityInitiatives: [],
      socialResponsibilityInitiatives: [],
      diversityInclusion: [],
      sustainabilityReport: false,
      sustainabilityReportUrl: '',
      preferredPaymentTerms: '',
      paymentMethods: '',
      returnPolicy: '',
      warrantyPeriod: '',
      bulkDiscounts: false,
      bulkDiscountTiers: [],
      leadTime: '',
      minimumOrderQuantity: 0,
      references: [{}],
      shippingCapabilities: [],
      // New Supply Chain fields
      rawMaterialSources: '',
      hasEthicalSourcing: false,
      ethicalSourcingDetails: '',
      supplyChainVisibility: '',
      traceabilityMethods: [],
      inventoryManagementSystem: '',
      hasJustInTimeDelivery: false,
      riskManagementPlan: false,
      riskManagementDetails: '',
      backupSuppliers: [],
      // New Compliance fields
      industryRegulations: '',
      hasComplianceOfficer: false,
      complianceOfficerName: '',
      complianceOfficerEmail: '',
      regularComplianceAudits: false,
      lastAuditDate: null,
      regulatoryViolations: false,
      violationDetails: ''
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
    
    // Ensure all model objects are properly initialized
    if (!this.model.additionalInformation) {
      this.model.additionalInformation = {};
    }
    
    // Initialize nested objects to prevent errors
    if (!this.model.additionalInformation.websites) {
      this.model.additionalInformation.websites = { website: '', linkedinUrl: '' };
    }
    
    if (!this.model.additionalInformation.productionFacilities || 
        !this.model.additionalInformation.productionFacilities.length) {
      this.model.additionalInformation.productionFacilities = [{}];
    }
    
    if (!this.model.additionalInformation.references || 
        !this.model.additionalInformation.references.length) {
      this.model.additionalInformation.references = [{}];
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
        key: 'additionalInformation',
        fieldGroup: [
          // Digital Presence Section
          {
            template: `
              <div class="mt-4 mb-3">
                <h4 class="section-title">Digital Presence</h4>
              </div>
            `
          },
          {
            key: 'websites',
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
                className: 'col-md-12',
                key: 'onlineMarketplaces',
                type: 'select',
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
              }
            ]
          },
          {
            key: 'marketplaceProfiles',
            type: 'repeat',
            templateOptions: {
              addText: '+ Add Marketplace Profile',
              min: 0
            },
            hideExpression: (model) => !model.onlineMarketplaces,
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
          },
          
          // Operational Metrics Section
          {
            template: `
              <div class="mt-4 mb-3">
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
                }
              }
            ]
          },
          {
            fieldGroupClassName: 'row',
            fieldGroup: [
              {
                className: 'col-md-6',
                key: 'annualProductionCapacity',
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
                key: 'capacityUnit',
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
                hideExpression: (model) => !model.annualProductionCapacity
              }
            ]
          },
          {
            key: 'productionFacilities',
            type: 'repeat',
            templateOptions: {
              label: 'Production Facilities',
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
                key: 'averageOrderFulfillmentTime',
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
                key: 'qualityControlProcess',
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
          
          // ESG & Quality Section
          {
            template: `
              <div class="mt-4 mb-3">
                <h4 class="section-title">ESG & Quality Standards</h4>
              </div>
            `
          },
          {
            fieldGroupClassName: 'row',
            fieldGroup: [
              {
                className: 'col-md-6',
                key: 'certifications',
                type: 'select',
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
                key: 'qualityStandards',
                type: 'select',
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
          
          // Business Terms Section
          {
            template: `
              <div class="mt-4 mb-3">
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
                key: 'preferredPaymentTerms',
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
                key: 'paymentMethods',
                type: 'select',
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
          
          // Supply Chain Section
          {
            template: `
              <div class="mt-4 mb-3">
                <h4 class="section-title">Supply Chain Management</h4>
              </div>
            `
          },
          {
            fieldGroupClassName: 'row',
            fieldGroup: [
              {
                className: 'col-md-12',
                key: 'rawMaterialSources',
                type: 'select',
                templateOptions: {
                  label: 'Raw Material Sources',
                  options: [
                    { label: 'Direct from Manufacturers', value: 'manufacturers' },
                    { label: 'Wholesalers/Distributors', value: 'wholesalers' },
                    { label: 'Importers', value: 'importers' },
                    { label: 'Local Sources', value: 'local' },
                    { label: 'International Sources', value: 'international' },
                    { label: 'Recycled/Upcycled Sources', value: 'recycled' }
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
                key: 'supplyChainVisibility',
                type: 'select',
                templateOptions: {
                  label: 'Supply Chain Visibility',
                  options: [
                    { label: 'Tier 1 (Direct Suppliers Only)', value: 'tier1' },
                    { label: 'Tier 2 (Suppliers of Suppliers)', value: 'tier2' },
                    { label: 'Full Supply Chain Visibility', value: 'full' },
                    { label: 'Limited Visibility', value: 'limited' }
                  ],
                  required: true
                }
              },
              {
                className: 'col-md-6',
                key: 'inventoryManagementSystem',
                type: 'select',
                templateOptions: {
                  label: 'Inventory Management System',
                  options: [
                    { label: 'Just-in-Time (JIT)', value: 'jit' },
                    { label: 'Material Requirements Planning (MRP)', value: 'mrp' },
                    { label: 'Economic Order Quantity (EOQ)', value: 'eoq' },
                    { label: 'ABC Analysis', value: 'abc' },
                    { label: 'FIFO/LIFO', value: 'fifo' },
                    { label: 'Vendor-Managed Inventory (VMI)', value: 'vmi' },
                    { label: 'Other', value: 'other' }
                  ],
                  required: true
                }
              }
            ]
          },
          
          // Compliance Section
          {
            template: `
              <div class="mt-4 mb-3">
                <h4 class="section-title">Regulatory Compliance</h4>
              </div>
            `
          },
          {
            fieldGroupClassName: 'row',
            fieldGroup: [
              {
                className: 'col-md-12',
                key: 'industryRegulations',
                type: 'select',
                templateOptions: {
                  label: 'Industry Regulations Compliance *',
                  options: [
                    { label: 'ISO Standards', value: 'iso' },
                    { label: 'FDA Regulations', value: 'fda' },
                    { label: 'CE Marking', value: 'ce' },
                    { label: 'RoHS Compliance', value: 'rohs' },
                    { label: 'REACH Compliance', value: 'reach' },
                    { label: 'GDPR Compliance', value: 'gdpr' },
                    { label: 'OSHA Regulations', value: 'osha' },
                    { label: 'Local Industry Regulations', value: 'local' }
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
                key: 'hasComplianceOfficer',
                type: 'toggle',
                templateOptions: {
                  label: 'Do you have a designated compliance officer?',
                  labelPosition: 'before',
                  required: false
                }
              }
            ]
          },
          {
            fieldGroupClassName: 'row',
            hideExpression: (model) => !model.hasComplianceOfficer,
            fieldGroup: [
              {
                className: 'col-md-6',
                key: 'complianceOfficerName',
                type: 'input',
                templateOptions: {
                  label: 'Compliance Officer Name',
                  placeholder: 'Enter name of compliance officer',
                  required: false
                }
              },
              {
                className: 'col-md-6',
                key: 'complianceOfficerEmail',
                type: 'input',
                templateOptions: {
                  type: 'email',
                  label: 'Compliance Officer Email',
                  placeholder: 'Enter email of compliance officer',
                  required: false
                }
              }
            ]
          },
          
          // References Section
          {
            template: `
              <div class="mt-4 mb-3">
                <h4 class="section-title">Business References</h4>
                <p class="text-muted small">Provide references from current or past clients/partners</p>
              </div>
            `
          },
          {
            key: 'references',
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
      } else {
        // If validation fails, mark all required fields as touched to show errors
        this.markFieldsAsTouched(this.currentFields);
        
        // Log validation errors to console for debugging
        console.log('Form validation failed. Current fields:', this.currentFields);
        console.log('Form errors:', this.form.errors);
        
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