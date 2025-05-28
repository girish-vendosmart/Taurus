import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';

export interface DropdownGroupOption {
  label: string;
  value: any;
  disabled?: boolean;
  [key: string]: any; // Allow additional custom properties
}

export interface DropdownGroup {
  label: string;
  items: DropdownGroupOption[];
  disabled?: boolean;
}

@Component({
  selector: 'app-p-dropdown-group-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DropdownModule, MultiSelectModule, InputTextModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PDropdownGroupSearchComponent),
      multi: true
    }
  ],
  template: `
    <div class="dropdown-group-search-container">
      <label *ngIf="label" [for]="dropdownId" class="form-label d-flex align-items-baseline">
        {{ label }}
        <span *ngIf="required" class="text-danger">*</span>
      </label>
      
      <!-- Single Select Dropdown -->
      <p-dropdown
        *ngIf="!multiselect"
        [id]="dropdownId"
        [formControl]="dropdownControl"
        [options]="displayOptions"
        [optionLabel]="optionLabel"
        [optionValue]="optionValue"
        [optionGroupLabel]="optionGroupLabel"
        [optionGroupChildren]="optionGroupChildren"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [required]="required"
        [style]="{ width: '100%' }"
        [group]="true"
        [filter]="false"
        [showClear]="showClear"
        [appendTo]="appendTo"
        (onChange)="onSelectionChange($event)"
        (onShow)="onDropdownShow()"
        (onHide)="onDropdownHide()"
      >
        <ng-template pTemplate="header">
          <div class="custom-filter-container">
            <input 
              #filterInput
              type="text" 
              class="custom-filter-input"
              [placeholder]="filterPlaceholder"
              [(ngModel)]="currentFilter"
              (input)="onCustomFilterChange($event)"
              (keydown.escape)="clearFilter()"
              (click)="$event.stopPropagation()"
            />
            <i class="pi pi-search filter-icon"></i>
          </div>
        </ng-template>
        
        <ng-template pTemplate="selectedItem" let-selectedOption>
          <div *ngIf="selectedOption" class="selected-item">
            <span>{{ getDisplayLabel(selectedOption) }}</span>
          </div>
        </ng-template>
        
        <ng-template pTemplate="item" let-option let-index="index">
          <div class="dropdown-item">
            <span [innerHTML]="highlightSearchTerm(getDisplayLabel(option), currentFilter)"></span>
          </div>
        </ng-template>
        
        <ng-template pTemplate="group" let-group>
          <div class="dropdown-group-header">
            <span [innerHTML]="highlightSearchTerm(group.label, currentFilter)"></span>
            <small class="text-muted">({{ getVisibleItemsCount(group) }} items)</small>
          </div>
        </ng-template>
        
        <ng-template pTemplate="empty">
          <div class="empty-filter-message" *ngIf="currentFilter">
            <i class="pi pi-search"></i>
            <p>No results found for "{{ currentFilter }}"</p>
            <small>Try searching for group names or specific processes</small>
          </div>
          <div class="empty-message" *ngIf="!currentFilter && displayOptions.length === 0">
            <p>No options available</p>
          </div>
        </ng-template>
      </p-dropdown>
      
      <!-- Multi Select Dropdown -->
      <p-multiSelect
        *ngIf="multiselect"
        [id]="dropdownId + '_multi'"
        [formControl]="dropdownControl"
        [options]="displayOptions"
        [optionLabel]="optionLabel"
        [optionValue]="optionValue"
        [optionGroupLabel]="optionGroupLabel"
        [optionGroupChildren]="optionGroupChildren"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [required]="required"
        [style]="{ width: '100%' }"
        [group]="true"
        [filter]="false"
        [showClear]="showClear"
        [appendTo]="appendTo"
        [showToggleAll]="true"
        [maxSelectedLabels]="3"
        [selectedItemsLabel]="getSelectedItemsLabel()"
        (onChange)="onSelectionChange($event)"
        (onShow)="onDropdownShow()"
        (onHide)="onDropdownHide()"
      >
        <ng-template pTemplate="header">
          <div class="custom-filter-container">
            <input 
              #filterInputMulti
              type="text" 
              class="custom-filter-input"
              [placeholder]="filterPlaceholder"
              [(ngModel)]="currentFilter"
              (input)="onCustomFilterChange($event)"
              (keydown.escape)="clearFilter()"
              (click)="$event.stopPropagation()"
            />
            <i class="pi pi-search filter-icon"></i>
          </div>
        </ng-template>
        
        <ng-template pTemplate="item" let-option let-index="index">
          <div class="dropdown-item">
            <span [innerHTML]="highlightSearchTerm(getDisplayLabel(option), currentFilter)"></span>
          </div>
        </ng-template>
        
        <ng-template pTemplate="group" let-group>
          <div class="dropdown-group-header">
            <span [innerHTML]="highlightSearchTerm(group.label, currentFilter)"></span>
            <small class="text-muted">({{ getVisibleItemsCount(group) }} items)</small>
          </div>
        </ng-template>
        
        <ng-template pTemplate="empty">
          <div class="empty-filter-message" *ngIf="currentFilter">
            <i class="pi pi-search"></i>
            <p>No results found for "{{ currentFilter }}"</p>
            <small>Try searching for group names or specific processes</small>
          </div>
          <div class="empty-message" *ngIf="!currentFilter && displayOptions.length === 0">
            <p>No options available</p>
          </div>
        </ng-template>
      </p-multiSelect>
      
      <small *ngIf="description" class="form-text text-muted">{{ description }}</small>
      
      <!-- Debug info (remove in production) -->
      <div *ngIf="showDebugInfo" class="debug-info mt-2 p-2 border rounded bg-light">
        <small>
          <strong>Debug Info:</strong><br>
          Mode: {{ multiselect ? 'Multi-select' : 'Single-select' }}<br>
          Selected Value: {{ selectedValue | json }}<br>
          Current Filter: "{{ currentFilter }}"<br>
          Total Groups: {{ originalOptions.length }}<br>
          Display Groups: {{ displayOptions.length }}<br>
          Total Items: {{ getTotalItemsCount() }}<br>
          Filtered Items: {{ getFilteredItemsCount() }} items
        </small>
      </div>
    </div>
  `,
  styles: [`
    .dropdown-group-search-container {
      width: 100%;
    }
    
    .custom-filter-container {
      position: relative;
      padding: 0.5rem;
      border-bottom: 1px solid #dee2e6;
      background: #fff;
      margin-bottom: 0;
    }
    
    .custom-filter-input {
      width: 100%;
      padding: 0.375rem 2rem 0.375rem 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }
    
    .custom-filter-input:focus {
      border-color: #86b7fe;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
    
    .filter-icon {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
      pointer-events: none;
    }
    
    .selected-item {
      display: flex;
      align-items: center;
      padding: 0.25rem 0;
    }
    
    .dropdown-item {
      padding: 0.5rem 0.75rem;
      cursor: pointer;
      transition: background-color 0.15s ease-in-out;
    }
    
    .dropdown-item:hover {
      background-color: #f8f9fa;
    }
    
    .dropdown-group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      color: #495057;
      background-color: #f8f9fa;
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid #dee2e6;
      font-size: 0.875rem;
    }
    
    .highlight {
      background-color: #fff3cd;
      font-weight: bold;
      padding: 0.1rem 0.2rem;
      border-radius: 0.2rem;
    }
    
    .empty-filter-message, .empty-message {
      text-align: center;
      padding: 2rem 1rem;
      color: #6c757d;
    }
    
    .empty-filter-message i {
      font-size: 2rem;
      margin-bottom: 1rem;
      display: block;
      color: #adb5bd;
    }
    
    .empty-filter-message p, .empty-message p {
      margin-bottom: 0.5rem;
      font-weight: 500;
      font-size: 1rem;
    }
    
    .empty-filter-message small {
      color: #adb5bd;
      font-size: 0.875rem;
    }
    
    .debug-info {
      font-size: 0.75rem;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      padding: 0.75rem;
      margin-top: 0.5rem;
    }
    
    .form-text {
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #6c757d;
    }
    
    .form-label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #212529;
    }
    
    .text-danger {
      color: #dc3545 !important;
      margin-left: 0.25rem;
    }
    
    /* PrimeNG Dropdown Panel Customization */
    :host ::ng-deep .p-dropdown-panel {
      max-height: 400px;
      border-radius: 0.375rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }
    
    :host ::ng-deep .p-dropdown-items-wrapper {
      max-height: 350px;
    }
    
    /* PrimeNG MultiSelect Panel Customization */
    :host ::ng-deep .p-multiselect-panel {
      max-height: 400px;
      border-radius: 0.375rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }
    
    :host ::ng-deep .p-multiselect-items-wrapper {
      max-height: 350px;
    }
    
    /* Improve group header styling */
    :host ::ng-deep .p-dropdown-item-group,
    :host ::ng-deep .p-multiselect-item-group {
      background-color: #f8f9fa !important;
      font-weight: 600 !important;
      color: #495057 !important;
      padding: 0.5rem 0.75rem !important;
      border-bottom: 1px solid #dee2e6 !important;
    }
    
    /* Improve item styling */
    :host ::ng-deep .p-dropdown-item,
    :host ::ng-deep .p-multiselect-item {
      padding: 0.5rem 0.75rem !important;
      transition: background-color 0.15s ease-in-out !important;
    }
    
    :host ::ng-deep .p-dropdown-item:hover,
    :host ::ng-deep .p-multiselect-item:hover {
      background-color: #f8f9fa !important;
    }
    
    /* Improve selected item styling for multiselect */
    :host ::ng-deep .p-multiselect-token {
      background-color: #e9ecef;
      color: #495057;
      border-radius: 0.25rem;
      padding: 0.25rem 0.5rem;
      margin: 0.125rem;
      font-size: 0.875rem;
    }
    
    :host ::ng-deep .p-multiselect-token-icon {
      margin-left: 0.25rem;
      color: #6c757d;
    }
  `]
})
export class PDropdownGroupSearchComponent implements OnInit, ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = 'Select an option';
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() description: string = '';
  @Input() showClear: boolean = true;
  @Input() appendTo: string = 'body';
  @Input() filterPlaceholder: string = 'Search groups and options...';
  @Input() showDebugInfo: boolean = false;
  @Input() multiselect: boolean = false;
  
  // PrimeNG dropdown configuration
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'value';
  @Input() optionGroupLabel: string = 'label';
  @Input() optionGroupChildren: string = 'items';
  
  // Data input
  @Input() options: DropdownGroup[] = [];
  
  // Form control input for direct binding (optional)
  @Input() formControl?: FormControl;
  
  // Events
  @Output() selectionChange = new EventEmitter<any>();
  
  // Internal properties
  dropdownId: string = `dropdown-${Math.random().toString(36).substr(2, 9)}`;
  dropdownControl = new FormControl();
  originalOptions: DropdownGroup[] = [];
  displayOptions: DropdownGroup[] = [];
  selectedValue: any = null;
  currentFilter: string = '';
  
  // ControlValueAccessor implementation
  private onChange = (value: any) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.originalOptions = [...this.options];
    this.displayOptions = [...this.options];
    
    // Use external formControl if provided, otherwise use internal one
    const controlToUse = this.formControl || this.dropdownControl;
    
    // Initialize with proper default value based on mode
    if (!controlToUse.value) {
      const defaultValue = this.multiselect ? [] : null;
      controlToUse.setValue(defaultValue, { emitEvent: false });
    }
    
    // Subscribe to control changes
    controlToUse.valueChanges.subscribe(value => {
      this.selectedValue = value;
      this.onChange(value);
      this.selectionChange.emit(value);
    });
    
    // If using external formControl, sync the internal control
    if (this.formControl) {
      this.dropdownControl = this.formControl;
    }
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.selectedValue = value;
    this.dropdownControl.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.dropdownControl.disable();
    } else {
      this.dropdownControl.enable();
    }
  }

  // Event handlers
  onSelectionChange(event: any): void {
    this.onTouched();
  }

  onDropdownShow(): void {
    // Reset filter when dropdown opens
    this.currentFilter = '';
    this.displayOptions = [...this.originalOptions];
  }

  onDropdownHide(): void {
    this.onTouched();
  }

  // Filtering logic
  private filterOptions(filterValue: string): void {
    if (!filterValue) {
      this.displayOptions = [...this.originalOptions];
      return;
    }

    const filtered: DropdownGroup[] = [];

    this.originalOptions.forEach(group => {
      const groupMatches = group.label.toLowerCase().includes(filterValue);
      
      // Filter items within the group
      const filteredItems = group.items.filter(item => 
        item.label.toLowerCase().includes(filterValue)
      );

      // Include group if:
      // 1. Group name matches the filter, OR
      // 2. At least one item in the group matches the filter
      if (groupMatches || filteredItems.length > 0) {
        filtered.push({
          ...group,
          items: groupMatches ? group.items : filteredItems
        });
      }
    });

    this.displayOptions = filtered;
  }

  // Helper methods
  getDisplayLabel(option: any): string {
    if (!option) return '';
    return typeof option === 'object' ? option[this.optionLabel] : option;
  }

  highlightSearchTerm(text: string, searchTerm: string): string {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${this.escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  getVisibleItemsCount(group: DropdownGroup): number {
    return group.items.length;
  }

  getTotalItemsCount(): number {
    return this.originalOptions.reduce((total, group) => total + group.items.length, 0);
  }

  getFilteredItemsCount(): number {
    return this.displayOptions.reduce((total, group) => total + group.items.length, 0);
  }

  // Public methods for external control
  clearSelection(): void {
    this.dropdownControl.setValue(null);
  }

  selectOption(value: any): void {
    this.dropdownControl.setValue(value);
  }

  getSelectedOption(): any {
    return this.selectedValue;
  }

  refreshOptions(newOptions: DropdownGroup[]): void {
    this.options = newOptions;
    this.originalOptions = [...newOptions];
    this.displayOptions = [...newOptions];
  }

  onCustomFilterChange(event: any): void {
    const filterValue = event.target.value.toLowerCase();
    this.currentFilter = filterValue;
    
    // Apply our custom filtering logic
    this.filterOptions(filterValue);
  }

  clearFilter(): void {
    this.currentFilter = '';
    this.displayOptions = [...this.originalOptions];
  }

  getSelectedItemsLabel(): string {
    const selectedItems = this.dropdownControl.value;
    if (!selectedItems || selectedItems.length === 0) {
      return 'Select items';
    }
    return selectedItems.map((item: any) => this.getDisplayLabel(item)).join(', ');
  }
} 