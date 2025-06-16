import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { FieldType } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';

interface ManufacturingOption {
  value: string;
  label: string;
  description?: string;
  checked?: boolean;
}

interface ManufacturingCategory {
  label: string;
  items: ManufacturingOption[];
  expanded?: boolean;
  id: string;
}

@Component({
  selector: 'app-manufacturing-process-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    CheckboxModule,
    ButtonModule
  ],
  template: `
    <div class="manufacturing-process-selector">
      <div class="field-label d-flex" *ngIf="to.label">
        <label style="font-size: 1rem !important; font-weight: 600;">{{ to.label }}</label>
        <span class="text-danger" style="font-size: 1.2rem !important; margin-left: 2px;" *ngIf="to.required"> *</span>
      </div>
      
      <!-- Search Bar -->
      <!-- <div class="search-bar mb-3">
        <div class="p-input-icon-left w-100">
          <i class="pi pi-search"></i>
          <input 
            type="text" 
            pInputText 
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchChange()"
            [placeholder]="to['filterPlaceholder'] || 'Search manufacturing processes and suboptions...'"
            class="w-100" />
        </div>
      </div> -->

      <!-- Categories Container with 2-column layout -->
      <div class="categories-container">
        <div class="row g-2">
          <div 
            *ngFor="let category of filteredCategories; trackBy: trackByCategory" 
            class="col-12 col-md-6">
            
            <div class="category-item h-100">
              <!-- Category Header -->
              <div 
                class="category-header d-flex justify-content-between align-items-center p-2 border rounded"
                [class.expanded]="category.expanded"
                (click)="toggleCategory(category, $event)"
                [attr.data-category-id]="category.id">
                
                <div class="category-info d-flex align-items-center flex-wrap">
                  <i class="pi" [class.pi-chevron-right]="!category.expanded" [class.pi-chevron-down]="category.expanded" style="font-size: 0.8rem;"></i>
                  <span class="category-title ms-2 fw-bold">{{ category.label }}</span>
                  <span class="options-count ms-2 text-muted small">{{ getVisibleItemsCount(category) }} options</span>
                  <span 
                    *ngIf="getSelectedCount(category) > 0" 
                    class="selected-count badge bg-primary ms-2 mt-1">
                    {{ getSelectedCount(category) }} selected
                  </span>
                </div>
              </div>

              <!-- Category Items -->
              <div 
                *ngIf="category.expanded" 
                class="category-items mt-2 ps-3">
                
                <div 
                  *ngFor="let item of getFilteredItems(category); trackBy: trackByItem" 
                  class="item-row mb-2 p-2 border-start border-2 border-light">
                  
                  <div class="d-flex align-items-start">
                    <p-checkbox
                      [binary]="true"
                      [(ngModel)]="item.checked"
                      (ngModelChange)="onItemChange(item)"
                      [inputId]="'option-' + item.value">
                    </p-checkbox>
                    
                    <div class="ms-2 flex-grow-1">
                      <label 
                        [for]="'option-' + item.value"
                        class="item-label fw-medium mb-1 d-block cursor-pointer">
                        {{ item.label }}
                      </label>
                      <small 
                        *ngIf="item.description" 
                        class="item-description text-muted d-block">
                        {{ item.description }}
                      </small>
                    </div>
                  </div>
                </div>

                <!-- No items found -->
                <div 
                  *ngIf="getFilteredItems(category).length === 0 && searchTerm" 
                  class="no-items text-muted text-center py-2">
                  No matching options found
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No categories found -->
      <div 
        *ngIf="filteredCategories.length === 0 && searchTerm" 
        class="no-results text-center py-4 text-muted">
        <i class="pi pi-search text-muted" style="font-size: 2rem;"></i>
        <p class="mt-2">No manufacturing processes found for "{{ searchTerm }}"</p>
      </div>

      <!-- Selected Summary -->
      <div 
        *ngIf="selectedValues.length > 0" 
        class="selected-summary mt-3 p-2 bg-light rounded">
        <small class="text-muted">
          Selected: {{ selectedValues.length }} manufacturing process{{ selectedValues.length !== 1 ? 'es' : '' }}
        </small>
      </div>

      <!-- Field Description -->
      <small *ngIf="to.description" class="field-description text-muted d-block mt-2">
        {{ to.description }}
      </small>
    </div>
  `,
  styles: [`
    .manufacturing-process-selector {
      .category-header {
        cursor: pointer;
        background-color: #f8f9fa;
        transition: all 0.2s ease;
        min-height: 50px;
      }
      
      .category-header:hover {
        background-color: #e9ecef;
      }
      
      .category-header.expanded {
        background-color: #e3f2fd;
        border-color: #2196f3 !important;
      }
      
      .category-title {
        color: #333;
        font-size: 0.9rem;
        line-height: 1.2;
      }
      
      .category-info {
        width: 100%;
      }
      
      .options-count {
        font-size: 0.75rem;
        white-space: nowrap;
      }
      
      .selected-count {
        font-size: 0.7rem;
        white-space: nowrap;
      }
      
      .category-item {
        border: 1px solid #dee2e6;
        border-radius: 0.375rem;
        background-color: #fff;
        transition: all 0.2s ease;
      }
      
      .category-item:hover {
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .item-row {
        background-color: #fafafa;
        border-radius: 0.25rem;
      }
      
      .item-row:hover {
        background-color: #f5f5f5;
      }
      
      .item-label {
        cursor: pointer;
        color: #333;
        font-size: 0.85rem;
      }
      
      .item-description {
        font-size: 0.75rem;
        line-height: 1.3;
      }
      
      .cursor-pointer {
        cursor: pointer;
      }
      
      .categories-container {
        max-height: 600px;
        overflow-y: auto;
        padding: 0.5rem;
      }
      
      .search-bar input {
        border-radius: 0.375rem;
      }
      
      .no-results {
        border: 1px dashed #dee2e6;
        border-radius: 0.375rem;
        margin: 0.5rem;
      }
      
      .selected-summary {
        border: 1px solid #d1ecf1;
        background-color: #d1ecf1 !important;
      }
      
      /* Responsive adjustments */
      @media (max-width: 767.98px) {
        .category-title {
          font-size: 0.85rem;
        }
        
        .category-info {
          flex-direction: column;
          align-items: flex-start !important;
          gap: 0.25rem;
        }
        
        .options-count {
          font-size: 0.7rem;
        }
        
        .selected-count {
          font-size: 0.65rem;
        }
      }
      
      /* Ensure equal height columns */
      .row > .col-12.col-md-6 {
        display: flex;
        flex-direction: column;
      }
      
      .category-item.h-100 {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      
      .category-items {
        flex-grow: 1;
      }
    }
  `]
})
export class ManufacturingProcessSelectorComponent extends FieldType implements OnInit, ControlValueAccessor {
  searchTerm = '';
  categories: ManufacturingCategory[] = [];
  filteredCategories: ManufacturingCategory[] = [];
  selectedValues: string[] = [];

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    console.log('🚀 Manufacturing Process Selector initializing...');
    console.log('📋 Form control initial value:', this.formControl.value);
    console.log('🔧 Template options:', this.to);
    
