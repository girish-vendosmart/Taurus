import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../../../../shared/services/common.service';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormatAddressPipe } from '../../../../shared/pipes/format-address.pipe';
import { FileUploadService, FileUploadResult } from '../../../../shared/services/file-upload.service';
import { SweetAlertService } from '../../../../shared/services/sweet-alert.service';

interface Project {
  name: string;
  project_name: string;
  project_description?: string;
  delivery_date: string;
  delivery_location: string;
  creation?: string;
  modified?: string;
}

export interface CustomerAddress {
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

interface NewProject {
  project_name: string;
  project_description: string;
  delivery_date: string;
  delivery_location: string;
}

// Add new interface for new location
interface NewLocation {
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

interface TechnicalDrawing {
  name: string;
  size: number;
  file: File;
  uploadProgress?: number;
  isUploaded?: boolean;
  url?: string;
}

interface ApiResponse {
  data: Project[];
  message?: string;
}

interface LineItem {
  partNumber: string;
  description: string;
  quantity: number;
  material: string;
}

interface RfqLineItem {
  item_name: string;
  item_description: string;
  quantity: number;
  unit: string;
  ai_analyzed: number;
  ai_complexity: string;
}

interface RfqAttachment {
  file_url: string;
}

interface RfqSubmissionData {
  customer_rfq_name: string;
  customer: string;
  customer_name: string;
  contact_email: string;
  contact_phone: string;
  rfq_date: string;
  required_by_date: string;
  priority: string;
  project_type: string;
  project_description: string;
  quality_standards: string;
  budget_range: string;
  confidentiality_level: string;
  expiry_date: string;
  status: string;
  workflow_state: string;
  line_items: RfqLineItem[];
  attachments: RfqAttachment[];
}

interface UploadError {
  message?: string;
  code?: string;
}

@Component({
  selector: 'app-create-rfq',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FormatAddressPipe],
  templateUrl: './create-rfq.component.html',
  styleUrl: './create-rfq.component.scss'
})
export class CreateRfqComponent implements OnInit {
  createRfqForm!: FormGroup;
  showProjectDialog = false;
  isDropdownOpen = false;
  isDeliveryDropdownOpen = false;
  projects: Project[] = [];
  minDeliveryDate: string;
  isLoadingProjects = false;
  isCreatingProject = false;
  projectCreationError: string = '';
  projectLoadError: string = '';
  
  // Technical Drawing properties
  technicalDrawings: TechnicalDrawing[] = [];
  isUploadingDrawing = false;
  uploadError: string = '';
  maxFileSize = 10 * 1024 * 1024; // 10MB
  allowedFileTypes = ['.pdf', '.dwg', '.dxf', '.jpg', '.jpeg', '.png', '.tiff', '.step', '.stp', '.iges', '.igs'];
  
  newProject: NewProject = {
    project_name: '',
    project_description: '',
    delivery_date: '',
    delivery_location: ''
  };

  materialOptions = [
    'Aluminum',
    'Steel',
    'Stainless Steel',
    'Copper',
    'Brass',
    'Titanium',
    'Plastic - ABS',
    'Plastic - PLA',
    'Carbon Fiber'
  ];

  customerAddresses: CustomerAddress[] = [];
  isLoadingAddresses = false;
  addressLoadError: string = '';
  newProjectForm!: FormGroup;
  showLocationDialog = false;
  isCreatingLocation = false;
  locationCreationError: string = '';
  
  newLocation: NewLocation = {
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: '',
    postal_code: ''
  };

  constructor(
    private fb: FormBuilder, 
    private commonService: CommonService,
    private fileUploadService: FileUploadService,
    private router: Router,
    private sweetAlertService: SweetAlertService
  ) {
    // Set minimum delivery date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDeliveryDate = tomorrow.toISOString().split('T')[0];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Handle project dropdown
    const projectDropdown = document.querySelector('.project-dropdown');
    if (projectDropdown && !projectDropdown.contains(event.target as Node)) {
      this.isDropdownOpen = false;
    }

    // Handle delivery location dropdown
    const deliveryDropdown = document.querySelector('.delivery-dropdown');
    if (deliveryDropdown && !deliveryDropdown.contains(event.target as Node)) {
      this.isDeliveryDropdownOpen = false;
    }
  }

  ngOnInit() {
    this.initializeForm();
    this.loadProjects();
    this.initializeNewProjectForm();
  }

