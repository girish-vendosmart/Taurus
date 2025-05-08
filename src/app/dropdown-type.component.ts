import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { Observable } from 'rxjs';

@Component({
  selector: 'formly-field-dropdown',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule, DropdownModule],
  template: `
    <div class="mb-3">
      <label *ngIf="props['label']" class="form-label">
        {{ props['label'] }}
        <span class="text-danger" *ngIf="props['required']">*</span>
      </label>
      <p *ngIf="props['description']" class="form-text text-muted">{{ props['description'] }}</p>
      
      <p-dropdown
        [formControl]="formControl"
        [options]="dropdownOptions"
        optionLabel="label"
        optionValue="value"
        [placeholder]="props['placeholder'] || 'Select an option'"
        [filter]="props['filter'] !== false"
        [showClear]="props['showClear'] !== false"
        [style]="{ width: '100%' }"
        styleClass="w-100"
        appendTo="body"
      ></p-dropdown>
      
      <div class="invalid-feedback d-block" *ngIf="showError">
        <formly-validation-message [field]="field"></formly-validation-message>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .p-dropdown {
        width: 100%;
        border-radius: 6px;
        border-color: #d1d5db;
      }
      
      .p-dropdown:hover {
        border-color: #2563eb;
      }
      
      .p-dropdown:focus,
      .p-dropdown.p-focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
      }
      
      .p-dropdown-panel .p-dropdown-items .p-dropdown-item.p-highlight {
        background-color: rgba(37, 99, 235, 0.1);
        color: #2563eb;
      }
    }
  `]
})
export class FormlyFieldDropdownComponent extends FieldType<FieldTypeConfig> implements OnInit {
  dropdownOptions: any[] = [];

  ngOnInit() {
    this.setOptions();
    
    // Watch for changes to the options
    if (this.field?.hooks) {
      this.field.hooks = {
        ...this.field.hooks,
        onInit: (field) => {
          if (field.props && field.props['options'] instanceof Observable) {
            const sub = (field.props['options'] as Observable<any[]>).subscribe(options => {
              if (field.props) {
                field.props['_options'] = options;
                this.setOptions();
              }
            });
            
            if (field.hooks) {
              field.hooks = {
                ...field.hooks,
                onDestroy: () => {
                  sub.unsubscribe();
                }
              };
            }
          }
        }
      };
    }
  }

  private setOptions() {
    const fieldOptions = this.props['_options'] || this.props['options'];
    
    if (fieldOptions instanceof Observable) {
      fieldOptions.subscribe(opts => {
        this.dropdownOptions = opts || [];
      });
    } else if (Array.isArray(fieldOptions)) {
      this.dropdownOptions = fieldOptions;
    } else {
      this.dropdownOptions = [];
    }
  }
} 