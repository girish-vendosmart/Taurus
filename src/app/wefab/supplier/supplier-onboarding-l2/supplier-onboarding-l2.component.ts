import { Component, OnInit, ViewChild, TemplateRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormsModule } from '@angular/forms';
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
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { SliderModule } from 'primeng/slider';

// Import Components
import { FileUploadComponent } from '../supplier-onboarding/file-upload.component';
import { FormlyRepeatTypeComponent } from '../../../../app/formly-repeat-type.component';
import { FormlyFieldFileUploadComponent } from '../../../../app/file-upload-type.component';
import { FormlyFieldRangeSliderComponent } from '../../../../app/range-slider-type.component';
import { FormlyFieldDropdownComponent } from '../../../../app/dropdown-type.component';

@Component({
  selector: 'app-supplier-onboarding-l2',
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
    FileUploadComponent,
    FormlyRepeatTypeComponent,
    FormlyFieldFileUploadComponent,
    FormlyFieldRangeSliderComponent,
    FormlyFieldDropdownComponent
  ],
  providers: [MessageService],
  templateUrl: './supplier-onboarding-l2.component.html',
  styleUrl: './supplier-onboarding-l2.component.scss'
})
export class SupplierOnboardingL2Component implements OnInit {
  form: FormGroup;
  model: any = {
    machines: [{}],
    certifications: [{}],
    industries: [],
    productionCapacity: 0,
    facilityAddress: '',
    facilityPhotos: null,
    gpsCoordinates: '',
    floorArea: 0
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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.form = this.fb.group({});
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Initialize step fields
    this.stepFields = [
      this.getManufacturingCapabilitiesFields(),
      this.getFacilityVerificationFields()
    ];
    
    this.steps = [
      {
        label: 'Manufacturing Capabilities',
        command: () => {
          this.activeStepIndex = 0;
        }
      },
      {
        label: 'Facility Verification',
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

  getManufacturingCapabilitiesFields(): FormlyFieldConfig[] {
    return [
      // Machine Details Section
      {
        fieldGroupClassName: 'mb-4',
        fieldGroup: [
          {
            template: `
              <div class="section-header mb-3">
                <h4 class="text-blueprint-blue">Machine Details</h4>
                <p class="text-machine-gray">Add details about your manufacturing machines.</p>
              </div>
            `
          },
          {
            key: 'machines',
            type: 'repeat',
            fieldArray: {
              fieldGroup: [
                {
                  fieldGroupClassName: 'row',
                  fieldGroup: [
                    {
                      className: 'col-md-6 mb-3',
                      key: 'make',
                      type: 'input',
                      templateOptions: {
                        label: 'Make',
                        placeholder: 'Manufacturer name',
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
                      key: 'model',
                      type: 'input',
                      templateOptions: {
                        label: 'Model',
                        placeholder: 'Model number',
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
                      key: 'specifications',
                      type: 'input',
                      templateOptions: {
                        label: 'Specifications',
                        placeholder: 'Key specifications',
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
                      key: 'quantity',
                      type: 'input',
                      templateOptions: {
                        label: 'Quantity',
                        type: 'number',
                        min: 1,
                        placeholder: '1',
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
                  key: 'machinePhotos',
                  type: 'file-upload',
                  className: 'mb-3',
                  templateOptions: {
                    label: 'Machine Photos',
                    description: 'Upload photos of this machine (max 10MB per file)',
                    required: true
                  },
                  validation: {
                    messages: {
                      required: 'At least one photo is required'
                    }
                  }
                }
              ]
            }
          }
        ]
      },
      
      // Certifications Section
      {
        fieldGroupClassName: 'mb-4 mt-5',
        fieldGroup: [
          {
            template: `
              <div class="section-header mb-3">
                <h4 class="text-blueprint-blue">Certifications</h4>
                <p class="text-machine-gray">Add details about your certifications.</p>
              </div>
            `
          },
          {
            key: 'certifications',
            type: 'repeat',
            fieldArray: {
              fieldGroup: [
                {
                  fieldGroupClassName: 'row',
                  fieldGroup: [
                    {
                      className: 'col-md-6 mb-3',
                      key: 'certificationName',
                      type: 'input',
                      templateOptions: {
                        label: 'Certification Name',
                        placeholder: 'e.g. ISO 9001',
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
                      key: 'certifyingBody',
                      type: 'input',
                      templateOptions: {
                        label: 'Certifying Body',
                        placeholder: 'e.g. Bureau Veritas',
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
                      key: 'expirationDate',
                      type: 'input',
                      templateOptions: {
                        label: 'Expiration Date',
                        type: 'date',
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
                      key: 'certificateDocument',
                      type: 'file-upload',
                      templateOptions: {
                        label: 'Certificate Document',
                        description: 'Upload certificate document (PDF preferred)',
                        required: true
                      },
                      validation: {
                        messages: {
                          required: 'Certificate document is required'
                        }
                      }
                    }
                  ]
                }
              ]
            }
          }
        ]
      },
      
      // Production & Industries Section
      {
        fieldGroupClassName: 'mb-4 mt-5',
        fieldGroup: [
          {
            template: `
              <div class="section-header mb-3">
                <h4 class="text-blueprint-blue">Production & Industries</h4>
                <p class="text-machine-gray">Provide details about your production capacity and industries served.</p>
              </div>
            `
          },
          {
            fieldGroupClassName: 'row',
            fieldGroup: [
              {
                className: 'col-md-6 mb-3',
                key: 'productionCapacity',
                type: 'range-slider',
                templateOptions: {
                  label: 'Production Capacity',
                  description: 'Current facility utilization',
                  min: 0,
                  max: 100,
                  step: 1,
                  unit: '%',
                  showLabels: true,
                  minLabel: 'Min',
                  maxLabel: 'Max',
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
                key: 'industries',
                type: 'p-multiselect',
                templateOptions: {
                  label: 'Industries Served',
                  options: [
                    { label: 'Aerospace', value: 'aerospace' },
                    { label: 'Automotive', value: 'automotive' },
                    { label: 'Consumer Electronics', value: 'consumer_electronics' },
                    { label: 'Defense', value: 'defense' },
                    { label: 'Healthcare', value: 'healthcare' },
                    { label: 'Industrial', value: 'industrial' },
                    { label: 'Medical Devices', value: 'medical_devices' },
                    { label: 'Robotics', value: 'robotics' },
                    { label: 'Telecommunications', value: 'telecommunications' }
                  ],
                  placeholder: 'Select all industries that apply',
                  required: true,
                  description: 'Select all industries that apply',
                  filter: true,
                  showToggleAll: true
                },
                validation: {
                  messages: {
                    required: 'Required'
                  }
                }
              }
            ]
          }
        ]
      }
    ];
  }

  getFacilityVerificationFields(): FormlyFieldConfig[] {
    return [
      {
        template: `
          <h4 class="text-blueprint-blue mb-2">Facility Verification</h4>
          <p class="mb-4">Upload geotagged photos of your manufacturing facility.</p>
        `
      },
      {
        template: `
          <div class="alert alert-warning mb-4">
            <strong>Important:</strong> Verified facility photos improve your profile ranking and visibility to potential clients. Please ensure photos clearly show your manufacturing space and equipment.
          </div>
        `
      },
      {
        key: 'facilityPhotos',
        type: 'file-upload',
        templateOptions: {
          label: 'Facility Photos',
          required: true,
          multiple: true
        },
        validation: {
          messages: {
            required: 'Facility photos are required'
          }
        }
      },
      {
        template: `
          <p class="mt-2 mb-4">Upload at least 3 photos of your facility (exterior, production floor, quality control area)</p>
        `
      },
      {
        template: `
          <div class="card border-primary mt-4 mb-3">
            <div class="card-body">
              <h5 class="card-title text-primary">Verification Process</h5>
              <p class="card-text">Our team will verify the uploaded photos against your registered address. This process typically takes 2-3 business days. You'll be notified once verification is complete.</p>
            </div>
          </div>
        `
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
      if (this.activeStepIndex < this.steps.length - 1) {
        this.activeStepIndex++;
      } else {
        this.submit();
      }
    } else {
      const errorMessages: { [key: number]: string } = {
        0: 'Please fill in all required manufacturing capability details correctly before proceeding.',
        1: 'Please complete all required facility verification details.'
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
    // Mark all fields as touched
    this.markFieldsAsTouched(this.currentFields);
    
    if (this.form.valid) {
      console.log('L2 Form submitted successfully', this.model);
      this.messageService.add({
        severity: 'success',
        summary: 'Form Submitted Successfully',
        detail: 'Your detailed supplier information has been received and will be reviewed shortly.',
        life: 5000
      });
      // Here you would typically send the data to the server or navigate to the next step
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields correctly before submitting the form.',
        life: 4000
      });
    }
  }
} 