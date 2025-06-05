import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PDropdownGroupSearchComponent, DropdownGroup } from '../../shared/formly-components/p-dropdown-group-search.component';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-dropdown-group-search-demo',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    PDropdownGroupSearchComponent,
    ButtonModule,
    CardModule,
    DividerModule
  ],
  template: `
    <div class="demo-container p-4">
      <h2>PrimeNG Dropdown with Group Search Demo</h2>
      <p class="text-muted">This component allows searching both group names and individual options within groups.</p>
      
      <div class="row">
        <!-- Basic Usage -->
        <div class="col-md-6 mb-4">
          <p-card header="Basic Usage" styleClass="h-100">
            <app-p-dropdown-group-search
              label="Select Technology"
              placeholder="Choose a technology..."
              [options]="technologyOptions"
              [required]="true"
              [showDebugInfo]="true"
              (selectionChange)="onTechnologyChange($event)"
            ></app-p-dropdown-group-search>
            
            <div class="mt-3">
              <strong>Selected:</strong> {{ selectedTechnology | json }}
            </div>
          </p-card>
        </div>

        <!-- Form Integration -->
        <div class="col-md-6 mb-4">
          <p-card header="Form Integration" styleClass="h-100">
            <form [formGroup]="demoForm" (ngSubmit)="onSubmit()">
              <app-p-dropdown-group-search
                label="Select Country"
                placeholder="Choose a country..."
                [options]="countryOptions"
                formControlName="country"
                [required]="true"
                description="Select your country from the grouped list"
              ></app-p-dropdown-group-search>
              
              <div class="mt-3">
                <p-button 
                  type="submit" 
                  label="Submit" 
                  [disabled]="demoForm.invalid"
                  styleClass="p-button-sm"
                ></p-button>
                
                <div class="mt-2">
                  <strong>Form Value:</strong> {{ demoForm.value | json }}<br>
                  <strong>Form Valid:</strong> {{ demoForm.valid }}
                </div>
              </div>
            </form>
          </p-card>
        </div>

        <!-- Custom Configuration -->
        <div class="col-md-6 mb-4">
          <p-card header="Custom Configuration" styleClass="h-100">
            <app-p-dropdown-group-search
              label="Select Product"
              placeholder="Search products..."
              [options]="productOptions"
              [showClear]="false"
              filterPlaceholder="Type to search products and categories..."
              optionLabel="name"
              optionValue="id"
              (selectionChange)="onProductChange($event)"
            ></app-p-dropdown-group-search>
            
            <div class="mt-3">
              <strong>Selected Product ID:</strong> {{ selectedProductId }}<br>
              <strong>Selected Product:</strong> {{ getSelectedProductName() }}
            </div>
          </p-card>
        </div>

        <!-- Dynamic Options -->
        <div class="col-md-6 mb-4">
          <p-card header="Dynamic Options" styleClass="h-100">
            <app-p-dropdown-group-search
              #dynamicDropdown
              label="Select Service"
              placeholder="Choose a service..."
              [options]="serviceOptions"
              [disabled]="isServiceDropdownDisabled"
            ></app-p-dropdown-group-search>
            
            <div class="mt-3">
              <p-button 
                label="Add New Service Group" 
                (onClick)="addNewServiceGroup()"
                styleClass="p-button-sm p-button-secondary me-2"
              ></p-button>
              
              <p-button 
                label="Clear Selection" 
                (onClick)="dynamicDropdown.clearSelection()"
                styleClass="p-button-sm p-button-outlined me-2"
              ></p-button>
              
              <p-button 
                [label]="isServiceDropdownDisabled ? 'Enable' : 'Disable'"
                (onClick)="toggleServiceDropdown()"
                styleClass="p-button-sm"
                [severity]="isServiceDropdownDisabled ? 'success' : 'warning'"
              ></p-button>
            </div>
          </p-card>
        </div>
      </div>

      <p-divider></p-divider>

      <!-- Additional Information -->
      <div class="row mt-4">
        <div class="col-12">
          <p-card header="Component Features">
            <div class="features-info">
              <h5>Search Capabilities:</h5>
              <ul>
                <li><strong>Group Name Search:</strong> Type "Frontend" to show all Frontend Technologies</li>
                <li><strong>Option Search:</strong> Type "Angular" to show only Angular option</li>
                <li><strong>Partial Search:</strong> Type "Front" to show Frontend Technologies group</li>
                <li><strong>Clear Search:</strong> Press Escape key to clear the search</li>
              </ul>
              
              <h5 class="mt-3">Usage Tips:</h5>
              <ul>
                <li>Search is case-insensitive</li>
                <li>Search works across both group names and individual options</li>
                <li>Matching text is highlighted in yellow</li>
                <li>Use the custom search input above each dropdown</li>
              </ul>
            </div>
          </p-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .features-info h5 {
      color: #495057;
      margin-bottom: 0.75rem;
    }
    
    .features-info ul {
      margin-bottom: 1rem;
    }
    
    .features-info li {
      margin-bottom: 0.5rem;
    }
    
    :host ::ng-deep .p-card-body {
      padding: 1rem;
    }
    
    :host ::ng-deep .p-card-header {
      font-weight: 600;
      font-size: 1.1rem;
    }
  `]
})
export class DropdownGroupSearchDemoComponent implements OnInit {
  demoForm: FormGroup;
  selectedTechnology: any = null;
  selectedProductId: any = null;
  isServiceDropdownDisabled: boolean = false;

