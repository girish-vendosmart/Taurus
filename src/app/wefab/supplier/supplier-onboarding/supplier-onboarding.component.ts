import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
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
            key: 'gstNumber',
            type: 'input',
            templateOptions: {
              label: 'GST Number',
              placeholder: 'Enter GST number',
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
            key: 'panNumber',
            type: 'input',
            templateOptions: {
              label: 'PAN Number',
              placeholder: 'Enter PAN number',
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
            key: 'contactPersonName',
            type: 'input',
            templateOptions: {
              label: 'Contact Person Name',
              placeholder: 'Enter full name',
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
            key: 'emailAddress',
            type: 'input',
            templateOptions: {
              label: 'Email Address',
              placeholder: 'Enter email',
              required: true,
              type: 'email'
            },
            validation: {
              messages: {
                required: 'Required',
                email: 'Invalid email'
              }
            }
          },
          {
            className: 'col-md-6 mb-3',
            key: 'country',
            type: 'select',
            templateOptions: {
              label: 'Country',
              required: true,
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
          }
        ]
      },
      {
        fieldGroupClassName: 'row',
        fieldGroup: [
          {
            className: 'col-md-6 mb-3',
            key: 'phoneNumber',
            type: 'input',
            templateOptions: {
              label: 'Phone Number',
              placeholder: 'Enter phone number',
              required: true,
              addonRight: {
                text: 'OTP',
                className: 'btn-primary',
                onClick: () => this.sendOTP(),
              }
            },
            validation: {
              messages: {
                required: 'Required'
              }
            }
          },
          {
            className: 'col-md-6 mb-3',
            key: 'otp',
            type: 'input',
            templateOptions: {
              label: 'OTP',
              placeholder: 'Enter OTP',
              required: true
            },
            expressionProperties: {
              'templateOptions.disabled': 'model.basicDetails && !model.basicDetails.phoneNumber',
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
            key: 'minimumOrderValue',
            type: 'input',
            templateOptions: {
              label: 'Minimum Order Value (INR)',
              placeholder: 'Enter value',
              required: true,
              type: 'number'
            },
            validation: {
              messages: {
                required: 'Required'
              }
            }
          },
          {
            className: 'col-md-6 mb-3',
            key: 'leadTime',
            type: 'input',
            templateOptions: {
              label: 'Average Lead Time (Days)',
              placeholder: 'Enter days',
              required: true,
              type: 'number'
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
            key: 'registeredAddress',
            type: 'textarea',
            templateOptions: {
              label: 'Registered Address',
              placeholder: 'Enter complete address',
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
              placeholder: 'Enter facility address',
              required: true,
              rows: 2
            },
            validation: {
              messages: {
                required: 'Required'
              }
            }
          }
        ]
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
