import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'formly-field-searchable-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FormlyModule],
  template: `
    <div class="mb-3">
      <label *ngIf="props['label']" class="form-label d-flex align-items-baseline">
        {{ props['label'] }}
        <span class="text-danger" *ngIf="props['required']">*</span>
      </label>
      <p *ngIf="props['description']" class="form-text text-muted">{{ props['description'] }}</p>
      
      <div class="searchable-select-container">
        <!-- Dropdown trigger -->
        <div 
          class="form-control d-flex justify-content-between align-items-center searchable-select-trigger" 
          (click)="toggleDropdown($event)"
          [class.is-invalid]="showError">
          <span *ngIf="!selectedLabel">{{ props['placeholder'] || 'Select an option' }}</span>
          <span *ngIf="selectedLabel">{{ selectedLabel }}</span>
          <i class="dropdown-icon" [class.open]="isOpen">▼</i>
        </div>
        
        <!-- Dropdown menu -->
        <div class="searchable-select-dropdown" *ngIf="isOpen">
          <div class="search-container">
            <input 
              type="text" 
              class="form-control search-input" 
              placeholder="Search..." 
              [(ngModel)]="searchText"
              (input)="filterOptions()"
              (click)="$event.stopPropagation()">
          </div>
          <div class="options-list">
            <div 
              *ngFor="let option of filteredOptions" 
              class="option-item" 
              [class.selected]="formControl.value === option.value"
              (click)="selectOption(option); $event.stopPropagation()">
              {{ option.label }}
            </div>
            <div *ngIf="filteredOptions.length === 0" class="no-results">
              No results found
            </div>
          </div>
        </div>
      </div>
      
      <div class="invalid-feedback d-block" *ngIf="showError">
        <formly-validation-message [field]="field"></formly-validation-message>
      </div>
    </div>
  `,
  styles: [`
    .searchable-select-container {
      position: relative;
    }
    
    .searchable-select-trigger {
      cursor: pointer;
      user-select: none;
      background-color: #fff;
    }
    
    .dropdown-icon {
      font-size: 10px;
      transition: transform 0.2s;
    }
    
    .dropdown-icon.open {
      transform: rotate(180deg);
    }
    
    .searchable-select-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      z-index: 1000;
      width: 100%;
      margin-top: 5px;
      background-color: white;
      border: 1px solid #ced4da;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      max-height: 300px;
      display: flex;
      flex-direction: column;
    }
    
    .search-container {
      padding: 8px;
      border-bottom: 1px solid #eee;
    }
    
    .search-input:focus {
      box-shadow: none;
      border-color: #ced4da;
    }
    
    .options-list {
      overflow-y: auto;
      max-height: 242px;
    }
    
    .option-item {
      padding: 8px 12px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .option-item:hover {
      background-color: #f8f9fa;
    }
    
    .option-item.selected {
      background-color: #e9ecef;
      font-weight: 500;
    }
    
    .no-results {
      padding: 12px;
      text-align: center;
      color: #6c757d;
      font-style: italic;
    }
  `]
})
export class FormlyFieldSearchableSelectComponent extends FieldType<FieldTypeConfig> implements OnInit, OnDestroy {
  isOpen = false;
  searchText = '';
  selectOptions: any[] = [];
  filteredOptions: any[] = [];
  selectedLabel = '';
  private clickListener: any;
  private isBrowser: boolean;
  private _options: any[] = [];
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    super();
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Only add document listener in browser environment
    if (this.isBrowser) {
      this.clickListener = () => {
        this.isOpen = false;
      };
      document.addEventListener('click', this.clickListener);
    }
  }
  
  ngOnInit() {
    // Set initial options
    this.setOptions();
    
    // Add a new hook to detect when templateOptions.options changes directly
    if (this.field && this.props) {
      // Create a property change detection setup
      Object.defineProperty(this.props, 'options', {
        get: () => this._options,
        set: (newOptions) => {
          this._options = newOptions;
          // When options are updated, refresh the dropdown
          this.setOptions();
          this.updateSelectedLabel();
        },
        configurable: true
      });
    }
    
    // Watch for changes to the options in field hooks
    if (this.field?.hooks) {
      const originalOnInit = this.field.hooks.onInit;
      
      this.field.hooks.onInit = (field) => {
        if (originalOnInit) {
          originalOnInit(field);
        }
        
        if (field.props && field.props['options'] instanceof Observable) {
          const sub = (field.props['options'] as Observable<any[]>).subscribe(options => {
            if (field.props) {
              field.props['_options'] = options;
              this.setOptions();
              this.updateSelectedLabel();
            }
          });
          
          if (field.hooks) {
            const originalOnDestroy = field.hooks.onDestroy;
            
            field.hooks.onDestroy = (fieldConfig) => {
              if (originalOnDestroy) {
                originalOnDestroy(fieldConfig);
              }
              sub.unsubscribe();
            };
          }
        }
      };
    }
    
    // Listen for value changes to update selected label
    this.formControl.valueChanges.subscribe(() => {
      this.updateSelectedLabel();
    });
  }
  
  ngOnDestroy() {
    // Clean up event listener when component is destroyed
    if (this.isBrowser && this.clickListener) {
      document.removeEventListener('click', this.clickListener);
    }
  }
  
  private setOptions() {
    const fieldOptions = this.props['_options'] || this.props['options'];
    
    if (fieldOptions instanceof Observable) {
      fieldOptions.subscribe(opts => {
        this.selectOptions = opts || [];
        this.filteredOptions = [...this.selectOptions];
        this.updateSelectedLabel();
        // Log for debugging
        console.log('Options set via Observable:', this.selectOptions);
      });
    } else if (Array.isArray(fieldOptions)) {
      this.selectOptions = fieldOptions;
      this.filteredOptions = [...this.selectOptions];
      this.updateSelectedLabel();
      // Log for debugging
      console.log('Options set via Array:', this.selectOptions);
    } else {
      this.selectOptions = [];
      this.filteredOptions = [];
      // Log for debugging
      console.log('No options found', this.props);
    }
  }
  
  toggleDropdown(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchText = '';
      this.filteredOptions = [...this.selectOptions];
    }
  }
  
  filterOptions() {
    if (!this.searchText.trim()) {
      this.filteredOptions = [...this.selectOptions];
      return;
    }
    
    const searchLower = this.searchText.toLowerCase();
    this.filteredOptions = this.selectOptions.filter(option => 
      option.label.toLowerCase().includes(searchLower)
    );
  }
  
  selectOption(option: any) {
    this.formControl.setValue(option.value);
    this.selectedLabel = option.label;
    this.isOpen = false;
  }
  
  updateSelectedLabel() {
    const value = this.formControl.value;
    const selectedOption = this.selectOptions.find(option => option.value === value);
    this.selectedLabel = selectedOption ? selectedOption.label : '';
  }
} 