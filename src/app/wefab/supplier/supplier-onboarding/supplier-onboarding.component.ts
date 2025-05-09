import { Component, OnInit, ViewChild, TemplateRef, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule, FormlyFormOptions, FormlyExtension } from '@ngx-formly/core';
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

// Import FileUploadComponent
import { FileUploadComponent } from './file-upload.component';
// Import MultiFileUploadComponent
import { MultiFileUploadComponent } from './multi-file-upload.component';

// Import PhoneOtpVerificationComponent
import { PhoneOtpVerificationComponent } from '../../wefab-shared-component/phone-otp-verification/phone-otp-verification.component';
import { CommonService } from '../../shared/common.service';

// GST Validator function
export function gstValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  
  if (!value) {
    return null; // Let required validation handle empty values
  }
  
  const gstPattern = /^[0-9]{2}[A-Za-z0-9]{10}[A-Za-z0-9]{1}Z[A-Za-z0-9]{1}$/;
  
  return gstPattern.test(value) ? null : { 'gstFormat': true };
}

@Component({
  selector: 'app-supplier-onboarding',
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
    FileUploadComponent,
    PhoneOtpVerificationComponent,
    MultiFileUploadComponent
  ],
  providers: [MessageService],
  templateUrl: './supplier-onboarding.component.html',
  styleUrl: './supplier-onboarding.component.scss'
})
export class SupplierOnboardingComponent implements OnInit {
  form: FormGroup;
  model: any = {};
  options: FormlyFormOptions = {};
  
  activeStepIndex = 0;
  steps: MenuItem[] = [];
  
  // Create arrays of field configurations for each step
  stepFields: FormlyFieldConfig[][] = [];
  
  // Phone verification state
  phoneVerified = false;

  @ViewChild('verifyOtpButton') verifyOtpButtonTemplate!: TemplateRef<any>;

  isBrowser: boolean;
  countryList: any = []
  selectedCountry: any;
  stateList: any;
  
