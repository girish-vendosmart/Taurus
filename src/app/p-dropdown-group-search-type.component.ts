import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { PDropdownGroupSearchComponent, DropdownGroup } from './p-dropdown-group-search.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'formly-field-p-dropdown-group-search',
  standalone: true,
  imports: [PDropdownGroupSearchComponent, ReactiveFormsModule],
  template: `
    <app-p-dropdown-group-search
      [label]="props.label || ''"
      [placeholder]="props.placeholder || 'Select an option'"
      [required]="props.required || false"
      [disabled]="props.disabled || false"
      [description]="props.description || ''"
      [showClear]="props['showClear'] !== false"
      [filterPlaceholder]="props['filterPlaceholder'] || 'Search groups and options...'"
      [multiselect]="props['multiselect'] || false"
      [options]="getOptions()"
      [formControl]="formControl"
    ></app-p-dropdown-group-search>
  `
})
export class FormlyFieldPDropdownGroupSearchComponent extends FieldType<FieldTypeConfig> {
  
  getOptions(): DropdownGroup[] {
    const options = this.props.options;
    if (Array.isArray(options)) {
      return options as DropdownGroup[];
    }
    return [];
  }
} 