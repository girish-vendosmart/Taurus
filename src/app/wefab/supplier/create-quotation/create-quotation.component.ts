import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Custom Formly components
import { FormlyFieldDropdownComponent } from '../../../dropdown-type.component';

@Component({
  selector: 'app-create-quotation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormlyModule,
    FormlyBootstrapModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    TableModule,
    ToastModule,
    FormlyFieldDropdownComponent
  ],
  providers: [MessageService],
  templateUrl: './create-quotation.component.html',
  styleUrl: './create-quotation.component.scss'
})
export class CreateQuotationComponent implements OnInit {
  form: FormGroup = new FormGroup({});
  model: any = {
    rfqId: 'RFQ000001137',
    projectDuration: 120,
    quotationItems: [
      {
        expenseHead: 'Professional Costs',
        sectionHead: 'Power Distribution Setup',
        itemNumber: '7.1.2',
        drawingRef: '-',
        description: 'Description',
        unit: 'Pieces',
        quantity: 200,
        rate: 1000,
        totalAmount: 200000,
        commentBySwissElectric: '-',
        notesByAlshayaGroup: '-'
      },
      {
        expenseHead: 'Preliminiries',
        sectionHead: 'others',
        itemNumber: '3.2.4',
        drawingRef: '-',
        description: 'Description',
        unit: 'Pieces',
        quantity: 56,
        rate: 10000,
        totalAmount: 560000,
        commentBySwissElectric: '-',
        notesByAlshayaGroup: '-'
      },
      {
        expenseHead: 'Contingency',
        sectionHead: 'Risk & Contingency Planning',
        itemNumber: '8.2.1',
        drawingRef: '-',
        description: 'Description',
        unit: 'Sqm',
        quantity: 20,
        rate: 20000,
        totalAmount: 400000,
        commentBySwissElectric: '-',
        notesByAlshayaGroup: '-'
      },
      {
        expenseHead: 'Preliminiries',
        sectionHead: 'Other',
        itemNumber: '3.2.3',
        drawingRef: '-',
        description: 'Description',
        unit: 'Sqm',
        quantity: 9,
        rate: 20000,
        totalAmount: 180000,
        commentBySwissElectric: '-',
        notesByAlshayaGroup: '-'
      },
      {
        expenseHead: 'Fire Services',
        sectionHead: 'Fire maintaince',
        itemNumber: '5.2.2',
        drawingRef: '-',
        description: 'Desc',
        unit: 'Pieces',
        quantity: 56,
        rate: 20000,
        totalAmount: 1120000,
        commentBySwissElectric: '-',
        notesByAlshayaGroup: '-'
      },
      {
        expenseHead: 'Preliminiries',
        sectionHead: 'Others',
        itemNumber: '3.2.6',
        drawingRef: '-',
        description: 'Descrip',
        unit: 'Pieces',
        quantity: 20,
        rate: 3000,
        totalAmount: 60000,
        commentBySwissElectric: '-',
        notesByAlshayaGroup: '-'
      },
      {
        expenseHead: 'HVAC',
        sectionHead: 'Water Supply & Drainage',
        itemNumber: '9.2.1',
        drawingRef: '-',
        description: 'Desc',
        unit: 'Sqm',
        quantity: 12,
        rate: 2000,
        totalAmount: 24000,
        commentBySwissElectric: '-',
        notesByAlshayaGroup: '-'
      },
      {
        expenseHead: 'IT Equipment',
        sectionHead: 'Temporary Site Services',
        itemNumber: '6.2.1',
        drawingRef: '-',
        description: 'Desc',
        unit: 'Pieces',
        quantity: 2,
        rate: 20000,
        totalAmount: 40000,
        commentBySwissElectric: '-',
        notesByAlshayaGroup: '-'
      }
    ],
    siteVisitConfirmed: false,
    complianceConfirmed: false
  };
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[] = [];

