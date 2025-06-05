import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FormlyFieldSingleSelectComponent } from '../../shared/formly-components/single-select-type.component';

@Component({
  selector: 'app-single-select-demo',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    FormlyModule,
    FormlyBootstrapModule,
    CardModule,
    ButtonModule,
    FormlyFieldSingleSelectComponent
  ],
  template: `
    <div class="container mt-4">
      <p-card header="PrimeNG Single Select Demo">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <formly-form [form]="form" [fields]="fields" [model]="model"></formly-form>
          
          <div class="d-flex justify-content-between mt-4">
            <button type="button" pButton label="Reset" (click)="onReset()" class="p-button-outlined"></button>
            <button type="submit" pButton label="Submit" [disabled]="!form.valid"></button>
          </div>
        </form>
        
        <div *ngIf="submitted" class="mt-4">
          <h5>Form Values:</h5>
          <pre>{{ model | json }}</pre>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    pre {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 6px;
      border: 1px solid #e9ecef;
    }
  `]
})
export class SingleSelectDemoComponent {
  form = new FormGroup({});
  model: any = {};
  submitted = false;
  
  fields: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'row',
      fieldGroup: [
        {
          className: 'col-md-6 mb-3',
          key: 'department',
          type: 'p-single-select',
          props: {
            label: 'Department',
            placeholder: 'Select department',
            required: true,
            filter: true,  // Enable search filter
            showClear: true,  // Show clear button
            options: [
              { label: 'IT', value: 'it' },
              { label: 'HR', value: 'hr' },
              { label: 'Finance', value: 'finance' },
              { label: 'Marketing', value: 'marketing' },
              { label: 'Operations', value: 'operations' }
            ]
          },
          validation: {
            messages: {
              required: 'Please select a department'
            }
          }
        },
        {
          className: 'col-md-6 mb-3',
          key: 'country',
          type: 'p-single-select',
          props: {
            label: 'Country',
            placeholder: 'Select your country',
            required: true,
            filter: true,
            options: [
              { label: 'United States', value: 'us' },
              { label: 'United Kingdom', value: 'uk' },
              { label: 'Canada', value: 'ca' },
              { label: 'Australia', value: 'au' },
              { label: 'Germany', value: 'de' },
              { label: 'France', value: 'fr' },
              { label: 'Japan', value: 'jp' },
              { label: 'India', value: 'in' },
              { label: 'Brazil', value: 'br' },
              { label: 'China', value: 'cn' }
            ]
          },
          validation: {
            messages: {
              required: 'Please select your country'
            }
          }
        }
      ]
    },
    {
      key: 'position',
      type: 'p-single-select',
      props: {
        label: 'Position',
        placeholder: 'Select your position',
        required: true,
        filter: true,
        description: 'Choose your current role in the company',
        options: [
          { label: 'Software Engineer', value: 'software_engineer' },
          { label: 'Product Manager', value: 'product_manager' },
          { label: 'UX Designer', value: 'ux_designer' },
          { label: 'Data Scientist', value: 'data_scientist' },
          { label: 'Project Manager', value: 'project_manager' },
          { label: 'Business Analyst', value: 'business_analyst' },
          { label: 'DevOps Engineer', value: 'devops_engineer' },
          { label: 'QA Engineer', value: 'qa_engineer' }
        ]
      },
      validation: {
        messages: {
          required: 'Please select your position'
        }
      }
    }
  ];
  
  onSubmit() {
    if (this.form.valid) {
      this.submitted = true;
      console.log('Form submitted:', this.model);
    }
  }
  
  onReset() {
    this.form.reset();
    this.model = {};
    this.submitted = false;
  }
} 