    this.initializeCategories();
    this.initializeSelectedValues();
    this.filteredCategories = [...this.categories];
    
    // Ensure form control has proper validation
    if (this.to.required) {
      console.log('✅ Field is required, setting up validation');
      
      // Add custom validator for required field
      this.formControl.setValidators((control: any) => {
        const value = control.value;
        if (!value || !Array.isArray(value) || value.length === 0) {
          return { required: true };
        }
        return null;
      });
      
      // Update validation immediately
      this.formControl.updateValueAndValidity();
    }
    
    // If we have initial selected values, ensure they're properly set
    if (this.selectedValues.length > 0) {
      console.log('📤 Setting initial form control value:', this.selectedValues);
      this.formControl.setValue([...this.selectedValues]);
      this.formControl.markAsDirty();
      this.formControl.updateValueAndValidity();
    }
    
    console.log('✅ Manufacturing Process Selector initialized:', {
      categoriesCount: this.categories.length,
      selectedCount: this.selectedValues.length,
      formControlValid: this.formControl.valid,
      formControlValue: this.formControl.value
    });
  }

  initializeCategories() {
    const rawCategories = this.to['options'] || [];
    
    // Ensure rawCategories is an array
    const categoriesArray = Array.isArray(rawCategories) ? rawCategories : [];
    
    this.categories = categoriesArray.map((category: any, index: number) => ({
      label: category.label,
      expanded: false, // Explicitly set to false for each category
      items: category.items.map((item: any) => ({
        ...item,
        checked: false,
        description: this.getItemDescription(item.value)
      })),
      // Add unique identifier to prevent state sharing
      id: `category-${index}-${category.label.replace(/\s+/g, '-').toLowerCase()}`
    }));
  }

  initializeSelectedValues() {
    // Get initial values from form control
    const formControlValue = this.formControl.value;
    this.selectedValues = Array.isArray(formControlValue) ? [...formControlValue] : [];
    
    console.log('🔧 Initializing selected values:', this.selectedValues);
    
    // Update checked state for all items using the new method
    this.updateCheckedStates();
    
    // Subscribe to form control value changes to stay in sync
    this.formControl.valueChanges.subscribe(value => {
      console.log('📡 Form control value changed:', value);
      
      if (Array.isArray(value)) {
        this.selectedValues = [...value];
        this.updateCheckedStates();
      }
    });
    
    console.log('✅ Selected values initialized:', {
      selectedCount: this.selectedValues.length,
      formControlValue: this.formControl.value,
      formControlValid: this.formControl.valid
    });
  }

  getItemDescription(value: string): string {
    const descriptions: { [key: string]: string } = {
      // Precision Machining
      'tight_tolerance_machining': '±0.0001" precision',
      'micro_machining': 'Ultra-small components',
      'surface_finishing': 'Ra 0.1-0.8 μm',
      'complex_geometry': 'Multi-axis operations',
      'prototype_machining': 'Low volume, high precision',
      
      // 3-axis Milling
      'face_milling': 'Flat surface machining',
      'end_milling': 'Profiling and slotting',
      'slot_milling': 'Keyway cutting',
      'profile_milling': 'Contour machining',
      'pocket_milling': 'Material removal',
      'drilling': 'Hole creation',
      'tapping': 'Thread cutting',
      'boring': 'Hole finishing',
      
      // 4-axis Milling
      'rotary_4axis': 'Continuous rotation',
      'indexing_4axis': 'Positioned rotation',
      'continuous_4axis': 'Simultaneous movement',
      'angular_features': 'Angled surfaces',
      'cylindrical_parts': 'Round components',
      'cam_profiles': 'Cam manufacturing',
      'helical_features': 'Spiral geometry',
      'compound_angles': 'Complex angles',
      'rotational_symmetry': 'Symmetric parts',
      'tube_cutting': 'Tubular processing',
      'pipe_cutting': 'Pipe modification',
      'wrap_around_features': 'Circumferential features',
      
      // 5-axis Milling
      'simultaneous_5axis': 'All 5 axes moving together',
      'positional_5axis': 'Indexed positioning',
      'complex_surfaces': 'Sculptured surfaces',
      'aerospace_parts': 'Aviation components',
      'turbine_blades': 'Engine blade manufacturing',
      'impellers': 'Pump and compressor parts',
      
      // CNC Turning
      'external_turning': 'Outside diameter machining',
      'internal_turning': 'Inside diameter machining',
      'facing': 'End surface machining',
      'grooving': 'Groove cutting',
      'threading': 'Thread production',
      'knurling': 'Textured surface creation',
      'parting': 'Cut-off operations',
      'live_tooling': 'Rotating tools on lathe',
      'sub_spindle': 'Secondary spindle work',
      'swiss_turning': 'Swiss-type machining',
      
      // Wire EDM
      'precision_cutting': 'High accuracy cutting',
      'complex_profiles': 'Intricate shapes',
      'hardened_materials': 'Heat-treated metals',
      'small_features': 'Micro-scale details',
      
      // Sheet Metal Works
      'laser_cutting': 'Laser beam cutting',
      'plasma_cutting': 'Plasma arc cutting',
      'waterjet_cutting': 'High-pressure water cutting',
      'punching': 'Hole punching operations',
      'blanking': 'Shape cutting/shearing',
      'bending': 'Press brake forming',
      'rolling': 'Cylindrical forming',
      'stamping': 'Press forming',
      'deep_drawing': 'Deep cup forming',
      'spinning': 'Rotational forming',
      'welding': 'Metal joining',
      'assembly': 'Component assembly',
      
      // 3D Printing
      'metal_3d_printing': 'Additive metal manufacturing',
      'plastic_3d_printing': 'Polymer additive manufacturing',
      'dmls': 'Direct Metal Laser Sintering',
      'slm': 'Selective Laser Melting',
      'ebm': 'Electron Beam Melting',
      'binder_jetting': 'Powder bed + binder',
      'ded': 'Directed Energy Deposition',
      'fdm': 'Fused Deposition Modeling',
      'sla': 'Stereolithography',
      'sls': 'Selective Laser Sintering',
      'polyjet': 'Multi-material jetting',
      'dlp': 'Digital Light Processing',
      'clip': 'Continuous Liquid Interface',
      
      // Surface Treatment
      'grinding': 'Abrasive surface finishing',
      'polishing': 'Mirror surface finishing',
      'lapping': 'Ultra-fine surface finishing',
      'honing': 'Precision bore finishing',
      'sandblasting': 'Abrasive surface preparation',
      'anodizing': 'Aluminum surface treatment',
      'plating': 'Metal coating application',
      'powder_coating': 'Electrostatic coating',
      'heat_treatment': 'Thermal processing',
      
      // Special Processes
      'ultrasonic_machining': 'Ultrasonic vibration cutting',
      'electrochemical_machining': 'Chemical dissolution cutting',
      'electrical_discharge_machining': 'Spark erosion machining',
      'laser_machining': 'Laser beam processing',
      'abrasive_waterjet': 'Water + abrasive cutting',
      'electron_beam_machining': 'Electron beam processing'
    };
    
    return descriptions[value] || '';
  }

  toggleCategory(category: ManufacturingCategory, event?: Event) {
    // Prevent event propagation to avoid any interference
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    // Find the specific category by its unique id and toggle only that one
    const targetCategory = this.categories.find(cat => cat.id === category.id);
    if (targetCategory) {
      targetCategory.expanded = !targetCategory.expanded;
    }
    
    // Also update the filtered categories if they exist
    const filteredCategory = this.filteredCategories.find(cat => cat.id === category.id);
    if (filteredCategory) {
      filteredCategory.expanded = targetCategory?.expanded || false;
    }
    
    // Force change detection
    this.cdr.detectChanges();
    
    console.log(`Toggled category: ${category.label}, expanded: ${targetCategory?.expanded}`);
  }

  onSearchChange() {
    if (!this.searchTerm.trim()) {
      // When clearing search, restore original categories with preserved expanded states
      this.filteredCategories = this.categories.map(category => ({
        ...category,
        // Preserve the expanded state from the original categories
        expanded: category.expanded
      }));
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    
    this.filteredCategories = this.categories
      .map(category => {
        // Find the original category to preserve its expanded state
        const originalCategory = this.categories.find(cat => cat.id === category.id);
        
        return {
          ...category,
          expanded: originalCategory?.expanded || false, // Preserve expanded state
          items: category.items.filter(item => 
            item.label.toLowerCase().includes(searchLower) ||
            (item.description && item.description.toLowerCase().includes(searchLower))
          )
        };
      })
      .filter(category => 
        category.label.toLowerCase().includes(searchLower) || 
        category.items.length > 0
      );
  }

  getFilteredItems(category: ManufacturingCategory) {
    if (!this.searchTerm.trim()) {
      return category.items;
    }

    const searchLower = this.searchTerm.toLowerCase();
    return category.items.filter(item => 
      item.label.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower))
    );
  }

  getVisibleItemsCount(category: ManufacturingCategory): number {
    return this.getFilteredItems(category).length;
  }

  getSelectedCount(category: ManufacturingCategory): number {
    return category.items.filter(item => item.checked).length;
  }

  private notifyParentForm() {
    // Notify parent form about changes
    if (this.formControl.parent) {
      this.formControl.parent.updateValueAndValidity();
    }
    
    // Also trigger change detection on the field itself
    if (this.field && this.field.formControl) {
      this.field.formControl.updateValueAndValidity();
    }
    
    // Emit value changes to ensure parent components are notified
    this.formControl.markAsDirty();
    this.formControl.markAsTouched();
    
    console.log('📢 Parent form notified of changes');
  }

  onItemChange(item: ManufacturingOption) {
    console.log('🔄 Item change triggered:', item.label, 'checked:', item.checked);
    
    if (item.checked) {
      if (!this.selectedValues.includes(item.value)) {
        this.selectedValues.push(item.value);
      }
    } else {
      const index = this.selectedValues.indexOf(item.value);
      if (index > -1) {
        this.selectedValues.splice(index, 1);
      }
    }
    
    console.log('📋 Updated selectedValues:', this.selectedValues);
    console.log('📊 Selected count:', this.selectedValues.length);
    
    // Create a copy of the array to ensure change detection
    const newValue = [...this.selectedValues];
    
    // Update form control with the new values
    this.formControl.setValue(newValue);
    this.formControl.markAsDirty();
    this.formControl.markAsTouched();
    
    // Trigger validation
    this.formControl.updateValueAndValidity();
    
    // Also update the model directly (important for Formly)
    if (this.field && this.field.model && this.field.key) {
      this.field.model[this.field.key as string] = newValue;
      console.log('📝 Updated field model:', this.field.model[this.field.key as string]);
    }
    
    // Notify parent form
    this.notifyParentForm();
    
    // Trigger onChange callback if it exists (for ControlValueAccessor compatibility)
    if (this.onChange) {
      this.onChange(newValue);
    }
    
    // Trigger onTouched callback if it exists
    if (this.onTouched) {
      this.onTouched();
    }
    
    console.log('✅ Form control updated:', {
      value: this.formControl.value,
      valid: this.formControl.valid,
      dirty: this.formControl.dirty,
      touched: this.formControl.touched,
      errors: this.formControl.errors,
      modelValue: this.field?.model ? this.field.model[this.field.key as string] : 'N/A'
    });
    
    // Force change detection
    this.cdr.detectChanges();
  }

  // Add ControlValueAccessor methods for better integration
  private onChange = (value: any) => {};
  private onTouched = () => {};

  writeValue(value: any): void {
    console.log('📝 writeValue called with:', value);
    if (Array.isArray(value)) {
      this.selectedValues = [...value];
      this.updateCheckedStates();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  private updateCheckedStates(): void {
    // Update checked state for all items in categories
    this.categories.forEach(category => {
      category.items.forEach(item => {
        item.checked = this.selectedValues.includes(item.value);
      });
    });
    
    // Update checked state for filtered categories as well
    this.filteredCategories.forEach(category => {
      category.items.forEach(item => {
        item.checked = this.selectedValues.includes(item.value);
      });
    });
    
    this.cdr.detectChanges();
  }

  trackByCategory(index: number, category: ManufacturingCategory): string {
    return category.id;
  }

  trackByItem(index: number, item: ManufacturingOption): string {
    return item.value;
  }
} 