import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { Router } from '@angular/router';

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
        rate: 0,
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
        rate: 0,
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
        rate: 0,
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
        rate: 0,
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
        rate: 0,
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
        rate: 0,
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
        rate: 0,
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
        rate: 0,
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

  @ViewChild('csvFileInput', { static: false }) csvFileInput!: ElementRef;

  constructor(private messageService: MessageService, private router: Router) {}

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
      // Generate a quotation ID (in a real app, this would come from the backend)
      const quotationId = 'QUO' + Date.now().toString().slice(-6);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Quotation saved successfully!'
      });
      console.log('Quotation Data:', this.model);
      
      // Redirect to quotation details page after a short delay to show the success message
      setTimeout(() => {
        this.router.navigate(['/wefab/supplier/quotation/details', quotationId]);
      }, 1500);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all required fields and confirm the checkboxes'
      });
    }
  }

  exportCSV() {
    // Create CSV content for quotation items only
    const headers = [
      'S.No',
      'Expense Head',
      'Section Head', 
      'Item Number',
      'Drawing Ref',
      'Description',
      'Unit',
      'Quantity',
      'Rate',
      'Total Amount',
      'Comment By Swiss Electric Solutions AG',
      'Notes By Alshaya Group'
    ];

    const csvContent = [
      headers.join(','),
      ...this.model.quotationItems.map((item: any, index: number) => [
        index + 1,
        `"${item.expenseHead || ''}"`,
        `"${item.sectionHead || ''}"`,
        `"${item.itemNumber || ''}"`,
        `"${item.drawingRef || ''}"`,
        `"${item.description || ''}"`,
        `"${item.unit || ''}"`,
        item.quantity || 0,
        item.rate || 0,
        this.getRowTotal(item),
        `"${item.commentBySwissElectric || ''}"`,
        `"${item.notesByAlshayaGroup || ''}"`
      ].join(','))
    ].join('\n');

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `quotation-items-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.messageService.add({
      severity: 'success',
      summary: 'Export Successful',
      detail: 'Quotation items exported to CSV successfully!'
    });
  }

  importCSV() {
    // Use the ViewChild reference to trigger file selection
    if (this.csvFileInput) {
      this.csvFileInput.nativeElement.click();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const csvContent = e.target.result;
          this.parseCSVAndUpdateTable(csvContent);
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Import Error',
            detail: 'Error reading CSV file. Please check the file format.'
          });
        }
      };
      reader.readAsText(file);
    }
  }

  private parseCSVAndUpdateTable(csvContent: string) {
    const lines = csvContent.split('\n');
    
    // Skip header row and filter out empty lines
    const dataLines = lines.slice(1).filter(line => line.trim() !== '');
    
    if (dataLines.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Import Warning',
        detail: 'No data found in CSV file.'
      });
      return;
    }

    const importedItems: any[] = [];

    dataLines.forEach((line, index) => {
      try {
        // Parse CSV line (handling quoted values)
        const values = this.parseCSVLine(line);
        
        if (values.length >= 12) {
          const item = {
            expenseHead: values[1] || '',
            sectionHead: values[2] || '',
            itemNumber: values[3] || '',
            drawingRef: values[4] || '',
            description: values[5] || '',
            unit: values[6] || '',
            quantity: parseFloat(values[7]) || 0,
            rate: parseFloat(values[8]) || 0,
            totalAmount: parseFloat(values[9]) || 0,
            commentBySwissElectric: values[10] || '',
            notesByAlshayaGroup: values[11] || ''
          };
          importedItems.push(item);
        }
      } catch (error) {
        console.warn(`Error parsing line ${index + 2}:`, error);
      }
    });

    if (importedItems.length > 0) {
      this.model.quotationItems = importedItems;
      this.calculateTotals();
      this.messageService.add({
        severity: 'success',
        summary: 'Import Successful',
        detail: `Successfully imported ${importedItems.length} quotation items from CSV.`
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Import Error',
        detail: 'No valid data could be imported from the CSV file.'
      });
    }
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result.map(value => value.replace(/^"|"$/g, '')); // Remove surrounding quotes
  }

  resetTable() {
    // Reset to original sample data
    this.model.quotationItems = [
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
    ];
    
    // Reset discount percentage
    this.discountPercentage = 0;
    
    this.calculateTotals();
    this.messageService.add({
      severity: 'success',
      summary: 'Reset Successful',
      detail: 'Table has been reset to original sample data'
    });
  }
}
