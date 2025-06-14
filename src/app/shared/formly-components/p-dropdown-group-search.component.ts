import { Component, OnInit, Input, Output, EventEmitter, forwardRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';

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
  imports: [CommonModule, ReactiveFormsModule, DropdownModule, MultiSelectModule, InputTextModule, FormsModule, CheckboxModule],
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
        [showToggleAll]="false"
        [maxSelectedLabels]="maxSelectedLabels"
        [selectedItemsLabel]="getSelectedItemsLabel()"
        (onChange)="onSelectionChange($event)"
        (onShow)="onDropdownShow()"
        (onHide)="onDropdownHide()"
      >
        <ng-template pTemplate="header">
          <div class="multiselect-header-container">    
            <!-- Search Input -->
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
          </div>
        </ng-template>
        
        <ng-template pTemplate="item" let-option let-index="index">
          <div class="dropdown-item">
            <span [innerHTML]="highlightSearchTerm(getDisplayLabel(option), currentFilter)"></span>
          </div>
        </ng-template>
        
        <ng-template pTemplate="group" let-group>
          <div class="dropdown-group-header-with-checkbox">
            <div class="group-checkbox-container" (click)="$event.stopPropagation()">
              <p-checkbox 
                [binary]="true"
                [ngModel]="groupCheckboxValues[group.label]"
                (ngModelChange)="onGroupCheckboxModelChange($event, group)"
                [inputId]="getGroupInputId(group)"
                [disabled]="disabled"
                [ngClass]="{ 'partial-selection': isGroupPartiallySelected(group) }">
              </p-checkbox>
            </div>
            <div class="group-label-container">
              <span [innerHTML]="highlightSearchTerm(group.label, currentFilter)"></span>
              <small class="text-muted">({{ getVisibleItemsCount(group) }} items)</small>
            </div>
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
      
    </div>
  `,
  styles: [`
    .dropdown-group-search-container {
      width: 100%;
    }
    
    .custom-filter-container {
      position: relative;
      padding: 0.75rem;
      border-bottom: 1px solid #dee2e6;
      margin-bottom: 0;
      width: 100%;
      position: sticky;
      top: 0;
      z-index: 10;
      flex: 1;
    }
    
    .custom-filter-input {
      width: 100%;
      padding: 0.5rem 2.5rem 0.5rem 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      background-color: #fff;
    }
    
    .custom-filter-input:focus {
      border-color: #86b7fe;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
    
    .filter-icon {
      position: absolute;
      right: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
      pointer-events: none;
      font-size: 0.875rem;
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
      background: #fff;
      margin: 0;
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
      margin-top: 0;
    }
    
    .empty-filter-message small {
      color: #adb5bd;
      font-size: 0.875rem;
      display: block;
      margin-top: 0.5rem;
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
      min-width: 300px;
      z-index: 1000;
    }
    
    :host ::ng-deep .p-dropdown-items-wrapper {
      max-height: 350px;
      overflow-y: auto;
    }
    
    :host ::ng-deep .p-dropdown-items {
      padding: 0;
    }
    
    /* PrimeNG MultiSelect Panel Customization */
    :host ::ng-deep .p-multiselect-panel {
      max-height: 400px;
      border-radius: 0.375rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      min-width: 350px;
      z-index: 1000;
      border: 1px solid #dee2e6;
    }
    
    :host ::ng-deep .p-multiselect-items-wrapper {
      max-height: 350px;
      overflow-y: auto;
    }
    
    :host ::ng-deep .p-multiselect-items {
      padding: 0;
    }
    
    /* Ensure multiselect trigger has proper width */
    :host ::ng-deep .p-multiselect {
      width: 100% !important;
      min-height: 2.5rem;
    }
    
    :host ::ng-deep .p-multiselect .p-multiselect-label {
      padding: 0.5rem 0.75rem;
      min-height: 2.5rem;
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 0.25rem;
      line-height: 1.4;
    }
    
    /* OLD CONFLICTING SELECT-ALL CHECKBOX RULES REMOVED */
    
    /* Hide ALL checkboxes in multiselect items and interface */
    :host ::ng-deep .p-multiselect .p-checkbox,
    :host ::ng-deep .p-multiselect-item .p-checkbox,
    :host ::ng-deep .p-multiselect-label .p-checkbox,
    :host ::ng-deep .p-multiselect-token .p-checkbox,
    :host ::ng-deep .p-multiselect-trigger .p-checkbox,
    :host ::ng-deep .p-multiselect-label-container .p-checkbox {
      display: none !important;
      visibility: hidden !important;
    }
    
    /* Hide checkbox boxes and icons */
    :host ::ng-deep .p-multiselect .p-checkbox-box,
    :host ::ng-deep .p-multiselect-item .p-checkbox-box,
    :host ::ng-deep .p-multiselect .p-checkbox-icon,
    :host ::ng-deep .p-multiselect-item .p-checkbox-icon {
      display: none !important;
      visibility: hidden !important;
    }
    
    /* Only show the select-all checkbox in header */
    :host ::ng-deep .select-all-container .p-checkbox {
      display: flex !important;
      visibility: visible !important;
      margin-right: 0.5rem;
    }
    
    :host ::ng-deep .select-all-container .p-checkbox .p-checkbox-box {
      display: inline-block !important;
      visibility: visible !important;
      width: 1rem;
      height: 1rem;
      border-radius: 0.25rem;
      border: 1px solid #ced4da;
      background: #fff;
    }
    
    :host ::ng-deep .select-all-container .p-checkbox .p-checkbox-box.p-highlight {
      background: #0d6efd;
      border-color: #0d6efd;
    }
    
    :host ::ng-deep .select-all-container .p-checkbox .p-checkbox-box .p-checkbox-icon {
      display: block !important;
      visibility: visible !important;
      color: #fff;
      font-size: 0.75rem;
    }
    
    /* Improve group header styling */
    :host ::ng-deep .p-dropdown-item-group,
    :host ::ng-deep .p-multiselect-item-group {
      background-color: #f8f9fa !important;
      font-weight: 600 !important;
      color: #495057 !important;
      padding: 0.75rem 1rem !important;
      border-bottom: 1px solid #dee2e6 !important;
      margin: 0 !important;
      font-size: 0.875rem !important;
      position: sticky;
      top: 0;
      z-index: 1;
    }
    
    /* Improve item styling */
    :host ::ng-deep .p-dropdown-item,
    :host ::ng-deep .p-multiselect-item {
      padding: 0.75rem 1rem !important;
      transition: background-color 0.15s ease-in-out !important;
      border: none !important;
      margin: 0 !important;
      display: flex !important;
      align-items: center !important;
      min-height: 2.5rem !important;
    }
    
    :host ::ng-deep .p-dropdown-item:hover,
    :host ::ng-deep .p-multiselect-item:hover {
      background-color: #f8f9fa !important;
    }
    
    :host ::ng-deep .p-multiselect-item.p-highlight {
      background-color: #e7f3ff !important;
      color: #0d6efd !important;
    }
    
    :host ::ng-deep .p-multiselect-item.p-highlight:hover {
      background-color: #cce7ff !important;
    }
    
    /* Improve selected item styling for multiselect */
    :host ::ng-deep .p-multiselect-token {
      background-color: #e9ecef;
      color: #495057;
      border-radius: 0.25rem;
      padding: 0.25rem 0.5rem;
      margin: 0.125rem;
      font-size: 0.875rem;
      display: inline-flex;
      align-items: center;
      max-width: 150px;
    }
    
    :host ::ng-deep .p-multiselect-token-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    :host ::ng-deep .p-multiselect-token-icon {
      margin-left: 0.25rem;
      color: #6c757d;
      cursor: pointer;
      flex-shrink: 0;
    }
    
    /* Improve multiselect label container to handle more tokens */
    :host ::ng-deep .p-multiselect .p-multiselect-label {
      padding: 0.5rem 0.75rem;
      min-height: 2.5rem;
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 0.25rem;
      line-height: 1.4;
    }
    
    /* Ensure the dropdown trigger adjusts height based on content */
    :host ::ng-deep .p-multiselect {
      width: 100% !important;
      min-height: 2.5rem;
    }
    
    /* Handle overflow better for many selected items */
    :host ::ng-deep .p-multiselect-label-container {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: 100%;
      min-height: 1.5rem;
      max-height: 4rem;
      overflow-y: auto;
    }
    
    /* Fix header filter styling */
    :host ::ng-deep .p-multiselect-header {
      padding: 0 !important;
      border-bottom: none !important;
    }
    
    /* Ensure proper panel positioning */
    :host ::ng-deep .p-multiselect-panel .p-multiselect-header {
      position: sticky;
      top: 0;
      z-index: 2;
      background: white;
    }
    
    .multiselect-header-container {
      display: flex;
      flex-direction: row;
      gap: 0.75rem;
      padding: 0.75rem;
      border-bottom: 1px solid #dee2e6;
      position: sticky;
      top: 0;
      width: 100%;
      z-index: 10;
    }
    
    .select-all-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .select-all-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #495057;
      cursor: pointer;
      margin: 0;
    }
    
    .custom-filter-container {
      position: relative;
      margin: 0;
      padding: 0;
      border: none;
      background: transparent;
    }

    ::ng-deep .p-multiselect-panel .p-multiselect-items {
      padding-left: 0px !important;
    }

    ::ng-deep .p-multiselect-item-group {
      padding: 0px !important;
    }
    
    .dropdown-group-header-with-checkbox {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      color: #495057;
      background-color: #f8f9fa;
      padding: 0.75rem;
      border-bottom: 1px solid #dee2e6;
      font-size: 0.875rem;
      position: sticky;
      top: 0;
      z-index: 1;
      cursor: pointer;
      user-select: none;
      transition: background-color 0.15s ease-in-out;
    }
    
    .group-checkbox-container {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      pointer-events: auto;
    }
    
    .group-label-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      flex-grow: 1;
      pointer-events: none;
    }
    
    .dropdown-group-header-with-checkbox:hover {
      background-color: #e9ecef;
    }
    
    .dropdown-group-header-with-checkbox:active {
      background-color: #dee2e6;
    }
    
    /* Show group checkboxes in multiselect mode */
    :host ::ng-deep .group-checkbox-container .p-checkbox {
      display: flex !important;
      visibility: visible !important;
      margin-right: 0.5rem;
    }
    
    :host ::ng-deep .group-checkbox-container .p-checkbox .p-checkbox-box {
      display: inline-block !important;
      visibility: visible !important;
      width: 1rem;
      height: 1rem;
      border-radius: 0.25rem;
      border: 1px solid #ced4da;
      background: #fff;
      position: relative;
    }
    
    :host ::ng-deep .group-checkbox-container .p-checkbox .p-checkbox-box.p-highlight {
      background: #0d6efd;
      border-color: #0d6efd;
    }
    
    /* Custom indeterminate state styling */
    :host ::ng-deep .group-checkbox-container .p-checkbox.partial-selection .p-checkbox-box {
      background: #6c757d;
      border-color: #6c757d;
    }
    
    :host ::ng-deep .group-checkbox-container .p-checkbox.partial-selection .p-checkbox-box::after {
      content: '';
      position: absolute;
      width: 6px;
      height: 2px;
      background: white;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    
    :host ::ng-deep .group-checkbox-container .p-checkbox .p-checkbox-box .p-checkbox-icon {
      display: block !important;
      visibility: visible !important;
      color: #fff;
      font-size: 0.75rem;
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
  @Input() maxSelectedLabels: number = 5;
  
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
  selectAllChecked: boolean = false;
  
  // Add new property to track group selection states
  groupSelectionStates: { [groupLabel: string]: 'none' | 'partial' | 'all' } = {};
  
  // Add new property to store checkbox values for reactive binding
  groupCheckboxValues: { [groupLabel: string]: boolean } = {};
  
  // Add flag to prevent recursive calls during Select All operations
  private isSelectAllChanging: boolean = false;
  
  // ControlValueAccessor implementation
  private onChange = (value: any) => {};
  private onTouched = () => {};
  
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.originalOptions = [...this.options];
    this.displayOptions = [...this.options];
    
    // Initialize group selection states properly
    this.initializeGroupSelectionStates();
    
    // Use external formControl if provided, otherwise use internal one
    const controlToUse = this.formControl || this.dropdownControl;
    
    // If using external formControl, sync the internal control
    if (this.formControl) {
      this.dropdownControl = this.formControl;
    }
    
    // Initialize with proper default value based on mode
    if (!controlToUse.value) {
      const defaultValue = this.multiselect ? [] : null;
      controlToUse.setValue(defaultValue, { emitEvent: false });
    }
    
    // Subscribe to control changes ONLY if we're using the internal control
    // If using external formControl (from Formly), the onChange callback will be called directly
    if (!this.formControl) {
      controlToUse.valueChanges.subscribe(value => {
        console.log('Internal dropdown control value changed:', value);
        this.selectedValue = value;
        this.onChange(value);
        this.selectionChange.emit(value);
        
        // Update select all state and group states for multiselect
        if (this.multiselect) {
          this.updateSelectAllState();
          this.updateAllGroupSelectionStates();
          // Force change detection after state updates
          this.cdr.detectChanges();
        }
      });
    } else {
      // For external form controls, just subscribe to update internal state
      controlToUse.valueChanges.subscribe(value => {
        console.log('External form control value changed:', value);
        this.selectedValue = value;
        
        // Update select all state and group states for multiselect
        if (this.multiselect) {
          this.updateSelectAllState();
          this.updateAllGroupSelectionStates();
          // Force change detection after state updates
          this.cdr.detectChanges();
        }
      });
    }
    
    // Initialize select all state
    if (this.multiselect) {
      this.updateSelectAllState();
    }
    
    // Initialize group selection states
    this.updateAllGroupSelectionStates();
  }

  // Add method to properly initialize group states
  private initializeGroupSelectionStates(): void {
    this.groupSelectionStates = {};
    this.groupCheckboxValues = {};
    
    // Initialize all groups to 'none' state
    this.originalOptions.forEach(group => {
      this.groupSelectionStates[group.label] = 'none';
      this.groupCheckboxValues[group.label] = false;
    });
    
    console.log('Initialized group selection states:', this.groupSelectionStates);
    console.log('Initialized group checkbox values:', this.groupCheckboxValues);
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
    
    // Explicitly get the current value from the dropdown control and notify parent
    const currentValue = this.dropdownControl.value;
    console.log('🔄 Selection changed:', currentValue);
    
    // Update our local selectedValue
    this.selectedValue = currentValue;
    
    // Mark the control as dirty and touched for proper form state management
    this.dropdownControl.markAsDirty();
    this.dropdownControl.markAsTouched();
    
    console.log('🔄 About to notify parent component via ControlValueAccessor with:', currentValue);
    
    // Notify parent form control about the change - CRITICAL for Formly
    this.onChange(currentValue);
    
    // Emit the selection change event for any additional listeners
    this.selectionChange.emit(currentValue);
    
    // Update group selection states when individual items are selected/deselected
    if (this.multiselect) {
      this.updateAllGroupSelectionStates();
      this.updateSelectAllState();
      // Force change detection
      this.cdr.detectChanges();
    }
    
    console.log('📤 Selection change - Final values sent to parent:', currentValue);
    
    // Add debugging for form integration after a brief delay
    setTimeout(() => {
      console.log('🔍 Post-selection form integration check:');
      this.logFormIntegration();
    }, 100);
  }

  onDropdownShow(): void {
    // Reset filter when dropdown opens
    this.currentFilter = '';
    this.displayOptions = [...this.originalOptions];
    
    // Update group selection states for multiselect
    if (this.multiselect) {
      this.updateAllGroupSelectionStates();
      this.updateSelectAllState();
      // Force change detection
      this.cdr.detectChanges();
    }
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
    
    // Update select all state and group states after filtering
    if (this.multiselect) {
      this.updateSelectAllState();
      this.updateAllGroupSelectionStates();
      // Force change detection
      this.cdr.detectChanges();
    }
  }

  clearFilter(): void {
    this.currentFilter = '';
    this.displayOptions = [...this.originalOptions];
    
    // Update select all state and group states after clearing filter
    if (this.multiselect) {
      this.updateSelectAllState();
      this.updateAllGroupSelectionStates();
      // Force change detection
      this.cdr.detectChanges();
    }
  }

  getSelectedItemsLabel(): string {
    const selectedItems = this.dropdownControl.value;
    if (!selectedItems || selectedItems.length === 0) {
      return 'Select items';
    }
    
    // If we have selected items, show a proper summary
    if (selectedItems.length > this.maxSelectedLabels) {
      return `${selectedItems.length} items selected`;
    }
    
    // For items within the limit, this won't be used as individual labels will show
    return selectedItems.map((value: any) => {
      // Find the corresponding label for each selected value
      for (const group of this.originalOptions) {
        const item = group.items.find(item => item.value === value);
        if (item) {
          return item.label;
        }
      }
      return value; // Fallback to value if label not found
    }).join(', ');
  }

  onSelectAllChange(event: any): void {
    if (!this.multiselect) return;
    
    console.log('Select All change:', event.checked);
    
    // Set flag to prevent recursive calls
    this.isSelectAllChanging = true;
    
    const allItems: any[] = [];
    this.displayOptions.forEach(group => {
      group.items.forEach(item => {
        allItems.push(item.value);
      });
    });
    
    let newValue: any[];
    
    if (event.checked) {
      // Select all items
      console.log('Selecting all items:', allItems);
      newValue = allItems;
      this.dropdownControl.setValue(allItems);
      
      // Set all group checkboxes to checked
      this.originalOptions.forEach(group => {
        this.groupCheckboxValues[group.label] = true;
        this.groupSelectionStates[group.label] = 'all';
      });
    } else {
      // Deselect all items
      console.log('Deselecting all items');
      newValue = [];
      this.dropdownControl.setValue([]);
      
      // Set all group checkboxes to unchecked
      this.originalOptions.forEach(group => {
        this.groupCheckboxValues[group.label] = false;
        this.groupSelectionStates[group.label] = 'none';
      });
    }
    
    // Update local selectedValue and notify parent
    this.selectedValue = newValue;
    this.onChange(newValue);
    this.selectionChange.emit(newValue);
    
    // Force immediate state updates
    this.updateSelectAllState();
    
    // Force change detection
    this.cdr.detectChanges();
    
    // Reset flag after a brief delay to allow all change events to process
    setTimeout(() => {
      this.isSelectAllChanging = false;
    }, 100);
    
    console.log('After Select All - Group checkbox values:', this.groupCheckboxValues);
    console.log('After Select All - Group states:', this.groupSelectionStates);
  }

  onGroupCheckboxModelChange(checked: boolean, group: DropdownGroup): void {
    console.log('🔄 Group checkbox model change triggered:', checked, 'for group:', group.label);
    
    if (!this.multiselect) return;
    
    // If this change is part of a Select All operation, don't process individual logic
    if (this.isSelectAllChanging) {
      console.log('⏭️ Ignoring group checkbox change because Select All is changing');
      return;
    }
    
    // Update the checkbox value immediately
    this.groupCheckboxValues[group.label] = checked;
    
    const selectedValues = this.dropdownControl.value || [];
    const groupItemValues = group.items.map(item => item.value);
    
    console.log('📋 Current selected values:', selectedValues);
    console.log('🏷️ Group item values for', group.label, ':', groupItemValues);
    
    let newSelectedValues: any[];
    
    if (checked) {
      // Select all items in this group
      newSelectedValues = [...selectedValues];
      
      groupItemValues.forEach(itemValue => {
        if (!newSelectedValues.includes(itemValue)) {
          newSelectedValues.push(itemValue);
        }
      });
      
      console.log('✅ Selecting all items in group. New values:', newSelectedValues);
      this.groupSelectionStates[group.label] = 'all';
    } else {
      // Deselect all items in this group
      newSelectedValues = selectedValues.filter((value: any) => 
        !groupItemValues.includes(value)
      );
      
      console.log('❌ Deselecting all items in group. New values:', newSelectedValues);
      this.groupSelectionStates[group.label] = 'none';
    }
    
    // Update the form control value with emitEvent: false first to avoid recursion
    this.dropdownControl.setValue(newSelectedValues, { emitEvent: false });
    
    // Then manually trigger the change detection and form updates
    this.selectedValue = newSelectedValues;
    
    // Mark the control as dirty and touched for proper form state management
    this.dropdownControl.markAsDirty();
    this.dropdownControl.markAsTouched();
    
    console.log('🔄 About to notify parent with values:', newSelectedValues);
    
    // Notify parent component through ControlValueAccessor - CRITICAL for Formly integration
    this.onChange(newSelectedValues);
    this.onTouched();
    
    // ALSO emit the selection change event - this ensures all listeners are notified
    this.selectionChange.emit(newSelectedValues);
    
    // Force update the form control with emitEvent: true to ensure Formly gets the change
    setTimeout(() => {
      console.log('🔄 Force updating form control with emitEvent: true');
      this.dropdownControl.setValue(newSelectedValues, { emitEvent: true });
      
      // Double-check: call onChange again after the setValue to ensure propagation
      this.onChange(newSelectedValues);
      
      console.log('✅ Form control value after force update:', this.dropdownControl.value);
    }, 10);
    
    // Update all group selection states immediately
    this.updateAllGroupSelectionStates();
    this.updateSelectAllState();
    
    // Force change detection to update the UI
    this.cdr.detectChanges();
    
    // Log form integration details
    setTimeout(() => {
      this.logFormIntegration();
    }, 50);
    
    console.log('🔄 After individual group change - Group checkbox values:', this.groupCheckboxValues);
    console.log('🔄 After individual group change - Group states:', this.groupSelectionStates);
    console.log('📤 Final selected values sent to parent:', newSelectedValues);
  }

  private updateSelectAllState(): void {
    if (!this.multiselect) return;
    
    const selectedValues = this.dropdownControl.value || [];
    const allItems: any[] = [];
    
    this.displayOptions.forEach(group => {
      group.items.forEach(item => {
        allItems.push(item.value);
      });
    });
    
    const wasChecked = this.selectAllChecked;
    this.selectAllChecked = allItems.length > 0 && selectedValues.length === allItems.length;
    
    if (wasChecked !== this.selectAllChecked) {
      console.log('Select All state changed from', wasChecked, 'to', this.selectAllChecked);
    }
  }

  // Updated group checkbox methods with better debugging
  getGroupCheckboxValue(group: DropdownGroup): boolean {
    // Ensure the group state exists
    if (!(group.label in this.groupCheckboxValues)) {
      this.groupCheckboxValues[group.label] = false;
    }
    
    const isChecked = this.groupCheckboxValues[group.label];
    
    // Debug output for problematic groups
    if (group.label === 'Precision Machining') {
      console.log(`Precision Machining checkbox value: ${isChecked}`);
    }
    
    return isChecked;
  }

  // Keep the old method for backward compatibility but log deprecation
  getGroupCheckboxModel(group: DropdownGroup): boolean {
    console.warn('getGroupCheckboxModel is deprecated, use getGroupCheckboxValue instead');
    return this.getGroupCheckboxValue(group);
  }

  isGroupPartiallySelected(group: DropdownGroup): boolean {
    // Ensure the group state exists
    if (!(group.label in this.groupSelectionStates)) {
      this.groupSelectionStates[group.label] = 'none';
    }
    
    const state = this.groupSelectionStates[group.label];
    return state === 'partial';
  }

  onGroupHeaderClick(event: any, group: DropdownGroup): void {
    console.log('Group header clicked:', group.label);
    event.preventDefault();
    event.stopPropagation();
    // Toggle the group selection when header is clicked
    this.toggleGroupSelection(group);
  }

  private toggleGroupSelection(group: DropdownGroup): void {
    console.log('Toggling group selection for:', group.label);
    
    if (!this.multiselect) return;
    
    const selectedValues = this.dropdownControl.value || [];
    const groupItemValues = group.items.map(item => item.value);
    
    console.log('Current selected values:', selectedValues);
    console.log('Group item values:', groupItemValues);
    
    // Check how many items in this group are currently selected
    const selectedInGroup = groupItemValues.filter(value => selectedValues.includes(value)).length;
    
    let newSelectedValues: any[];
    
    if (selectedInGroup === groupItemValues.length) {
      // All items are selected, so deselect all
      newSelectedValues = selectedValues.filter((value: any) => 
        !groupItemValues.includes(value)
      );
      console.log('Deselecting all items in group. New values:', newSelectedValues);
      this.dropdownControl.setValue(newSelectedValues);
    } else {
      // Some or no items are selected, so select all
      newSelectedValues = [...selectedValues];
      
      groupItemValues.forEach(itemValue => {
        if (!newSelectedValues.includes(itemValue)) {
          newSelectedValues.push(itemValue);
        }
      });
      
      console.log('Selecting all items in group. New values:', newSelectedValues);
      this.dropdownControl.setValue(newSelectedValues);
    }
    
    // Update local selectedValue and notify parent
    this.selectedValue = newSelectedValues;
    this.onChange(newSelectedValues);
    this.selectionChange.emit(newSelectedValues);
    
    // Update group selection states with proper timing
    setTimeout(() => {
      this.updateAllGroupSelectionStates();
      this.updateSelectAllState();
      this.cdr.detectChanges();
      console.log('Updated group selection states:', this.groupSelectionStates);
    }, 0);
  }

  private updateGroupSelectionState(group: DropdownGroup): void {
    const selectedValues = this.dropdownControl.value || [];
    const groupItemValues = group.items.map(item => item.value);
    
    const selectedInGroup = groupItemValues.filter(value => 
      selectedValues.includes(value)
    ).length;
    
    const previousState = this.groupSelectionStates[group.label];
    const previousCheckboxValue = this.groupCheckboxValues[group.label];
    
    if (selectedInGroup === 0) {
      this.groupSelectionStates[group.label] = 'none';
      this.groupCheckboxValues[group.label] = false;
    } else if (selectedInGroup === groupItemValues.length) {
      this.groupSelectionStates[group.label] = 'all';
      this.groupCheckboxValues[group.label] = true;
    } else {
      this.groupSelectionStates[group.label] = 'partial';
      this.groupCheckboxValues[group.label] = false; // Partial state shows as unchecked but with special styling
    }
    
    // Enhanced logging for debugging
    if (previousState !== this.groupSelectionStates[group.label] || 
        previousCheckboxValue !== this.groupCheckboxValues[group.label] || 
        group.label === 'Precision Machining') {
      console.log(`Group ${group.label}: ${selectedInGroup}/${groupItemValues.length} selected, state changed from ${previousState} to ${this.groupSelectionStates[group.label]}, checkbox: ${this.groupCheckboxValues[group.label]}`);
    }
  }

  private updateAllGroupSelectionStates(): void {
    console.log('Updating all group selection states...');
    
    // Ensure all groups are initialized in the state objects
    this.originalOptions.forEach(group => {
      if (!(group.label in this.groupSelectionStates)) {
        this.groupSelectionStates[group.label] = 'none';
      }
      if (!(group.label in this.groupCheckboxValues)) {
        this.groupCheckboxValues[group.label] = false;
      }
    });
    
    // Update display options
    this.displayOptions.forEach(group => {
      this.updateGroupSelectionState(group);
    });
    
    // Also update original options to ensure consistency
    this.originalOptions.forEach(group => {
      this.updateGroupSelectionState(group);
    });
    
    console.log('Final group states:', this.groupSelectionStates);
    console.log('Final group checkbox values:', this.groupCheckboxValues);
  }

  getGroupInputId(group: DropdownGroup): string {
    return `group_${group.label.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  private logFormIntegration(): void {
    console.log('🔧 Form Integration Debug:', {
      selectedValue: this.selectedValue,
      dropdownControlValue: this.dropdownControl.value,
      groupCheckboxValues: this.groupCheckboxValues,
      groupSelectionStates: this.groupSelectionStates,
      formControlValid: this.dropdownControl.valid,
      formControlDirty: this.dropdownControl.dirty,
      formControlTouched: this.dropdownControl.touched,
      formControlErrors: this.dropdownControl.errors
    });
  }
} 