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
import { PMultiSelectGroupComponent } from '../../../p-multiSelect-group.component'
// Import GstVerifyFieldComponent
import { GstVerifyFieldComponent } from './gst-verify-field.component';
// Import the FormlyFieldGstVerifyComponent
import { FormlyFieldGstVerifyComponent } from '../../../gst-verify-type.component';
// GST Validator function
import { ChangeDetectorRef } from '@angular/core';
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
    MultiFileUploadComponent,
    PMultiSelectGroupComponent,
    GstVerifyFieldComponent,
    FormlyFieldGstVerifyComponent
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
  // GST verification state
  gstVerified = false;
  // Add this property for configurable file types
  acceptedDocumentTypes: string = '.zip'; 
  @ViewChild('verifyOtpButton') verifyOtpButtonTemplate!: TemplateRef<any>;
  isBrowser: boolean;
  countryList: any = [];
  selectedCountry: any;
  selectedState: any; // Add this to track the selected state
  stateList: any = []; // Initialize as empty array
  getCompanyProfile: any;
  stateFieldInitialized = false; // Flag to track state field initialization
  
  // New property to check if supplier already exists
  hasExistingSupplier = false;
  
  constructor(
    private fb: FormBuilder, 
    private messageService: MessageService,
    private renderer: Renderer2,
    private router: Router,
    private cdr: ChangeDetectorRef,
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
    });
  }

  getStates(country: any) {
    if (!country) return;
    
    let endPoint = `/api/resource/pq_city?fields=["country_title", "state_title", "city_title"]&filters=[["country_title", "=", "${country}"]]`;
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
        
        // After state list is loaded, now set the selected state if we have one
        if (this.selectedState) {
          console.log('Setting selected state from stored value:', this.selectedState);
          
          // Use setTimeout to ensure the UI has time to update
          setTimeout(() => {
            // Update the model directly
            this.model.state = this.selectedState;
            
            // Also update the form control
            const stateControl = this.form.get('state');
            if (stateControl) {
              stateControl.setValue(this.selectedState);
              stateControl.markAsDirty();
              stateControl.updateValueAndValidity();
              console.log('State control updated with:', this.selectedState);
            }
            
            // Update the state dropdown options and mark as dirty
            this.updateStateDropdownOptions(true);
          }, 200);
        }

        this.updateStateDropdownOptions(true);

      } else {
        this.stateList = [];
      }
    }, error => {
      console.error('Error fetching states:', error);
      this.stateList = [];
    });
  }

  // Method to update state dropdown options with an option to force selection
  updateStateDropdownOptions(forceSelection: boolean = false) {
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
          
          // If forceSelection and we have a selectedState, make sure it's applied
          if (forceSelection && this.selectedState && stateField.formControl) {
            console.log('Forcing state selection to:', this.selectedState);
            stateField.formControl.setValue(this.selectedState);
            stateField.formControl.markAsDirty();
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
    
    // Check if supplier_id exists in session storage
    if (this.isBrowser) {
      const supplierId = sessionStorage.getItem('supplier_id');
      if (supplierId) {
        this.hasExistingSupplier = true;
      }
      
      // Check if we're in edit mode
      const route = this.router.url;
      if (route.includes('mode=edit')) {
        const supplierId = sessionStorage.getItem('supplier_id');
        if (supplierId) {
          this.getL1Data(supplierId);
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
      this.patchEmailId();
    }
  }

  patchEmailId() {
    this.model.primary_email_id = sessionStorage.getItem('primary_email_id');
    
    setTimeout(() => {
      this.form.markAsPristine();
    }, 1000);
  }

  getL1Data(supplierId: any) {
    let endPoint = '/api/resource/wfb_supplier_onboarding_L1/' + supplierId;
    this.commonService.getData(endPoint).subscribe((res: any) => {
      console.log('L1 Data response:', res);
      if (res && res.data && res.data.company_profile) {
        try {
          this.getCompanyProfile = JSON.parse(res.data.company_profile);
          this.phoneVerified = this.getCompanyProfile.phone_verified;
          console.log('Company profile loaded:', this.getCompanyProfile);
          
          // Wait for the form to be initialized before patching values
          setTimeout(() => {
            this.patchValueForm();
          }, 500);
        } catch (e) {
          console.error('Error parsing company profile:', e);
        }
      }
    }, error => {
      console.error('Error fetching L1 data:', error);
    });
  }

  patchValueForm() {
    if (!this.getCompanyProfile) {
      console.log('No company profile to patch');
      return;
    }
    
    console.log('Patching form with values:', this.getCompanyProfile);
    
    // First, store the state if it exists
    if (this.getCompanyProfile.state) {
      this.selectedState = this.getCompanyProfile.state;
      console.log('Stored selected state:', this.selectedState);
    }

    // Special handling for registeredAddress if it's a string (old format)
    if (this.getCompanyProfile.registeredAddress && typeof this.getCompanyProfile.registeredAddress === 'string') {
      // Convert to new format compatible with Google Places component
      this.getCompanyProfile.registeredAddress = {
        fullAddress: this.getCompanyProfile.registeredAddress,
        placeId: '',
        streetNumber: '',
        street: '',
        city: this.getCompanyProfile.city || '',
        state: this.getCompanyProfile.state || '',
        stateCode: '',
        postalCode: '',
        country: this.getCompanyProfile.country || '',
        countryCode: '',
        location: {
          lat: 0,
          lng: 0
        }
      };
    }
    
    // Update the model with the values from getCompanyProfile
    this.model = {
      ...this.model,
      ...this.getCompanyProfile
    };
    
    console.log('Model updated with values:', this.model);
    
    // If the country is selected, load the states for that country
    if (this.getCompanyProfile.country) {
      this.selectedCountry = this.getCompanyProfile.country;
      this.getStates(this.selectedCountry);
    }
    
    // Set phone verification status
    if (this.getCompanyProfile.phone_verified) {
      this.phoneVerified = true;
    }
    
    // Give the form time to update
    setTimeout(() => {
      this.form.markAsDirty();
      console.log('Final form model:', this.model);
    }, 500);
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
            className: 'col-md-6 mb-3',
            fieldGroup: [
              {
                key: 'gstinNumber',
                type: 'gst-verify',
                templateOptions: {
                  label: 'GSTIN',
                  placeholder: '22AAAAA0000A1Z5',
                  required: true,
                  description: 'Format: 2 digits + 10-character PAN + 1 entity code + Z + 1 checksum',
                  parentComponent: this,
                  isVerified: this.gstVerified
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
          },
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
              disabled: true // 👈 this disables the field
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
            templateOptions: {
              label: 'Registered Address',
              placeholder: 'Search for your registered address',
              required: true
            },
            expressionProperties: {
              'templateOptions.disabled': 'formState.disabled'
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
                  console.log('Country changed to:', selectedCountry);
                  if (selectedCountry) {
                    this.selectedCountry = selectedCountry;
                    
                    // Clear the state when country changes
                    if (field.form?.get('state')) {
                      field.form.get('state')!.setValue(null);
                    }
                    
                    // Get states for the new country
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
                console.log('State field initialized');
                this.stateFieldInitialized = true;
                
                // If we already have a selected state, set it
                if (this.selectedState && field.formControl) {
                  console.log('Setting state to previously selected value:', this.selectedState);
                  setTimeout(() => {
                    field.formControl!.setValue(this.selectedState);
                    field.formControl!.markAsDirty();
                    field.formControl!.updateValueAndValidity();
                  }, 200);
                }
                
                // Watch for state changes
                field.formControl?.valueChanges.subscribe(selectedState => {
                  console.log('State changed to:', selectedState);
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
                required: 'Please enter city name'
              }
            },
            expressionProperties: {
              'templateOptions.disabled': '!model.state'
            }
          }
        ]
      },
      // {
      //   key: 'sameAsRegistered',
      //   type: 'checkbox',
      //   className: 'mb-2',
      //   defaultValue: false,
      //   templateOptions: {
      //     label: 'Manufacturing Facility Address is Same as Registered Address'
      //   },
      //   hooks: {
      //     onInit: (field) => {
      //       field.formControl?.valueChanges.subscribe(value => {
      //         const manufacturingAddressField = field.form?.get('manufacturingFacilityAddress');
      //         if (value && manufacturingAddressField) {
      //           const registeredAddress = field.form?.get('registeredAddress')?.value;
      //           manufacturingAddressField.setValue(registeredAddress);
      //           manufacturingAddressField.disable();
      //         } else if (manufacturingAddressField) {
      //           manufacturingAddressField.enable();
      //         }
      //       });
      //     }
      //   }
      // },
    ];
  }

  getManufacturingCapabilitiesFields(): FormlyFieldConfig[] {
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
                // Ensure the verified state is properly set
                if (this.phoneVerified) {
                  console.log('Phone is already verified, updating field display');
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
            className: 'col-md-4 mb-2',
            key: 'primaryManufacturingProcess',
            type: 'p-multiselect-group', // Use the multiselect-group type
            defaultValue: [], // For multiselect, initialize as an empty array
            templateOptions: {
              label: 'Primary Manufacturing Process',
              placeholder: 'Select your primary manufacturing process',
              required: true,
              groups: [
                {
                  label: 'Process Types',
                  items: [
                    { label: 'CNC Machining', value: 'cnc_machining' },
                    { label: 'Injection Molding', value: 'injection_molding' },
                    { label: 'Sheet Metal Fabrication', value: 'sheet_metal_fabrication' }
                  ]
                },
                {
                  label: 'Advanced Manufacturing',
                  items: [
                    { label: '3D Printing', value: '3d_printing' },
                    { label: 'Die Casting', value: 'die_casting' },
                    { label: 'Laser Cutting', value: 'laser_cutting' }
                  ]
                },
                {
                  label: 'Surface Treatment',
                  items: [
                    { label: 'Anodizing', value: 'anodizing' },
                    { label: 'Powder Coating', value: 'powder_coating' },
                    { label: 'Heat Treatment', value: 'heat_treatment' }
                  ]
                }
              ],
              optionGroupLabel: 'label',
              optionGroupChildren: 'items',
              filter: true,
              showToggleAll: true,
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
          required: true,
          acceptedTypes: '.png,.jpg,.jpeg,.pdf,.doc,.docx',
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

  prevStep() {
    this.activeStepIndex--;
  }

  nextStep() {
    const formlyFields = this.currentFields;
    
    // Mark all fields in the current step as touched
    this.markFieldsAsTouched(formlyFields);
    
    // Check if the current step is valid
    if (this.isStepValid(formlyFields)) {
      // For step 1 to 2, check if phone verification is required (only if not already verified)
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
  
  updateData(data: any) {
    console.log('Preparing data for submission:', data);
    let body = {
      company_name: data.company_name,
      primary_email_id: data.primary_email_id,
      onboarding_status: 'Under Review',
      registered_lat: data.registeredAddress.location.lat,
      registered_lng: data.registeredAddress.location.lng, 
      phone_verified: this.phoneVerified,
      company_profile: JSON.stringify(data)
    };
    return body;
  }

  postDataFunction(endPoint:any, body: any) {
    this.commonService.postData(endPoint, body).subscribe((res: any) => {
      sessionStorage.setItem('supplier_id', res.data.name);
      this.hasExistingSupplier = true;
      this.messageService.add({
        severity: 'success',
        summary: 'Form Submitted Successfully',
        detail: 'Your information has been saved. Redirecting to the next step of the onboarding process.',
        life: 3000
      });
      // Navigate to verification page after 3 seconds
      setTimeout(() => {
        this.router.navigate(['/wefab/supplier/supplier-onboarding-l2']);
      }, 3000);
    }, (err) => {
      console.error('Error submitting form:', err);
    });
  }

  putDataFunction(endPoint:any, body: any) {
    this.commonService.putData(endPoint, body).subscribe((res: any) => {
      sessionStorage.setItem('supplier_id', res.data.name);
      this.hasExistingSupplier = true;
      this.messageService.add({
        severity: 'success',
        summary: 'Update Successful',
        detail: 'Your supplier information has been updated. Redirecting to the next step of the onboarding process.',
        life: 3000
      });      
      
      // Navigate to verification page after 3 seconds
      this.router.navigateByUrl('/wefab/supplier/profile-review')

    }, (err) => {
      console.error('Error updating form:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Submission Error',
        detail: err.error?.message || 'An error occurred while submitting the form. Please try again later.',
        life: 5000
      });
    });
  }
  
  postSupplierOnboardingL1() {
    let companyProfile = { ...this.form.value };
    
    // Extract city, state, and country from the registeredAddress if it has the new format
    if (companyProfile.registeredAddress && typeof companyProfile.registeredAddress === 'object') {
      // Store the structured registeredAddress
      const addressData = companyProfile.registeredAddress;
      
      // Update the city, state, and country from the address components
      if (!companyProfile.city && addressData.city) {
        companyProfile.city = addressData.city;
      }
      
      if (!companyProfile.state && addressData.state) {
        companyProfile.state = addressData.state;
      }
      
      if (!companyProfile.country && addressData.country) {
        companyProfile.country = addressData.country;
      }
    }
    
    // Ensure phone verification status is included
    companyProfile.phone_verified = this.phoneVerified;
    
    // Create the body for the API
    let body = {
      company_profile: JSON.stringify(companyProfile)
    };
    
    console.log('Submitting L1 data:', body);
    
    let endPoint = '/api/resource/wfb_supplier_onboarding_L1';
    
    // Check if we have a supplier_id
    let supplier_id = sessionStorage.getItem('supplier_id');
    this.model.phone_verified = this.phoneVerified;
    this.model.registered_lat = this.model.registeredAddress.location.lat;
    this.model.registered_lng = this.model.registeredAddress.location.lng;
    body = this.updateData(this.model);
    if(supplier_id) {
      endPoint = '/api/resource/wfb_supplier_onboarding_L1/' + supplier_id;
      this.putDataFunction(endPoint, body);
    } else {
      this.postDataFunction(endPoint, body);
    }
  }
  
  putSupplierOnboardingL1() {
    let endPoint = '/api/resource/wfb_supplier_onboarding_L1/'  + sessionStorage.getItem('supplier_id');
    this.model.phone_verified = this.phoneVerified;
    console.log('Updating existing form data:', this.model);
    let body = this.updateData(this.model);
  }
  
  submit() {
    if (this.form.valid) {
      debugger
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

  // Add a method to navigate to supplier review page
  navigateToReviewPage() {
    const supplierId = sessionStorage.getItem('supplier_id');
    if (supplierId) {
      this.router.navigate(['/wefab/supplier/supplier-verification'], {
        queryParams: { supplier_id: supplierId }
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Supplier ID not found. Please try again.',
        life: 3000
      });
    }
  }

  // Handle GST verification event
  onGstVerified(verified: boolean): void {
    this.gstVerified = verified;
    console.log('GST verification status:', verified);
  }

  onCompanyNameChanged(companyName: string) {
    console.log('onCompanyNameChanged called with:', companyName);
    
    if (companyName) {
      this.model.company_name = companyName;
      
      // If using reactive forms:
      // this.form.patchValue({
      //   company_name: companyName
      // });
      
      console.log('Company name updated to:', this.model.company_name);
      
      // Force change detection if needed
      this.cdr.detectChanges();
    } else {
      console.error('Received empty company name');
    }
  }

  // ... existing verifyGST method but make it call a GST verification service or API
  verifyGST(gstNumber: string) {
    if (!gstNumber) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter a GST number first',
        life: 3000
      });
      return;
    }

    // Add your GST verification logic here
    console.log('Verifying GST number:', gstNumber);
    
    // For now, just show a success message
    this.messageService.add({
      severity: 'info',
      summary: 'Verification',
      detail: 'GST verification in progress...',
      life: 3000
    });
  }
}