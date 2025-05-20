import { Component, SimpleChanges } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { GooglePlacesComponentComponent, AddressData } from './wefab/wefab-shared-component/google-places-component/google-places-component.component';

interface GooglePlacesTemplateOptions {
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  updateFields?: Record<string, string>;
}

@Component({
  selector: 'formly-field-google-places',
  standalone: true,
  imports: [GooglePlacesComponentComponent],
  template: `
    <app-google-places-component
      [label]="to.label || 'Address'"
      [placeholder]="to.placeholder || 'Search for places'"
      [disabled]="to.disabled || formControl.disabled"
      [prefillAdress]="prefillAdress"
      (addressSelect)="onAddressSelect($event)"
    >
    </app-google-places-component>
  `,
})
export class FormlyFieldGooglePlacesComponent extends FieldType<FieldTypeConfig> {
  prefillAdress: any;
  // Type the template options
  override get to(): GooglePlacesTemplateOptions {
    return this.props as GooglePlacesTemplateOptions;
  }

  ngOnInit() {
    this.formControl.valueChanges.subscribe((value) => {
        this.prefillAdress = value
    });
  }

  onAddressSelect(address: AddressData | null) {
    if (address) {
      // Store the full address data in the form control
      this.formControl.setValue(address);
      
      // If there are parent field keys for specific address parts, update them
      if (this.to.updateFields) {
        const fields = this.to.updateFields;
        const form = this.form;
        
        // Update each field with the corresponding address data
        Object.keys(fields).forEach(key => {
          const addressKey = fields[key];
          let value = '';
          
          // Handle nested properties with dot notation
          if (addressKey.includes('.')) {
            const parts = addressKey.split('.');
            let obj: any = address;
            for (let i = 0; i < parts.length - 1; i++) {
              if (obj && typeof obj === 'object') {
                obj = obj[parts[i]];
              }
            }
            const lastPart = parts[parts.length - 1];
            value = obj && typeof obj === 'object' && lastPart in obj ? obj[lastPart] : '';
          } else if (addressKey in address) {
            // Type safe way to access address properties
            value = (address as any)[addressKey]; 
          }
          
          if (form.get(key)) {
            form.get(key)!.setValue(value);
          }
        });
      }
      
      // Mark as touched
      this.formControl.markAsTouched();
    } else {
      this.formControl.setValue(null);
    }
  }
} 