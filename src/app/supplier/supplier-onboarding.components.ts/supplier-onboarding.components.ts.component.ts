import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { Supplier } from '../supplier.model';

// Add this at the top of your file, outside the component class
export function gstValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  
  if (!value) {
    return null; // Let required validation handle empty values
  }
  
  const gstPattern = /^[0-9]{2}[A-Za-z0-9]{10}[A-Za-z0-9]{1}Z[A-Za-z0-9]{1}$/;
  
  return gstPattern.test(value) ? null : { 'invalidGST': true };
}

// Add these interfaces near the top of your file
interface LocationItem {
  id: string;
  name: string;
}

@Component({
  selector: 'app-supplier-onboarding.components.ts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule, FormlyBootstrapModule],
  templateUrl: './supplier-onboarding.components.ts.component.html',
  styleUrl: './supplier-onboarding.components.ts.component.scss'
})
export class SupplierOnboardingComponentsTsComponent {
  form = new FormGroup({});
  model: Partial<Supplier> = {
    productsOffered: [] // Initialize empty array
  };
  currentStep = 0;
  
  // First define your data
  // Sample data for country-state-city relationships
  countries: LocationItem[] = [
    { id: 'US', name: 'United States' },
    { id: 'IN', name: 'India' },
    { id: 'UK', name: 'United Kingdom' },
    { id: 'CA', name: 'Canada' },
    { id: 'AU', name: 'Australia' }
  ];
  
  states: { [countryId: string]: LocationItem[] } = {
    'US': [
      { id: 'CA', name: 'California' },
      { id: 'TX', name: 'Texas' },
      { id: 'NY', name: 'New York' },
      { id: 'FL', name: 'Florida' },
      { id: 'IL', name: 'Illinois' }
    ],
    'IN': [
      { id: 'MH', name: 'Maharashtra' },
      { id: 'DL', name: 'Delhi' },
      { id: 'KA', name: 'Karnataka' },
      { id: 'TN', name: 'Tamil Nadu' },
      { id: 'GJ', name: 'Gujarat' }
    ],
    'UK': [
      { id: 'LDN', name: 'London' },
      { id: 'MAN', name: 'Manchester' },
      { id: 'BIR', name: 'Birmingham' },
      { id: 'EDI', name: 'Edinburgh' },
      { id: 'CAR', name: 'Cardiff' }
    ],
    'CA': [
      { id: 'ON', name: 'Ontario' },
      { id: 'QC', name: 'Quebec' },
      { id: 'BC', name: 'British Columbia' },
      { id: 'AB', name: 'Alberta' },
      { id: 'NS', name: 'Nova Scotia' }
    ],
    'AU': [
      { id: 'NSW', name: 'New South Wales' },
      { id: 'VIC', name: 'Victoria' },
      { id: 'QLD', name: 'Queensland' },
      { id: 'WA', name: 'Western Australia' },
      { id: 'SA', name: 'South Australia' }
    ]
  };
  
