import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

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
        [options]="to['groups']"
        [optionLabel]="to['optionLabel'] || 'label'"
        [optionValue]="to['optionValue'] || 'value'"
        [optionGroupLabel]="to['optionGroupLabel'] || 'label'"
        [optionGroupChildren]="to['optionGroupChildren'] || 'items'"
        [placeholder]="to['placeholder'] || 'Select options'"
        [required]="to.required || false"
        [disabled]="to.disabled || false"
        [style]="{ width: '100%' }"
        [group]="true"
        [filter]="to['filter'] || false"
        [showToggleAll]="to['showToggleAll'] !== undefined ? to['showToggleAll'] : true"
        appendTo="body"
      >
      </p-multiSelect>
      
      <small *ngIf="to.description" class="form-text text-muted">{{ to.description }}</small>
    </div>
  `,
})
export class PMultiSelectGroupComponent extends FieldType<FieldTypeConfig> implements OnInit {
  ngOnInit() {
    // You can add initialization logic here if needed
  }
}