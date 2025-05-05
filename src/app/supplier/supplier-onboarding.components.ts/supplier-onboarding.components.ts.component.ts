import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { Supplier } from '../supplier.model';

@Component({
  selector: 'app-supplier-onboarding.components.ts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormlyModule, FormlyBootstrapModule],
  templateUrl: './supplier-onboarding.components.ts.component.html',
  styleUrl: './supplier-onboarding.components.ts.component.scss'
})
export class SupplierOnboardingComponentsTsComponent {
  form = new FormGroup({});
  model: Partial<Supplier> = {};
  currentStep = 0;
  
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
            key: 'city',
            type: 'input',
            props: {
              label: 'City',
              placeholder: 'Enter city',
              required: true,
            }
          },
          {
            key: 'state',
            type: 'input',
            props: {
              label: 'State / Province / Region',
              placeholder: 'Enter state, province or region',
              required: true,
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
          },
          {
            key: 'country',
            type: 'select',
            props: {
              label: 'Country',
              placeholder: 'Select country',
              required: true,
              options: [
                { label: 'United States', value: 'US' },
                { label: 'United Kingdom', value: 'UK' },
                { label: 'Canada', value: 'CA' },
                { label: 'Australia', value: 'AU' },
                { label: 'India', value: 'IN' },
                { label: 'Germany', value: 'DE' },
                { label: 'France', value: 'FR' },
                { label: 'Japan', value: 'JP' },
                // Add more countries as needed
              ]
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
      this.currentStep++;
      window.scrollTo(0, 0);
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


}
