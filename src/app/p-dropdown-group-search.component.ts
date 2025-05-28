import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
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
  imports: [CommonModule, ReactiveFormsModule, DropdownModule, InputTextModule, FormsModule],
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
      
      <p-dropdown
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
            <small>Try searching for group names like "Frontend" or "Backend"</small>
          </div>
          <div class="empty-message" *ngIf="!currentFilter && displayOptions.length === 0">
            <p>No options available</p>
          </div>
        </ng-template>
      </p-dropdown>
      
      <small *ngIf="description" class="form-text text-muted">{{ description }}</small>
      
      <!-- Debug info (remove in production) -->
      <div *ngIf="showDebugInfo" class="debug-info mt-2 p-2 border rounded bg-light">
        <small>
          <strong>Debug Info:</strong><br>
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
    }
    
    .custom-filter-input {
      width: 100%;
      padding: 0.375rem 2rem 0.375rem 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      outline: none;
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
    }
    
    .dropdown-item {
      padding: 0.5rem;
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
    }
    
    .highlight {
      background-color: #fff3cd;
      font-weight: bold;
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
    }
    
    .empty-filter-message p, .empty-message p {
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    
    .empty-filter-message small {
      color: #adb5bd;
    }
    
    .debug-info {
      font-size: 0.75rem;
    }
    
    :host ::ng-deep .p-dropdown-panel {
      max-height: 300px;
    }
    
    :host ::ng-deep .p-dropdown-items-wrapper {
      max-height: 250px;
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
  
  // PrimeNG dropdown configuration
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'value';
  @Input() optionGroupLabel: string = 'label';
  @Input() optionGroupChildren: string = 'items';
  
  // Data input
  @Input() options: DropdownGroup[] = [];
  
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
    
    // Subscribe to dropdown control changes
    this.dropdownControl.valueChanges.subscribe(value => {
      this.selectedValue = value;
      this.onChange(value);
      this.selectionChange.emit(value);
    });
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
} 