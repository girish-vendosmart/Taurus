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

import { CommonService } from '../../shared/common.service';

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
  styleUrl: './create-quotation.component.scss',
  styles: [`
    .totals-section {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      font-size: 14px;
    }
    
    .totals-section .form-control-sm {
      padding: 0.25rem 0.5rem;
      font-size: 12px;
    }
    
    .totals-section .form-check-sm {
      font-size: 13px;
    }
    
    .totals-section .small {
      font-size: 12px;
    }
    
    .total-amount-label, .total-amount-value {
      font-size: 14px;
      font-weight: 600;
    }
    
    .total-amount-value {
      color: #0d6efd !important;
    }
    
    .border-bottom {
      border-bottom: 1px solid #dee2e6 !important;
    }
    
    .border-top {
      border-top: 2px solid #0d6efd !important;
    }
    
    @media (max-width: 768px) {
      .totals-section {
        margin-top: 1rem;
      }
    }
  `]
})
export class CreateQuotationComponent implements OnInit {
  form: FormGroup = new FormGroup({});
  isEditMode: boolean = false;
  quotationId: string = '';
  
  model: any = {
    rfqId: '',
    quotationName: '',
    totalLeadTime: '',
    paymentTerms: 'Net 10',
    quoteValidTill: null,
    currency: 'USD',
    email: 'email@example.com',
    reference: '',
    termsAndConditions: '',
    deliveryAddress: '',
    shippingTerms: 'FOB Origin',
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

  // Tax calculation properties - Fixed values
  cgstPercentage: number = 9;
  sgstPercentage: number = 9;
  igstPercentage: number = 18;

  // Tax selection
  selectedTaxType: string = 'none'; // 'cgstSgst', 'igst', or 'none'

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

  constructor(private messageService: MessageService, private router: Router, private route: ActivatedRoute, private commonService: CommonService) {}

  ngOnInit() {
    // Extract and set RFQ ID from URL
    this.extractRfqIdFromUrl();
    
    this.initializeForm();
    this.calculateTotals();
    
    // Listen for route parameter changes to update RFQ ID dynamically
    this.route.params.subscribe(params => {
      if (params['rfqId'] && params['rfqId'] !== this.model.rfqId) {
        this.model.rfqId = params['rfqId'];
        console.log('RFQ ID updated from route params:', params['rfqId']);
      }
    });
    
    // Get query parameters
    this.route.queryParams.subscribe(params => {
      // Update RFQ ID if it comes through query params
      if ((params['rfqId'] || params['rfq_id']) && 
          (params['rfqId'] || params['rfq_id']) !== this.model.rfqId) {
        this.model.rfqId = params['rfqId'] || params['rfq_id'];
        console.log('RFQ ID updated from query params:', this.model.rfqId);
      }
      
      // Check if this is edit mode
      if (params['mode'] === 'edit' && params['quotationId']) {
        this.isEditMode = true;
        this.quotationId = params['quotationId'];
        console.log('Edit mode activated for quotation:', this.quotationId);
        this.loadQuotationForEdit(this.quotationId);
      }
    });
  }

  // Extract RFQ ID from URL and prefill the field
  extractRfqIdFromUrl() {
    // Try multiple ways to get RFQ ID from the URL
    // Supports patterns like:
    // /create-quotation/RFQ001
    // /create-quotation?rfqId=RFQ001
    // /create-quotation?rfq_id=RFQ001
    const rfqId = this.route.snapshot.params['rfqId'] || 
                  this.route.snapshot.params['id'] ||
                  this.route.snapshot.queryParams['rfqId'] || 
                  this.route.snapshot.queryParams['rfq_id'] ||
                  this.route.snapshot.queryParams['rfq'];
    
    if (rfqId) {
      this.model.rfqId = rfqId;
      console.log('RFQ ID extracted from URL:', rfqId);
    } else {
      // If no RFQ ID in URL, try to get from route data or generate a default
      this.model.rfqId = this.route.snapshot.data['rfqId'] || this.generateDefaultRfqId();
      console.log('Using default RFQ ID:', this.model.rfqId);
    }
  }

  // Generate a default RFQ ID if none is provided
  private generateDefaultRfqId(): string {
    const timestamp = Date.now().toString().slice(-6);
    return `RFQ${timestamp}`;
  }

  // Method to test different URL patterns (for development/testing)
  testRfqIdExtraction() {
    console.log('Current route params:', this.route.snapshot.params);
    console.log('Current query params:', this.route.snapshot.queryParams);
    console.log('Extracted RFQ ID:', this.model.rfqId);
    
    this.messageService.add({
      severity: 'info',
      summary: 'RFQ ID Info',
      detail: `Current RFQ ID: ${this.model.rfqId}`
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
    this.selectedTaxType = taxType;
    
    // Reset all tax flags
    this.model.cgstSgst = false;
    this.model.igst = false;
    
    // Set the selected tax type
    if (taxType === 'cgstSgst') {
      this.model.cgstSgst = true;
    } else if (taxType === 'igst') {
      this.model.igst = true;
    }
    // 'none' case: both remain false
    
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
      // Transform data to API format
      const apiData = this.transformToApiFormat();
      
      // Validate API data
      const validation = this.validateApiData(apiData);
      
      if (!validation.isValid) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validation Warning',
          detail: `Some fields may be missing: ${validation.missingFields.join(', ')}`
        });
        console.warn('Missing API fields:', validation.missingFields);
      }
      
      if (this.isEditMode) {
        this.updateExistingQuotation(apiData);
        // Update existing quotation
        // this.messageService.add({
        //   severity: 'success',
        //   summary: 'Success',
        //   detail: 'Quotation updated successfully!'
        // });
        // console.log('Updated Quotation Data (API Format):', apiData);
        
        // // Redirect back to quotation details page after a short delay
        // setTimeout(() => {
        //   this.router.navigate(['/wefab/supplier/quotation/details', this.quotationId]);
        // }, 1500);
      } else {
        // Create new quotation
        this.createNewQuotation(apiData);
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

  updateExistingQuotation(apiData: any) {
    let endPoint = `/api/resource/Supplier Quotation/${this.quotationId}`

    this.commonService.putWefabData(endPoint, apiData).subscribe((res: any) => {
      console.log('Quotation updated successfully:', res);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Quotation Update successfully!'
      });
      this.router.navigate(['/wefab/supplier/quotation/details', res.data.name]);
    })
  }

