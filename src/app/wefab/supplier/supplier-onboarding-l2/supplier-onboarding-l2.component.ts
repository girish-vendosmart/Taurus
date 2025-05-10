import { Component, OnInit, ViewChild, TemplateRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { Router } from '@angular/router';
import { CommonService } from '../../shared/common.service';

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
  getManufacturerData: any;
  
  constructor(
    private fb: FormBuilder, 
    private messageService: MessageService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private commonService: CommonService
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

    // Check if we're in edit mode
    const route = this.router.url;
    if (route.includes('editMode=true')) {
      const supplierId = sessionStorage.getItem('supplier_id');
      if (supplierId) {
        this.getL2Data(supplierId);
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
  }

  getL2Data(supplierId: any) {
    let endPoint = '/api/resource/wfb_supplier_onboarding_L2/' + supplierId;
    this.commonService.getData(endPoint).subscribe((res: any) => {
      this.getManufacturerData = JSON.parse(res.data.company_profile);
      console.log('Retrieved data:', this.getManufacturerData);
      this.patchValueForm();
    });
  }

  patchValueForm() {
    if (!this.getManufacturerData) {
      return;
    }
    
    // Create a deep copy of the manufacturer data
    const processedData = JSON.parse(JSON.stringify(this.getManufacturerData));
    
    // Process file uploads in machines array
    if (processedData.machines && Array.isArray(processedData.machines)) {
      processedData.machines.forEach((machine: any) => {
        // Transform machinePhotos to the format expected by file-upload component
        if (machine.machinePhotos && typeof machine.machinePhotos === 'object' && !Array.isArray(machine.machinePhotos)) {
          // If it's a single file object
          this.transformFileObject(machine, 'machinePhotos');
        }
      });
    }
    
    // Process certifications array for certificate documents
    if (processedData.certifications && Array.isArray(processedData.certifications)) {
      processedData.certifications.forEach((cert: any) => {
        // Transform certificateDocument to the format expected by file-upload component
        if (cert.certificateDocument && typeof cert.certificateDocument === 'object' && !Array.isArray(cert.certificateDocument)) {
          this.transformFileObject(cert, 'certificateDocument');
        }
      });
    }
    
    // Process facilityPhotos if exists
    if (processedData.facilityPhotos) {
      if (Array.isArray(processedData.facilityPhotos)) {
        // If it's already an array, ensure each item has the correct format
        processedData.facilityPhotos = processedData.facilityPhotos.map((photo: any) => {
          return this.createFileObjectFromData(photo);
        });
      } else if (typeof processedData.facilityPhotos === 'object') {
        // If it's a single object, transform it to an array
        processedData.facilityPhotos = [this.createFileObjectFromData(processedData.facilityPhotos)];
      }
    }
    
    // Update the model with the processed values
    this.model = processedData;
    
    // Force form control update after model is set
    setTimeout(() => {
      this.form.patchValue(this.model);
      this.form.markAsPristine();
      console.log('Form patched with processed data:', this.model);
    });
  }

  /**
   * Transforms a file object in the parent object at the specified key
   */
  transformFileObject(parentObj: any, fileKey: string) {
    if (parentObj[fileKey]) {
      parentObj[fileKey] = this.createFileObjectFromData(parentObj[fileKey]);
    }
  }

  /**
   * Creates a properly formatted file object that works with the file-upload component
   */
  createFileObjectFromData(fileData: any): any {
    // Check if the file data is already in the correct format
    if (fileData && typeof fileData === 'object') {
      // Ensure it has all the required properties
      const fileObj: any = {
        name: fileData.name || 'document',
        size: fileData.size || 0,
        type: fileData.type || 'application/octet-stream',
        url: fileData.url || fileData.file_url || ''
      };
      
      // If it already has a lastModified property, use it
      if (fileData.lastModified) {
        fileObj.lastModified = fileData.lastModified;
      } else {
        // Otherwise, set it to now
        fileObj.lastModified = Date.now();
      }
      
      return fileObj;
    }
    
    // If it's just a URL string, create a minimalist file object
    if (typeof fileData === 'string') {
      return {
        name: fileData.split('/').pop() || 'document',
        size: 0,
        type: 'application/octet-stream',
        url: fileData,
        lastModified: Date.now()
      };
    }
    
    return fileData;
  }

  // Getter to make accessing the current step's fields easy in template
  get currentFields(): FormlyFieldConfig[] {
    return this.stepFields[this.activeStepIndex] || [];
  }

  getManufacturingCapabilitiesFields(): FormlyFieldConfig[] {
    return [
      // Machine Details Section
      {
        fieldGroupClassName: 'mb-2',
        fieldGroup: [
          {
            template: `
              <div class="section-header mb-2">
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
                      className: 'col-md-6 mb-2',
                      key: 'make',
                      type: 'input',
                      templateOptions: {
                        label: 'Make',
                        placeholder: 'Manufacturer name',
                        required: true
                      },
                      validation: {
                        messages: {
                          required: 'Please enter the machine manufacturer name'
                        }
                      }
                    },
                    {
                      className: 'col-md-6 mb-2',
                      key: 'model',
                      type: 'input',
                      templateOptions: {
                        label: 'Model',
                        placeholder: 'Model number',
                        required: true
                      },
                      validation: {
                        messages: {
                          required: 'Please provide the machine model number'
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
                      key: 'specifications',
                      type: 'input',
                      templateOptions: {
                        label: 'Specifications',
                        placeholder: 'Key specifications',
                        required: true
                      },
                      validation: {
                        messages: {
                          required: 'Please specify the key machine specifications'
                        }
                      }
                    },
                    {
                      className: 'col-md-6 mb-2',
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
                          required: 'Please enter the quantity of machines'
                        }
                      }
                    }
                  ]
                },
                {
                  key: 'machinePhotos',
                  type: 'file-upload',
                  className: 'col-12 mb-2',
                  templateOptions: {
                    label: 'Machine Photos',
                    description: 'Upload photos of this machine (max 10MB per file)',
                    required: true
                  },
                  validation: {
                    messages: {
                      required: 'Please upload at least one photo of this machine'
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
        fieldGroupClassName: 'mb-2 mt-3',
        fieldGroup: [
          {
            template: `
              <div class="section-header mb-2">
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
                      className: 'col-md-6 mb-2',
                      key: 'certificationName',
                      type: 'input',
                      templateOptions: {
                        label: 'Certification Name',
                        placeholder: 'e.g. ISO 9001',
                        required: true
                      },
                      validation: {
                        messages: {
                          required: 'Please enter the certification name'
                        }
                      }
                    },
                    {
                      className: 'col-md-6 mb-2',
                      key: 'certifyingBody',
                      type: 'input',
                      templateOptions: {
                        label: 'Certifying Body',
                        placeholder: 'e.g. Bureau Veritas',
                        required: true
                      },
                      validation: {
                        messages: {
                          required: 'Please specify the certifying organization'
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
                      key: 'expirationDate',
                      type: 'input',
                      templateOptions: {
                        label: 'Expiration Date',
                        type: 'date',
                        required: true
                      },
                      validation: {
                        messages: {
                          required: 'Please enter the certification expiration date'
                        }
                      }
                    },
                    {
                      className: 'col-md-6 mb-2',
                      key: 'certificateDocument',
                      type: 'file-upload',
                      templateOptions: {
                        label: 'Certificate Document',
                        description: 'Upload certificate document (PDF preferred)',
                        required: true
                      },
                      validation: {
                        messages: {
                          required: 'Please upload the certificate document'
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
        fieldGroupClassName: 'mb-2 mt-3',
        fieldGroup: [
          {
            template: `
              <div class="section-header mb-2">
                <h4 class="text-blueprint-blue">Production & Industries</h4>
                <p class="text-machine-gray">Provide details about your production capacity and industries served.</p>
              </div>
            `
          },
          {
            fieldGroupClassName: 'row',
            fieldGroup: [
              {
                className: 'col-md-6 mb-2',
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
                    required: 'Please indicate your current production capacity'
                  }
                }
              },
              {
                className: 'col-md-6 mb-2',
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
                    required: 'Please select at least one industry you serve'
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
          <div class="section-header mb-2">
            <h4 class="text-blueprint-blue">Facility Verification</h4>
            <p class="text-machine-gray mb-2">Upload geotagged photos of your manufacturing facility.</p>
          </div>
        `
      },
      {
        template: `
          <div class="alert alert-warning mb-2">
            <strong>Important:</strong> Verified facility photos improve your profile ranking and visibility to potential clients. Please ensure photos clearly show your manufacturing space and equipment.
          </div>
        `
      },
      {
        key: 'facilityPhotos',
        type: 'file-upload',
        className: 'col-12 mb-2',
        templateOptions: {
          label: 'Facility Photos',
          required: true,
          multiple: true
        },
        validation: {
          messages: {
            required: 'Please upload at least 3 photos of your facility'
          }
        }
      },
      {
        template: `
          <p class="mt-1 mb-2">Upload at least 3 photos of your facility (exterior, production floor, quality control area)</p>
        `
      },
      {
        template: `
          <div class="card border-primary mt-2 mb-1">
            <div class="card-body" style="padding: 0.75rem 1rem;">
              <h5 class="card-title text-primary" style="font-size: 1rem; margin-bottom: 0.25rem;">Verification Process</h5>
              <p class="card-text" style="font-size: 0.85rem; margin-bottom: 0;">Our team will verify the uploaded photos against your registered address. This process typically takes 2-3 business days. You'll be notified once verification is complete.</p>
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

  updateData(data:any) {
    console.log(data);
    let body = {
      supplier_company_id: sessionStorage.getItem('supplier_id'),
      onboarding_status: 'Under Review',
      company_profile: JSON.stringify(data)
    };
    return body;
  }

  postSupplierOnboardingL2() {
    let endPoint = '/api/resource/wfb_supplier_onboarding_L2';
    let body = this.updateData(this.model);
    this.commonService.putData(endPoint, body).subscribe((res: any) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Form Submitted Successfully',
        detail: 'Your detailed supplier information has been received. Starting manufacturing verification process.',
        life: 3000
      });
      
      // Navigate to manufacturing verification after 3 seconds
      setTimeout(() => {
        this.router.navigate(['/wefab/supplier/manufacturing-verification']);
      }, 3000);
    }, (err:any) => {
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
    // Mark all fields as touched
    this.markFieldsAsTouched(this.currentFields);
    
    if (this.form.valid) {
      console.log('L2 Form submitted successfully', this.model);
      this.postSupplierOnboardingL2();
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