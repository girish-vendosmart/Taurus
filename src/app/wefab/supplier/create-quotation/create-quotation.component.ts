import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
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
    CalendarModule,
    RadioButtonModule,
    CheckboxModule,
    FormlyFieldDropdownComponent
  ],
  providers: [MessageService],
  templateUrl: './create-quotation.component.html',
  styleUrl: './create-quotation.component.scss'
})
export class CreateQuotationComponent implements OnInit {
  form: FormGroup = new FormGroup({});
  isEditMode: boolean = false;
  quotationId: string = '';
  
  model: any = {
    quotationName: '',
    totalLeadTime: '',
    paymentTerms: 'Net 10',
    quoteValidTill: null,
    currency: 'USD',
    email: 'email@example.com',
    reference: '',
    termsAndConditions: '',
    cgstSgst: false,
    igst: false,
    quotationItems: [
      {
        actionItemName: '',
        description: '',
        material: '',
        qty: 0,
        unit: '',
        itemPrice: 0,
        miscellaneous: '',
        tooling: ''
      }
    ],
    subTotal: 0,
    discount: 0,
    shippingCharges: 0,
    totalAmount: 0
  };
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[] = [];

  // Calculation properties
  subTotal: number = 0;
  discountPercentage: number = 0;
  shippingCharges: number = 0;
  totalAmount: number = 0;

  // Tax calculation properties
  cgstPercentage: number = 9;
  sgstPercentage: number = 9;
  igstPercentage: number = 18;

  // Attachment properties
  attachedFiles: File[] = [];

  // Dropdown options
  paymentTermsOptions = [
    { label: 'Net 10', value: 'Net 10' },
    { label: 'Net 15', value: 'Net 15' },
    { label: 'Net 30', value: 'Net 30' },
    { label: 'Net 45', value: 'Net 45' },
    { label: 'Net 60', value: 'Net 60' },
    { label: 'Due on receipt', value: 'Due on receipt' }
  ];

  currencyOptions = [
    { label: 'INR', value: 'INR' },
    { label: 'USD', value: 'USD' }
  ];

  unitOptions = [
    { label: 'Pieces', value: 'Pieces' },
    { label: 'Sqm', value: 'Sqm' },
    { label: 'Meters', value: 'Meters' },
    { label: 'Hours', value: 'Hours' },
    { label: 'Days', value: 'Days' },
    { label: 'Kg', value: 'Kg' },
    { label: 'Liters', value: 'Liters' }
  ];

  @ViewChild('csvFileInput', { static: false }) csvFileInput!: ElementRef;
  @ViewChild('attachmentFileInput', { static: false }) attachmentFileInput!: ElementRef;

  constructor(private messageService: MessageService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.initializeForm();
    this.calculateTotals();
    
    // Get query parameters
    this.route.queryParams.subscribe(params => {
      // Check if this is edit mode
      if (params['mode'] === 'edit' && params['quotationId']) {
        this.isEditMode = true;
        this.quotationId = params['quotationId'];
        console.log('Edit mode activated for quotation:', this.quotationId);
        this.loadQuotationForEdit(this.quotationId);
      }
    });
  }

  initializeForm() {
    this.fields = [
      {
        fieldGroupClassName: 'row mb-4',
        fieldGroup: [
          {
            className: 'col-md-6',
            key: 'quotationName',
            type: 'input',
            templateOptions: {
              label: 'Quotation Name',
              placeholder: 'Enter quotation name',
              required: false
            }
          },
          {
            className: 'col-md-6',
            key: 'totalLeadTime',
            type: 'input',
            templateOptions: {
              label: 'Total lead time (days)',
              type: 'number',
              placeholder: 'Enter total lead time',
              required: true
            }
          }
        ]
      },
      {
        fieldGroupClassName: 'row mb-4',
        fieldGroup: [
          {
            className: 'col-md-6',
            key: 'paymentTerms',
            type: 'dropdown',
            templateOptions: {
              label: 'Payment Terms',
              placeholder: 'Select payment terms',
              required: true,
              options: this.paymentTermsOptions
            }
          },
          {
            className: 'col-md-6',
            key: 'quoteValidTill',
            type: 'input',
            templateOptions: {
              label: 'Quote Valid till',
              type: 'date',
              placeholder: 'dd/mm/yyyy',
              required: true
            }
          }
        ]
      }
    ];
  }