  createNewQuotation(apiData: any) {
    let endpoint = `/api/resource/Supplier Quotation`

    this.commonService.postWefabData(endpoint, apiData).subscribe((res: any) => {
      console.log('Quotation created successfully:', res);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Quotation sent successfully!'
      });
      this.router.navigate(['/wefab/supplier/quotation/details', res.data.name]);
    })

    // const quotationId = 'QUO' + Date.now().toString().slice(-6);
        
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Success',
    //       detail: 'Quotation sent successfully!'
    //     });
    //     console.log('New Quotation Data (API Format):', apiData);
        
    //     // Here you would typically make an API call:
    //     // this.quotationService.createQuotation(apiData).subscribe(...)
        
    //     // Redirect to quotation details page after a short delay
    //     setTimeout(() => {
    //       this.router.navigate(['/wefab/supplier/quotation/details', quotationId]);
    //     }, 1500);
  }

  // Transform current form data to API expected format
  transformToApiFormat(): any {
    const apiData = {
      rfq_id: this.getRfqId(),
      supplier_id: this.getSupplierId(),
      estimated_completion_duration: `${this.model.totalLeadTime} days`,
      validity: this.formatDateForApi(this.model.quoteValidTill),
      delivery_address: this.getDeliveryAddress(),
      discount_percentage: this.discountPercentage || 0,
      payment_terms: this.model.paymentTerms,
      shipping_terms: this.getShippingTerms(),
      notes: `<p>${this.model.termsAndConditions}</p>`,
      items: this.transformQuotationItems(),
      attachments: this.transformAttachments()
    };

    return apiData;
  }

  // Transform quotation items to API format
  transformQuotationItems(): any[] {
    return this.model.quotationItems.map((item: any, index: number) => {
      const unitPrice = item.itemPrice || 0;
      const quantity = item.qty || 0;
      const totalItemAmount = unitPrice * quantity;
      
      return {
        item_code: this.generateItemCode(item, index),
        item_description: item.description || item.actionItemName || '',
        quantity: quantity,
        unit: item.unit || 'Nos',
        currency_code: this.model.currency,
        unit_price: unitPrice,
        setup_cost: this.calculateSetupCost(item),
        material_cost: this.calculateMaterialCost(item, totalItemAmount),
        labor_cost: this.calculateLaborCost(item, totalItemAmount),
        overhead_cost: this.calculateOverheadCost(item, totalItemAmount),
        discount_type: "Percentage",
        discount: 0, // You can add item-level discount if needed
        comments: this.buildItemComments(item)
      };
    });
  }

  // Transform attachments to API format
  transformAttachments(): any[] {
    return this.attachedFiles.map((file: File) => ({
      file_name: file.name,
      file_url: `/files/${file.name}`, // This would be updated after file upload
      description: this.getFileDescription(file)
    }));
  }

  // Helper methods for data transformation
  private getRfqId(): string {
    // Use the RFQ ID that was extracted from URL and stored in model
    return this.model.rfqId || 'RFQ0001';
  }

  private getSupplierId(): string {
    // You might get this from user session or service
    // For now, using a placeholder - in real app, get from authentication service
    return localStorage.getItem('supplierId') || 
           sessionStorage.getItem('supplierId') ||
           'f9m9s21tsu';
  }

  private getDeliveryAddress(): string {
    // Use form value if provided, otherwise use default
    return this.model.deliveryAddress || 'Industrial Park Chicago-Shipping';
  }

  private getShippingTerms(): string {
    // Use form value if provided, otherwise use default
    return this.model.shippingTerms || 'FOB Origin';
  }

  private formatDateForApi(date: Date | string): string {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  private generateItemCode(item: any, index: number): string {
    // Generate item code based on item name or use index
    const baseName = item.actionItemName || `ITEM-${index + 1}`;
    return baseName.toUpperCase().replace(/\s+/g, '-').substring(0, 20);
  }

  private calculateSetupCost(item: any): number {
    // Calculate setup cost based on tooling or other factors
    const baseSetupCost = item.tooling && item.tooling.toLowerCase() === 'required' ? 500 : 200;
    return baseSetupCost;
  }

  private calculateMaterialCost(item: any, totalItemAmount: number): number {
    // Calculate material cost as percentage of total item amount
    return totalItemAmount * 0.6; // 60% of total as material cost
  }

  private calculateLaborCost(item: any, totalItemAmount: number): number {
    // Calculate labor cost as percentage of total item amount
    return totalItemAmount * 0.3; // 30% of total as labor cost
  }

  private calculateOverheadCost(item: any, totalItemAmount: number): number {
    // Calculate overhead cost as percentage of total item amount
    return totalItemAmount * 0.1; // 10% of total as overhead cost
  }

  private buildItemComments(item: any): string {
    const comments = [];
    
    if (item.material) {
      comments.push(`Material: ${item.material}`);
    }
    
    if (item.miscellaneous) {
      comments.push(`Misc: ${item.miscellaneous}`);
    }
    
    if (item.tooling) {
      comments.push(`Tooling: ${item.tooling}`);
    }
    
    return comments.join('; ') || 'Standard manufacturing specifications';
  }

  private getFileDescription(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'Technical specifications and documentation';
      case 'doc':
      case 'docx':
        return 'Supporting documentation';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'Technical drawings and images';
      case 'xlsx':
      case 'xls':
        return 'Technical data and specifications';
      default:
        return 'Supporting file';
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

  getQuotationDetails(quotationId: string) {
    return this.commonService.getWefabData(`/api/resource/Supplier Quotation/${quotationId}`);
  }

  loadQuotationForEdit(quotationId: string) {
    console.log('Loading quotation data for editing:', quotationId);
    
    // Store the current RFQ ID before loading edit data
    const currentRfqId = this.model.rfqId;
    
    this.getQuotationDetails(quotationId).subscribe((res: any) => {
      if (res && res.data) {
        const quotationData = res.data;
        console.log('Received quotation data:', quotationData);
        
        // Map API data to component model
        this.model = {
          rfqId: quotationData.rfq_id || currentRfqId,
          quotationName: quotationData.name || '',
          totalLeadTime: this.extractDaysFromDuration(quotationData.estimated_completion_duration),
          paymentTerms: quotationData.payment_terms || 'Net 30',
          quoteValidTill: this.parseApiDate(quotationData.validity),
          currency: quotationData.items?.[0]?.currency_code || 'USD',
          email: 'email@example.com', // This might come from user/supplier data
          reference: quotationData.name || '',
          termsAndConditions: this.stripHtmlTags(quotationData.notes || ''),
          deliveryAddress: 'Industrial Park Chicago-Shipping', // This might come from API later
          shippingTerms: quotationData.shipping_terms || 'FOB Origin',
          cgstSgst: quotationData.sgst_cgst_applicable === 1,
          igst: quotationData.igst_applicable === 1,
          quotationItems: this.transformApiItemsToModel(quotationData.items || []),
          subTotal: quotationData.total_amount || 0,
          discount: quotationData.discount_percentage || 0,
          shippingCharges: 0, // This might need to be calculated or come from API
          totalAmount: quotationData.grand_total || 0
        };

        // Set discount percentage and shipping charges for calculations
        this.discountPercentage = quotationData.discount_percentage || 0;
        this.shippingCharges = 0; // Set based on your business logic

        // Set the selectedTaxType based on loaded data
        if (this.model.cgstSgst) {
          this.selectedTaxType = 'cgstSgst';
        } else if (this.model.igst) {
          this.selectedTaxType = 'igst';
        } else {
          this.selectedTaxType = 'none';
        }

        // Update the form with loaded data
        this.form.patchValue({
          quotationName: this.model.quotationName,
          totalLeadTime: this.model.totalLeadTime,
          paymentTerms: this.model.paymentTerms,
          quoteValidTill: this.model.quoteValidTill
        });

        // Handle attachments if any
        if (quotationData.attachments && quotationData.attachments.length > 0) {
          // Note: You might need to handle file reconstruction from API data
          console.log('Attachments found:', quotationData.attachments);
        }

        // Recalculate totals
        this.calculateTotals();

        // console.log('Quotation data loaded and mapped to model:', this.model);
        
        // this.messageService.add({
        //   severity: 'success',
        //   summary: 'Data Loaded',
        //   detail: 'Quotation data loaded successfully for editing'
        // });
      }
    }, (error) => {
      console.error('Error loading quotation data:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load quotation data'
      });
    });
  }

  // Helper method to extract days from duration string like "20 days"
  private extractDaysFromDuration(duration: string): number {
    if (!duration) return 0;
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  // Helper method to parse API date format
  private parseApiDate(dateString: string): Date | null {
    if (!dateString) return null;
    try {
      return new Date(dateString);
    } catch (error) {
      console.warn('Error parsing date:', dateString);
      return null;
    }
  }

  // Helper method to strip HTML tags from notes
  private stripHtmlTags(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  }

  // Helper method to transform API items to component model format
  private transformApiItemsToModel(apiItems: any[]): any[] {
    return apiItems.map(item => {
      // Parse comments to extract material, miscellaneous, and tooling info
      const parsedComments = this.parseItemComments(item.comments || '');
      
      return {
        actionItemName: item.item_code || '',
        description: item.item_description || '',
        material: parsedComments.material || '',
        qty: item.quantity || 0,
        unit: item.unit || 'Pieces',
        itemPrice: item.unit_price || 0,
        miscellaneous: parsedComments.miscellaneous || '',
        tooling: parsedComments.tooling || ''
      };
    });
  }

  // Helper method to parse item comments back to individual fields
  private parseItemComments(comments: string): { material: string; miscellaneous: string; tooling: string } {
    const result = { material: '', miscellaneous: '', tooling: '' };
    
    if (!comments) return result;
    
    // Split by semicolon and parse each part
    const parts = comments.split(';');
    
    parts.forEach(part => {
      const trimmedPart = part.trim();
      if (trimmedPart.startsWith('Material:')) {
        result.material = trimmedPart.replace('Material:', '').trim();
      } else if (trimmedPart.startsWith('Misc:')) {
        result.miscellaneous = trimmedPart.replace('Misc:', '').trim();
      } else if (trimmedPart.startsWith('Tooling:')) {
        result.tooling = trimmedPart.replace('Tooling:', '').trim();
      }
    });
    
    return result;
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

  // Method to preview API data format (useful for debugging)
  previewApiData(): void {
    const apiData = this.transformToApiFormat();
    console.log('API Data Preview:', JSON.stringify(apiData, null, 2));
    
    this.messageService.add({
      severity: 'info',
      summary: 'API Data Preview',
      detail: 'Check console for formatted API data structure'
    });
  }

  // Method to validate required API fields
  validateApiData(apiData: any): { isValid: boolean; missingFields: string[] } {
    const requiredFields = [
      'rfq_id',
      'supplier_id', 
      'estimated_completion_duration',
      'validity',
      'payment_terms',
      'items'
    ];
    
    const missingFields: string[] = [];
    
    requiredFields.forEach(field => {
      if (!apiData[field] || (Array.isArray(apiData[field]) && apiData[field].length === 0)) {
        missingFields.push(field);
      }
    });
    
    // Validate items array
    if (apiData.items && apiData.items.length > 0) {
      apiData.items.forEach((item: any, index: number) => {
        const requiredItemFields = ['item_description', 'quantity', 'unit_price'];
        requiredItemFields.forEach(field => {
          if (!item[field]) {
            missingFields.push(`items[${index}].${field}`);
          }
        });
      });
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }
}
