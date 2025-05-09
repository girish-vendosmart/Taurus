import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { Observable } from 'rxjs';

@Component({
  selector: 'formly-field-multiselect',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule, MultiSelectModule],
  template: `
    <div class="mb-3">
      <label *ngIf="props['label']" class="form-label d-flex align-items-baseline">
        {{ props['label'] }}
        <span class="text-danger" *ngIf="props['required']">*</span>
      </label>
      <p *ngIf="props['description']" class="form-text text-muted">{{ props['description'] }}</p>
      
      <p-multiSelect
        [formControl]="formControl"
        [options]="multiselectOptions"
        optionLabel="label"
        optionValue="value"
        [placeholder]="props['placeholder'] || 'Select options'"
        [filter]="props['filter'] !== false"
        [showToggleAll]="props['showToggleAll'] !== false"
        [style]="{ width: '100%' }"
        styleClass="w-100"
        appendTo="body"
      ></p-multiSelect>
      
      <div class="invalid-feedback d-block" *ngIf="showError">
        <formly-validation-message [field]="field"></formly-validation-message>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .p-multiselect {
        width: 100%;
        border-radius: 6px;
        border-color: #d1d5db;
      }
      
      .p-multiselect:hover {
        border-color: #2563eb;
      }
      
      .p-multiselect:focus,
      .p-multiselect.p-focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
      }
      
      .p-multiselect-panel .p-multiselect-items .p-multiselect-item.p-highlight {
        background-color: rgba(37, 99, 235, 0.1);
        color: #2563eb;
      }
      
      .p-multiselect-token {
        background: rgba(37, 99, 235, 0.1);
        color: #2563eb;
      }
    }
  `]
})
export class FormlyFieldMultiSelectComponent extends FieldType<FieldTypeConfig> implements OnInit {
  multiselectOptions: any[] = [];

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
        this.multiselectOptions = opts || [];
      });
    } else if (Array.isArray(fieldOptions)) {
      this.multiselectOptions = fieldOptions;
    } else {
      this.multiselectOptions = [];
    }
  }
} 