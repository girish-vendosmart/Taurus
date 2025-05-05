import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldArrayType, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'formly-repeat-section',
  standalone: true,
  imports: [CommonModule, FormlyModule],
  template: `
    <div class="mb-3">
      <legend *ngIf="props.label">{{ props.label }}</legend>
      <p *ngIf="props.description" class="text-muted">{{ props.description }}</p>
      
      <div class="alert alert-secondary" *ngIf="model.length === 0">
        No items added yet. Click the button below to add your first item.
      </div>
      
      <div *ngFor="let field of field.fieldGroup; let i = index" class="card mb-3">
        <div class="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Item #{{ i + 1 }}</h5>
          <button 
            type="button" 
            class="btn btn-sm btn-danger"
            (click)="remove(i)">
            {{ props['removeText'] || 'Remove' }}
          </button>
        </div>
        <div class="card-body">
          <formly-field [field]="field"></formly-field>
        </div>
      </div>
      
      <button 
        type="button" 
        class="btn btn-primary"
        (click)="add()">
        {{ props['addText'] || 'Add' }}
      </button>
    </div>
  `,
})
export class FormlyRepeatTypeComponent extends FieldArrayType {} 