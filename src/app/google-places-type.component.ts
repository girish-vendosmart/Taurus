import { Component, SimpleChanges, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { GooglePlacesComponentComponent, AddressData } from './wefab/wefab-shared-component/google-places-component/google-places-component.component';
import { Subscription } from 'rxjs';

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
export class FormlyFieldGooglePlacesComponent extends FieldType<FieldTypeConfig> implements OnInit, OnDestroy {
  prefillAdress: any;
  private valueChangesSubscription?: Subscription;
  
  // Type the template options
  override get to(): GooglePlacesTemplateOptions {
    return this.props as GooglePlacesTemplateOptions;
  }

  constructor(private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    // Check if form control already has a value (for step navigation)
    const currentValue = this.formControl.value;
    if (currentValue && typeof currentValue === 'object') {
      console.log('Google Places field initialized with existing value:', currentValue);
      this.prefillAdress = currentValue;
      this.cdr.detectChanges();
    }

    // Subscribe to value changes for future updates
    this.valueChangesSubscription = this.formControl.valueChanges.subscribe((value) => {
      console.log('Google Places form control value changed:', value);
      if (value && typeof value === 'object') {
        this.prefillAdress = value;
        this.cdr.detectChanges();
      } else if (!value) {
        this.prefillAdress = null;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
    }
  }

  onAddressSelect(address: AddressData | null) {
    if (address) {
      // Store the full address data in the form control
      this.formControl.setValue(address);
      
      // Automatically fill country, state and city fields regardless of updateFields setting
      const form = this.form;
      
      // Try to update country field
      if (form.get('country') && address.country) {
        form.get('country')!.setValue(address.country);
        form.get('country')!.markAsDirty();
        form.get('country')!.updateValueAndValidity();
        
        // Trigger any change events that might be needed to load states
        const countryControl = form.get('country');
        if (countryControl) {
          const event = new Event('change', { bubbles: true });
          setTimeout(() => {
            // Give time for Angular to process the value change
            const formField = document.querySelector(`[formcontrolname="country"]`) as HTMLElement;
            if (formField) formField.dispatchEvent(event);
          }, 100);
        }
      }
      
      // Try to update state field after a short delay to allow country-dependent state list to load
      setTimeout(() => {
        if (form.get('state') && address.state) {
          form.get('state')!.setValue(address.state);
          form.get('state')!.markAsDirty();
          form.get('state')!.updateValueAndValidity();
        }
      }, 500);
      
      // Try to update city field
      if (form.get('city') && address.city) {
        form.get('city')!.setValue(address.city);
        form.get('city')!.markAsDirty();
        form.get('city')!.updateValueAndValidity();
      }
      
      // If there are parent field keys for specific address parts, update them
      if (this.to.updateFields) {
        const fields = this.to.updateFields;
        
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