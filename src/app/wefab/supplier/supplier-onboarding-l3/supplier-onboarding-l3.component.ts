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
    bankInformation: {
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      swiftCode: '',
      accountHolderName: '',
      accountType: ''
    },
    financialDocuments: null,
    companyFinancials: {
      annualRevenue: 0,
      yearInBusiness: 0,
      employeeCount: 0,
      currency: 'USD'
    },
    additionalInformation: {
      preferredPaymentTerms: '',
      leadTime: '',
      minimumOrderQuantity: 0,
      references: [{}],
      shippingCapabilities: [],
      qualityStandards: []
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
  }

  // Getter to make accessing the current step's fields easy in template
  get currentFields(): FormlyFieldConfig[] {
    return this.stepFields[this.activeStepIndex] || [];
  }

  getFinancialInformationFields(): FormlyFieldConfig[] {
    return [
      // Bank Information Section
      {
        fieldGroupClassName: 'mb-4',
        fieldGroup: [
          {
            template: `
              <div class="section-header mb-3">
                <h4 class="text-blueprint-blue">Bank Information</h4>
                <p class="text-machine-gray">Please provide your banking details for payment processing.</p>
              </div>
            `
          },
          {
            template: `
              <div class="alert alert-info mb-4">
                <i class="pi pi-info-circle me-2"></i>
                <span>Your banking information is securely stored and only used for payment processing.</span>
              </div>
            `
          },
          {
            key: 'bankInformation',
            fieldGroup: [
              {
                fieldGroupClassName: 'row',
                fieldGroup: [
                  {
                    className: 'col-md-6 mb-3',
                    key: 'accountHolderName',
                    type: 'input',
                    templateOptions: {
                      label: 'Account Holder Name',
                      placeholder: 'Enter account holder name',
                      required: true
                    },
                    validation: {
                      messages: {
                        required: 'Account holder name is required'
                      }
                    }
                  },
                  {
                    className: 'col-md-6 mb-3',
                    key: 'accountType',
                    type: 'select',
                    templateOptions: {
                      label: 'Account Type',
                      options: [
                        { label: 'Checking', value: 'Checking' },
                        { label: 'Savings', value: 'Savings' },
                        { label: 'Business', value: 'Business' }
                      ],
                      required: true
                    },
                    validation: {
                      messages: {
                        required: 'Account type is required'
                      }
                    }
                  }
                ]
              },
              {
                fieldGroupClassName: 'row',
                fieldGroup: [
                  {
                    className: 'col-md-6 mb-3',
                    key: 'bankName',
                    type: 'input',
                    templateOptions: {
                      label: 'Bank Name',
                      placeholder: 'Enter your bank name',
                      required: true
                    },
                    validation: {
                      messages: {
                        required: 'Bank name is required'
                      }
                    }
                  },
                  {
                    className: 'col-md-6 mb-3',
                    key: 'accountNumber',
                    type: 'input',
                    templateOptions: {
                      label: 'Account Number',
                      placeholder: 'Enter account number',
                      required: true
                    },
                    validation: {
                      messages: {
                        required: 'Account number is required'
                      }
                    }
                  }
                ]
              },
              {
                fieldGroupClassName: 'row',
                fieldGroup: [
                  {
                    className: 'col-md-6 mb-3',
                    key: 'routingNumber',
                    type: 'input',
                    templateOptions: {
                      label: 'Routing Number',
                      placeholder: 'Enter routing number',
                      required: true
                    },
                    validation: {
                      messages: {
                        required: 'Routing number is required'
                      }
                    }
                  },
                  {
                    className: 'col-md-6 mb-3',
                    key: 'swiftCode',
                    type: 'input',
                    templateOptions: {
                      label: 'SWIFT Code',
                      placeholder: 'Enter SWIFT code',
                      required: true
                    },
                    validation: {
                      messages: {
                        required: 'SWIFT code is required'
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      
      // Financial Documents Section
      {
        fieldGroupClassName: 'mb-4 mt-5',
        fieldGroup: [
          {
            template: `
              <div class="section-header mb-3">
                <h4 class="text-blueprint-blue">Financial Documents</h4>
                <p class="text-machine-gray">Upload relevant financial documents for verification.</p>
              </div>
            `
          },
          {
            template: `
              <div class="document-guidelines p-3 mb-4 bg-light rounded">
                <h5 class="mb-2"><i class="pi pi-file me-2"></i> Financial Document Guidelines</h5>
                <p class="mb-2">For a comprehensive financial assessment, please upload the following documents:</p>
                <ul class="mb-0">
                  <li>Financial statements for the last fiscal year</li>
                  <li>Tax documents</li>
                  <li>Business credit reports (if available)</li>
                  <li>Bank statements for the last three months</li>
                </ul>
              </div>
            `
          },
          {
            key: 'financialDocuments',
            type: 'file-upload',
            className: 'mb-3',
            templateOptions: {
              label: 'Financial Documents',
              description: 'Upload financial statements, tax documents, etc. (max 10MB per file)',
              required: true
            },
            validation: {
              messages: {
                required: 'At least one document is required'
              }
            }
          }
        ]
      },
      
      // Company Financials Section
      {
        fieldGroupClassName: 'mb-4 mt-5',
        fieldGroup: [
          {
            template: `
              <div class="section-header mb-3">
                <h4 class="text-blueprint-blue">Company Financials</h4>
                <p class="text-machine-gray">Provide information about your company's financial health.</p>
              </div>
            `
          },
          {
            key: 'companyFinancials',
            fieldGroup: [
              {
                fieldGroupClassName: 'row',
                fieldGroup: [
                  {
                    className: 'col-md-6 mb-3',
                    key: 'annualRevenue',
                    type: 'input',
                    templateOptions: {
                      label: 'Annual Revenue',
                      type: 'number',
                      min: 0,
                      placeholder: 'Enter annual revenue',
                      required: true
                    },
                    validation: {
                      messages: {
                        required: 'Annual revenue is required'
                      }
                    }
                  },
                  {
                    className: 'col-md-6 mb-3',
                    key: 'currency',
                    type: 'select',
                    templateOptions: {
                      label: 'Currency',
                      options: [
                        { label: 'USD - US Dollar', value: 'USD' },
                        { label: 'EUR - Euro', value: 'EUR' },
                        { label: 'GBP - British Pound', value: 'GBP' },
                        { label: 'INR - Indian Rupee', value: 'INR' },
                        { label: 'CNY - Chinese Yuan', value: 'CNY' },
                        { label: 'JPY - Japanese Yen', value: 'JPY' }
                      ],
                      required: true
                    },
                    validation: {
                      messages: {
                        required: 'Currency is required'
                      }
                    }
                  }
                ]
              },
              {
                fieldGroupClassName: 'row',
                fieldGroup: [
                  {
                    className: 'col-md-6 mb-3',
                    key: 'yearInBusiness',
                    type: 'input',
                    templateOptions: {
                      label: 'Years in Business',
                      type: 'number',
                      min: 1,
                      placeholder: 'Enter years in business',
                      required: true
                    },
                    validation: {
                      messages: {
                        required: 'Years in business is required'
                      }
                    }
                  },
                  {
                    className: 'col-md-6 mb-3',
                    key: 'employeeCount',
                    type: 'input',
                    templateOptions: {
                      label: 'Number of Employees',
                      type: 'number',
                      min: 1,
                      placeholder: 'Enter number of employees',
                      required: true
                    },
                    validation: {
                      messages: {
                        required: 'Employee count is required'
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
  }

  getAdditionalInformationFields(): FormlyFieldConfig[] {
    return [
      // Business Terms Section
      {
        fieldGroupClassName: 'mb-4',
        fieldGroup: [
          {
            template: `
              <div class="section-header mb-3">
                <h4 class="text-blueprint-blue">Business Terms</h4>
                <p class="text-machine-gray">Provide information about your business terms and conditions.</p>
              </div>
            `
          },
          {
            key: 'additionalInformation',
            fieldGroup: [
              {
                fieldGroupClassName: 'row',
                fieldGroup: [
                  {
                    className: 'col-md-6 mb-3',
                    key: 'preferredPaymentTerms',
                    type: 'select',
                    templateOptions: {
                      label: 'Preferred Payment Terms',
                      options: [
                        { label: 'Net 30', value: 'Net 30' },
                        { label: 'Net 45', value: 'Net 45' },
                        { label: 'Net 60', value: 'Net 60' },
                        { label: 'Net 90', value: 'Net 90' },
                        { label: 'Advance Payment', value: 'Advance Payment' },
                        { label: 'Letter of Credit', value: 'Letter of Credit' }
                      ],
                      required: true
                    },
                    validation: {
                      messages: {
                        required: 'Payment terms are required'
                      }
                    }
                  },
                  {
                    className: 'col-md-6 mb-3',
                    key: 'leadTime',
                    type: 'select',
                    templateOptions: {
                      label: 'Average Production Lead Time',
                      options: [
                        { label: '1-2 weeks', value: '1-2 weeks' },
                        { label: '2-3 weeks', value: '2-3 weeks' },
                        { label: '3-4 weeks', value: '3-4 weeks' },
                        { label: '4-6 weeks', value: '4-6 weeks' },
                        { label: '6-8 weeks', value: '6-8 weeks' },
                        { label: '8+ weeks', value: '8+ weeks' }
                      ],
                      required: true
                    },
                    validation: {
                      messages: {
                        required: 'Production lead time is required'
                      }
                    }
                  }
                ]
              },
              {
                fieldGroupClassName: 'row',
                fieldGroup: [
                  {
                    className: 'col-md-6 mb-3',
                    key: 'minimumOrderQuantity',
                    type: 'input',
                    templateOptions: {
                      label: 'Minimum Order Quantity',
                      type: 'number',
                      min: 1,
                      placeholder: 'Enter MOQ',
                      required: true
                    },
                    validation: {
                      messages: {
                        required: 'Minimum order quantity is required'
                      }
                    }
                  },
                  {
                    className: 'col-md-6 mb-3',
                    key: 'shippingCapabilities',
                    type: 'p-multiselect',
                    templateOptions: {
                      label: 'Shipping Capabilities',
                      options: [
                        { label: 'Air Freight', value: 'air_freight' },
                        { label: 'Sea Freight', value: 'sea_freight' },
                        { label: 'Land Transport', value: 'land_transport' },
                        { label: 'Express Delivery', value: 'express_delivery' },
                        { label: 'International Shipping', value: 'international_shipping' }
                      ],
                      placeholder: 'Select shipping methods',
                      required: true,
                      filter: true,
                      showToggleAll: true
                    },
                    validation: {
                      messages: {
                        required: 'Shipping capabilities are required'
                      }
                    }
                  }
                ]
              },
              {
                className: 'mb-3',
                key: 'qualityStandards',
                type: 'p-multiselect',
                templateOptions: {
                  label: 'Quality Standards & Processes',
                  options: [
                    { label: 'QC Inspection', value: 'qc_inspection' },
                    { label: 'Statistical Process Control', value: 'spc' },
                    { label: 'Six Sigma', value: 'six_sigma' },
                    { label: 'Lean Manufacturing', value: 'lean_manufacturing' },
                    { label: 'TQM (Total Quality Management)', value: 'tqm' },
                    { label: 'Kaizen', value: 'kaizen' }
                  ],
                  placeholder: 'Select quality standards',
                  required: true,
                  filter: true,
                  showToggleAll: true
                },
                validation: {
                  messages: {
                    required: 'Quality standards are required'
                  }
                }
              }
            ]
          }
        ]
      },
      
      // References Section
      {
        fieldGroupClassName: 'mb-4 mt-5',
        fieldGroup: [
          {
            template: `
              <div class="section-header mb-3">
                <h4 class="text-blueprint-blue">Client References</h4>
                <p class="text-machine-gray">Provide references from your clients or partners who can vouch for your services.</p>
              </div>
            `
          },
          {
            key: 'additionalInformation.references',
            type: 'repeat',
            fieldArray: {
              fieldGroup: [
                {
                  fieldGroupClassName: 'row',
                  fieldGroup: [
                    {
                      className: 'col-md-6 mb-3',
                      key: 'companyName',
                      type: 'input',
                      templateOptions: {
                        label: 'Company Name',
                        placeholder: 'Enter company name',
                        required: true
                      },
                      validation: {
                        messages: {
                          required: 'Required'
                        }
                      }
                    },
                    {
                      className: 'col-md-6 mb-3',
                      key: 'contactPerson',
                      type: 'input',
                      templateOptions: {
                        label: 'Contact Person',
                        placeholder: 'Enter contact name',
                        required: true
                      },
                      validation: {
                        messages: {
                          required: 'Required'
                        }
                      }
                    }
                  ]
                },
                {
                  fieldGroupClassName: 'row',
                  fieldGroup: [
                    {
                      className: 'col-md-6 mb-3',
                      key: 'email',
                      type: 'input',
                      templateOptions: {
                        label: 'Email',
                        placeholder: 'Enter email address',
                        required: true,
                        type: 'email'
                      },
                      validation: {
                        messages: {
                          required: 'Required'
                        }
                      }
                    },
                    {
                      className: 'col-md-6 mb-3',
                      key: 'phone',
                      type: 'input',
                      templateOptions: {
                        label: 'Phone',
                        placeholder: 'Enter phone number',
                        required: true
                      },
                      validation: {
                        messages: {
                          required: 'Required'
                        }
                      }
                    }
                  ]
                },
                {
                  className: 'mb-3',
                  key: 'relationship',
                  type: 'textarea',
                  templateOptions: {
                    label: 'Business Relationship',
                    placeholder: 'Briefly describe your business relationship',
                    rows: 3,
                    required: true
                  },
                  validation: {
                    messages: {
                      required: 'Required'
                    }
                  }
                }
              ]
            }
          }
        ]
      },
      
      // Terms and Conditions
      {
        fieldGroupClassName: 'mb-4 mt-5',
        fieldGroup: [
          {
            template: `
              <div class="section-header mb-3">
                <h4 class="text-blueprint-blue">Terms & Conditions</h4>
                <p class="text-machine-gray">Please review and accept our terms and conditions.</p>
              </div>
            `
          },
          {
            key: 'termsAndConditions',
            fieldGroup: [
              {
                key: 'acceptTerms',
                type: 'checkbox',
                templateOptions: {
                  label: 'I agree to the Terms and Conditions',
                  description: 'By checking this box, you agree to our supplier terms and conditions.',
                  required: true
                },
                validation: {
                  messages: {
                    required: 'You must accept the terms and conditions to continue'
                  }
                }
              },
              {
                key: 'acceptPrivacyPolicy',
                type: 'checkbox',
                templateOptions: {
                  label: 'I accept the Privacy Policy',
                  description: 'By checking this box, you accept our privacy policy for handling your information.',
                  required: true
                },
                validation: {
                  messages: {
                    required: 'You must accept the privacy policy to continue'
                  }
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