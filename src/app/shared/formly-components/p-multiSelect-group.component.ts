import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

interface GroupMapping {
  [key: string]: (string | RegExp)[];
}

@Component({
  selector: 'app-p-multiselect-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MultiSelectModule, FormlyModule],
  template: `
    <div class="form-group">
      <label *ngIf="to.label" [for]="id" class="form-label d-flex align-items-baseline"> 
        {{ to.label }}
        <span *ngIf="to.required" class="text-danger">*</span>
      </label>
      
      <p-multiSelect
        [formControl]="formControl"
        [formlyAttributes]="field"
        [options]="groupedOptions"
        [optionLabel]="to['optionLabel'] || 'label'"
        [optionValue]="to['optionValue'] || 'value'"
        [optionGroupLabel]="to['optionGroupLabel'] || 'label'"
        [optionGroupChildren]="to['optionGroupChildren'] || 'items'"
        [placeholder]="to['placeholder'] || 'Select options'"
        [required]="to.required || false"
        [disabled]="to.disabled || false"
        [style]="{ width: '100%' }"
        [group]="true"
        [filter]="to['filter'] !== undefined ? to['filter'] : true"
        [showToggleAll]="to['showToggleAll'] !== undefined ? to['showToggleAll'] : true"
        appendTo="body"
      >
      </p-multiSelect>
      
      <small *ngIf="to.description" class="form-text text-muted">{{ to.description }}</small>
    </div>
  `,
})
export class PMultiSelectGroupComponent extends FieldType<FieldTypeConfig> implements OnInit {
  groupedOptions: any[] = [];

  ngOnInit() {
    // Process options initially
    this.processOptions();
    
    // No subscription needed as we're working with arrays, not Observables
  }

  processOptions() {
    // If groups are already provided, use them directly
    if (this.to['groups'] && Array.isArray(this.to['groups'])) {
      this.groupedOptions = this.to['groups'];
      return;
    }

    // If we have a flat array, convert it to grouped format using groupMappings
    const flatOptions = this.to['options'] || [];
    if (Array.isArray(flatOptions) && flatOptions.length > 0) {
      // If it's an array of strings, we need to create objects
      const processedOptions = flatOptions.map(option => {
        if (typeof option === 'string') {
          return {
            label: this.formatLabel(option),
            value: option
          };
        }
        return option;
      });
      
      // Use defined mappings to create groups
      const groupMappings: GroupMapping = this.to['groupMappings'] || this.getDefaultGroupMappings();
      
      // Initialize groups object
      const groups: Record<string, any[]> = {};
      
      // Initialize all groups with empty arrays
      Object.keys(groupMappings).forEach(groupName => {
        groups[groupName] = [];
      });
      
      // Assign options to their respective groups
      processedOptions.forEach(option => {
        let assigned = false;
        
        // Check which group this option belongs to
        Object.entries(groupMappings).forEach(([groupName, patterns]) => {
          // Now patterns is properly typed as (string | RegExp)[]
          patterns.forEach((pattern: string | RegExp) => {
            if ((pattern instanceof RegExp && pattern.test(option.value)) || 
                (typeof pattern === 'string' && option.value.includes(pattern))) {
              groups[groupName].push(option);
              assigned = true;
            }
          });
        });
        
        // If not assigned to any group, put in 'Other'
        if (!assigned && groups['Other']) {
          groups['Other'].push(option);
        }
      });
      
      // Convert to final format needed by p-multiSelect
      this.groupedOptions = Object.entries(groups)
        .filter(([_, items]) => items.length > 0) // Remove empty groups
        .map(([label, items]) => ({
          label,
          items
        }));
    }
  }
  
  // Format label from snake_case or similar to Title Case
  formatLabel(str: string): string {
    if (!str) return '';
    
    // Replace underscores and hyphens with spaces
    const spacedStr = str.replace(/[_-]/g, ' ');
    
    // Convert to title case
    return spacedStr
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Default group mappings if none provided
  getDefaultGroupMappings(): GroupMapping {
    return {
      'Manufacturing Processes': [
        'cnc', 'machining', 'molding', 'casting', 'fabrication', 'extrusion', 'printing'
      ],
      'Finishing Processes': [
        'coating', 'anodizing', 'painting', 'plating', 'polishing', 'treatment'
      ],
      'Materials': [
        'metal', 'plastic', 'wood', 'ceramic', 'composite', 'steel', 'aluminum'
      ],
      'Other': []
    };
  }
}