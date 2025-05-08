import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldArrayType, FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';

@Component({
  selector: 'formly-repeat-section',
  standalone: true,
  imports: [CommonModule, FormlyModule],
  template: `
    <div class="mb-3 repeatable-section">
      <div class="repeatable-section-items">
        <div *ngFor="let field of field.fieldGroup; let i = index" class="repeatable-section-item mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header d-flex justify-content-between align-items-center bg-light">
              <h5 class="mb-0">{{ field.templateOptions?.label || getEntityLabel(i) }}</h5>
              <div class="actions">
                <button type="button" class="btn btn-sm btn-outline-danger" (click)="remove(i)" *ngIf="showRemoveButton">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </div>
            <div class="card-body">
              <formly-field [field]="field"></formly-field>
            </div>
          </div>
        </div>
      </div>
      <div class="repeatable-section-add text-center mt-3">
        <button type="button" class="btn btn-outline-primary" (click)="add()">
          <i class="pi pi-plus me-2"></i> Add {{ getSingularLabel() }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .repeatable-section-item {
      position: relative;
    }
    .card-header {
      border-radius: 8px 8px 0 0 !important;
      padding: 12px 16px;
    }
    .card-body {
      padding: 20px;
    }
  `]
})
export class FormlyRepeatTypeComponent extends FieldArrayType {
  // This function gets the singular name for the "Add" button
  getSingularLabel(): string {
    const key = this.field.key as string;
    if (key === 'machines') return 'Machine';
    if (key === 'certifications') return 'Certification';
    return 'Item';
  }

  // Get a label for each repeatable entity
  getEntityLabel(index: number): string {
    const key = this.field.key as string;
    if (key === 'machines') return `Machine ${index + 1}`;
    if (key === 'certifications') return `Certification ${index + 1}`;
    return `Item ${index + 1}`;
  }

  // Show remove button only if there's more than one item
  get showRemoveButton(): boolean {
    return (this.field.fieldGroup?.length || 0) > 1;
  }

  override add(i?: number, initialModel?: any): void {
    i = i || this.field.fieldGroup?.length || 0;
    
    // Get the fieldArray from the field config
    const fieldArray = this.field as unknown as { fieldArray: FormlyFieldConfig };
    
    // Use formly's built-in add() method
    super.add(i, initialModel);
    
    // Set the index on each item's model for use in file upload
    if (this.field.fieldGroup) {
      this.field.fieldGroup.forEach((f, idx) => {
        if (f.model) {
          f.model.$index = idx;
        }
      });
    }
  }
} 