  initializeForm() {
    this.createRfqForm = this.fb.group({
      projectInfo: this.fb.group({
        projectId: ['', [Validators.required]],
        projectName: [''],
        rfqName: ['', [Validators.required]],
        contactEmail: ['', [Validators.required, Validators.email]],
        contactPhone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        priority: ['', [Validators.required]],
        projectType: ['', [Validators.required]]
      }),
      technicalDrawings: this.fb.group({
        hasDrawings: [false],
        drawings: [[]]
      }),
      lineItems: this.fb.array([this.createLineItem()])
    });
  }

  initializeNewProjectForm() {
    this.newProjectForm = this.fb.group({
      project_name: ['', [Validators.required]],
      project_description: [''],
      delivery_date: ['', [Validators.required]],
      delivery_location: ['', [Validators.required]]
    });
  }

  // Load existing projects from API
  loadProjects() {
    this.isLoadingProjects = true;
    this.projectLoadError = '';
    const params = new HttpParams().set('fields', '["*"]');
    
    this.commonService.getWefabData('/api/resource/Project', params).subscribe({
      next: (response: any) => {
        console.log('Projects loaded:', response);
        this.projects = response.data || [];
        this.isLoadingProjects = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.isLoadingProjects = false;
        this.projectLoadError = 'Failed to load projects. Please try again.';
        // Fallback to empty array
        this.projects = [];
      }
    });
  }

  // Toggle dropdown
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Get selected project name
  getSelectedProjectName(): string {
    const projectName = this.createRfqForm.get('projectInfo.projectId')?.value;
    if (!projectName) return 'Select an option';
    const project = this.projects.find(p => p.name === projectName);
    return project ? project.project_name : 'Select an option';
  }

  // Select project
  selectProject(project: Project) {
    const projectInfo = this.createRfqForm.get('projectInfo');
    if (projectInfo) {
      projectInfo.patchValue({
        projectId: project.name,
        projectName: project.project_name
      });
    }
    this.isDropdownOpen = false;
  }

  // Open project creation dialog
  openProjectDialog() {
    this.showProjectDialog = true;
    this.isDropdownOpen = false;
    this.projectCreationError = '';
    // Reset new project form
    this.newProject = {
      project_name: '',
      project_description: '',
      delivery_date: '',
      delivery_location: ''
    };
    // Load customer addresses when opening dialog
    this.loadCustomerAddresses();
  }

  // Close project creation dialog
  closeProjectDialog() {
    this.showProjectDialog = false;
    this.isCreatingProject = false;
  }

  // Create new project
  createProject(projectData: NewProject) {
    this.isCreatingProject = true;
    
    const projectPayload = {
      project_name: projectData.project_name,
      delivery_date: projectData.delivery_date,
      delivery_location: projectData.delivery_location,
      project_description: projectData.project_description
    };
    
    this.commonService.postWefabData('/api/resource/Project', projectPayload).subscribe({
      next: (response: any) => {
        console.log('Project created successfully:', response);
        
        // Add the new project to the local list
        const newProject: Project = {
          name: response.data.name,
          project_name: response.data.project_name,
          project_description: response.data.project_description,
          delivery_date: response.data.delivery_date,
          delivery_location: response.data.delivery_location,
          creation: response.data.creation,
          modified: response.data.modified
    };
    
    this.projects = [...this.projects, newProject];
    
    // Update form with new project data
    const projectInfo = this.createRfqForm.get('projectInfo');
    if (projectInfo) {
      projectInfo.patchValue({
            projectId: newProject.name,
            projectName: newProject.project_name
      });
    }
    
    this.closeProjectDialog();
      },
      error: (error) => {
        console.error('Error creating project:', error);
        this.isCreatingProject = false;
        this.projectCreationError = 'Failed to create project. Please try again.';
        if (error.error && error.error.message) {
          this.projectCreationError = error.error.message;
        }
      }
    });
  }

  createLineItem(): FormGroup {
    return this.fb.group({
      partNumber: ['', [Validators.required]],
      description: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      material: ['', [Validators.required]]
    });
  }

  get lineItems(): FormArray {
    return this.createRfqForm.get('lineItems') as FormArray;
  }

  addLineItem() {
    this.lineItems.push(this.createLineItem());
  }

  removeLineItem(index: number) {
    if (this.lineItems.length > 1) {
      this.lineItems.removeAt(index);
    }
  }

  incrementQuantity(index: number) {
    const control = this.lineItems.at(index).get('quantity');
    if (control) {
      control.setValue(control.value + 1);
    }
  }

  decrementQuantity(index: number) {
    const control = this.lineItems.at(index).get('quantity');
    if (control && control.value > 1) {
      control.setValue(control.value - 1);
    }
  }

  addLineItemsManually() {
    this.addLineItem();
  }

  uploadBOMFile() {
    console.log('Upload BOM File clicked');
  }