  calculateTotals() {
    this.subTotal = this.model.quotationItems?.reduce((sum: number, item: any) => {
      const itemTotal = (item.qty || 0) * (item.itemPrice || 0);
      return sum + itemTotal;
    }, 0) || 0;
    
    const discountAmount = this.subTotal * this.discountPercentage / 100;
    const subtotalAfterDiscount = this.subTotal - discountAmount;
    
    // Calculate taxes
    let totalTax = 0;
    if (this.model.cgstSgst) {
      totalTax += (subtotalAfterDiscount * this.cgstPercentage / 100);
      totalTax += (subtotalAfterDiscount * this.sgstPercentage / 100);
    }
    if (this.model.igst) {
      totalTax += (subtotalAfterDiscount * this.igstPercentage / 100);
    }
    
    this.totalAmount = subtotalAfterDiscount + totalTax + this.shippingCharges;
    
    // Update model
    this.model.subTotal = this.subTotal;
    this.model.discount = this.discountPercentage;
    this.model.shippingCharges = this.shippingCharges;
    this.model.totalAmount = this.totalAmount;
  }

  // Add getter methods for template calculations
  get calculatedSubTotal(): number {
    return this.model.quotationItems?.reduce((sum: number, item: any) => {
      return sum + ((item.qty || 0) * (item.itemPrice || 0));
    }, 0) || 0;
  }

  get calculatedTotalAmount(): number {
    const subTotal = this.calculatedSubTotal;
    const discountAmount = subTotal * this.discountPercentage / 100;
    const subtotalAfterDiscount = subTotal - discountAmount;
    
    let totalTax = 0;
    if (this.model.cgstSgst) {
      totalTax += (subtotalAfterDiscount * this.cgstPercentage / 100);
      totalTax += (subtotalAfterDiscount * this.sgstPercentage / 100);
    }
    if (this.model.igst) {
      totalTax += (subtotalAfterDiscount * this.igstPercentage / 100);
    }
    
    return subtotalAfterDiscount + totalTax + this.shippingCharges;
  }

  get calculatedCGST(): number {
    const subTotal = this.calculatedSubTotal;
    const discountAmount = subTotal * this.discountPercentage / 100;
    const subtotalAfterDiscount = subTotal - discountAmount;
    return this.model.cgstSgst ? (subtotalAfterDiscount * this.cgstPercentage / 100) : 0;
  }

  get calculatedSGST(): number {
    const subTotal = this.calculatedSubTotal;
    const discountAmount = subTotal * this.discountPercentage / 100;
    const subtotalAfterDiscount = subTotal - discountAmount;
    return this.model.cgstSgst ? (subtotalAfterDiscount * this.sgstPercentage / 100) : 0;
  }

  get calculatedIGST(): number {
    const subTotal = this.calculatedSubTotal;
    const discountAmount = subTotal * this.discountPercentage / 100;
    const subtotalAfterDiscount = subTotal - discountAmount;
    return this.model.igst ? (subtotalAfterDiscount * this.igstPercentage / 100) : 0;
  }

  // Method to calculate individual row total
  getRowTotal(item: any): number {
    return (item.qty || 0) * (item.itemPrice || 0);
  }

  onQuantityOrPriceChange(item: any) {
    this.calculateTotals();
  }

  onTaxTypeChange(taxType: string) {
    if (taxType === 'cgstSgst' && this.model.cgstSgst) {
      this.model.igst = false;
    } else if (taxType === 'igst' && this.model.igst) {
      this.model.cgstSgst = false;
    }
    this.calculateTotals();
  }

  addNewRow() {
    this.model.quotationItems.push({
      actionItemName: '',
      description: '',
      material: '',
      qty: 0,
      unit: '',
      itemPrice: 0,
      miscellaneous: '',
      tooling: ''
    });
  }

  removeRow(index: number) {
    if (this.model.quotationItems.length > 1) {
      this.model.quotationItems.splice(index, 1);
      this.calculateTotals();
    }
  }

