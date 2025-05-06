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
    ToastModule
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
              placeholder: 'Enter your registered company name',
              required: true,
              description: 'Enter the official registered name of your business'
            },
            validation: {
              messages: {
                required: 'Legal Business Name is required'
              }
            }
          },
          {
            className: 'col-md-6 mb-3',
            key: 'gstNumber',
            type: 'input',
            templateOptions: {
              label: 'GST Number',
              placeholder: 'Enter 15-digit GST number',
              required: true,
              description: 'Your Goods and Services Tax registration number'
            },
            validation: {
              messages: {
                required: 'GST Number is required'
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
            key: 'contactPersonName',
            type: 'input',
            templateOptions: {
              label: 'Contact Person Name',
              placeholder: 'Enter full name of primary contact person',
              required: true
            },
            validation: {
              messages: {
                required: 'Contact Person Name is required'
              }
            }
          },
          {
            className: 'col-md-6 mb-3',
            key: 'emailAddress',
            type: 'input',
            templateOptions: {
              label: 'Email Address',
              placeholder: 'Enter contact email address',
              required: true,
              type: 'email',
              description: 'This will be used for all communications'
            },
            validation: {
              messages: {
                required: 'Email Address is required',
                email: 'Please enter a valid email address'
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
              placeholder: 'Enter 10-character PAN number',
              required: true
            },
            validation: {
              messages: {
                required: 'PAN Number is required'
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
                required: 'Country is required'
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
              label: 'Phone Number (with OTP verification)',
              placeholder: 'Enter phone number',
              required: true,
              addonRight: {
                text: 'Send OTP',
                className: 'btn-primary',
                onClick: () => this.sendOTP(),
              }
            },
            validation: {
              messages: {
                required: 'Phone Number is required'
              }
            }
          },
          {
            className: 'col-md-6 mb-3',
            key: 'otp',
            type: 'input',
            templateOptions: {
              label: 'OTP',
              placeholder: 'Enter OTP sent to your phone',
              required: true
            },
            expressionProperties: {
              'templateOptions.disabled': 'model.basicDetails && !model.basicDetails.phoneNumber',
            },
            validation: {
              messages: {
                required: 'OTP is required'
              }
            }
          }
        ]
      },
      {
        key: 'registeredAddress',
        type: 'textarea',
        templateOptions: {
          label: 'Registered Address',
          placeholder: 'Enter complete registered address with city, state, PIN code',
          required: true,
          rows: 3
        },
        validation: {
          messages: {
            required: 'Registered Address is required'
          }
        }
      },
      {
        key: 'manufacturingFacilityAddress',
        type: 'textarea',
        templateOptions: {
          label: 'Manufacturing Facility Address',
          placeholder: 'Enter manufacturing facility address with city, state, PIN code',
          required: true,
          rows: 3,
          description: 'Please include the full address of your manufacturing facility'
        },
        validation: {
          messages: {
            required: 'Manufacturing Facility Address is required'
          }
        }
      }
    ];
  }

  getManufacturingCapabilitiesFields(): FormlyFieldConfig[] {
    return [
      {
        key: 'manufacturingCapabilities',
        type: 'multicheckbox',
        templateOptions: {
          label: 'Manufacturing Capabilities',
          required: true,
          options: [
            { label: 'CNC Machining', value: 'cnc_machining' },
            { label: '3D Printing', value: '3d_printing' },
            { label: 'Sheet Metal Fabrication', value: 'sheet_metal' },
            { label: 'Injection Molding', value: 'injection_molding' },
            { label: 'Casting', value: 'casting' },
            { label: 'Extrusion', value: 'extrusion' },
            { label: 'Welding', value: 'welding' },
            { label: 'Electronics Assembly', value: 'electronics' }
          ],
          description: 'Select all manufacturing capabilities that apply to your business'
        },
        validation: {
          messages: {
            required: 'Please select at least one manufacturing capability'
          }
        }
      },
      {
        key: 'materialTypes',
        type: 'multicheckbox',
        templateOptions: {
          label: 'Material Types',
          required: true,
          options: [
            { label: 'Metals (Steel, Aluminum, etc.)', value: 'metals' },
            { label: 'Plastics (ABS, PLA, Nylon, etc.)', value: 'plastics' },
            { label: 'Rubber & Elastomers', value: 'rubber' },
            { label: 'Composites', value: 'composites' },
            { label: 'Wood', value: 'wood' },
            { label: 'Ceramics', value: 'ceramics' },
            { label: 'Electronics Components', value: 'electronics' }
          ]
        },
        validation: {
          messages: {
            required: 'Please select at least one material type'
          }
        }
      },
      {
        key: 'certifications',
        type: 'multicheckbox',
        templateOptions: {
          label: 'Certifications',
          options: [
            { label: 'ISO 9001', value: 'iso_9001' },
            { label: 'ISO 14001', value: 'iso_14001' },
            { label: 'AS9100', value: 'as9100' },
            { label: 'IATF 16949', value: 'iatf_16949' },
            { label: 'UL Certification', value: 'ul' },
            { label: 'CE Marking', value: 'ce' },
            { label: 'RoHS Compliance', value: 'rohs' }
          ],
          description: 'Select all certifications that your company currently holds'
        }
      },
      {
        key: 'qualityControlProcess',
        type: 'textarea',
        templateOptions: {
          label: 'Quality Control Process',
          placeholder: 'Describe your quality control procedures and processes',
          required: true,
          rows: 3
        },
        validation: {
          messages: {
            required: 'Quality Control Process description is required'
          }
        }
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
              placeholder: 'Enter minimum order value',
              required: true,
              type: 'number'
            },
            validation: {
              messages: {
                required: 'Minimum Order Value is required'
              }
            }
          },
          {
            className: 'col-md-6 mb-3',
            key: 'leadTime',
            type: 'input',
            templateOptions: {
              label: 'Average Lead Time (Days)',
              placeholder: 'Enter average lead time in days',
              required: true,
              type: 'number'
            },
            validation: {
              messages: {
                required: 'Lead Time is required'
              }
            }
          }
        ]
      },
      {
        key: 'documents',
        templateOptions: {
          label: 'Required Documents',
        },
        fieldGroup: [
          {
            key: 'gstCertificate',
            type: 'file',
            templateOptions: {
              label: 'GST Registration Certificate',
              required: true,
              description: 'Upload GST registration certificate (PDF format only)'
            },
            validation: {
              messages: {
                required: 'GST Certificate is required'
              }
            }
          },
          {
            key: 'panCard',
            type: 'file',
            templateOptions: {
              label: 'PAN Card',
              required: true,
              description: 'Upload PAN card copy (PDF or JPG format)'
            },
            validation: {
              messages: {
                required: 'PAN Card copy is required'
              }
            }
          },
          {
            key: 'msmeRegistration',
            type: 'file',
            templateOptions: {
              label: 'MSME Registration (if applicable)',
              description: 'Upload MSME registration certificate if applicable'
            }
          },
          {
            key: 'iso9001',
            type: 'file',
            templateOptions: {
              label: 'ISO 9001 Certificate (if applicable)',
              description: 'Upload ISO 9001 certificate if applicable'
            }
          }
        ]
      }
    ];
  }

  sendOTP() {
    // Mock function to simulate sending OTP
    this.messageService.add({
      severity: 'success',
      summary: 'OTP Sent',
      detail: 'A verification code has been sent to your phone number.',
      life: 5000
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
        life: 6000
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
        detail: 'Your supplier onboarding application has been received and will be reviewed shortly. You will receive confirmation via email.',
        life: 8000
      });
    } else {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields correctly before submitting the form.',
        life: 6000
      });
    }
  }
}