  // Sample data for different dropdowns
  technologyOptions: DropdownGroup[] = [
    {
      label: 'Frontend Technologies',
      items: [
        { label: 'Angular', value: 'angular' },
        { label: 'React', value: 'react' },
        { label: 'Vue.js', value: 'vue' },
        { label: 'Svelte', value: 'svelte' }
      ]
    },
    {
      label: 'Backend Technologies',
      items: [
        { label: 'Node.js', value: 'nodejs' },
        { label: 'Python Django', value: 'django' },
        { label: 'Java Spring', value: 'spring' },
        { label: 'ASP.NET Core', value: 'aspnet' }
      ]
    },
    {
      label: 'Database Technologies',
      items: [
        { label: 'PostgreSQL', value: 'postgresql' },
        { label: 'MongoDB', value: 'mongodb' },
        { label: 'MySQL', value: 'mysql' },
        { label: 'Redis', value: 'redis' }
      ]
    }
  ];

  countryOptions: DropdownGroup[] = [
    {
      label: 'North America',
      items: [
        { label: 'United States', value: 'US' },
        { label: 'Canada', value: 'CA' },
        { label: 'Mexico', value: 'MX' }
      ]
    },
    {
      label: 'Europe',
      items: [
        { label: 'Germany', value: 'DE' },
        { label: 'France', value: 'FR' },
        { label: 'United Kingdom', value: 'GB' },
        { label: 'Italy', value: 'IT' },
        { label: 'Spain', value: 'ES' }
      ]
    },
    {
      label: 'Asia',
      items: [
        { label: 'Japan', value: 'JP' },
        { label: 'China', value: 'CN' },
        { label: 'India', value: 'IN' },
        { label: 'South Korea', value: 'KR' }
      ]
    }
  ];

  productOptions: DropdownGroup[] = [
    {
      label: 'Electronics',
      items: [
        { label: 'Smartphone', value: 'phone-001', name: 'Smartphone', id: 'phone-001' },
        { label: 'Laptop', value: 'laptop-001', name: 'Laptop', id: 'laptop-001' },
        { label: 'Tablet', value: 'tablet-001', name: 'Tablet', id: 'tablet-001' },
        { label: 'Smartwatch', value: 'watch-001', name: 'Smartwatch', id: 'watch-001' }
      ]
    },
    {
      label: 'Clothing',
      items: [
        { label: 'T-Shirt', value: 'shirt-001', name: 'T-Shirt', id: 'shirt-001' },
        { label: 'Jeans', value: 'jeans-001', name: 'Jeans', id: 'jeans-001' },
        { label: 'Sneakers', value: 'shoes-001', name: 'Sneakers', id: 'shoes-001' },
        { label: 'Jacket', value: 'jacket-001', name: 'Jacket', id: 'jacket-001' }
      ]
    },
    {
      label: 'Books',
      items: [
        { label: 'Programming Guide', value: 'book-001', name: 'Programming Guide', id: 'book-001' },
        { label: 'Design Patterns', value: 'book-002', name: 'Design Patterns', id: 'book-002' },
        { label: 'Clean Code', value: 'book-003', name: 'Clean Code', id: 'book-003' }
      ]
    }
  ];

  serviceOptions: DropdownGroup[] = [
    {
      label: 'Web Services',
      items: [
        { label: 'Website Development', value: 'web-dev' },
        { label: 'E-commerce Platform', value: 'ecommerce' },
        { label: 'Web Hosting', value: 'hosting' }
      ]
    },
    {
      label: 'Mobile Services',
      items: [
        { label: 'iOS App Development', value: 'ios-dev' },
        { label: 'Android App Development', value: 'android-dev' },
        { label: 'Cross-platform Development', value: 'cross-platform' }
      ]
    }
  ];

  constructor(private fb: FormBuilder) {
    this.demoForm = this.fb.group({
      country: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Initialize any additional setup if needed
  }

  onTechnologyChange(selectedValue: any) {
    this.selectedTechnology = selectedValue;
    console.log('Technology selected:', selectedValue);
  }

  onProductChange(selectedValue: any) {
    this.selectedProductId = selectedValue;
    console.log('Product selected:', selectedValue);
  }

  onSubmit() {
    if (this.demoForm.valid) {
      console.log('Form submitted:', this.demoForm.value);
      alert('Form submitted successfully! Check console for details.');
    }
  }

  addNewServiceGroup() {
    const newGroup: DropdownGroup = {
      label: 'Consulting Services',
      items: [
        { label: 'Technical Consulting', value: 'tech-consulting' },
        { label: 'Business Analysis', value: 'business-analysis' },
        { label: 'Project Management', value: 'project-mgmt' }
      ]
    };

    // Check if group already exists
    const exists = this.serviceOptions.some(group => group.label === newGroup.label);
    if (!exists) {
      this.serviceOptions = [...this.serviceOptions, newGroup];
      console.log('New service group added');
    } else {
      alert('This service group already exists!');
    }
  }

  toggleServiceDropdown() {
    this.isServiceDropdownDisabled = !this.isServiceDropdownDisabled;
  }

  getSelectedProductName(): string {
    if (!this.selectedProductId) return 'None';
    
    for (const group of this.productOptions) {
      const product = group.items.find(item => item['id'] === this.selectedProductId);
      if (product) {
        return product['name'];
      }
    }
    return 'Unknown';
  }
} 