  // Calculation properties
  subTotal: number = 0;
  discountPercentage: number = 0;
  totalAmount: number = 0;

  // Dropdown options
  expenseHeadOptions = [
    { label: 'Professional Costs', value: 'Professional Costs' },
    { label: 'Preliminiries', value: 'Preliminiries' },
    { label: 'Contingency', value: 'Contingency' },
    { label: 'Fire Services', value: 'Fire Services' },
    { label: 'HVAC', value: 'HVAC' },
    { label: 'IT Equipment', value: 'IT Equipment' }
  ];

  sectionHeadOptions = [
    { label: 'Power Distribution Setup', value: 'Power Distribution Setup' },
    { label: 'others', value: 'others' },
    { label: 'Risk & Contingency Planning', value: 'Risk & Contingency Planning' },
    { label: 'Other', value: 'Other' },
    { label: 'Fire maintaince', value: 'Fire maintaince' },
    { label: 'Others', value: 'Others' },
    { label: 'Water Supply & Drainage', value: 'Water Supply & Drainage' },
    { label: 'Temporary Site Services', value: 'Temporary Site Services' }
  ];

  unitOptions = [
    { label: 'Pieces', value: 'Pieces' },
    { label: 'Sqm', value: 'Sqm' },
    { label: 'Meters', value: 'Meters' },
    { label: 'Hours', value: 'Hours' },
    { label: 'Days', value: 'Days' }
  ];

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.initializeForm();
    this.calculateTotals();
  }

  initializeForm() {
    this.fields = [
      {
        fieldGroupClassName: 'row mb-4',
        fieldGroup: [
          {
            className: 'col-md-6',
            key: 'rfqId',
            type: 'input',
            templateOptions: {
              label: 'RFQ ID',
              placeholder: 'RFQ000001137',
              readonly: true
            }
          },
          {
            className: 'col-md-6',
            key: 'projectDuration',
            type: 'input',
            templateOptions: {
              label: 'Project Duration (in days)',
              type: 'number',
              placeholder: '120',
              required: true
            }
          }
        ]
      }
    ];
  }

  calculateTotals() {
    this.subTotal = this.model.quotationItems?.reduce((sum: number, item: any) => {
      const itemTotal = (item.quantity || 0) * (item.rate || 0);
      item.totalAmount = itemTotal;
      return sum + itemTotal;
    }, 0) || 0;
    
    this.totalAmount = this.subTotal - (this.subTotal * this.discountPercentage / 100);
  }

  // Add getter methods for template calculations
  get calculatedSubTotal(): number {
    return this.model.quotationItems?.reduce((sum: number, item: any) => {
      return sum + ((item.quantity || 0) * (item.rate || 0));
    }, 0) || 0;
  }

  get calculatedTotalAmount(): number {
    const subTotal = this.calculatedSubTotal;
    return subTotal - (subTotal * this.discountPercentage / 100);
  }

  // Method to calculate individual row total
  getRowTotal(item: any): number {
    return (item.quantity || 0) * (item.rate || 0);
  }

  onQuantityOrRateChange(item: any) {
    // Only rate can be changed now, quantity is frozen
    item.totalAmount = (item.quantity || 0) * (item.rate || 0);
    this.calculateTotals();
  }

  onSubmit() {
    if (this.form.valid && this.model.siteVisitConfirmed && this.model.complianceConfirmed) {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Quotation saved successfully!'
      });
      console.log('Quotation Data:', this.model);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all required fields and confirm the checkboxes'
      });
    }
  }

  exportCSV() {
    this.messageService.add({
      severity: 'info',
      summary: 'Export',
      detail: 'CSV export functionality will be implemented'
    });
  }

  resetTable() {
    this.model.quotationItems = [];
    this.calculateTotals();
    this.messageService.add({
      severity: 'info',
      summary: 'Reset',
      detail: 'Table has been reset'
    });
  }
}