  cities: { [stateId: string]: LocationItem[] } = {
    // US States
    'CA': [{ id: 'SF', name: 'San Francisco' }, { id: 'LA', name: 'Los Angeles' }, { id: 'SD', name: 'San Diego' }],
    'TX': [{ id: 'HOU', name: 'Houston' }, { id: 'AUS', name: 'Austin' }, { id: 'DAL', name: 'Dallas' }],
    'NY': [{ id: 'NYC', name: 'New York City' }, { id: 'BUF', name: 'Buffalo' }, { id: 'ROC', name: 'Rochester' }],
    'FL': [{ id: 'MIA', name: 'Miami' }, { id: 'ORL', name: 'Orlando' }, { id: 'JAX', name: 'Jacksonville' }],
    'IL': [{ id: 'CHI', name: 'Chicago' }, { id: 'SPR', name: 'Springfield' }, { id: 'PEO', name: 'Peoria' }],
    
    // India States
    'MH': [{ id: 'MUM', name: 'Mumbai' }, { id: 'PUN', name: 'Pune' }, { id: 'NAG', name: 'Nagpur' }],
    'DL': [{ id: 'NDL', name: 'New Delhi' }, { id: 'ODL', name: 'Old Delhi' }],
    'KA': [{ id: 'BLR', name: 'Bangalore' }, { id: 'MYS', name: 'Mysore' }, { id: 'HUB', name: 'Hubli' }],
    'TN': [{ id: 'CHN', name: 'Chennai' }, { id: 'COI', name: 'Coimbatore' }, { id: 'MAD', name: 'Madurai' }],
    'GJ': [{ id: 'AHD', name: 'Ahmedabad' }, { id: 'SUR', name: 'Surat' }, { id: 'VAD', name: 'Vadodara' }],
    
    // UK States
    'LDN': [{ id: 'WST', name: 'Westminster' }, { id: 'KEN', name: 'Kensington' }, { id: 'GRN', name: 'Greenwich' }],
    'MAN': [{ id: 'MCC', name: 'Manchester City Center' }, { id: 'SAL', name: 'Salford' }],
    'BIR': [{ id: 'BCC', name: 'Birmingham City Center' }, { id: 'SOL', name: 'Solihull' }],
    'EDI': [{ id: 'OLD', name: 'Old Town' }, { id: 'NEW', name: 'New Town' }, { id: 'LEI', name: 'Leith' }],
    'CAR': [{ id: 'CTC', name: 'Cardiff City Center' }, { id: 'BAY', name: 'Cardiff Bay' }],
    
    // Canadian States
    'ON': [{ id: 'TOR', name: 'Toronto' }, { id: 'OTT', name: 'Ottawa' }, { id: 'HAM', name: 'Hamilton' }],
    'QC': [{ id: 'MTL', name: 'Montreal' }, { id: 'QUE', name: 'Quebec City' }, { id: 'GAT', name: 'Gatineau' }],
    'BC': [{ id: 'VAN', name: 'Vancouver' }, { id: 'VIC', name: 'Victoria' }, { id: 'KEL', name: 'Kelowna' }],
    'AB': [{ id: 'CAL', name: 'Calgary' }, { id: 'EDM', name: 'Edmonton' }, { id: 'RED', name: 'Red Deer' }],
    'NS': [{ id: 'HAL', name: 'Halifax' }, { id: 'DAR', name: 'Dartmouth' }, { id: 'SYD', name: 'Sydney' }],
    
    // Australian States
    'NSW': [{ id: 'SYD', name: 'Sydney' }, { id: 'NEW', name: 'Newcastle' }, { id: 'WOL', name: 'Wollongong' }],
    'VIC': [{ id: 'MEL', name: 'Melbourne' }, { id: 'GEE', name: 'Geelong' }, { id: 'BAL', name: 'Ballarat' }],
    'QLD': [{ id: 'BRI', name: 'Brisbane' }, { id: 'GCO', name: 'Gold Coast' }, { id: 'CAI', name: 'Cairns' }],
    'WA': [{ id: 'PER', name: 'Perth' }, { id: 'FRE', name: 'Fremantle' }, { id: 'BUN', name: 'Bunbury' }],
    'SA': [{ id: 'ADE', name: 'Adelaide' }, { id: 'MBK', name: 'Mount Barker' }, { id: 'GAW', name: 'Gawler' }]
  };

  // Then initialize the steps array AFTER the data is defined
  steps = [
    {
      label: 'Basic Information',
      fields: this.getBasicInfoFields()
    },
    {
      label: 'Contact Information',
      fields: this.getContactInfoFields()
    },
    {
      label: 'Address Information',
      fields: this.getAddressFields()
    },
    {
      label: 'Banking Details',
      fields: this.getBankingFields()
    },
    {
      label: 'Business Details',
      fields: this.getBusinessDetailsFields()
    },
    {
      label: 'Product/Service Information',
      fields: this.getProductServiceFields()
    },
    {
      label: 'Products Offered',
      fields: this.getProductsOfferedFields()
    },
    {
      label: 'Terms and Compliance',
      fields: this.getTermsFields()
    }
  ];