  onSubmit() {
    if (this.form.valid && this.model.termsAndConditions) {
      if (this.isEditMode) {
        // Update existing quotation
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Quotation updated successfully!'
        });
        console.log('Updated Quotation Data:', this.model);
        
        // Redirect back to quotation details page after a short delay
        setTimeout(() => {
          this.router.navigate(['/wefab/supplier/quotation/details', this.quotationId]);
        }, 1500);
      } else {
        // Create new quotation
        const quotationId = 'QUO' + Date.now().toString().slice(-6);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Quotation sent successfully!'
        });
        console.log('New Quotation Data:', this.model);
        
        // Redirect to quotation details page after a short delay
        setTimeout(() => {
          this.router.navigate(['/wefab/supplier/quotation/details', quotationId]);
        }, 1500);
      }
    } else {
      let errorMessage = 'Please fill all required fields';
      
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage
      });
    }
  }

  exportCSV() {
    // Create CSV content for quotation items only
    const headers = [
      'S.No',
      'ActionItem Name',
      'Description',
      'Material',
      'Qty',
      'Unit',
      'Item Price',
      'Miscellaneous',
      'Tooling'
    ];

    const csvContent = [
      headers.join(','),
      ...this.model.quotationItems.map((item: any, index: number) => [
        index + 1,
        `"${item.actionItemName || ''}"`,
        `"${item.description || ''}"`,
        `"${item.material || ''}"`,
        item.qty || 0,
        `"${item.unit || ''}"`,
        item.itemPrice || 0,
        `"${item.miscellaneous || ''}"`,
        `"${item.tooling || ''}"`
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
        
        if (values.length >= 8) {
          const item = {
            actionItemName: values[1] || '',
            description: values[2] || '',
            material: values[3] || '',
            qty: parseFloat(values[4]) || 0,
            unit: values[5] || '',
            itemPrice: parseFloat(values[6]) || 0,
            miscellaneous: values[7] || '',
            tooling: values[8] || ''
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
    // Reset to single empty row
    this.model.quotationItems = [
      {
        actionItemName: '',
        description: '',
        material: '',
        qty: 0,
        unit: '',
        itemPrice: 0,
        miscellaneous: '',
        tooling: ''
      }
    ];
    
    // Reset totals
    this.discountPercentage = 0;
    this.shippingCharges = 0;
    
    this.calculateTotals();
    this.messageService.add({
      severity: 'success',
      summary: 'Reset Successful',
      detail: 'Table has been reset'
    });
  }

  loadQuotationForEdit(quotationId: string) {
    // In a real application, this would fetch data from a service
    console.log('Loading quotation data for editing:', quotationId);
    
    // Simulate quotation data (this would come from an API)
    const quotationData = {
      quotationName: 'Sample Quotation',
      totalLeadTime: 30,
      paymentTerms: 'Net 30',
      quoteValidTill: new Date(),
      currency: 'USD',
      email: 'supplier@example.com',
      reference: 'REF123',
      termsAndConditions: 'Standard terms and conditions apply',
      cgstSgst: false,
      igst: true,
      quotationItems: [
        {
          actionItemName: 'Sample Item',
          description: 'Sample Description',
          material: 'Steel',
          qty: 10,
          unit: 'Pieces',
          itemPrice: 100,
          miscellaneous: 'N/A',
          tooling: 'Required'
        }
      ]
    };

    // Update the model with loaded data
    this.model = { ...quotationData };

    // Update the form with loaded data
    this.form.patchValue({
      quotationName: quotationData.quotationName,
      totalLeadTime: quotationData.totalLeadTime,
      paymentTerms: quotationData.paymentTerms,
      quoteValidTill: quotationData.quoteValidTill
    });

    // Recalculate totals
    this.calculateTotals();

    console.log('Quotation data loaded for editing:', this.model);
  }

  cancel() {
    this.router.navigate(['/wefab/supplier/quotations']);
  }

  // Attachment methods
  selectAttachments() {
    if (this.attachmentFileInput) {
      this.attachmentFileInput.nativeElement.click();
    }
  }

  onAttachmentSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (this.isValidFileType(file)) {
          this.attachedFiles.push(file);
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Invalid File Type',
            detail: `File "${file.name}" is not supported. Please use PDF, DOC, DOCX, JPG, PNG, TXT, or XLSX files.`
          });
        }
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (this.isValidFileType(file)) {
          this.attachedFiles.push(file);
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Invalid File Type',
            detail: `File "${file.name}" is not supported. Please use PDF, DOC, DOCX, JPG, PNG, TXT, or XLSX files.`
          });
        }
      }
    }
  }

  removeAttachment(index: number) {
    this.attachedFiles.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private isValidFileType(file: File): boolean {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    return allowedTypes.includes(file.type);
  }
}
