import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../../../../shared/services/common.service';
import { HttpParams } from '@angular/common/http';

interface Project {
  name: string;
  project_name: string;
  project_description?: string;
  delivery_date: string;
  delivery_location: string;
  creation?: string;
  modified?: string;
}

interface NewProject {
  project_name: string;
  project_description: string;
  delivery_date: string;
  delivery_location: string;
}

interface ApiResponse {
  data: Project[];
  message?: string;
}

@Component({
  selector: 'app-create-rfq',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-rfq.component.html',
  styleUrl: './create-rfq.component.scss'
})
export class CreateRfqComponent implements OnInit {
  createRfqForm!: FormGroup;
  showProjectDialog = false;
  isDropdownOpen = false;
  projects: Project[] = [];
  minDeliveryDate: string;
  isLoadingProjects = false;
  isCreatingProject = false;
  projectCreationError: string = '';
  projectLoadError: string = '';
  
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

  constructor(
    private fb: FormBuilder, 
    private commonService: CommonService
  ) {
    // Set minimum delivery date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDeliveryDate = tomorrow.toISOString().split('T')[0];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const dropdown = document.querySelector('.custom-dropdown');
    if (dropdown && !dropdown.contains(event.target as Node)) {
      this.isDropdownOpen = false;
    }
  }

  ngOnInit() {
    this.initializeForm();
    this.loadProjects();
  }

  initializeForm() {
    this.createRfqForm = this.fb.group({
      projectInfo: this.fb.group({
        projectId: ['', [Validators.required]],
        projectName: ['']
      }),
      lineItems: this.fb.array([this.createLineItem()])
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
    console.log('Back to Options clicked');
  }

  saveDraft() {
    if (this.createRfqForm.valid) {
      console.log('Saving draft:', this.createRfqForm.value);
    }
  }

  submitRfq() {
    if (this.createRfqForm.valid) {
      const rfqData = this.createRfqForm.value;
      console.log('Submitting RFQ:', rfqData);
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
}