  private getBasicInfoFields(): FormlyFieldConfig[] {
    return [
      {
        key: 'companyName',
        type: 'input',
        props: {
          label: 'Company Name',
          placeholder: 'Enter legal company name',
          required: true,
        }
      },
      {
        key: 'tradingName',
        type: 'input',
        props: {
          label: 'Trading Name (if different)',
          placeholder: 'Enter trading name if different from company name',
        }
      },
      {
        key: 'taxId',
        type: 'input',
        props: {
          label: 'Tax ID / VAT Number',
          placeholder: 'Enter your tax identification number',
          required: true,
        }
      },
      {
        key: 'registrationNumber',
        type: 'input',
        props: {
          label: 'Business Registration Number',
          placeholder: 'Enter business registration number',
          required: true,
        }
      },
      {
        key: 'gstNumber',
        type: 'input',
        props: {
          label: 'GST Number',
          placeholder: 'Enter GST number',
          required: true,
          description: 'Format: 2 digits + 10-character PAN + 1 entity code + Z + 1 checksum'
        },
        validators: {
          validation: [(control: AbstractControl) => {
            const value = control.value;
            if (!value) {
              return null; // Let required validation handle empty values
            }
            
            const gstPattern = /^[0-9]{2}[A-Za-z0-9]{10}[A-Za-z0-9]{1}Z[A-Za-z0-9]{1}$/;
            return gstPattern.test(value) ? null : { 'gstFormat': true };
          }]
        },
        validation: {
          messages: {
            gstFormat: 'Invalid GST format. Must be: 2 digits (state code) + 10-character PAN + entity code + Z + checksum'
          }
        }
      }
    ];

  }

  private getContactInfoFields(): FormlyFieldConfig[] {
    return [
      {
        key: 'primaryContact',
        wrappers: ['panel'],
        props: {
          label: 'Primary Contact Person',
        },
        fieldGroup: [
          {
            key: 'firstName',
            type: 'input',
            props: {
              label: 'First Name',
              placeholder: 'Enter first name',
              required: true,
            }
          },
          {
            key: 'lastName',
            type: 'input',
            props: {
              label: 'Last Name',
              placeholder: 'Enter last name',
              required: true,
            }
          },
          {
            key: 'email',
            type: 'input',
            props: {
              type: 'email',
              label: 'Email Address',
              placeholder: 'Enter email address',
              required: true,
              validation: {
                messages: {
                  pattern: 'Please enter a valid email address'
                }
              }
            },
            validators: {
              validation: ['email']
            }
          },
          {
            key: 'phone',
            type: 'input',
            props: {
              label: 'Phone Number',
              placeholder: 'Enter phone number with country code',
              required: true,
            }
          },
          {
            key: 'position',
            type: 'input',
            props: {
              label: 'Position / Job Title',
              placeholder: 'Enter position or job title',
              required: true,
            }
          }
        ]
      }
    ];    
  }

  private getAddressFields(): FormlyFieldConfig[] {
    return [
      {
        key: 'address',
        wrappers: ['panel'],
        props: {
          label: 'Business Address',
        },
        fieldGroup: [
          {
            key: 'street',
            type: 'input',
            props: {
              label: 'Street Address',
              placeholder: 'Enter street address',
              required: true,
            }
          },
          {
            key: 'country',
            type: 'select',
            props: {
              label: 'Country',
              placeholder: 'Select country',
              required: true,
              options: this.countries.map(country => ({
                label: country.name,
                value: country.id
              }))
            },
            hooks: {
              onInit: (field) => {
                // Reset state and city when country changes
                field.formControl?.valueChanges.subscribe(countryId => {
                  const form = field.parent?.formControl as FormGroup;
                  if (form && countryId) {
                    form.get('state')?.setValue(null);
                    form.get('city')?.setValue(null);
                    
                    // Update the state options
                    const stateField = field.parent?.fieldGroup?.find(f => f.key === 'state');
                    if (stateField && stateField.props) {
                      const stateOptions = this.states[countryId as string] || [];
                      stateField.props.options = stateOptions.map((state: LocationItem) => ({
                        label: state.name,
                        value: state.id
                      }));
                    }
                  }
                });
              }
            }
          },
          {
            key: 'state',
            type: 'select',
            props: {
              label: 'State / Province / Region',
              placeholder: 'Select state',
              required: true,
              options: [] // Will be populated dynamically
            },
            hooks: {
              onInit: (field) => {
                // Reset city when state changes
                field.formControl?.valueChanges.subscribe(stateId => {
                  const form = field.parent?.formControl as FormGroup;
                  if (form && stateId) {
                    form.get('city')?.setValue(null);
                    
                    // Update the city options
                    const cityField = field.parent?.fieldGroup?.find(f => f.key === 'city');
                    if (cityField && cityField.props) {
                      const cityOptions = this.cities[stateId as string] || [];
                      cityField.props.options = cityOptions.map((city: LocationItem) => ({
                        label: city.name,
                        value: city.id
                      }));
                    }
                  }
                });
              }
            },
            expressions: {
              'props.disabled': '!model.address.country'
            }
          },
          {
            key: 'city',
            type: 'select',
            props: {
              label: 'City',
              placeholder: 'Select city',
              required: true,
              options: [] // Will be populated dynamically
            },
            expressions: {
              'props.disabled': '!model.address.state'
            }
          },
          {
            key: 'postalCode',
            type: 'input',
            props: {
              label: 'Postal / ZIP Code',
              placeholder: 'Enter postal or ZIP code',
              required: true,
            }
          }
        ]
      }
    ];
  }