  constructor(
    private fb: FormBuilder, 
    private messageService: MessageService,
    private renderer: Renderer2,
    private router: Router,
    private commonService: CommonService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.form = this.fb.group({});
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  getCountryList() {
    let endPoint = '/api/resource/Country?limit=300';
    this.commonService.getData(endPoint).subscribe((res: any) => {
      this.countryList = res.data;
    })
  }

  getStates(country: any) {
    let endPoint = `/api/resource/pq_city?fields=["country_title", "state_title", "city_title"]&filters=[["country_title", "=", "${country}"]]`
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
        
        // Update the state dropdown options
        this.updateStateDropdownOptions();
      } else {
        this.stateList = [];
      }
    }, error => {
      console.error('Error fetching states:', error);
      this.stateList = [];
    });
  }

  // Method to update state dropdown options
  updateStateDropdownOptions() {
    // Find the state field in the form
    if (this.stepFields && this.stepFields.length > 0) {
      const basicDetailsFields = this.stepFields[0];
      
      // Find the row containing country, state, city fields
      const addressRow = basicDetailsFields.find((fieldGroup: any) => 
        fieldGroup.fieldGroup && 
        fieldGroup.fieldGroup.some((field: any) => field.key === 'country')
      );
      
      if (addressRow && addressRow.fieldGroup) {
        // Find the state field
        const stateField = addressRow.fieldGroup.find((field: any) => field.key === 'state');
        
        if (stateField && stateField.templateOptions) {
          // Update the options
          stateField.templateOptions.options = this.stateList;
          
          // Reset the state value if it's not in the new options
          const stateControl = this.form.get('state');
          if (stateControl && stateControl.value) {
            const stateExists = this.stateList.some(
              (option: any) => option.value === stateControl.value
            );
            
            if (!stateExists) {
              stateControl.setValue('');
            }
          }
          
          // Force update the UI
          setTimeout(() => {
            if (stateField.formControl) {
              stateField.formControl.updateValueAndValidity();
            }
          });
        }
      }
    }
  }

  ngOnInit(): void {
    // Initialize form with empty fields first
    this.form = this.fb.group({});
    
    // Load country list first, then initialize fields after data is loaded
    this.getCountryListAndInitializeForm();
    
    this.steps = [
      {
        label: 'Basic Details',
        command: () => {
          this.activeStepIndex = 0;
        }
      },
      {
        label: 'Contact & Capabilities',
        command: () => {
          this.activeStepIndex = 1;
        }
      }
    ];
  }

  // New method to load countries then initialize form
  getCountryListAndInitializeForm() {
    let endPoint = '/api/resource/Country?limit=300';
    this.commonService.getData(endPoint).subscribe((res: any) => {
      // Store country list
      this.countryList = res.data || [];
      
      console.log('Country list loaded:', this.countryList.length);
      
      // Initialize form fields after country data is loaded
      this.stepFields = [
        this.getBasicDetailsFields(),          // Step 1
        this.getManufacturingCapabilitiesFields() // Step 2
      ];
      
      // Add icon wrapper to all error messages for validation
      this.addValidationIconToErrorMessages(this.stepFields);
    }, error => {
      console.error('Error loading country list:', error);
      // Initialize with empty country list if there's an error
      this.countryList = [];
      this.stepFields = [
        this.getBasicDetailsFields(),          // Step 1
        this.getManufacturingCapabilitiesFields() // Step 2
      ];
      this.addValidationIconToErrorMessages(this.stepFields);
    });
  }

  // Handle phone verification event
  onPhoneVerified(verified: boolean): void {
    this.phoneVerified = verified;
    console.log('Phone verification status:', verified);
  }

  // Getter to make accessing the current step's fields easy in template
  get currentFields(): FormlyFieldConfig[] {
    return this.stepFields[this.activeStepIndex] || [];
  }

  getBasicDetailsFields(): FormlyFieldConfig[] {
    return [
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-6 mb-2',
            key: 'legalBusinessName',
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
          },
          {
            className: 'col-md-6 mb-3',
            fieldGroup: [
              {
                key: 'gstinNumber',
                type: 'input',
                templateOptions: {
                  label: 'GSTIN',
                  placeholder: '22AAAAA0000A1Z5',
                  required: true,
                  description: 'Format: 2 digits + 10-character PAN + 1 entity code + Z + 1 checksum'
                },
                validators: {
                  validation: [gstValidator]
                },
                validation: {
                  messages: {
                    required: 'Please enter your GSTIN number',
                    gstFormat: 'Invalid GSTIN format'
                  }
                },
                expressionProperties: {
                  'templateOptions.required': '!model.noGst',
                  'hide': 'model.noGst'
                }
              },
              {
                key: 'panNumber',
                type: 'input',
                className: 'mb-2',
                templateOptions: {
                  label: 'PAN',
                  placeholder: 'ABCDE1234F',
                  required: false,
                  maxLength: 10,
                  description: 'Enter 10-character PAN (e.g., ABCDE1234F)'
                },
                expressionProperties: {
                  'hide': '!model.noGst'
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
                      const panField = field.form?.get('panNumber');
                      const gstinField = field.form?.get('gstinNumber');
                      
                      if (value && gstinField) {
                        // When "We don't have GST" is checked, clear GSTIN validation errors
                        gstinField.setErrors(null);
                        gstinField.setValue('');
                      }
                    });
                  }
                }
              }
            ]
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
                // Country list should be already loaded at this point
                const options = field.templateOptions?.options;
                const optionsLength = Array.isArray(options) ? options.length : 0;
                console.log('Country field initialized with options:', optionsLength);
                
                // If empty, try to update it once more
                if (optionsLength === 0 && this.countryList.length > 0) {
                  field.templateOptions!.options = this.countryList.map((country: any) => ({
                    label: country.name,
                    value: country.name
                  }));
                  field.formControl?.updateValueAndValidity();
                }
                
                // Watch for country changes to update state dropdown
                field.formControl?.valueChanges.subscribe(selectedCountry => {
                  console.log('Selected country:', selectedCountry);
                  if (selectedCountry) {
                    this.selectedCountry = selectedCountry;
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
                // If country changes, this field will be updated by updateStateDropdownOptions
                console.log('State field initialized');
                
                // Watch for state changes to update city dropdown
                field.formControl?.valueChanges.subscribe(selectedState => {
                  console.log('Selected state:', selectedState);
                  // if (selectedState && this.selectedCountry) {
                  //   this.getCities(this.selectedCountry, selectedState);
                  // }
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
              required: true,
              options: []
            },
            hooks: {
              onInit: (field) => {
                console.log('City field initialized');
              }
            },
            validation: {
              messages: {
                required: 'Please select a city'
              }
            },
            expressionProperties: {
              'templateOptions.disabled': '!model.state'
            }
          }
        ]
      },
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-6 mb-2',
            key: 'registeredAddress',
            type: 'textarea',
            templateOptions: {
              label: 'Registered Address',
              placeholder: 'Enter your registered address',
              required: true,
              rows: 1
            },
            validation: {
              messages: {
                required: 'Please enter your registered address'
              }
            }
          },
          {
            className: 'col-md-6 mb-2',
            key: 'manufacturingFacilityAddress',
            type: 'textarea',
            templateOptions: {
              label: 'Manufacturing Facility Address',
              placeholder: 'Enter your manufacturing facility address',
              required: true,
              rows: 1
            },
            validation: {
              messages: {
                required: 'Please enter your manufacturing facility address'
              }
            },
            expressionProperties: {
              'templateOptions.disabled': 'model.sameAsRegistered'
            }
          }
        ]
      },
      {
        key: 'sameAsRegistered',
        type: 'checkbox',
        className: 'mb-2',
        defaultValue: false,
        templateOptions: {
          label: 'Manufacturing Facility Address is Same as Registered Address'
        },
        hooks: {
          onInit: (field) => {
            field.formControl?.valueChanges.subscribe(value => {
              const manufacturingAddressField = field.form?.get('manufacturingFacilityAddress');
              if (value && manufacturingAddressField) {
                const registeredAddress = field.form?.get('registeredAddress')?.value;
                manufacturingAddressField.setValue(registeredAddress);
                manufacturingAddressField.disable();
              } else if (manufacturingAddressField) {
                manufacturingAddressField.enable();
              }
            });
          }
        }
      }
    ];
  }

  getManufacturingCapabilitiesFields(): FormlyFieldConfig[] {
    return [
      {
        fieldGroupClassName: 'row align-items-end',
        fieldGroup: [
          {
            className: 'col-md-4 mb-2',
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
            className: 'col-md-4 mb-2',
            key: 'phoneNumber',
            type: 'phone-otp',
            templateOptions: {
              label: 'Phone Number',
              required: true,
              placeholder: 'Enter phone number',
              countryCode: '91',
              parentComponent: this
            },
            validation: {
              messages: {
                required: 'Please enter your phone number'
              }
            }
          },
          {
            className: 'col-md-4 mb-2',
            key: 'primaryManufacturingProcess',
            type: 'p-multiselect',
            defaultValue: [],
            templateOptions: {
              label: 'Primary Manufacturing Process',
              placeholder: 'Select manufacturing processes',
              required: true,
              options: [
                { label: 'CNC Machining', value: 'cnc_machining' },
                { label: 'Injection Molding', value: 'injection_molding' },
                { label: 'Sheet Metal Fabrication', value: 'sheet_metal_fabrication' },
                { label: '3D Printing', value: '3d_printing' },
                { label: 'Die Casting', value: 'die_casting' }
              ],
              filter: true,
              showToggleAll: true
            },
            validation: {
              messages: {
                required: 'Please select at least one manufacturing process'
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
              label: 'Website URL',
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
      // Added Documentation Guidelines Component
      {
        template: `
          <div class="card mt-4 mb-4 border-0 bg-light">
            <div class="card-body">
              <div class="d-flex align-items-start">
                <i class="pi pi-info-circle text-primary me-2 mt-1" style="font-size: 1.2rem;"></i>
                <div>
                  <h5 class="documentation-title">Documentation Guidelines</h5>
                  <p class="mb-3">To help us evaluate your profile more accurately and expedite decision-making, we encourage you to upload comprehensive and relevant documentation. A well-documented profile significantly increases your visibility and improves your chances of being shortlisted for relevant opportunities.</p>
                  
                  <p class="mb-2">We highly recommend uploading a single ZIP file containing all supporting documents. However, individual file uploads are also supported for your convenience.</p>
                  
                  <p class="mb-2">Please ensure the inclusion of the following key documents, where applicable:</p>
                  
                  <ul>
                    <li><strong>Manufacturing Facility Details</strong> – Photos, videos, or formal documentation showcasing your infrastructure.</li>
                    <li><strong>Machinery Information</strong> – Make, model, and specifications of key equipment in use.</li>
                    <li><strong>Product Portfolio</strong> – A detailed list or brochure of products currently manufactured.</li>
                    <li><strong>Certifications</strong> – Copies of relevant quality, safety, environmental, or industry-specific certifications.</li>
                  </ul>
                  
                  <p>Providing a complete set of documents enhances our ability to assess your capabilities thoroughly and match you with suitable business opportunities.</p>
                </div>
              </div>
            </div>
          </div>
        `
      },
      {
        key: 'companyDocuments',
        type: 'file-upload',
        className: 'col-12 mb-2',
        templateOptions: {
          label: 'Company Documents',
          description: 'Upload documents that will help us evaluate your profile more accurately and expedite decision-making',
          required: true
        },
        validation: {
          messages: {
            required: 'Please upload documents'
          }
        }
      }
    ];
  }

  prevStep() {
    this.activeStepIndex--;
  }

  nextStep() {
    const formlyFields = this.currentFields;
    
    // Mark all fields in the current step as touched
    this.markFieldsAsTouched(formlyFields);
    
    // Check if the current step is valid
    if (this.isStepValid(formlyFields)) {
      // For step 1 to 2, check if phone verification is required
      if (this.activeStepIndex === 1 && !this.phoneVerified) {
        this.messageService.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please verify your phone number before submitting the form.',
          life: 4000
        });
        return;
      }
      
      if (this.activeStepIndex < this.steps.length - 1) {
        this.activeStepIndex++;
      } else {
        this.submit();
      }
    } else {
      const errorMessages: { [key: number]: string } = {
        0: 'Please fill in all required basic details correctly before proceeding.',
        1: 'Please complete all required manufacturing capabilities and document details.'
      };
      
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: errorMessages[this.activeStepIndex] || 'Please fill all required fields correctly.',
        life: 4000
      });
    }
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
    
    return isValid;
  }

  updateData(data:any) {
    console.log(data)
    let body = {
      company_name: data.legalBusinessName,
      primary_email_id: data.primaryEmailId,
      onboarding_status: 'Under Review',
      company_profile: JSON.stringify(data)
    }
    return body
  }

  postSupplierOnboardingL1() {
    let endPoint = '/api/resource/wfb_supplier_onboarding_L1';
    let body = this.updateData(this.model);
    this.commonService.postData(endPoint, body).subscribe((res: any) => {
      sessionStorage.setItem('supplier_id', res.data.name)
      this.messageService.add({
        severity: 'success',
        summary: 'Form Submitted Successfully',
        detail: 'Your supplier onboarding application has been received. Redirecting to detailed information form.',
        life: 3000
      });
      
      // Navigate to L2 form after 3 seconds
      setTimeout(() => {
        this.router.navigate(['/wefab/supplier/supplier-onboarding-l2']);
      }, 3000);
    }, (err) => {
      console.error('Error submitting form:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Submission Error',
        detail: err.error?.message || 'An error occurred while submitting the form. Please try again later.',
        life: 5000
      });
    });
  }

  submit() {
    if (this.form.valid) {
      console.log('Form submitted successfully', this.model);
      this.postSupplierOnboardingL1();
    } else {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields correctly before submitting the form.',
        life: 4000
      });
    }
  }

  sendOTP() {
    console.log('Sending OTP');
  }

  verifyOTP() {
    console.log('Verifying OTP');
  }

  // Add this method to the component
  addValidationIconToErrorMessages(fields: FormlyFieldConfig[][]) {
    fields.forEach(step => {
      step.forEach(field => {
        // Add a validation message transformer to add an icon
        if (!field.validators) {
          field.validators = {};
        }
        
        // Add a wrapper to all fields
        if (!field.wrappers) {
          field.wrappers = [];
        }
        
        // Process nested fields
        if (field.fieldGroup) {
          this.processFieldGroup(field.fieldGroup);
        }
      });
    });
  }
  
  // Modify processFieldGroup method
  processFieldGroup(fieldGroup: FormlyFieldConfig[]) {
    fieldGroup.forEach(field => {
      if (field.fieldGroup) {
        this.processFieldGroup(field.fieldGroup);
      } else {
        // Add an icon wrapper to this field's error display if needed
        if (field.type === 'phone-otp') {
          // Phone OTP fields already have an icon added via component
          return;
        }
        
        // For other field types, make sure they use proper error formatting
        if (!field.expressionProperties) {
          field.expressionProperties = {};
        }
        
        // Add a class to error elements
        if (!field.className) {
          field.className = '';
        }
        field.className += ' has-validation-icon';
      }
    });
  }

  // Method to get cities based on country and state
  getCities(country: string, state: string) {
    let endPoint = `/api/resource/pq_city?fields=["country_title", "state_title", "city_title"]&filters=[["country_title", "=", "${country}"], ["state_title", "=", "${state}"]]`;
    console.log('Fetching cities for country:', country, 'and state:', state);
    
    this.commonService.getData(endPoint).subscribe((res: any) => {
      console.log('Cities API response:', res);
      if (res && res.data) {
        // Extract unique cities from the response
        const cities = [...new Set(res.data.map((item: any) => item.city_title))];
        
        const cityList = cities.map((city: any) => ({
          label: city,
          value: city
        }));
        
        console.log('City list updated:', cityList);
        
        // Update the city dropdown options
        this.updateCityDropdownOptions(cityList);
      }
    }, error => {
      console.error('Error fetching cities:', error);
    });
  }
  
  // Method to update city dropdown options
  updateCityDropdownOptions(cityList: any[]) {
    // Find the city field in the form
    if (this.stepFields && this.stepFields.length > 0) {
      const basicDetailsFields = this.stepFields[0];
      
      // Find the row containing country, state, city fields
      const addressRow = basicDetailsFields.find((fieldGroup: any) => 
        fieldGroup.fieldGroup && 
        fieldGroup.fieldGroup.some((field: any) => field.key === 'country')
      );
      
      if (addressRow && addressRow.fieldGroup) {
        // Find the city field
        const cityField = addressRow.fieldGroup.find((field: any) => field.key === 'city');
        
        if (cityField && cityField.templateOptions) {
          // Update the options
          cityField.templateOptions.options = cityList;
          
          // Reset the city value if it's not in the new options
          const cityControl = this.form.get('city');
          if (cityControl && cityControl.value) {
            const cityExists = cityList.some(
              (option: any) => option.value === cityControl.value
            );
            
            if (!cityExists) {
              cityControl.setValue('');
            }
          }
          
          // Force update the UI
          setTimeout(() => {
            if (cityField.formControl) {
              cityField.formControl.updateValueAndValidity();
            }
          });
        }
      }
    }
  }
}
