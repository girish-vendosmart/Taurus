import { Component, OnInit, ViewChild, TemplateRef, Inject, PLATFORM_ID, HostListener } from '@angular/core';
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
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { TabViewModule } from 'primeng/tabview';
import { TabMenuModule } from 'primeng/tabmenu';

import { SweetAlertService } from '../../../../shared/services/sweet-alert.service';

// Import Components
import { FileUploadComponent } from '../supplier-onboarding/file-upload.component';
import { BankVerifyFieldComponent } from './bank-verify-field.component';
import { FormlyFieldBankVerifyComponent } from '../../../../shared/formly-components/bank-verify-type.component';
import { FormlyRepeatTypeComponent } from '../../../../shared/formly-components/formly-repeat-type.component';
import { FormlyFieldFileUploadComponent } from '../../../../shared/formly-components/file-upload-type.component';
import { FormlyFieldRangeSliderComponent } from '../../../../shared/formly-components/range-slider-type.component';
import { FormlyFieldDropdownComponent } from '../../../../shared/formly-components/dropdown-type.component';

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
    FormlyFieldDropdownComponent,
    BankVerifyFieldComponent,
    FormlyFieldBankVerifyComponent
  ],
  providers: [MessageService],
  templateUrl: './supplier-onboarding-l3.component.html',
  styleUrl: './supplier-onboarding-l3.component.scss'
})
export class SupplierOnboardingL3Component implements OnInit {
  form: FormGroup;
  model: any = {
    bankDetails: {
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      accountType: 'Current',
      branchName: ''
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
  
  // Bank verification state
  bankVerified = false;
  
  constructor(
    private fb: FormBuilder, 
    private messageService: MessageService,
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
    this.isMobile = window.innerWidth < 768;
  }

  // Number formatting function for currency inputs - Indian format
  formatNumber(value: string): string {
    if (!value) return '';
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    // Convert to number and format with Indian comma system
    const number = parseFloat(numericValue);
    if (isNaN(number)) return '';
    return this.formatIndianCurrency(number);
  }

  // Indian currency formatting function
  formatIndianCurrency(num: number): string {
    const numStr = num.toString();
    const [integerPart, decimalPart] = numStr.split('.');
    
    if (integerPart.length <= 3) {
      return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
    }
    
    // Indian number system: last 3 digits, then groups of 2
    const lastThree = integerPart.slice(-3);
    const remaining = integerPart.slice(0, -3);
    
    // Add commas every 2 digits from right to left for the remaining part
    const formattedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    
    const result = formattedRemaining + ',' + lastThree;
    return decimalPart ? `${result}.${decimalPart}` : result;
  }

  // Parse formatted number back to numeric string
  parseFormattedNumber(value: string): string {
    if (!value) return '';
    return value.replace(/,/g, '');
  }

  // Number input validation function
  validateNumberInput(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    // Allow: backspace, delete, tab, escape, enter, decimal point
    if ([8, 9, 27, 13, 46].indexOf(charCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (charCode === 65 && event.ctrlKey) ||
        (charCode === 67 && event.ctrlKey) ||
        (charCode === 86 && event.ctrlKey) ||
        (charCode === 88 && event.ctrlKey)) {
      return true;
    }
    // Ensure that it is a number and stop the keypress
    if ((charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
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
      const supplierId = localStorage.getItem('supplier_id');
      if (supplierId) {
        this.getL3Data(supplierId);
      } else {
        this.sweetAlert.error('Supplier ID not found. Please try again.');
        this.router.navigate(['/wefab/supplier/supplier-verification']);
      }
    } else {
      const supplierId = localStorage.getItem('supplier_id');
      if (supplierId) {
        this.getL3Data(supplierId);
      } else {
        this.sweetAlert.error('Supplier ID not found. Please try again.');
      }
    }
  }

  getL3Data(supplierId:any) {
    let endPoint = '/api/resource/Supplier Onboarding L3/' + supplierId
      this.commonService.getData(endPoint).subscribe((res: any) => {
        
        this.getFinancialData = JSON.parse(res.data.company_profile)
        
        // Load bank verification status from the API response
        this.bankVerified = res.data.bank_verified || false;
        
        console.log('L3 Data response:', res);
        console.log('Bank verified status:', this.bankVerified);
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
    
    // Ensure bank verification field is properly initialized
    if (this.model.bankDetails && !this.model.bankDetails.verification) {
      this.model.bankDetails.verification = {
        accountNumber: this.model.bankDetails.accountNumber || '',
        ifscCode: this.model.bankDetails.ifscCode || ''
      };
    }
    
    // Format numbers for display when loading existing data
    if (this.model.companyFinancials) {
      if (this.model.companyFinancials.annualRevenue2024) {
        this.model.companyFinancials.annualRevenue2024 = this.formatIndianCurrency(Number(this.model.companyFinancials.annualRevenue2024));
      }
      if (this.model.companyFinancials.annualRevenue2023) {
        this.model.companyFinancials.annualRevenue2023 = this.formatIndianCurrency(Number(this.model.companyFinancials.annualRevenue2023));
      }
      if (this.model.companyFinancials.annualRevenue2022) {
        this.model.companyFinancials.annualRevenue2022 = this.formatIndianCurrency(Number(this.model.companyFinancials.annualRevenue2022));
      }
    }
    
    if (this.model.insuranceCoverage) {
      if (this.model.insuranceCoverage.generalLiabilityInsurance) {
        this.model.insuranceCoverage.generalLiabilityInsurance = this.formatIndianCurrency(Number(this.model.insuranceCoverage.generalLiabilityInsurance));
      }
      if (this.model.insuranceCoverage.productLiabilityInsurance) {
        this.model.insuranceCoverage.productLiabilityInsurance = this.formatIndianCurrency(Number(this.model.insuranceCoverage.productLiabilityInsurance));
      }
    }
    
    // Ensure arrays are properly initialized
    if (!this.model.additionalInformation.references || 
        !Array.isArray(this.model.additionalInformation.references) || 
        this.model.additionalInformation.references.length === 0) {
      this.model.additionalInformation.references = [{
        companyName: '',
        contactName: '',
        email: ''
      }];
    }
    
    // Force change detection
    this.cdr.detectChanges();
    
    // Update bank verification status after patching
    this.updateBankFieldVerificationStatus();
    
    // Mark form as pristine after patching values
    setTimeout(() => {
      this.form.markAsPristine();
      console.log('Form patched with stored data:', this.model);
    });
  }

  // Method to update bank field verification status
  updateBankFieldVerificationStatus() {
    if (this.stepFields && this.stepFields.length > 0) {
      const financialFields = this.stepFields[0];
      
      // Find the bank verification field
      const bankField = financialFields.find((field: any) => field.key === 'bankDetails.verification');
      
      if (bankField && bankField.templateOptions) {
        // Update the isVerified status
        bankField.templateOptions['isVerified'] = this.bankVerified;
        console.log('Updated bank field verification status to:', this.bankVerified);
        
        // Force update the UI
        setTimeout(() => {
          if (bankField.formControl) {
            bankField.formControl.updateValueAndValidity();
          }
          // Force change detection
          this.cdr.detectChanges();
        });
      }
    }
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
          <h3 class=" mb-2">Financial Information</h3>
          <p class="text-machine-gray mb-3">Share your financial details to improve matching with potential clients</p>
        `
      },
      // Bank Details Section
      {
        template: '<h4 class="bank-details-title mb-2 mt-4">Bank Details</h4>'
      },
      {
        template: '<p class="text-muted small mb-3">Provide your primary business bank account details for payment processing</p>'
      },
      // Bank Name, Branch Name, and Account Type in one row
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-4',
            key: 'bankDetails.bankName',
            type: 'input',
            templateOptions: {
              label: 'Bank Name',
              required: true,
              placeholder: 'Enter your bank name'
            },
            validation: {
              messages: {
                required: 'Bank name is required'
              }
            }
          },
          {
            className: 'col-md-4',
            key: 'bankDetails.branchName',
            type: 'input',
            templateOptions: {
              label: 'Branch Name',
              required: true,
              placeholder: 'Enter branch name'
            },
            validation: {
              messages: {
                required: 'Branch name is required'
              }
            }
          },
          {
            className: 'col-md-4',
            key: 'bankDetails.accountType',
            type: 'select',
            templateOptions: {
              label: 'Account Type',
              required: true,
              options: [
                { label: 'Current Account', value: 'Current' },
                { label: 'Savings Account', value: 'Savings' },
                { label: 'Business Account', value: 'Business' }
              ],
              placeholder: 'Select account type'
            },
            validation: {
              messages: {
                required: 'Account type is required'
              }
            }
          },
        ]
      },
      // Account Holder Name
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-6',
            key: 'bankDetails.accountHolderName',
            type: 'input',
            templateOptions: {
              label: 'Account Holder Name',
              required: true,
              placeholder: 'Enter account holder name'
            },
            validation: {
              messages: {
                required: 'Account holder name is required'
              }
            }
          },
        ]
      },
      // Bank Verification Section
      {
        template: '<h5 class="bank-verification-title mb-2 mt-3">Account Verification</h5>'
      },
      {
        template: '<p class="text-muted small mb-3">Verify your bank account details to enable secure payments</p>'
      },
      {
        key: 'bankDetails.verification',
        type: 'bank-verify',
        templateOptions: {
          parentComponent: this,
          isVerified: this.bankVerified
        },
        expressionProperties: {
          'templateOptions.isVerified': () => this.bankVerified
        }
      },
      // Financial Overview Section
      {
        template: '<h4 class="financial-overview-title mb-2 mt-4">Financial Overview (Last 3 Years)</h4>'
      },
      // Annual Revenue 2024 and 2023 in one row with number formatting
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
              placeholder: 'Enter current year revenue amount (e.g., 1,00,000)',
              pattern: '^[0-9,]+$'
            },
            hooks: {
              onInit: (field: any) => {
                if (field.formControl) {
                  // Format on value changes
                  field.formControl.valueChanges.subscribe((value: string) => {
                    if (value && value.length > 0) {
                      const numericValue = value.replace(/[^\d]/g, '');
                      if (numericValue && !isNaN(Number(numericValue))) {
                        const formatted = this.formatIndianCurrency(Number(numericValue));
                        if (formatted !== value) {
                          field.formControl.setValue(formatted, { emitEvent: false });
                        }
                      }
                    }
                  });
                }
              }
            },
            validators: {
              numberOnly: {
                expression: (c: AbstractControl) => {
                  if (!c.value) return true;
                  const numericValue = c.value.toString().replace(/[^\d]/g, '');
                  return /^\d+$/.test(numericValue);
                },
                message: 'Please enter only numbers'
              }
            },
            validation: {
              messages: {
                required: 'Annual revenue is required',
                pattern: 'Please enter a valid amount'
              }
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
              placeholder: 'Enter last year revenue amount (e.g., 1,00,000)',
              pattern: '^[0-9,]+$'
            },
            hooks: {
              onInit: (field: any) => {
                if (field.formControl) {
                  // Format on value changes
                  field.formControl.valueChanges.subscribe((value: string) => {
                    if (value && value.length > 0) {
                      const numericValue = value.replace(/[^\d]/g, '');
                      if (numericValue && !isNaN(Number(numericValue))) {
                        const formatted = this.formatIndianCurrency(Number(numericValue));
                        if (formatted !== value) {
                          field.formControl.setValue(formatted, { emitEvent: false });
                        }
                      }
                    }
                  });
                }
              }
            },
            validators: {
              numberOnly: {
                expression: (c: AbstractControl) => {
                  if (!c.value) return true;
                  const numericValue = c.value.toString().replace(/[^\d]/g, '');
                  return /^\d+$/.test(numericValue);
                },
                message: 'Please enter only numbers'
              }
            },
            validation: {
              messages: {
                required: 'Annual revenue is required',
                pattern: 'Please enter a valid amount'
              }
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
              placeholder: 'Enter two years ago revenue amount (e.g., 1,00,000)',
              pattern: '^[0-9,]+$'
            },
            hooks: {
              onInit: (field: any) => {
                if (field.formControl) {
                  // Format on value changes
                  field.formControl.valueChanges.subscribe((value: string) => {
                    if (value && value.length > 0) {
                      const numericValue = value.replace(/[^\d]/g, '');
                      if (numericValue && !isNaN(Number(numericValue))) {
                        const formatted = this.formatIndianCurrency(Number(numericValue));
                        if (formatted !== value) {
                          field.formControl.setValue(formatted, { emitEvent: false });
                        }
                      }
                    }
                  });
                }
              }
            },
            validators: {
              numberOnly: {
                expression: (c: AbstractControl) => {
                  if (!c.value) return true;
                  const numericValue = c.value.toString().replace(/[^\d]/g, '');
                  return /^\d+$/.test(numericValue);
                },
                message: 'Please enter only numbers'
              }
            },
            validation: {
              messages: {
                required: 'Annual revenue is required',
                pattern: 'Please enter a valid amount'
              }
            }
          },
        ]
      },
      // Annual Revenue 2022 and Credit Rating Provider in one row
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-4',
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
      // Row with General Liability and Product Liability Insurance with number formatting
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-6',
            key: 'insuranceCoverage.generalLiabilityInsurance',
            type: 'input',
            templateOptions: {
              label: 'General Liability Insurance (INR)',
              placeholder: 'Enter General Liability Insurance Amount (e.g., 1,00,000)',
              required: false,
              type: 'text',
              pattern: '^[0-9,]+$'
            },
            hooks: {
              onInit: (field: any) => {
                if (field.formControl) {
                  // Format on value changes
                  field.formControl.valueChanges.subscribe((value: string) => {
                    if (value && value.length > 0) {
                      const numericValue = value.replace(/[^\d]/g, '');
                      if (numericValue && !isNaN(Number(numericValue))) {
                        const formatted = this.formatIndianCurrency(Number(numericValue));
                        if (formatted !== value) {
                          field.formControl.setValue(formatted, { emitEvent: false });
                        }
                      }
                    }
                  });
                }
              }
            },
            validators: {
              numberOnly: {
                expression: (c: AbstractControl) => {
                  if (!c.value) return true;
                  const numericValue = c.value.toString().replace(/[^\d]/g, '');
                  return /^\d+$/.test(numericValue);
                },
                message: 'Please enter only numbers'
              }
            },
            validation: {
              messages: {
                pattern: 'Please enter a valid amount'
              }
            }
          },
          {
            className: 'col-md-6',
            key: 'insuranceCoverage.productLiabilityInsurance',
            type: 'input',
            templateOptions: {
              label: 'Product Liability Insurance (INR)',
              placeholder: 'Enter Product Liability Insurance Amount (e.g., 1,00,000)',
              required: false,
              type: 'text',
              pattern: '^[0-9,]+$'
            },
            hooks: {
              onInit: (field: any) => {
                if (field.formControl) {
                  // Format on value changes
                  field.formControl.valueChanges.subscribe((value: string) => {
                    if (value && value.length > 0) {
                      const numericValue = value.replace(/[^\d]/g, '');
                      if (numericValue && !isNaN(Number(numericValue))) {
                        const formatted = this.formatIndianCurrency(Number(numericValue));
                        if (formatted !== value) {
                          field.formControl.setValue(formatted, { emitEvent: false });
                        }
                      }
                    }
                  });
                }
              }
            },
            validators: {
              numberOnly: {
                expression: (c: AbstractControl) => {
                  if (!c.value) return true;
                  const numericValue = c.value.toString().replace(/[^\d]/g, '');
                  return /^\d+$/.test(numericValue);
                },
                message: 'Please enter only numbers'
              }
            },
            validation: {
              messages: {
                pattern: 'Please enter a valid amount'
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
                  template: ''
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
                      className: 'col-md-6',
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
        this.sweetAlert.error('Please fill in all required fields correctly before proceeding.');
      }
    } else {
      // If this is the last step, submit the form
      this.submit();
    }
  }

  // Helper method to get a control by a possibly nested key
  getControlByKey(key: string): AbstractControl | null {
    // Handle nested keys for form controls
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
    const repeatingFields = ['references'];
    repeatingFields.forEach(field => {
      if (!Array.isArray(formData.additionalInformation[field])) {
        formData.additionalInformation[field] = 
          this.model.additionalInformation[field] || [];
      }
    });
    
    // Parse formatted numbers back to numeric values for storage
    if (formData.companyFinancials) {
      if (formData.companyFinancials.annualRevenue2024) {
        formData.companyFinancials.annualRevenue2024 = this.parseFormattedNumber(formData.companyFinancials.annualRevenue2024);
      }
      if (formData.companyFinancials.annualRevenue2023) {
        formData.companyFinancials.annualRevenue2023 = this.parseFormattedNumber(formData.companyFinancials.annualRevenue2023);
      }
      if (formData.companyFinancials.annualRevenue2022) {
        formData.companyFinancials.annualRevenue2022 = this.parseFormattedNumber(formData.companyFinancials.annualRevenue2022);
      }
    }
    
    if (formData.insuranceCoverage) {
      if (formData.insuranceCoverage.generalLiabilityInsurance) {
        formData.insuranceCoverage.generalLiabilityInsurance = this.parseFormattedNumber(formData.insuranceCoverage.generalLiabilityInsurance);
      }
      if (formData.insuranceCoverage.productLiabilityInsurance) {
        formData.insuranceCoverage.productLiabilityInsurance = this.parseFormattedNumber(formData.insuranceCoverage.productLiabilityInsurance);
      }
    }
    
    // Create final body to send
    let body = {
      supplier_company_id: localStorage.getItem('supplier_id'),
      onboarding_status: 'Under Review',
      bank_verified: this.bankVerified === true ? true : false,
      company_profile: JSON.stringify(formData)
    }
    
    return body;
  }

  submit() {
    if (this.form.valid) {
      console.log(this.model)
      // Get complete form data before submission
      const formValues = this.form.getRawValue();
      
      // Get original form model and preserve array structures
      const fullModel = { ...this.model };
      
      // Merge with form values to ensure all data is captured
      // This will pull in the arrays properly
      const mergedData = this.mergeDeep(fullModel, formValues);
      
      console.log('Form submitted:', mergedData);
      
      let body = this.updateData(mergedData);

      // Use the existing POST or PUT methods as needed
      this.commonService.postData('/api/resource/Supplier Onboarding L3', body).subscribe((res: any) => {
        this.sweetAlert.success('Thank you! Your supplier onboarding process has been completed successfully. We will review your information and contact you shortly.');
        
        // Here you might redirect to a supplier dashboard or confirmation page
        setTimeout(() => {
          this.router.navigate(['/wefab/supplier/profile-review/', localStorage.getItem('supplier_id')]);
        }, 3000);
      }, (err: any) => {
        this.putSupplierOnboardingL3()
      });
    } else {
      this.markFieldsAsTouched(this.stepFields.flat());
      this.sweetAlert.error('Please fill in all required fields correctly.');
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

      let endPoint = '/api/resource/Supplier Onboarding L3/' + localStorage.getItem('supplier_id')

      this.commonService.putData(endPoint, body).subscribe((res: any) => {
        this.sweetAlert.success('Your data has been updated successfully. We will review the changes and get back to you if necessary.');
        
        // Here you might redirect to a supplier dashboard or confirmation page
        setTimeout(() => {
          this.router.navigate(['/wefab/supplier/profile-review/', localStorage.getItem('supplier_id')]);
        }, 3000);
      }, (err: any) => {
        this.sweetAlert.error(err.error?.message || 'An error occurred while submitting the form. Please try again later.');
      });
    } else {
      this.markFieldsAsTouched(this.stepFields.flat());
      this.sweetAlert.error('Please fill in all required fields correctly.');
    }
  }

  // Handle bank verification event
  onBankVerified(verified: boolean): void {
    this.bankVerified = verified;
    console.log('Bank verification status:', verified);
  }

  // Handle bank details verification event
  onBankDetailsVerified(bankDetails: any): void {
    console.log('Bank details verified:', bankDetails);
    // You can store additional bank details if needed
  }
}