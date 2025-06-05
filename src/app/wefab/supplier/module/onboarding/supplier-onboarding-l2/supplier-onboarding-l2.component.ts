import { Component, OnInit, ViewChild, TemplateRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { Router } from '@angular/router';
import { CommonService } from '../../../../../shared/services/common.service';

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
import { FormlyRepeatTypeComponent } from '../../../../../shared/formly-components/formly-repeat-type.component';
import { FormlyFieldFileUploadComponent } from '../../../../../shared/formly-components/file-upload-type.component';
import { FormlyFieldRangeSliderComponent } from '../../../../../shared/formly-components/range-slider-type.component';
import { FormlyFieldDropdownComponent } from '../../../../../shared/formly-components/dropdown-type.component';

// SweetAlertService
import { SweetAlertService } from '../../../../../shared/services/sweet-alert.service';

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
    private commonService: CommonService,
    private sweetAlertService: SweetAlertService
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
    if (route.includes('mode=edit')) {
      const supplierId = localStorage.getItem('supplier_id');
      if (supplierId) {
        this.getL2Data(supplierId);
      } else {
        this.sweetAlertService.error('Supplier ID not found. Please try again.');
        this.router.navigate(['/wefab/supplier/supplier-verification']);
      }
    }
  }

  getL2Data(supplierId: any) {
    let endPoint = '/api/resource/Supplier Onboarding L2/' + supplierId;
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
    
    console.log('Original data:', this.getManufacturerData);
    
    // Create a deep copy of the manufacturer data
    const processedData = JSON.parse(JSON.stringify(this.getManufacturerData));
    
    // Process machines array - handle all properties including file uploads
    if (processedData.machines && Array.isArray(processedData.machines)) {
      // Ensure at least one empty machine if none exists
      if (processedData.machines.length === 0) {
        processedData.machines = [{}];
      }
      
      processedData.machines.forEach((machine: any, index: number) => {
        if (machine.machinePhotos) {
          console.log(`Processing machine ${index} photos (before):`, machine.machinePhotos);
          let photoFiles = [];
          
          // If it's already an array, process each item
          if (Array.isArray(machine.machinePhotos)) {
            photoFiles = machine.machinePhotos.map((photo: any) => this.convertToFileObject(photo));
          } 
          // If it's a single object, convert and wrap in array
          else if (typeof machine.machinePhotos === 'object') {
            photoFiles = [this.convertToFileObject(machine.machinePhotos)];
          }
          // If it's a URL string
          else if (typeof machine.machinePhotos === 'string') {
            photoFiles = [this.convertToFileObject(machine.machinePhotos)];
          }
          
          machine.machinePhotos = photoFiles;
          console.log(`Machine ${index} photos (after processing):`, machine.machinePhotos);
        }
      });
    } else {
      // Initialize with empty array if machines don't exist
      processedData.machines = [{}];
    }
    
    // Process certifications array - handle all properties including file uploads
    if (processedData.certifications && Array.isArray(processedData.certifications)) {
      // Ensure at least one empty certification if none exists
      if (processedData.certifications.length === 0) {
        processedData.certifications = [{}];
      }
      
      processedData.certifications.forEach((cert: any, index: number) => {
        // Force single certificate document to be an array if it exists
        if (cert.certificateDocument) {
          console.log(`Processing certification ${index} document (before):`, cert.certificateDocument);
          let docFiles = [];
          
          // If it's already an array, process each item
          if (Array.isArray(cert.certificateDocument)) {
            docFiles = cert.certificateDocument.map((doc: any) => this.convertToFileObject(doc));
          } 
          // If it's a single object, convert and wrap in array
          else if (typeof cert.certificateDocument === 'object') {
            docFiles = [this.convertToFileObject(cert.certificateDocument)];
          }
          // If it's a URL string
          else if (typeof cert.certificateDocument === 'string') {
            docFiles = [this.convertToFileObject(cert.certificateDocument)];
          }
          
          cert.certificateDocument = docFiles;
          console.log(`Certification ${index} document (after processing):`, cert.certificateDocument);
        }
      });
    } else {
      // Initialize with empty array if certifications don't exist
      processedData.certifications = [{}];
    }
    
    // Process facility photos
    if (processedData.facilityPhotos) {
      console.log('Processing facility photos (before):', processedData.facilityPhotos);
      let facilityFiles = [];
      
      // If it's already an array, process each item
      if (Array.isArray(processedData.facilityPhotos)) {
        facilityFiles = processedData.facilityPhotos.map((photo: any) => this.convertToFileObject(photo));
      } 
      // If it's a single object, convert and wrap in array
      else if (typeof processedData.facilityPhotos === 'object') {
        facilityFiles = [this.convertToFileObject(processedData.facilityPhotos)];
      }
      // If it's a URL string
      else if (typeof processedData.facilityPhotos === 'string') {
        facilityFiles = [this.convertToFileObject(processedData.facilityPhotos)];
      }
      
      processedData.facilityPhotos = facilityFiles;
      console.log('Facility photos (after processing):', processedData.facilityPhotos);
    }
    
    // Update the model with the processed values
    this.model = processedData;
    console.log('Final processed model:', this.model);
    
    // Reset the form to match our model structure
    this.form = this.fb.group({});
    
    // Force update after a longer delay to ensure components are ready
    setTimeout(() => {
      // Patch the form with processed data
      this.form.patchValue(this.model);
      
      // Explicitly set form control values for file uploads to ensure they are recognized properly
      this.setFormControlsDirectly();
      
      this.form.markAsPristine();
      console.log('Form patched with processed data - checking file_id preservation...');
      
      // Debug: Check if file_id is preserved in form controls
      this.debugFileIdPreservation();
    }, 1500);  // Increased timeout for component initialization
  }

  /**
   * Debug method to check if file_id values are preserved in form controls
   */
  private debugFileIdPreservation() {
    console.log('=== DEBUG: Checking file_id preservation ===');
    
    // Check machine photos
    if (this.model.machines && Array.isArray(this.model.machines)) {
      this.model.machines.forEach((machine: any, machineIndex: number) => {
        if (machine.machinePhotos && machine.machinePhotos.length > 0) {
          console.log(`Machine ${machineIndex} photos in model:`, machine.machinePhotos);
          const control = this.form.get(`machines.${machineIndex}.machinePhotos`);
          if (control) {
            console.log(`Machine ${machineIndex} photos in form control:`, control.value);
          } else {
            console.log(`Machine ${machineIndex} photos form control not found`);
          }
        }
      });
    }
    
    // Check certification documents
    if (this.model.certifications && Array.isArray(this.model.certifications)) {
      this.model.certifications.forEach((cert: any, certIndex: number) => {
        if (cert.certificateDocument && cert.certificateDocument.length > 0) {
          console.log(`Certification ${certIndex} document in model:`, cert.certificateDocument);
          const control = this.form.get(`certifications.${certIndex}.certificateDocument`);
          if (control) {
            console.log(`Certification ${certIndex} document in form control:`, control.value);
          } else {
            console.log(`Certification ${certIndex} document form control not found`);
          }
        }
      });
    }
    
    // Check facility photos
    if (this.model.facilityPhotos && this.model.facilityPhotos.length > 0) {
      console.log('Facility photos in model:', this.model.facilityPhotos);
      const control = this.form.get('facilityPhotos');
      if (control) {
        console.log('Facility photos in form control:', control.value);
      } else {
        console.log('Facility photos form control not found');
      }
    }
    
    console.log('=== END DEBUG ===');
  }

  /**
   * Attempts to set a form control value with multiple retries if the control isn't found immediately
   */
  private setControlWithRetry(path: string, value: any, maxRetries: number, currentRetry: number = 0) {
    const control = this.form.get(path);
    
    if (control) {
      // Successfully found control, set the value
      control.setValue(value);
      control.markAsDirty();
      console.log(`Successfully set control for ${path} (attempt ${currentRetry + 1})`);
    } else if (currentRetry < maxRetries) {
      // Control not found yet, retry after a delay
      console.log(`Control not found for ${path}, retrying... (${currentRetry + 1}/${maxRetries})`);
      setTimeout(() => {
        this.setControlWithRetry(path, value, maxRetries, currentRetry + 1);
      }, 400 * (currentRetry + 1)); // Increasing delay with each retry
    } else {
      // Max retries reached
      console.error(`Failed to set control for ${path} after ${maxRetries} attempts`);
    }
  }
  
  /**
   * Directly sets form control values for file uploads to ensure proper initialization
   */
  private setFormControlsDirectly() {
    if (this.form && this.model) {
      // Directly set machine photos in form controls with retry logic
      if (this.model.machines && Array.isArray(this.model.machines)) {
        this.model.machines.forEach((machine: any, machineIndex: number) => {
          if (machine.machinePhotos && machine.machinePhotos.length > 0) {
            // Use retry mechanism instead of direct set
            this.setControlWithRetry(`machines.${machineIndex}.machinePhotos`, machine.machinePhotos, 6);
          }
        });
      }
      
      // Directly set certification documents in form controls with retry logic
      if (this.model.certifications && Array.isArray(this.model.certifications)) {
        this.model.certifications.forEach((cert: any, certIndex: number) => {
          if (cert.certificateDocument && cert.certificateDocument.length > 0) {
            // Use retry mechanism instead of direct set
            this.setControlWithRetry(`certifications.${certIndex}.certificateDocument`, cert.certificateDocument, 6);
          }
        });
      }
      
      // Directly set facility photos in form control with retry logic
      if (this.model.facilityPhotos && this.model.facilityPhotos.length > 0) {
        // Use retry mechanism instead of direct set
        this.setControlWithRetry('facilityPhotos', this.model.facilityPhotos, 6);
      }
    }
  }

  /**
   * Converts any file representation to a file-like object that works with the FormlyFieldFileUploadComponent
   */
  convertToFileObject(fileData: any): any {
    // Handle null/undefined
    if (!fileData) return null;
    
    let fileObject = null;
    
    // Handle by type
    if (typeof fileData === 'string') {
      // For string URL
      const fileName = this.getFileNameFromUrl(fileData);
      const fileType = this.getFileTypeFromUrl(fileName);
      
      fileObject = {
        name: fileName,
        size: 0,
        type: fileType,
        lastModified: Date.now(),
        url: fileData,
      };
    } else if (typeof fileData === 'object') {
      // For file objects - handle both fileId and file_id property names
      const fileId = fileData.fileId || fileData.file_id || '';
      
      fileObject = {
        name: fileData.name || fileData.fileName || 'document',
        size: fileData.size || 0,
        type: fileData.type || fileData.fileType || this.getFileTypeFromUrl(fileData.name || 'document'),
        lastModified: fileData.lastModified || Date.now(),
        url: fileData.url || fileData.file_url || '',
        fileId: fileId,  // Store as fileId to match FormlyFieldFileUploadComponent
        file_id: fileId  // Also store as file_id for backward compatibility
      };
    }
    
    // Return null if we couldn't create a valid file object
    if (!fileObject) return null;
    
    console.log('Converted file object:', fileObject);
    return fileObject;
  }
  
  /**
   * Helper function to extract filename from URL - matches FormlyFieldFileUploadComponent
   */
  private getFileNameFromUrl(url: string): string {
    if (!url) return 'File';
    
    // Extract filename from URL path
    const urlParts = url.split('/');
    let fileName = urlParts[urlParts.length - 1];
    
    // Remove query parameters if any
    if (fileName.includes('?')) {
      fileName = fileName.split('?')[0];
    }
    
    // Decode URI components
    try {
      return decodeURIComponent(fileName) || 'File';
    } catch (e) {
      return 'File';
    }
  }
  
  /**
   * Helper function to determine file type from name - matches FormlyFieldFileUploadComponent
   */
  private getFileTypeFromUrl(fileName: string): string {
    if (!fileName) return 'application/octet-stream';
    
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    // Return appropriate MIME type based on extension
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
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
                    description: 'Upload photos of this machine (max 10MB per file, PNG and JPEG only)',
                    required: true,
                    acceptedTypes: '.png,.jpg,.jpeg',
                    fileTypeErrorMessage: 'Only PNG and JPEG files are accepted'
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
                        description: 'Upload certificate document (PNG and JPEG only)',
                        required: true,
                        acceptedTypes: '.png,.jpg,.jpeg',
                        fileTypeErrorMessage: 'Only PNG and JPEG files are accepted'
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
          multiple: true,
          acceptedTypes: '.png,.jpg,.jpeg',
          fileTypeErrorMessage: 'Only PNG and JPEG files are accepted',
          description: 'Upload at least 3 photos of your facility (PNG and JPEG only)'
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
      
      this.sweetAlertService.error(errorMessages[this.activeStepIndex] || 'Please fill all required fields correctly.');
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
      supplier_company_id: localStorage.getItem('supplier_id'),
      onboarding_status: 'Under Review',
      company_profile: JSON.stringify(data)
    };
    return body;
  }

  postDataFunction(endPoint: string, body: any) {
    this.commonService.postData(endPoint, body).subscribe((res: any) => {
      this.sweetAlertService.success('Your information has been saved. Redirecting to the next step of the onboarding process.');
      
      // Navigate to manufacturing verification after 3 seconds
      setTimeout(() => {
        this.router.navigate(['/wefab/supplier/supplier-onboarding-l3']);
      }, 3000);
    }, (err:any) => {
      endPoint = '/api/resource/Supplier Onboarding L2/' + localStorage.getItem('supplier_id');
      this.putDataFunction(endPoint, body);
      // this.messageService.add({
      //   severity: 'error',
      //   summary: 'Submission Error',
      //   detail: err.error?.message || 'An error occurred while submitting the form. Please try again later.',
      //   life: 5000
      // });
    });
  }

  putDataFunction(endPoint: string, body: any) {
    this.commonService.putData(endPoint, body).subscribe((res: any) => {
      this.sweetAlertService.success('Your supplier information has been updated. Redirecting to the next step of the onboarding process.');
      
      // Navigate to manufacturing verification after 3 seconds
      setTimeout(() => {
        this.router.navigateByUrl('/wefab/supplier/profile-review/' + localStorage.getItem('supplier_id'))
      }, 3000);
    }, (err:any) => {
      console.error('Error submitting form:', err);
      this.sweetAlertService.error(err.error?.message || 'An error occurred while submitting the form. Please try again later.');
    });
  }

  postSupplierOnboardingL2() {
    let endPoint = '/api/resource/Supplier Onboarding L2';
    let body = this.updateData(this.model);
    this.postDataFunction(endPoint, body);
  }

  putSupplierOnboardingL2() {
    let endPoint = '/api/resource/Supplier Onboarding L2/' + localStorage.getItem('supplier_id');
    let body = this.updateData(this.model);
    this.commonService.putData(endPoint, body).subscribe((res: any) => {
      this.sweetAlertService.success('Your supplier information has been updated. We are reviewing the changes and will proceed with verification shortly.');
      
      // Navigate to manufacturing verification after 3 seconds
      setTimeout(() => {
        this.router.navigateByUrl('/wefab/supplier/profile-review/' + localStorage.getItem('supplier_id'))
      }, 3000);
    }, (err:any) => {
      console.error('Error submitting form:', err);
      this.putSupplierOnboardingL2()
      // this.messageService.add({
      //   severity: 'error',
      //   summary: 'Submission Error',
      //   detail: err.error?.message || 'An error occurred while submitting the form. Please try again later.',
      //   life: 5000 
      // });
    });
  }

  submit() {
    // Mark all fields as touched
    this.markFieldsAsTouched(this.currentFields);
    
    if (this.form.valid) {
      console.log('L2 Form submitted successfully', this.model);
      this.postSupplierOnboardingL2();
    } else {
      this.sweetAlertService.error('Please fill all required fields correctly before submitting the form.');
    }
  }
}