  private getBankingFields() {

    return [
      {
        key: 'bankInformation',
        wrappers: ['panel'],
        props: {
          label: 'Banking Details',
        },
        fieldGroup: [
          {
            key: 'accountName',
            type: 'input',
            props: {
              label: 'Account Holder Name',
              placeholder: 'Enter the name on the bank account',
              required: true,
            }
          },
          {
            key: 'accountNumber',
            type: 'input',
            props: {
              label: 'Account Number',
              placeholder: 'Enter bank account number',
              required: true,
            }
          },
          {
            key: 'bankName',
            type: 'input',
            props: {
              label: 'Bank Name',
              placeholder: 'Enter bank name',
              required: true,
            }
          },
          {
            key: 'branchCode',
            type: 'input',
            props: {
              label: 'Branch Code / Sort Code',
              placeholder: 'Enter branch code or sort code',
              required: true,
            }
          },
          {
            key: 'routingNumber',
            type: 'input',
            props: {
              label: 'Routing Number (if applicable)',
              placeholder: 'Enter routing number if applicable',
            }
          },
          {
            key: 'iban',
            type: 'input',
            props: {
              label: 'IBAN (if applicable)',
              placeholder: 'Enter IBAN if applicable',
            }
          },
          {
            key: 'swift',
            type: 'input',
            props: {
              label: 'SWIFT / BIC Code (if applicable)',
              placeholder: 'Enter SWIFT or BIC code if applicable',
            }
          }
        ]
      }
    ];
    
  }

  private getBusinessDetailsFields() {
    return [
      {
        key: 'businessType',
        type: 'select',
        props: {
          label: 'Business Type',
          placeholder: 'Select business type',
          required: true,
          options: [
            { label: 'Corporation', value: 'corporation' },
            { label: 'Limited Liability Company (LLC)', value: 'llc' },
            { label: 'Partnership', value: 'partnership' },
            { label: 'Sole Proprietorship', value: 'sole_proprietorship' },
            { label: 'Non-Profit Organization', value: 'non_profit' },
            { label: 'Other', value: 'other' }
          ]
        }
      },
      {
        key: 'yearEstablished',
        type: 'input',
        props: {
          type: 'number',
          label: 'Year Established',
          placeholder: 'Enter year company was established',
          required: true,
          min: 1800,
          max: new Date().getFullYear()
        }
      },
      {
        key: 'numberOfEmployees',
        type: 'select',
        props: {
          label: 'Number of Employees',
          placeholder: 'Select number of employees range',
          required: true,
          options: [
            { label: '1-10', value: '1-10' },
            { label: '11-50', value: '11-50' },
            { label: '51-200', value: '51-200' },
            { label: '201-500', value: '201-500' },
            { label: '501-1000', value: '501-1000' },
            { label: '1000+', value: '1000+' }
          ]
        }
      },
      {
        key: 'annualRevenue',
        type: 'select',
        props: {
          label: 'Annual Revenue (optional)',
          placeholder: 'Select annual revenue range',
          options: [
            { label: 'Less than $100,000', value: '<100k' },
            { label: '$100,000 - $500,000', value: '100k-500k' },
            { label: '$500,000 - $1 million', value: '500k-1m' },
            { label: '$1 million - $5 million', value: '1m-5m' },
            { label: '$5 million - $10 million', value: '5m-10m' },
            { label: '$10 million - $50 million', value: '10m-50m' },
            { label: '$50 million - $100 million', value: '50m-100m' },
            { label: '$100 million+', value: '100m+' }
          ]
        }
      }
    ];
    
  }