  backToOptions() {
    this.router.navigate(['/wefab/customer/rfq-list']);
  }

  saveDraft() {
    if (this.createRfqForm.valid) {
      console.log('Saving draft:', this.createRfqForm.value);
    }
  }

  private transformFormData(): RfqSubmissionData {
    const formValue = this.createRfqForm.value;
    const projectInfo = formValue.projectInfo;
    
    // Get the selected project details
    const selectedProject = this.projects.find(p => p.name === projectInfo.projectId);

    // Format today's date
    const today = new Date();
    const rfqDate = today.toISOString().split('T')[0];

    // Calculate required by date (default to 30 days from now)
    const requiredByDate = new Date(today);
    requiredByDate.setDate(requiredByDate.getDate() + 30);

    // Calculate expiry date (default to 60 days from now)
    const expiryDate = new Date(today);
    expiryDate.setDate(expiryDate.getDate() + 60);

    // Transform line items
    const lineItems: RfqLineItem[] = formValue.lineItems.map((item: LineItem) => ({
      item_name: item.partNumber,
      item_description: item.description,
      quantity: item.quantity,
      unit: 'pcs', // Default unit
      ai_analyzed: 0, // Default value
      ai_complexity: 'Low' // Default value
    }));

    // Transform attachments
    const attachments: RfqAttachment[] = formValue.technicalDrawings.drawings.map((drawing: any) => ({
      file_url: drawing.url || ''
    }));

    // Map priority values
    const priorityMap: { [key: string]: string } = {
      'standard': 'Normal',
      'high': 'High',
      'urgent': 'Urgent',
      'critical': 'Critical'
    };

    // Map project type values
    const projectTypeMap: { [key: string]: string } = {
      'prototype': 'Prototype',
      'small_batch': 'Small Batch',
      'production_run': 'Production Run',
      'r_and_d': 'R&D'
    };

    return {
      customer_rfq_name: projectInfo.rfqName,
      customer: selectedProject?.name || '',
      customer_name: selectedProject?.project_name || '',
      contact_email: projectInfo.contactEmail,
      contact_phone: projectInfo.contactPhone,
      rfq_date: rfqDate,
      required_by_date: requiredByDate.toISOString().split('T')[0],
      priority: priorityMap[projectInfo.priority] || projectInfo.priority,
      project_type: projectTypeMap[projectInfo.projectType] || projectInfo.projectType,
      project_description: selectedProject?.project_description || '',
      quality_standards: 'ISO 9001', // Default value
      budget_range: '', // To be added in form if needed
      confidentiality_level: 'Confidential', // Default value
      expiry_date: expiryDate.toISOString().split('T')[0],
      status: 'Draft',
      workflow_state: 'Draft',
      line_items: lineItems,
      attachments: attachments
    };
  }

  submitRfq() {
    if (this.createRfqForm.valid) {
      const rfqData = this.transformFormData();
      console.log('Submitting RFQ:', rfqData);
      
      this.commonService.postWefabData('/api/resource/Customer Request for Quotation', rfqData).subscribe({
        next: (response: any) => {
          console.log('RFQ submitted successfully:', response);
          this.sweetAlertService.success('RFQ submitted successfully');
          this.router.navigate(['/wefab/customer/rfq-details/', response.data.name]);
          // Handle success (e.g., show success message, redirect)
          // this.router.navigate(['/wefab/customer/rfq-list']);
        },
        error: (error) => {
          console.error('Error submitting RFQ:', error);
          // Handle error (e.g., show error message)
        }
      });
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched(this.createRfqForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched({ onlySelf: true });
      }
    });
  }

