import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';

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
    FormlyModule,
    FormlyBootstrapModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TooltipModule,
    StepsModule,
    ToastModule,
    MultiSelectModule
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

  constructor(private fb: FormBuilder, private messageService: MessageService) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    // Initialize step fields
    this.stepFields = [
      this.getBasicDetailsFields(),          // Step 1
      this.getManufacturingCapabilitiesFields() // Step 2
    ];
    
    this.steps = [
      {
        label: 'Basic Details',
        command: () => {
          this.activeStepIndex = 0;
        }
      },
      {
        label: 'Manufacturing Capabilities & Documents',
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

  getBasicDetailsFields(): FormlyFieldConfig[] {
    return [
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-6 mb-3',
            key: 'legalBusinessName',
            type: 'input',
            templateOptions: {
              label: 'Legal Business Name',
              placeholder: 'Your company\'s registered name',
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
                    required: 'Required',
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
            className: 'col-md-6 mb-3',
            key: 'country',
            type: 'select',
            templateOptions: {
              label: 'Country',
              required: true,
              placeholder: 'Select country',
              options: [
                { label: 'India', value: 'india' },
                { label: 'United States', value: 'us' },
                { label: 'United Kingdom', value: 'uk' },
                { label: 'Germany', value: 'germany' },
                { label: 'Japan', value: 'japan' },
                { label: 'China', value: 'china' }
              ]
            },
            validation: {
              messages: {
                required: 'Required'
              }
            }
          },
          {
            className: 'col-md-6 mb-3',
            key: 'state',
            type: 'select',
            templateOptions: {
              label: 'State',
              required: true,
              placeholder: 'Select state',
              options: []
            },
            hooks: {
              onInit: (field) => {
                // Initialize state options based on country
                field.form?.get('country')?.valueChanges.subscribe(country => {
                  // Reset state value when country changes
                  field.formControl?.setValue(null);
                  
                  // Set state options based on selected country
                  switch(country) {
                    case 'india':
                      field.templateOptions!.options = [
                        { label: 'Delhi', value: 'delhi' },
                        { label: 'Maharashtra', value: 'maharashtra' },
                        { label: 'Karnataka', value: 'karnataka' },
                        { label: 'Tamil Nadu', value: 'tamil_nadu' },
                        { label: 'Uttar Pradesh', value: 'uttar_pradesh' }
                      ];
                      break;
                    case 'us':
                      field.templateOptions!.options = [
                        { label: 'California', value: 'california' },
                        { label: 'Texas', value: 'texas' },
                        { label: 'New York', value: 'new_york' },
                        { label: 'Florida', value: 'florida' }
                      ];
                      break;
                    case 'uk':
                      field.templateOptions!.options = [
                        { label: 'England', value: 'england' },
                        { label: 'Scotland', value: 'scotland' },
                        { label: 'Wales', value: 'wales' },
                        { label: 'Northern Ireland', value: 'northern_ireland' }
                      ];
                      break;
                    default:
                      field.templateOptions!.options = [];
                  }
                });
              }
            },
            validation: {
              messages: {
                required: 'Required'
              }
            },
            expressionProperties: {
              'templateOptions.disabled': '!model.country'
            }
          }
        ]
      },
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-6 mb-3',
            key: 'registeredAddress',
            type: 'textarea',
            templateOptions: {
              label: 'Registered Address',
              placeholder: 'Enter your registered address',
              required: true,
              rows: 2
            },
            validation: {
              messages: {
                required: 'Required'
              }
            }
          },
          {
            className: 'col-md-6 mb-3',
            key: 'manufacturingFacilityAddress',
            type: 'textarea',
            templateOptions: {
              label: 'Manufacturing Facility Address',
              placeholder: 'Enter your manufacturing facility address',
              required: true,
              rows: 2
            },
            validation: {
              messages: {
                required: 'Required'
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
        className: 'mb-3',
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
        key: 'qualityControlProcess',
        type: 'textarea',
        templateOptions: {
          label: 'Quality Control Process',
          placeholder: 'Describe your QC procedures',
          required: true,
          rows: 3
        },
        validation: {
          messages: {
            required: 'Required'
          }
        }
      },
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-6 mb-3',
            key: 'documents.panCard',
            type: 'file',
            props: {
              label: 'PAN Card',
              required: true
            },
            validation: {
              messages: {
                required: 'Required'
              }
            }
          },
          // {
          //   className: 'col-md-6 mb-3',
          //   key: 'certifications',
          //   type: 'p-multiselect',
          //   props: {
          //     label: 'Certifications',
          //     multiple: true,
          //     placeholder: 'Select any certifications you hold',
          //     options: [
          //       { label: 'ISO 9001', value: 'iso_9001' },
          //       { label: 'ISO 14001', value: 'iso_14001' },
          //       { label: 'AS9100', value: 'as9100' },
          //       { label: 'IATF 16949', value: 'iatf_16949' },
          //       { label: 'UL', value: 'ul' },
          //       { label: 'CE', value: 'ce' },
          //       { label: 'RoHS', value: 'rohs' }
          //     ]
          //   }
          // },
          {
            className: 'col-md-6 mb-3',
            key: 'documents.gstCertificate',
            type: 'file',
            props: {
              label: 'GST Registration Certificate',
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
            key: 'documents.iso9001',
            type: 'file',
            props: {
              label: 'ISO 9001 Certificate (if applicable)'
            }
          },
          {
            className: 'col-md-6 mb-3',
            key: 'documents.msmeRegistration',
            type: 'file',
            props: {
              label: 'MSME Registration (if applicable)'
            }
          }
        ]
      },
    ];
  }

  sendOTP() {
    // Mock function to simulate sending OTP
    this.messageService.add({
      severity: 'success',
      summary: 'OTP Sent',
      detail: 'A verification code has been sent to your phone number.',
      life: 3000
    });
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

  submit() {
    if (this.form.valid) {
      console.log('Form submitted successfully', this.model);
      this.messageService.add({
        severity: 'success',
        summary: 'Form Submitted Successfully',
        detail: 'Your supplier onboarding application has been received and will be reviewed shortly.',
        life: 5000
      });
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
}