  private getProductServiceFields() {

    return [
      {
        key: 'productCategories',
        type: 'multicheckbox',
        props: {
          label: 'Product/Service Categories',
          required: true,
          options: [
            { label: 'Raw Materials', value: 'raw_materials' },
            { label: 'Manufacturing Components', value: 'manufacturing_components' },
            { label: 'Electronics', value: 'electronics' },
            { label: 'Software', value: 'software' },
            { label: 'Professional Services', value: 'professional_services' },
            { label: 'Logistics & Transportation', value: 'logistics' },
            { label: 'Marketing & Advertising', value: 'marketing' },
            { label: 'IT Services', value: 'it_services' },
            { label: 'Office Supplies', value: 'office_supplies' },
            { label: 'Other', value: 'other' }
          ]
        }
      },
      {
        key: 'serviceDescription',
        type: 'textarea',
        props: {
          label: 'Brief Description of Products/Services',
          placeholder: 'Describe the products or services your company offers',
          required: true,
          rows: 4
        }
      },
      {
        key: 'certifications',
        type: 'multicheckbox',
        props: {
          label: 'Certifications',
          description: 'Select all that apply',
          options: [
            { label: 'ISO 9001', value: 'iso_9001' },
            { label: 'ISO 14001', value: 'iso_14001' },
            { label: 'ISO 27001', value: 'iso_27001' },
            { label: 'GDPR Compliant', value: 'gdpr' },
            { label: 'Fair Trade Certified', value: 'fair_trade' },
            { label: 'Organic Certified', value: 'organic' },
            { label: 'Minority-Owned Business', value: 'minority_owned' },
            { label: 'Woman-Owned Business', value: 'woman_owned' },
            { label: 'Other', value: 'other' }
          ]
        }
      }
    ];
    
  }

  private getProductsOfferedFields(): FormlyFieldConfig[] {
    return [
      {
        key: 'productsOffered',
        type: 'repeat',
        props: {
          label: 'Products Offered',
          description: 'Add all products that your company offers',
          addText: 'Add Product',
          removeText: 'Remove'
        },
        fieldArray: {
          fieldGroup: [
            {
              key: 'productName',
              type: 'input',
              props: {
                label: 'Product Name',
                placeholder: 'Enter product name',
                required: true,
              }
            },
            {
              key: 'productDescription',
              type: 'textarea',
              props: {
                label: 'Description',
                placeholder: 'Enter product description',
                required: true,
                rows: 3
              }
            },
            {
              key: 'itemCode',
              type: 'input',
              props: {
                label: 'Item Code/SKU',
                placeholder: 'Enter product code or SKU',
                required: true,
              }
            },
            {
              key: 'category',
              type: 'select',
              props: {
                label: 'Category',
                placeholder: 'Select product category',
                required: true,
                options: [
                  { label: 'Electronics', value: 'electronics' },
                  { label: 'Clothing & Apparel', value: 'apparel' },
                  { label: 'Food & Beverage', value: 'food' },
                  { label: 'Home & Furniture', value: 'home' },
                  { label: 'Office Supplies', value: 'office' },
                  { label: 'Industrial Equipment', value: 'industrial' },
                  { label: 'Raw Materials', value: 'raw_materials' },
                  { label: 'Software', value: 'software' },
                  { label: 'Services', value: 'services' },
                  { label: 'Other', value: 'other' }
                ]
              }
            },
            {
              key: 'price',
              type: 'input',
              props: {
                type: 'number',
                label: 'Unit Price',
                placeholder: 'Enter unit price',
                required: true,
                min: 0,
                step: 0.01
              }
            },
            {
              key: 'currency',
              type: 'select',
              props: {
                label: 'Currency',
                placeholder: 'Select currency',
                required: true,
                options: [
                  { label: 'USD - US Dollar', value: 'USD' },
                  { label: 'EUR - Euro', value: 'EUR' },
                  { label: 'GBP - British Pound', value: 'GBP' },
                  { label: 'INR - Indian Rupee', value: 'INR' },
                  { label: 'CAD - Canadian Dollar', value: 'CAD' },
                  { label: 'AUD - Australian Dollar', value: 'AUD' },
                  { label: 'JPY - Japanese Yen', value: 'JPY' }
                ]
              }
            },
            {
              key: 'availableQuantity',
              type: 'input',
              props: {
                type: 'number',
                label: 'Available Quantity',
                placeholder: 'Enter available quantity',
                required: true,
                min: 0
              }
            }
          ]
        }
      }
    ];
  }