  isFieldInvalid(fieldPath: string): boolean {
    const field = this.createRfqForm.get(fieldPath);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Technical Drawing Methods
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        // Create a new technical drawing object
        const drawing: TechnicalDrawing = {
          name: file.name,
          size: file.size,
          file: file,
          uploadProgress: 0,
          isUploaded: false
        };

        // Upload the file
        this.uploadFile(drawing);
      });

      // Reset file input
      input.value = '';
    }
  }

  private uploadFile(drawing: TechnicalDrawing) {
    if (!(drawing.file instanceof File)) {
      console.warn('Invalid file object:', drawing.file);
      return;
    }

    this.fileUploadService.uploadFile(drawing.file).subscribe({
      next: (result: FileUploadResult) => {
        drawing.uploadProgress = result.progress;
        
        if (result.success) {
          drawing.isUploaded = true;
          drawing.url = result.url;
          
          // Add the drawing to the array after successful upload
          this.technicalDrawings.push(drawing);
          
          // Update form control
          this.updateTechnicalDrawingsForm();
          
          console.log('File uploaded successfully:', result);
        } else if (result.error) {
          this.uploadError = `Failed to upload ${drawing.name}: ${result.error}`;
        }
      },
      error: (error: UploadError) => {
        console.error('Error uploading file:', error);
        this.uploadError = `Failed to upload ${drawing.name}: ${error.message || 'Unknown error'}`;
      }
    });
  }

  removeDrawing(index: number) {
    const drawing = this.technicalDrawings[index];
    if (this.isImageFile(drawing.name)) {
      URL.revokeObjectURL(this.getLocalImagePreview(drawing.file));
    }
    this.technicalDrawings.splice(index, 1);
    this.updateTechnicalDrawingsForm();
  }

  updateTechnicalDrawingsForm() {
    const technicalDrawingsControl = this.createRfqForm.get('technicalDrawings');
    if (technicalDrawingsControl) {
      technicalDrawingsControl.patchValue({
        hasDrawings: this.technicalDrawings.length > 0,
        drawings: this.technicalDrawings
          .filter(d => d.isUploaded && d.url) // Only include successfully uploaded files
          .map(d => ({
            name: d.name,
            url: d.url
          }))
      });
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'fas fa-file-pdf';
      case 'dwg':
      case 'dxf': return 'fas fa-drafting-compass';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'tiff': return 'fas fa-file-image';
      case 'step':
      case 'stp':
      case 'iges':
      case 'igs': return 'fas fa-cube';
      default: return 'fas fa-file';
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('technicalDrawingInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  isImageFile(fileName: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.tiff'];
    const extension = '.' + fileName.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension);
  }

  getLocalImagePreview(file: File): string {
    if (!this.isImageFile(file.name)) {
      return '';
    }
    return URL.createObjectURL(file);
  }

  // Add new method to load customer addresses
  loadCustomerAddresses() {
    this.isLoadingAddresses = true;
    this.addressLoadError = '';
    const params = new HttpParams().set('fields', '["*"]');
    
    this.commonService.getWefabData('/api/resource/Customer Address', params).subscribe({
      next: (response: any) => {
        console.log('Customer addresses loaded:', response);
        this.customerAddresses = response.data || [];
        this.isLoadingAddresses = false;
      },
      error: (error) => {
        console.error('Error loading addresses:', error);
        this.isLoadingAddresses = false;
        this.addressLoadError = 'Failed to load delivery addresses. Please try again.';
        this.customerAddresses = [];
      }
    });
  }

  // Add method to format address for display
  formatAddress(address: CustomerAddress): string {
    const parts = [
      address.address_line1,
      address.address_line2,
      address.city,
      address.state,
      address.postal_code,
      address.country
    ].filter(part => part); // Remove empty/undefined parts
    
    return parts.join(', ');
  }

  // Add method to handle address selection
  selectDeliveryLocation(address: CustomerAddress) {
    this.newProject.delivery_location = address.name;
    this.newProjectForm.patchValue({
      delivery_location: address.name
    });
  }

  // Add method to find address by name
  findAddressByName(name: string): CustomerAddress | undefined {
    return this.customerAddresses.find(addr => addr.name === name);
  }

  openLocationDialog() {
    this.showLocationDialog = true;
    this.isDeliveryDropdownOpen = false;
    this.locationCreationError = '';
    // Reset new location form
    this.newLocation = {
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      country: '',
      postal_code: ''
    };
  }

  closeLocationDialog() {
    this.showLocationDialog = false;
    this.isCreatingLocation = false;
  }

  createLocation(locationData: NewLocation) {
    this.isCreatingLocation = true;
    
    const locationPayload = {
      address_line1: locationData.address_line1,
      address_line2: locationData.address_line2,
      city: locationData.city,
      state: locationData.state,
      country: locationData.country,
      postal_code: locationData.postal_code
    };
    
    this.commonService.postWefabData('/api/resource/Customer Address', locationPayload).subscribe({
      next: (response: any) => {
        console.log('Location created successfully:', response);
        
        // Add the new location to the local list
        const newAddress: CustomerAddress = {
          name: response.data.name,
          ...locationPayload
        };
        
        this.customerAddresses = [...this.customerAddresses, newAddress];
        
        // Select the newly created location
        this.selectDeliveryLocation(newAddress);
        
        this.closeLocationDialog();
      },
      error: (error) => {
        console.error('Error creating location:', error);
        this.isCreatingLocation = false;
        this.locationCreationError = 'Failed to create location. Please try again.';
        if (error.error && error.error.message) {
          this.locationCreationError = error.error.message;
        }
      }
    });
  }
}
