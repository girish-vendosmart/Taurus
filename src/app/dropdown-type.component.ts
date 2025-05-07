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
      <label *ngIf="props['label']" class="form-label d-flex align-items-center">
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
        styleClass="w-100 formly-dropdown"
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
        width: 100% !important;
        border-radius: 8px;
        border: 1px solid #d1d5db;
        min-height: 52px;
      }
      
      .p-dropdown-label {
        padding: 0.95rem 1.2rem;
        font-size: 1rem;
        display: flex;
        align-items: center;
      }
      
      .p-dropdown-trigger {
        width: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .p-dropdown:hover {
        border-color: #2563eb;
      }
      
      .p-dropdown:focus,
      .p-dropdown.p-focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
      }
      
      .p-dropdown-panel {
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        
        .p-dropdown-items {
          padding: 0.5rem 0;
        }
        
        .p-dropdown-item {
          padding: 0.75rem 1.2rem;
          font-size: 1rem;
        }
        
        .p-dropdown-items .p-dropdown-item.p-highlight {
          background-color: rgba(37, 99, 235, 0.1);
          color: #2563eb;
        }
        
        .p-dropdown-filter-container {
          padding: 0.5rem 1rem;
          
          .p-dropdown-filter {
            padding: 0.5rem;
            font-size: 1rem;
          }
        }
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