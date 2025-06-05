import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';

@Component({
  selector: 'formly-field-range-slider',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule, SliderModule],
  template: `
    <div class="mb-4">
      <label *ngIf="props['label']" class="form-label">
        {{ props['label'] }}
        <span class="text-danger" *ngIf="props['required']">*</span>
      </label>
      <p *ngIf="props['description']" class="form-text text-muted mb-2">{{ props['description'] }}</p>
      
      <div class="range-slider-container">
        <div class="range-slider-wrapper">
          <p-slider 
            [formControl]="formControl" 
            [min]="props['min'] || 0" 
            [max]="props['max'] || 100" 
            [step]="props['step'] || 1"
            class="w-100"
          ></p-slider>
        </div>
        
        <div class="range-value">
          <div class="value-display">
            {{ formControl.value || 0 }}<span class="unit">{{ props['unit'] || '%' }}</span>
          </div>
        </div>
      </div>

      <div class="slider-labels d-flex justify-content-between mt-2" *ngIf="props['showLabels']">
        <div class="min-label">{{ props['minLabel'] || props['min'] || 0 }}{{ props['unit'] || '%' }}</div>
        <div class="max-label">{{ props['maxLabel'] || props['max'] || 100 }}{{ props['unit'] || '%' }}</div>
      </div>
      
      <div class="invalid-feedback d-block" *ngIf="showError">
        <formly-validation-message [field]="field"></formly-validation-message>
      </div>
    </div>
  `,
  styles: [`
    .range-slider-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }
    
    .range-slider-wrapper {
      flex: 1;
    }
    
    .range-value {
      width: 80px;
      text-align: center;
    }
    
    .value-display {
      background-color: #2563eb;
      color: white;
      border-radius: 20px;
      padding: 0.25rem 0.75rem;
      font-weight: 500;
      display: inline-block;
    }
    
    .unit {
      margin-left: 2px;
      font-size: 0.9em;
    }
    
    .slider-labels {
      font-size: 0.8rem;
      color: #6b7280;
    }
    
    :host ::ng-deep {
      .p-slider {
        background: #e5e7eb;
        border-radius: 10px;
        height: 6px;
        margin: 1rem 0;
      }
      
      .p-slider .p-slider-handle {
        background: #2563eb;
        border: 2px solid #2563eb;
        border-radius: 50%;
        height: 20px;
        width: 20px;
        margin-top: -10px;
        margin-left: -10px;
        transition: background-color 0.2s, box-shadow 0.2s;
      }
      
      .p-slider .p-slider-handle:hover {
        background: #1e40af;
        border-color: #1e40af;
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
      }
      
      .p-slider .p-slider-range {
        background: #2563eb;
        border-radius: 10px;
      }
    }
  `]
})
export class FormlyFieldRangeSliderComponent extends FieldType<FieldTypeConfig> {} 