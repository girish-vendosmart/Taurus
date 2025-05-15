import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

declare var google: any;

export interface AddressData {
  fullAddress: string;
  placeId: string;
  streetNumber: string;
  street: string;
  city: string;
  state: string;
  stateCode: string;
  postalCode: string;
  country: string;
  countryCode: string;
  location: {
    lat: number;
    lng: number;
  };
}

@Component({
  selector: 'app-google-places-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule
  ],
  templateUrl: './google-places-component.component.html',
  styleUrl: './google-places-component.component.scss',
  providers: [
    MessageService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GooglePlacesComponentComponent),
      multi: true
    }
  ]
})
export class GooglePlacesComponentComponent implements OnInit, ControlValueAccessor {
  @Input() placeholder: string = 'Search for places';
  @Input() disabled: boolean = false;
  @Input() label: string = 'Location';
  
  @Output() addressSelect = new EventEmitter<AddressData | null>();
  @ViewChild('addressInput') addressInput!: ElementRef;
  
  searchControl = new FormControl('');
  autocompleteInstance: any;
  isLoaded: boolean = false;
  loadingScript: boolean = false;
  selectedAddress: AddressData | null = null;
  
  // For ControlValueAccessor
  onChange: any = () => {};
  onTouched: any = () => {};
  
  constructor(private zone: NgZone, private messageService: MessageService) {}
  
  ngOnInit(): void {
    this.loadGoogleMapsScript();
    
    // When search control changes, call the onChange callback
    this.searchControl.valueChanges.subscribe(value => {
      if (!value && this.selectedAddress) {
        this.selectedAddress = null;
        this.onChange(null);
        this.addressSelect.emit(null);
      }
    });
  }
  
  private loadGoogleMapsScript(): void {
    if (window.document.getElementById('google-maps-script')) {
      this.setupPlacesAutocomplete();
      return;
    }
    
    this.loadingScript = true;
    const script = window.document.createElement('script');
    script.id = 'google-maps-script';
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB0spBejh3-vsmRoYWORKzWv4LgamhS2iQ&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.zone.run(() => {
        this.isLoaded = true;
        this.loadingScript = false;
        this.setupPlacesAutocomplete();
      });
    };
    script.onerror = () => {
      this.zone.run(() => {
        this.loadingScript = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load Google Maps API',
          life: 5000
        });
      });
    };
    window.document.body.appendChild(script);
  }
  
  private setupPlacesAutocomplete(): void {
    if (!this.addressInput || !google || !google.maps || !google.maps.places) {
      setTimeout(() => this.setupPlacesAutocomplete(), 100);
      return;
    }
    
    this.zone.run(() => {
      this.autocompleteInstance = new google.maps.places.Autocomplete(this.addressInput.nativeElement, {
        fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id']
      });
      
      this.autocompleteInstance.addListener('place_changed', () => {
        this.zone.run(() => {
          const place = this.autocompleteInstance.getPlace();
          
          if (!place.geometry) {
            return;
          }
          
          // Parse address components
          const addressData: AddressData = {
            fullAddress: place.formatted_address,
            placeId: place.place_id,
            streetNumber: '',
            street: '',
            city: '',
            state: '',
            stateCode: '',
            postalCode: '',
            country: '',
            countryCode: '',
            location: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          };
          
          // Extract address components
          if (place.address_components) {
            place.address_components.forEach((component: any) => {
              const types = component.types;
              
              if (types.includes('street_number')) {
                addressData.streetNumber = component.long_name;
              } else if (types.includes('route')) {
                addressData.street = component.long_name;
              } else if (types.includes('locality')) {
                addressData.city = component.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                addressData.state = component.long_name;
                addressData.stateCode = component.short_name;
              } else if (types.includes('postal_code')) {
                addressData.postalCode = component.long_name;
              } else if (types.includes('country')) {
                addressData.country = component.long_name;
                addressData.countryCode = component.short_name;
              }
            });
          }
          
          this.selectedAddress = addressData;
          
          // Call the ControlValueAccessor callbacks
          this.onChange(addressData);
          this.onTouched();
          
          // Emit the address select event
          this.addressSelect.emit(addressData);
          
          // Update the input field with the formatted address
          this.searchControl.setValue(addressData.fullAddress, { emitEvent: false });
        });
      });
    });
  }
  
  // ControlValueAccessor methods
  writeValue(value: AddressData | null): void {
    if (value) {
      this.selectedAddress = value;
      this.searchControl.setValue(value.fullAddress, { emitEvent: false });
    } else {
      this.selectedAddress = null;
      this.searchControl.setValue('', { emitEvent: false });
    }
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    isDisabled ? this.searchControl.disable() : this.searchControl.enable();
  }
  
  // Method to clear the selected address
  resetAddress(): void {
    this.searchControl.setValue('');
    this.selectedAddress = null;
    this.onChange(null);
    this.addressSelect.emit(null);
  }
}
