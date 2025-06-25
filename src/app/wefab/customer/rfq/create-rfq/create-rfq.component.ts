import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface LineItem {
  partNumber: string;
  description: string;
  quantity: number;
  material: string;
}

@Component({
  selector: 'app-create-rfq',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-rfq.component.html',
  styleUrl: './create-rfq.component.scss'
})
export class CreateRfqComponent implements OnInit {
  createRfqForm!: FormGroup;
  
  materialOptions = [
    'Aluminum',
    'Steel',
    'Stainless Steel',
    'Copper',
    'Brass',
    'Titanium',
    'Plastic - ABS',
    'Plastic - PLA',
    'Carbon Fiber'
  ];

  deliveryLocations = [
    'Select existing address...',
    'New York, NY',
    'Los Angeles, CA',
    'Chicago, IL',
    'Houston, TX',
    'Philadelphia, PA'
  ];

  supportedFormats = 'PDF, STEP, STL, IGES, DXF, DWG, SLDPRT';

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.createRfqForm = this.fb.group({
      projectInfo: this.fb.group({
        projectName: ['', [Validators.required]],
        targetDeliveryDate: ['', [Validators.required]],
        deliveryLocation: ['', [Validators.required]],
        specialInstructions: ['']
      }),
      lineItems: this.fb.array([this.createLineItem()]),
      technicalDrawings: this.fb.array([])
    });
  }

  createLineItem(): FormGroup {
    return this.fb.group({
      partNumber: ['', [Validators.required]],
      description: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      material: ['', [Validators.required]]
    });
  }

  get lineItems(): FormArray {
    return this.createRfqForm.get('lineItems') as FormArray;
  }

  get technicalDrawings(): FormArray {
    return this.createRfqForm.get('technicalDrawings') as FormArray;
  }

  addLineItem() {
    this.lineItems.push(this.createLineItem());
  }

  removeLineItem(index: number) {
    if (this.lineItems.length > 1) {
      this.lineItems.removeAt(index);
    }
  }

  incrementQuantity(index: number) {
    const control = this.lineItems.at(index).get('quantity');
    if (control) {
      control.setValue(control.value + 1);
    }
  }

  decrementQuantity(index: number) {
    const control = this.lineItems.at(index).get('quantity');
    if (control && control.value > 1) {
      control.setValue(control.value - 1);
    }
  }

  onFileSelect(event: any) {
    const files = event.target.files;
    if (files) {
      for (let file of files) {
        this.technicalDrawings.push(this.fb.control(file));
      }
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  addLineItemsManually() {
    // Add multiple line items functionality
    this.addLineItem();
  }

  uploadBOMFile() {
    // Implement BOM file upload functionality
    console.log('Upload BOM File clicked');
  }

  backToOptions() {
    // Navigate back to options
    console.log('Back to Options clicked');
  }

  saveDraft() {
    if (this.createRfqForm.valid) {
      console.log('Saving draft:', this.createRfqForm.value);
    }
  }

  submitRfq() {
    if (this.createRfqForm.valid) {
      console.log('Submitting RFQ:', this.createRfqForm.value);
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched(this.createRfqForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched({ onlySelf: true });
      }
    });
  }

  isFieldInvalid(fieldPath: string): boolean {
    const field = this.createRfqForm.get(fieldPath);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