  private getTermsFields() {
    return [
      {
        key: 'additionalNotes',
        type: 'textarea',
        props: {
          label: 'Additional Notes',
          placeholder: 'Any additional information you would like to provide',
          rows: 4
        }
      },
      {
        key: 'termsAccepted',
        type: 'checkbox',
        props: {
          label: 'I agree to the terms and conditions for suppliers',
          description: 'By checking this box, you agree to our supplier terms and conditions.',
          required: true,
        },
        validators: {
          validation: [
            {
              name: 'required',
              message: 'You must accept the terms and conditions to continue'
            }
          ]
        }
      },
      {
        key: 'privacyPolicyAccepted',
        type: 'checkbox',
        props: {
          label: 'I consent to the collection and processing of my business information',
          description: 'By checking this box, you consent to our privacy policy.',
          required: true,
        },
        validators: {
          validation: [
            {
              name: 'required',
              message: 'You must consent to the privacy policy to continue'
            }
          ]
        }
      }
    ];
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Form submitted:', this.model);
      // Here you would typically send the data to your backend
      alert('Supplier onboarding form submitted successfully!');
    } else {
      this.form.markAllAsTouched();
      alert('Please fill all required fields correctly.');
    }
  }
  
  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      // Mark fields in the current step as touched to trigger validation
      const currentFields = this.steps[this.currentStep].fields;
      this.markFieldsAsTouched(currentFields);
      
      // Check if the current step is valid
      if (this.isStepValid(currentFields)) {
        this.currentStep++;
        window.scrollTo(0, 0);
      }
    }
  }
  
  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }
  
  isFirstStep(): boolean {
    return this.currentStep === 0;
  }

  isLastStep(): boolean {
    return this.currentStep === this.steps.length - 1;
  }

  // Helper method to mark all fields in the current step as touched
  private markFieldsAsTouched(fields: FormlyFieldConfig[]): void {
    const markRecursively = (field: FormlyFieldConfig) => {
      // If field has formControl property, use it directly
      if (field.formControl) {
        field.formControl.markAsTouched();
        field.formControl.markAsDirty();
      } 
      
      // Handle nested fieldGroup
      if (field.fieldGroup) {
        field.fieldGroup.forEach(childField => markRecursively(childField));
      }
      
      // Handle nested fields with keys
      if (field.key) {
        // For object paths like 'address.street'
        if (typeof field.key === 'string' && field.key.includes('.')) {
          const parts = field.key.split('.');
          let control:any = this.form;
          for (const part of parts) {
            control = control.get(part);
            if (!control) break;
          }
          if (control) {
            control.markAsTouched();
            control.markAsDirty();
          }
        } else {
          const control = this.form.get(String(field.key));
          if (control) {
            control.markAsTouched();
            control.markAsDirty();
          }
        }
      }
    };

    fields.forEach(field => markRecursively(field));
  }

  // Helper method to check if the current step is valid
  private isStepValid(fields: FormlyFieldConfig[]): boolean {
    let valid = true;
    
    const validateRecursively = (field: FormlyFieldConfig): boolean => {
      // If field has formControl property, check validity directly
      if (field.formControl && field.formControl.invalid) {
        return false;
      }
      
      // Handle nested fieldGroup
      if (field.fieldGroup) {
        for (const childField of field.fieldGroup) {
          if (!validateRecursively(childField)) {
            return false;
          }
        }
      }
      
      // Handle nested fields with keys
      if (field.key) {
        // For object paths like 'address.street'
        if (typeof field.key === 'string' && field.key.includes('.')) {
          const parts = field.key.split('.');
          let control:any = this.form;
          for (const part of parts) {
            control = control.get(part);
            if (!control) break;
          }
          if (control && control.invalid) {
            return false;
          }
        } else {
          const control = this.form.get(String(field.key));
          if (control && control.invalid) {
            return false;
          }
        }
      }
      
      return true;
    };
    
    for (const field of fields) {
      if (!validateRecursively(field)) {
        valid = false;
        break;
      }
    }
    
    return valid;
  }

}
