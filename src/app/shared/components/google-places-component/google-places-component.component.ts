import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, SimpleChanges, ViewChild, forwardRef } from '@angular/core';
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
  @Input() prefillAdress: any;
  
  @Output() addressSelect = new EventEmitter<AddressData | null>();
  @ViewChild('addressInput') addressInput!: ElementRef;
  
  searchControl = new FormControl('');
  autocompleteInstance: any;
  isLoaded: boolean = false;
  loadingScript: boolean = false;
  selectedAddress: any;
  
  // For ControlValueAccessor
  onChange: any = () => {};
  onTouched: any = () => {};
  addressText: any= ''
  prefillAddressDetails: any;
  
  constructor(private zone: NgZone, private messageService: MessageService) {}

  ngOnChanges(changes: any): void {
    if (changes.prefillAdress && changes.prefillAdress.currentValue) {
      console.log('Google Places component received prefill address:', changes.prefillAdress.currentValue);
      this.prefillAddressDetails = changes.prefillAdress.currentValue;
      this.prefillAddressData(this.prefillAddressDetails);
    }
  }
  
  ngOnInit(): void {
    // Check if Google Maps API is already loaded
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      this.isLoaded = true;
      // Wait for view initialization to setup autocomplete
      setTimeout(() => {
        if (this.addressInput) {
          this.setupPlacesAutocomplete();
        }
      });
    } else {
      this.loadGoogleMapsScript();
    }
    
    // When search control changes, call the onChange callback
    this.searchControl.valueChanges.subscribe(value => {
      // Update addressText to keep it in sync
      this.addressText = value || '';
      
      if (!value && this.selectedAddress) {
        this.selectedAddress = null;
        this.onChange(null);
        this.addressSelect.emit(null);
      }
    });

    // If we have prefillAdress on init, use it
    if (this.prefillAdress) {
      console.log('Google Places component initialized with prefill address:', this.prefillAdress);
      this.prefillAddressData(this.prefillAdress);
    }
  }

  prefillAddressData(addressDetails: any) {
    if (!addressDetails) {
      console.log('No address details to prefill');
      return;
    }

    console.log('Prefilling address data:', addressDetails);
    
    // Ensure the address object has all required properties
    const processedAddress = this.ensureAddressStructure(addressDetails);
    
    // Set the address text directly
    this.addressText = processedAddress.fullAddress || '';
    
    // Set the selected address object
    this.selectedAddress = processedAddress;
    
    // Update the search control with the address text
    this.searchControl.setValue(this.addressText, { emitEvent: false });
    
    // Call the ControlValueAccessor onChange to notify parent form
    this.onChange(processedAddress);
    
    console.log('Address prefilled successfully:', {
      addressText: this.addressText,
      selectedAddress: this.selectedAddress,
      hasCoordinates: !!(processedAddress.location && processedAddress.location.lat && processedAddress.location.lng)
    });
  }

  // Helper method to ensure address structure includes coordinates
  private ensureAddressStructure(addressData: any): AddressData {
    const processedAddress: AddressData = {
      fullAddress: addressData.fullAddress || addressData.address || '',
      placeId: addressData.placeId || '',
      streetNumber: addressData.streetNumber || '',
      street: addressData.street || '',
      city: addressData.city || '',
      state: addressData.state || '',
      stateCode: addressData.stateCode || '',
      postalCode: addressData.postalCode || '',
      country: addressData.country || '',
      countryCode: addressData.countryCode || '',
      location: {
        lat: 0,
        lng: 0
      }
    };

    // Handle various coordinate formats
    if (addressData.location) {
      if (typeof addressData.location.lat === 'number' && typeof addressData.location.lng === 'number') {
        processedAddress.location = {
          lat: addressData.location.lat,
          lng: addressData.location.lng
        };
      }
    } else if (addressData.lat && addressData.lng) {
      // Handle flat coordinate structure
      processedAddress.location = {
        lat: typeof addressData.lat === 'number' ? addressData.lat : parseFloat(addressData.lat) || 0,
        lng: typeof addressData.lng === 'number' ? addressData.lng : parseFloat(addressData.lng) || 0
      };
    } else if (addressData.latitude && addressData.longitude) {
      // Handle alternative coordinate naming
      processedAddress.location = {
        lat: typeof addressData.latitude === 'number' ? addressData.latitude : parseFloat(addressData.latitude) || 0,
        lng: typeof addressData.longitude === 'number' ? addressData.longitude : parseFloat(addressData.longitude) || 0
      };
    }

    // If we still don't have coordinates but have an address, try to geocode it
    if ((!processedAddress.location.lat || !processedAddress.location.lng) && processedAddress.fullAddress) {
      this.geocodeAddress(processedAddress.fullAddress).then(coordinates => {
        if (coordinates) {
          processedAddress.location = coordinates;
          this.selectedAddress = processedAddress;
          console.log('Geocoded coordinates for address:', coordinates);
        }
      });
    }

    return processedAddress;
  }

  // Method to geocode an address to get coordinates
  private async geocodeAddress(address: string): Promise<{lat: number, lng: number} | null> {
    return new Promise((resolve) => {
      if (!google || !google.maps || !google.maps.Geocoder) {
        console.log('Google Maps Geocoder not available');
        resolve(null);
        return;
      }

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: address }, (results: any, status: any) => {
        if (status === 'OK' && results && results.length > 0) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          console.log('Geocoding failed:', status);
          resolve(null);
        }
      });
    });
  }
  
  private loadGoogleMapsScript(): void {
    // Check if script already exists in the document
    if (window.document.getElementById('google-maps-script')) {
      // Wait to make sure the script is fully loaded
      if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        this.isLoaded = true;
        this.setupPlacesAutocomplete();
      } else {
        // Set up a check for Google API availability
        const checkGoogleInterval = setInterval(() => {
          if (typeof google !== 'undefined' && google.maps && google.maps.places) {
            clearInterval(checkGoogleInterval);
            this.isLoaded = true;
            this.loadingScript = false;
            this.setupPlacesAutocomplete();
          }
        }, 100);
        
        // Clear interval after 10 seconds to prevent infinite checking
        setTimeout(() => {
          clearInterval(checkGoogleInterval);
          if (!this.isLoaded) {
            this.loadingScript = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Google Maps API failed to initialize'
            });
          }
        }, 10000);
      }
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
    if (!this.addressInput || !this.addressInput.nativeElement) {
      // Wait for the view to be initialized
      setTimeout(() => this.setupPlacesAutocomplete(), 100);
      return;
    }
    
    if (!google || !google.maps || !google.maps.places) {
      // Wait for Google API to be fully loaded
      setTimeout(() => this.setupPlacesAutocomplete(), 100);
      return;
    }
    
    this.zone.run(() => {
      try {
        this.autocompleteInstance = new google.maps.places.Autocomplete(this.addressInput.nativeElement, {
          fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id']
        });
        
        this.autocompleteInstance.addListener('place_changed', () => {
          this.zone.run(() => {
            const place = this.autocompleteInstance.getPlace();
            
            if (!place.geometry) {
              console.log('Place selected but no geometry available');
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
            
            console.log('New address selected with coordinates:', {
              address: addressData.fullAddress,
              coordinates: addressData.location
            });
            
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
      } catch (error) {
        console.error('Error setting up Places Autocomplete:', error);
        this.loadingScript = false;
      }
    });
  }
  
  // ControlValueAccessor methods
  writeValue(value: AddressData | null): void {
    console.log('Google Places writeValue called with:', value);
    if (value) {
      // Process the incoming value to ensure proper structure
      const processedValue = this.ensureAddressStructure(value);
      
      this.selectedAddress = processedValue;
      this.addressText = processedValue.fullAddress || '';
      this.searchControl.setValue(processedValue.fullAddress, { emitEvent: false });
      
      console.log('Address value written successfully:', {
        addressText: this.addressText,
        selectedAddress: this.selectedAddress,
        hasCoordinates: !!(processedValue.location && processedValue.location.lat && processedValue.location.lng)
      });
    } else {
      this.selectedAddress = null;
      this.addressText = '';
      this.searchControl.setValue('', { emitEvent: false });
      console.log('Address value cleared');
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
