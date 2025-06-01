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
import { SweetAlertService } from '../../shared/sweet-alert.service';
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

    .upload-area {
      border: 2px dashed #dee2e6;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: #f8f9fa;
    }
    
    .upload-area:hover {
      border-color: #0d6efd;
      background-color: #f0f8ff;
    }
    
    .upload-area i {
      font-size: 2rem;
      color: #6c757d;
      margin-bottom: 0.5rem;
    }

    .file-item {
      background-color: #f8f9fa;
      transition: all 0.2s ease;
    }
    
    .file-item:hover {
      background-color: #e9ecef;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .file-name {
      font-size: 14px;
      color: #495057;
      word-break: break-word;
    }
    
    .attached-files h6 {
      color: #495057;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }

    .btn-sm {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
    }
    
    @media (max-width: 768px) {
      .totals-section {
        margin-top: 1rem;
      }
      
      .file-item {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .file-item .btn-group {
        margin-top: 0.5rem;
        align-self: flex-end;
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
    quotationId: '', // Add quotation ID field
    isEditMode: false, // Add edit mode flag for form visibility
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
        bid_type: 'Bid',
        itemPrice: 0,
        tax_type: 'No Tax',
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

  // Discount properties
  discountType: string = 'percentage'; // 'percentage' or 'amount'
  discountValue: number = 0;

  // Tax calculation properties - Fixed values
  cgstPercentage: number = 9;
  sgstPercentage: number = 9;
  igstPercentage: number = 18;

  // Tax selection
  selectedTaxType: string = 'No Tax'; // 'cgstSgst', 'igst', or 'No Tax'

  // Attachment properties
  attachedFiles: string[] = [];
  attachedFileObjects: { url: string; file?: File; thumbnail?: string; name: string; type: string }[] = [];

  // Store original state for reset functionality
  originalQuotationItems: any[] = [];

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
    { label: 'Nos', value: 'Nos' },
    { label: 'Kg', value: 'Kg' },
    { label: 'Meter', value: 'Meter' },
    { label: 'Square Meter', value: 'Square Meter' },
    { label: 'Cubic Meter', value: 'Cubic Meter' },
    { label: 'Liter', value: 'Liter' },
    { label: 'Set', value: 'Set' },
    { label: 'Pair', value: 'Pair' }
  ];

  bidTypeOptions = [
    { label: 'Bid', value: 'Bid' },
    { label: 'No Bid', value: 'No Bid' }
  ];

  taxTypeOptions = [
    { label: 'No Tax', value: 'No Tax' },
    { label: 'CGST & SGST', value: 'SGCT & CGST' },
    { label: 'IGST', value: 'IGST' }
  ];

  @ViewChild('csvFileInput', { static: false }) csvFileInput!: ElementRef;
  @ViewChild('attachmentFileInput', { static: false }) attachmentFileInput!: ElementRef;
  quoteFrom: any;
  quoteTo: any;

  // Add validation error tracking
  validationErrors: { [key: string]: string[] } = {};
  csvImportErrors: string[] = [];
  showValidationErrors: boolean = false;

  constructor(private sweetAlert: SweetAlertService, private messageService: MessageService, private router: Router, private route: ActivatedRoute, private commonService: CommonService) {}

  ngOnInit() {
    debugger
    // Extract and set RFQ ID from URL
    this.extractRfqIdFromUrl();
    
    this.initializeForm();
    this.calculateTotals();
    
    // Store initial state for reset functionality
    this.storeCurrentStateForReset();
    
    // Listen for route parameter changes to update RFQ ID dynamically
    this.route.params.subscribe(params => {
      if (params['rfqId'] && params['rfqId'] !== this.model.rfqId) {
        debugger
        this.model.rfqId = params['rfqId'];
        console.log('RFQ ID updated from route params:', params['rfqId']);
        
        // Load quotation data if not in edit mode
        if (!this.isEditMode) {
          this.loadCreateQuotation(this.model.rfqId);
        }
      }
    });
    
    // Get query parameters
    this.route.queryParams.subscribe(params => {
      // Check if this is edit mode first
      if (params['mode'] === 'edit' && params['quotationId']) {
        this.isEditMode = true;
        this.model.isEditMode = true; // Set model flag for form visibility
        this.quotationId = params['quotationId'];
        console.log('Edit mode activated for quotation:', this.quotationId);
        this.loadQuotationForEdit(this.quotationId);
      } else {
        this.model.isEditMode = false; // Set model flag for form visibility
        // Not in edit mode, handle RFQ ID updates and load create quotation data
        let rfqIdFromQuery = params['rfqId'] || params['rfq_id'];
        
        if (rfqIdFromQuery && rfqIdFromQuery !== this.model.rfqId) {
          this.model.rfqId = rfqIdFromQuery;
          console.log('RFQ ID updated from query params:', this.model.rfqId);
          this.loadCreateQuotation(this.model.rfqId);
        } else if (this.model.rfqId && !this.isEditMode) {
          // If we have an RFQ ID (from URL params or extracted initially) and not in edit mode,
          // load the create quotation data
          console.log('Loading create quotation data for existing RFQ ID:', this.model.rfqId);
          this.loadCreateQuotation(this.model.rfqId);
        }
      }
    });
    
    // Initialize tax calculations
    setTimeout(() => {
      this.updateTaxCalculations();
    }, 500);
  }

  loadCreateQuotation(rfqId: string) {
    let endPoint = `/api/method/wefab.wefab.api.supplier.quotation.quotation_builder.build_quote_for_rfq?rfq_id=${rfqId}&supplier_id=${this.getSupplierId()}`

    this.commonService.getWefabData(endPoint).subscribe((res: any) => {
      if (res && res.message && res.message.data) {
        const createQuotationData = res.message.data;
        console.log('Create Quotation data loaded:', createQuotationData);

        this.quoteFrom = createQuotationData.quotation_from;
        this.quoteTo = createQuotationData.quotation_to;
        
        // Map API data to component model
        this.model = {
          rfqId: createQuotationData.rfq_id || this.model.rfqId,
          quotationName: createQuotationData.quotation_id || '',
          quotationFrom: createQuotationData.quotation_from || '',
          quotationTo: createQuotationData.quotation_to || '',
          totalLeadTime: this.extractDaysFromDuration(createQuotationData.estimated_completion_duration),
          paymentTerms: createQuotationData.payment_terms || 'Net 30',
          quoteValidTill: this.parseApiDateForInput(createQuotationData.validity),
          currency: createQuotationData.items?.[0]?.currency_code || 'USD',
          email: 'email@example.com', // This might come from user/supplier data
          reference: createQuotationData.quotation_id || '',
          termsAndConditions: this.stripHtmlTags(createQuotationData.notes || ''),
          deliveryAddress: this.parseAddressFromQuotationTo(createQuotationData.quotation_to),
          shippingTerms: createQuotationData.shipping_terms || 'FOB Origin',
          cgstSgst: createQuotationData.sgst_cgst_applicable === 1,
          igst: createQuotationData.igst_applicable === 1,
          quotationItems: this.transformCreateQuotationItemsToModel(createQuotationData.items || []),
          subTotal: createQuotationData.total_amount || 0,
          discount: createQuotationData.discount_percentage || 0,
          shippingCharges: createQuotationData.shipping_charges || 0,
          totalAmount: createQuotationData.grand_total || 0
        };

        // Set discount and shipping charges for calculations
        if (createQuotationData.discount_type === 'Amount' && createQuotationData.discount_amount) {
          this.discountType = 'amount';
          this.discountValue = createQuotationData.discount || createQuotationData.discount_amount;
        } else if (createQuotationData.discount_percentage) {
          this.discountType = 'percentage';
          this.discountValue = createQuotationData.discount || createQuotationData.discount_percentage;
        } else {
          this.discountType = 'percentage';
          this.discountValue = 0;
        }
        this.shippingCharges = createQuotationData.shipping_charges || 0;

        // Set the selectedTaxType based on loaded data
        if (this.model.cgstSgst) {
          this.selectedTaxType = 'SGCT & CGST';
        } else if (this.model.igst) {
          this.selectedTaxType = 'IGST';
        } else {
          this.selectedTaxType = 'No Tax';
        }

        // Update the form with loaded data
        this.form.patchValue({
          quotationName: this.model.quotationName,
          totalLeadTime: this.model.totalLeadTime,
          paymentTerms: this.model.paymentTerms,
          quoteValidTill: this.model.quoteValidTill
        });

        // Handle attachments if any
        if (createQuotationData.attachments && createQuotationData.attachments.length > 0) {
          console.log('Attachments found:', createQuotationData.attachments);
        }

        // Recalculate totals based on the loaded items
        this.calculateTotals();

        // Store original state for reset functionality
        this.storeCurrentStateForReset();

        console.log('Create quotation data mapped to model:', this.model);
      }
    }, (error) => {
      console.error('Error loading create quotation data:', error);
      this.sweetAlert.error('Failed to load RFQ data for quotation creation');
    });
  }

  // Helper method to transform create quotation API items to component model format
  private transformCreateQuotationItemsToModel(apiItems: any[]): any[] {
    return apiItems.map(item => {
      // Parse comments to extract material, specification, process, etc.
      const parsedComments = this.parseCreateQuotationItemComments(item.comments || '');
      
      // Extract estimated rate if available
      const estimatedRate = this.extractEstimatedRate(item.comments || '');
      
      // Determine tax type based on currency and item properties
      let taxType = 'No Tax';
      if (item.currency_code === 'INR') {
        if (item.igst_applicable || this.model.igst) {
          taxType = 'IGST';
        } else if (item.sgst_cgst_applicable || this.model.cgstSgst) {
          taxType = 'SGCT & CGST';
        }
      }
      
      return {
        actionItemName: item.item_code || '',
        description: this.stripHtmlTags(item.item_description || ''),
        material: parsedComments.material || '',
        qty: item.quantity || 0,
        unit: item.unit || 'Nos',
        itemPrice: item.unit_price || estimatedRate || 0,
        tax_type: taxType,
        miscellaneous: this.buildMiscellaneousFromComments(parsedComments),
        tooling: parsedComments.processRequired || 'Standard',
        bid_type: item.bid_type || 'Bid'
      };
    });
  }

  // Helper method to parse create quotation item comments
  private parseCreateQuotationItemComments(comments: string): any {
    const result: any = {
      material: '',
      specification: '',
      processRequired: '',
      tolerance: '',
      notes: '',
      cadFile: '',
      estimatedRate: ''
    };
    
    if (!comments) return result;
    
    // Split by | and parse each part
    const parts = comments.split('|');
    
    parts.forEach(part => {
      const trimmedPart = part.trim();
      if (trimmedPart.startsWith('Material:')) {
        result.material = trimmedPart.replace('Material:', '').trim();
      } else if (trimmedPart.startsWith('Specification:')) {
        result.specification = trimmedPart.replace('Specification:', '').trim();
      } else if (trimmedPart.startsWith('Process Required:')) {
        result.processRequired = trimmedPart.replace('Process Required:', '').trim();
      } else if (trimmedPart.startsWith('Tolerance:')) {
        result.tolerance = trimmedPart.replace('Tolerance:', '').trim();
      } else if (trimmedPart.startsWith('Notes:')) {
        result.notes = trimmedPart.replace('Notes:', '').trim();
      } else if (trimmedPart.startsWith('CAD File:')) {
        result.cadFile = trimmedPart.replace('CAD File:', '').trim();
      } else if (trimmedPart.startsWith('Estimated Rate:')) {
        result.estimatedRate = trimmedPart.replace('Estimated Rate:', '').trim();
      }
    });
    
    return result;
  }

  // Helper method to extract estimated rate from comments
  private extractEstimatedRate(comments: string): number {
    if (!comments) return 0;
    
    const match = comments.match(/Estimated Rate:\s*(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  // Helper method to build miscellaneous field from parsed comments
  private buildMiscellaneousFromComments(parsedComments: any): string {
    const miscParts = [];
    
    if (parsedComments.specification) {
      miscParts.push(`Spec: ${parsedComments.specification}`);
    }
    
    if (parsedComments.tolerance) {
      miscParts.push(`Tolerance: ${parsedComments.tolerance}`);
    }
    
    if (parsedComments.notes) {
      miscParts.push(`Notes: ${parsedComments.notes}`);
    }
    
    if (parsedComments.cadFile) {
      miscParts.push(`CAD: ${parsedComments.cadFile}`);
    }
    
    return miscParts.join(' | ');
  }

  // Helper method to parse delivery address from quotation_to field
  private parseAddressFromQuotationTo(quotationTo: string): string {
    if (!quotationTo) return 'Industrial Park Chicago-Shipping';
    
    // Remove company name (first line) and return the address part
    const lines = quotationTo.split('\n');
    return lines.length > 1 ? lines.slice(1).join(', ') : quotationTo;
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

  // Generate a default RFQ ID if No Tax is provided
  private generateDefaultRfqId(): string {
    const timestamp = Date.now().toString().slice(-6);
    return `RFQ${timestamp}`;
  }

  // Method to test different URL patterns (for development/testing)
  testRfqIdExtraction() {
    console.log('Current route params:', this.route.snapshot.params);
    console.log('Current query params:', this.route.snapshot.queryParams);
    console.log('Extracted RFQ ID:', this.model.rfqId);
    
    this.sweetAlert.info(`Current RFQ ID: ${this.model.rfqId}`);
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
    
    const discountAmount = this.getDiscountAmount();
    const subtotalAfterDiscount = this.subTotal - discountAmount;
    
    // Calculate taxes from individual line items
    const totalTax = this.getTotalTaxAmount();
    
    this.totalAmount = subtotalAfterDiscount + totalTax + this.shippingCharges;
    
    // Update model
    this.model.subTotal = this.subTotal;
    this.model.discount = this.discountValue;
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
    const discountAmount = this.getDiscountAmount();
    const subtotalAfterDiscount = subTotal - discountAmount;
    
    // Calculate taxes from individual line items
    const totalTax = this.getTotalTaxAmount();
    
    return subtotalAfterDiscount + totalTax + this.shippingCharges;
  }

  get calculatedDiscountedAmount(): number {
    const subTotal = this.calculatedSubTotal;
    return subTotal - this.getDiscountAmount();
  }

  // Method to calculate individual row total
  getRowTotal(item: any): number {
    return (item.qty || 0) * (item.itemPrice || 0);
  }

  onQuantityOrPriceChange(item: any) {
    this.calculateTotals();
    // Force change detection to update tax amounts in the table
    this.updateTaxAmounts();
  }

  onBidTypeChange(item: any) {
    if (item.bid_type === 'No Bid') {
      item.itemPrice = 0;
    }
    this.calculateTotals();
  }

  onItemTaxTypeChange(item: any) {
    // Recalculate totals when tax type changes for any item
    this.calculateTotals();
    // Force UI update for tax amounts
    this.updateTaxAmounts();
    // Debug log
    console.log('Tax type changed for item:', item.actionItemName, 'New tax type:', item.tax_type);
    console.log('Item total tax amount:', this.getLineTaxAmount(item));
  }

  // Method to force update tax amounts in the UI
  updateTaxAmounts() {
    // This will trigger change detection and update all tax amount displays
    if (this.model.quotationItems) {
      this.model.quotationItems = [...this.model.quotationItems];
    }
  }

  // TrackBy function for ngFor to improve change detection
  trackByItemIndex(index: number, item: any): number {
    return index;
  }

  // Methods to get aggregated tax amounts from all line items
  getTotalCGST(): number {
    return this.model.quotationItems?.reduce((total: number, item: any) => {
      if (item.tax_type === 'SGCT & CGST') {
        const itemTotal = (item.qty || 0) * (item.itemPrice || 0);
        return total + (itemTotal * 0.09); // 9% CGST
      }
      return total;
    }, 0) || 0;
  }

  getTotalSGST(): number {
    return this.model.quotationItems?.reduce((total: number, item: any) => {
      if (item.tax_type === 'SGCT & CGST') {
        const itemTotal = (item.qty || 0) * (item.itemPrice || 0);
        return total + (itemTotal * 0.09); // 9% SGST
      }
      return total;
    }, 0) || 0;
  }

  getTotalIGST(): number {
    return this.model.quotationItems?.reduce((total: number, item: any) => {
      if (item.tax_type === 'IGST') {
        const itemTotal = (item.qty || 0) * (item.itemPrice || 0);
        return total + (itemTotal * 0.18); // 18% IGST
      }
      return total;
    }, 0) || 0;
  }

  // Method to get total tax amount from all line items
  getTotalTaxAmount(): number {
    if (!this.model.quotationItems || this.model.quotationItems.length === 0) {
      return 0;
    }
    
    let totalTax = 0;
    
    this.model.quotationItems.forEach((item: any) => {
      if (item.qty && item.itemPrice && item.qty > 0 && item.itemPrice > 0) {
        const itemTotal = item.qty * item.itemPrice;
        
        if (item.tax_type === 'SGCT & CGST') {
          totalTax += itemTotal * 0.18; // 9% CGST + 9% SGST = 18%
        } else if (item.tax_type === 'IGST') {
          totalTax += itemTotal * 0.18; // 18% IGST
        }
        // For 'No Tax', add 0
      }
    });
    
    return totalTax;
  }

  // Method to get tax amount for a specific line item
  getLineTaxAmount(item: any): number {
    if (!item) return 0;
    
    const quantity = Number(item.qty) || 0;
    const price = Number(item.itemPrice) || 0;
    const itemTotal = quantity * price;
    
    if (itemTotal <= 0) return 0;
    
    if (item.tax_type === 'SGCT & CGST') {
      return itemTotal * 0.18; // 9% CGST + 9% SGST = 18%
    } else if (item.tax_type === 'IGST') {
      return itemTotal * 0.18; // 18% IGST
    }
    return 0; // No tax
  }

  // Method to get discount amount for display
  getDiscountAmount(): number {
    const subTotal = this.calculatedSubTotal;
    if (this.discountType === 'percentage') {
      return subTotal * (this.discountValue || 0) / 100;
    } else {
      return this.discountValue || 0;
    }
  }

  // Method to handle discount type change
  onDiscountTypeChange() {
    // Reset discount value when changing type to avoid confusion
    this.discountValue = 0;
    this.calculateTotals();
  }

  onTaxTypeChange(taxType: string) {
    this.selectedTaxType = taxType;
    
    // Reset all tax flags
    this.model.cgstSgst = false;
    this.model.igst = false;
    
    // Set the selected tax type only for INR currency
    if (this.model.currency === 'INR') {
      if (taxType === 'SGCT & CGST') {
        this.model.cgstSgst = true;
      } else if (taxType === 'IGST') {
        this.model.igst = true;
      }
      // 'No Tax' case: both remain false
    }
    
    this.calculateTotals();
  }

  // Method to handle currency change
  onCurrencyChange() {
    // If currency is changed to USD, reset tax options
    if (this.model.currency === 'USD') {
      this.selectedTaxType = 'No Tax';
      this.model.cgstSgst = false;
      this.model.igst = false;
    } else if (this.model.currency === 'INR' && this.selectedTaxType === 'No Tax') {
      // If currency is changed to INR and no tax was selected, you might want to set a default
      // Uncomment the following line if you want to default to 'No Tax' for INR as well
      // this.selectedTaxType = 'No Tax';
    }
    
    this.calculateTotals();
  }

  onSubmit() {
    console.log('=== ONSUBMIT DEBUG START ===');
    console.log('Is Edit Mode:', this.isEditMode);
    console.log('Form Valid:', this.form.valid);
    console.log('Model Data:', this.model);
    console.log('Quotation Items:', this.model.quotationItems);
    
    this.showValidationErrors = true;
    
    // Clear previous errors
    this.validationErrors = {};
    
    // Validate form
    console.log('Starting form validation...');
    const validation = this.validateForm();
    console.log('Validation result:', validation);
    
    if (!validation.isValid) {
      console.log('Form validation failed with errors:', validation.errors);
      // Show detailed error message
      const errorCount = validation.errors.length;
      let errorMessage = `Please fix the following ${errorCount} error${errorCount > 1 ? 's' : ''}:\n\n`;
      errorMessage += validation.errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
      
      this.sweetAlert.error(errorMessage);
      
      // Scroll to first error field
      this.scrollToFirstError();
      return;
    }

    console.log('Form validation passed, transforming to API format...');
    // Transform data to API format
    const apiData = this.transformToApiFormat();
    
    console.log('API data transformation completed');
    // Validate API data
    const apiValidation = this.validateApiData(apiData);
    console.log('API validation result:', apiValidation);
    
    if (!apiValidation.isValid) {
      this.sweetAlert.warning(`Some fields may be missing: ${apiValidation.missingFields.join(', ')}`);
      console.warn('Missing API fields:', apiValidation.missingFields);
    }

    console.log("Final Api Data to be sent:", apiData);
    
    if (this.isEditMode) {
      console.log('Calling updateExistingQuotation...');
      this.updateExistingQuotation(apiData);
    } else {
      console.log('Calling createNewQuotation...');
      this.createNewQuotation(apiData);
    }
    console.log('=== ONSUBMIT DEBUG END ===');
  }

  private scrollToFirstError() {
    setTimeout(() => {
      const errorElement = document.querySelector('.is-invalid, .error-field');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  updateExistingQuotation(apiData: any) {
    let endPoint = `/api/resource/Supplier Quotation/${this.quotationId}`

    this.commonService.putWefabData(endPoint, apiData).subscribe((res: any) => {
      console.log('Quotation updated successfully:', res);
      this.sweetAlert.success('Quotation Update successfully!');
      this.router.navigate(['/wefab/supplier/quotation/details', res.data.name]);
    })
  }

  createNewQuotation(apiData: any) {
    console.log('=== CREATE NEW QUOTATION DEBUG ===');
    console.log('API Data being sent:', JSON.stringify(apiData, null, 2));
    
    let endpoint = `/api/resource/Supplier Quotation`
    console.log('API Endpoint:', endpoint);

    this.commonService.postWefabData(endpoint, apiData).subscribe({
      next: (res: any) => {
        console.log('Quotation created successfully:', res);
        this.sweetAlert.success('Quotation Create successfully!');
        this.router.navigate(['/wefab/supplier/quotation/details', res.data.name]);
      },
      error: (error: any) => {
        console.error('Error creating quotation:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        
        let errorMessage = 'Failed to create quotation. ';
        if (error.error && error.error.message) {
          errorMessage += error.error.message;
        } else if (error.message) {
          errorMessage += error.message;
        } else {
          errorMessage += 'Please check your data and try again.';
        }
        
        this.sweetAlert.error(errorMessage);
      }
    });
  }

  // Transform current form data to API expected format
  transformToApiFormat(): any {
    const calculatedDiscountAmount = this.getDiscountAmount(); // Always calculate the actual discount amount
    
    // Create discount variable - use discount_percentage if exists, otherwise use discount_amount
    let discount = 0;
    if (this.discountType === 'percentage' && this.discountValue > 0) {
      discount = this.discountValue; // Use percentage value
    } else if (this.discountType === 'amount' && this.discountValue > 0) {
      discount = this.discountValue; // Use amount value
    }
    
    // Log discount calculation details for debugging
    console.log('=== DISCOUNT CALCULATION DEBUG ===');
    console.log('Discount Type:', this.discountType);
    console.log('Discount Value:', this.discountValue);
    console.log('Discount Variable:', discount);
    console.log('Sub Total:', this.calculatedSubTotal);
    console.log('Calculated Discount Amount:', calculatedDiscountAmount);
    console.log('=====================================');
    
    const apiData = {
      rfq_id: this.getRfqId(),
      quotation_name: this.model.quotationName,
      supplier_id: this.getSupplierId(),
      estimated_completion_duration: `${this.model.totalLeadTime} days`,
      validity: this.formatDateForApi(this.model.quoteValidTill),
      delivery_address: this.getDeliveryAddress(),
      quotation_from: this.quoteFrom,
      quotation_to: this.quoteTo,
      discount_type: this.discountType === 'percentage' ? 'Percentage' : 'Amount',
      discount_percentage: this.discountType === 'percentage' ? this.discountValue : 0,
      discount_amount: calculatedDiscountAmount, // Always set the calculated discount amount
      discount: discount, // New single discount variable
      shipping_charges: this.shippingCharges || 0,
      total_tax_amount: this.getTotalTaxAmount(),
      payment_terms: this.model.paymentTerms,
      shipping_terms: this.getShippingTerms(),
      notes: `<p>${this.model.termsAndConditions}</p>`,
      igst_applicable: this.selectedTaxType === 'IGST',
      sgst_cgst_applicable: this.selectedTaxType === 'SGCT & CGST',
      items: this.transformQuotationItems(),
      attachments: this.transformAttachments(),
    };

    debugger
    console.log('API Data:', apiData);

    return apiData;
  }

  // Transform quotation items to API format
  transformQuotationItems(): any[] {
    return this.model.quotationItems.map((item: any, index: number) => {
      const unitPrice = item.itemPrice || 0;
      const quantity = item.qty || 0;
      
      return {
        item_code: this.generateItemCode(item, index),
        item_description: item.description || item.actionItemName || '',
        quantity: quantity,
        unit: item.unit || 'Nos',
        currency_code: this.model.currency,
        unit_price: unitPrice,
        comments: this.buildItemComments(item),
        bid_type: item.bid_type || 'Bid',
        tax_type: item.tax_type || 'No Tax',
        tax_amount: this.getLineTaxAmount(item)
      };
    });
  }

  // Transform attachments to API format
  transformAttachments(): any[] {
    return this.attachedFileObjects
      .filter(fileObj => fileObj.url) // Only include files that have been uploaded
      .map((fileObj: any) => ({
        file_name: fileObj.name,
        file_url: fileObj.url,
        description: this.getFileDescriptionFromType(fileObj.type)
      }));
  }

  // Helper method to get file description from type
  private getFileDescriptionFromType(fileType: string): string {
    if (!fileType) return 'Supporting file';
    
    const type = fileType.toLowerCase();
    
    if (type.includes('pdf')) {
      return 'Technical specifications and documentation';
    } else if (type.includes('word') || type.includes('doc')) {
      return 'Supporting documentation';
    } else if (type.includes('image')) {
      return 'Technical drawings and images';
    } else if (type.includes('excel') || type.includes('sheet')) {
      return 'Technical data and specifications';
    } else {
      return 'Supporting file';
    }
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

  exportCSV() {
    // Clean and validate data first
    if (!this.validateAndCleanTableData()) {
      this.sweetAlert.warning('Please add at least one valid quotation item before exporting.');
      return;
    }

    // Small delay to ensure all pending changes are captured
    setTimeout(() => {
      this.performCSVExport();
    }, 100);
  }

  private performCSVExport() {
    // Ensure model is synchronized with current table data
    this.syncTableDataToModel();
    
    // Debug: Log current table data
    console.log('Current quotation items for export:', this.model.quotationItems);
    
    // Ensure we have data to export
    if (!this.model.quotationItems || this.model.quotationItems.length === 0) {
      this.sweetAlert.warning('No quotation items to export. Please add items to the table first.');
      return;
    }

    // Create CSV content for quotation items with all current data
    const headers = [
      'S.No',
      'Item Name',
      'Description', 
      'Material',
      'Qty',
      'Unit',
      'Item Price',
      'Tax Type',
      'Taxable Amount',
      'Miscellaneous',
      'Tooling',
      'Bid Type',
      'Discount Type',
      'Discount Value'
    ];

    const csvRows = this.model.quotationItems.map((item: any, index: number) => {
      return [
        index + 1,
        `"${(item.actionItemName || '').replace(/"/g, '""')}"`,
        `"${(item.description || '').replace(/"/g, '""')}"`,
        `"${(item.material || '').replace(/"/g, '""')}"`,
        item.qty || 0,
        `"${(item.unit || '').replace(/"/g, '""')}"`,
        item.itemPrice || 0,
        `"${item.tax_type || 'No Tax'}"`,
        this.getLineTaxAmount(item),
        `"${(item.miscellaneous || '').replace(/"/g, '""')}"`,
        `"${(item.tooling || '').replace(/"/g, '""')}"`,
        `"${item.bid_type || 'Bid'}"`,
        `"${this.discountType}"`,
        `"${this.discountValue}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    // Debug: Log CSV content
    console.log('CSV Content to be exported:', csvContent);

    try {
      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Generate filename with current timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `quotation-items-${timestamp}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.sweetAlert.success(`Quotation items exported to ${filename} successfully!`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      this.sweetAlert.error('Failed to export CSV file. Please try again.');
    }
  }

  // Method to ensure table data is synchronized with model
  syncTableDataToModel() {
    // Force change detection and model synchronization
    if (this.model.quotationItems) {
      // Trigger a small update to ensure all bindings are current
      this.model.quotationItems = [...this.model.quotationItems];
    }
  }

  // Test method to check current table data (for debugging)
  logCurrentTableData() {
    console.log('=== CURRENT TABLE DATA DEBUG ===');
    console.log('Total items:', this.model.quotationItems?.length || 0);
    this.model.quotationItems?.forEach((item: any, index: number) => {
      console.log(`Item ${index + 1}:`, {
        actionItemName: item.actionItemName,
        description: item.description,
        material: item.material,
        qty: item.qty,
        unit: item.unit,
        itemPrice: item.itemPrice,
        miscellaneous: item.miscellaneous,
        tooling: item.tooling
      });
    });
    console.log('=== END DEBUG ===');
  }

  importCSV() {
    // Store current state before import for potential reset
    this.storeCurrentStateForReset();
    
    // Use the ViewChild reference to trigger file selection
    if (this.csvFileInput) {
      this.csvFileInput.nativeElement.click();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const csvContent = e.target.result;
          this.parseCSVAndUpdateTable(csvContent);
        } catch (error) {
          console.error('Error reading CSV file:', error);
          this.sweetAlert.error('Error reading CSV file. Please check the file format.');
        }
      };
      reader.onerror = () => {
        this.sweetAlert.error('Error reading the selected file.');
      };
      reader.readAsText(file);
    } else {
      this.sweetAlert.error('Please select a valid CSV file.');
    }
    
    // Reset the input to allow selecting the same file again
    event.target.value = '';
  }

  private parseCSVAndUpdateTable(csvContent: string) {
    this.csvImportErrors = [];
    
    try {
      const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line !== '');
      
      if (lines.length === 0) {
        this.csvImportErrors.push('CSV file is empty');
        this.showCSVErrors();
        return;
      }

      if (lines.length === 1) {
        this.csvImportErrors.push('CSV file contains only headers, no data rows found');
        this.showCSVErrors();
        return;
      }

      // Parse and validate header
      const headerLine = lines[0];
      const headers = this.parseCSVLine(headerLine);
      const headerValidation = this.validateCSVHeaders(headers);
      
      if (!headerValidation.isValid) {
        this.csvImportErrors.push(...headerValidation.errors);
        this.showCSVErrors();
        return;
      }

      // Parse data lines
      const dataLines = lines.slice(1);
      const importedItems: any[] = [];
      const rowErrors: string[] = [];

      dataLines.forEach((line, index) => {
        const rowNumber = index + 2; // +2 because we start from line 2 (after header)
        
        try {
          const values = this.parseCSVLine(line);
          const itemValidation = this.validateCSVRow(values, rowNumber, headers.length);
          
          if (!itemValidation.isValid) {
            rowErrors.push(...itemValidation.errors);
            return; // Skip this row
          }

          const item = this.createItemFromCSVRow(values, rowNumber);
          
          if (item) {
            importedItems.push(item);
          }
        } catch (error) {
          rowErrors.push(`Row ${rowNumber}: Error parsing data - ${error}`);
        }
      });

      // Check if we have any valid items
      if (importedItems.length === 0) {
        this.csvImportErrors.push('No valid items could be imported from the CSV file');
        if (rowErrors.length > 0) {
          this.csvImportErrors.push('Errors found:');
          this.csvImportErrors.push(...rowErrors);
        }
        this.showCSVErrors();
        return;
      }

      // Show warnings if some rows failed
      if (rowErrors.length > 0) {
        const warningMessage = `Warning: ${rowErrors.length} row(s) had errors and were skipped. ${importedItems.length} item(s) imported successfully.\n\nErrors:\n${rowErrors.join('\n')}`;
        this.sweetAlert.warning(warningMessage);
      } else {
        this.sweetAlert.success(`Successfully imported ${importedItems.length} quotation items from CSV.`);
      }

      // Update the model with imported items
      this.model.quotationItems = importedItems;
      this.calculateTotals();

    } catch (error) {
      this.csvImportErrors.push(`Critical error parsing CSV file: ${error}`);
      this.showCSVErrors();
    }
  }

  private validateCSVHeaders(headers: string[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const requiredHeaders = [
      'Item Name',
      'Qty', 
      'Unit',
      'Item Price',
      'Tax Type',
      'Bid Type',
      'Tooling'
    ];

    const expectedHeaders = [
      'S.No',
      'Item Name',
      'Description', 
      'Material',
      'Qty',
      'Unit',
      'Item Price',
      'Tax Type',
      'Taxable Amount',
      'Miscellaneous',
      'Tooling',
      'Bid Type'
    ];

    if (headers.length < 8) {
      errors.push(`CSV must have at least 8 columns. Found ${headers.length} columns.`);
      return { isValid: false, errors };
    }

    // Check for required headers (case-insensitive)
    const lowerHeaders = headers.map(h => h.toLowerCase().trim());
    
    requiredHeaders.forEach(required => {
      const found = lowerHeaders.some(header => 
        header.includes(required.toLowerCase()) || 
        required.toLowerCase().includes(header)
      );
      
      if (!found) {
        errors.push(`Required column '${required}' not found in CSV headers`);
      }
    });

    if (errors.length > 0) {
      errors.unshift('CSV Header Validation Failed:');
      errors.push('Expected headers: ' + expectedHeaders.join(', '));
      errors.push('Found headers: ' + headers.join(', '));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateCSVRow(values: string[], rowNumber: number, expectedColumns: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check column count
    if (values.length < expectedColumns) {
      errors.push(`Row ${rowNumber}: Expected ${expectedColumns} columns, found ${values.length}`);
    }

    // Check if row is completely empty
    const hasAnyValue = values.some(value => value && value.trim() !== '');
    if (!hasAnyValue) {
      errors.push(`Row ${rowNumber}: Empty row detected`);
      return { isValid: false, errors };
    }

    // Validate required fields (assuming standard column positions)
    if (values.length >= 2 && (!values[1] || values[1].trim() === '')) {
      errors.push(`Row ${rowNumber}: Item Name is required`);
    }

    if (values.length >= 5) {
      const qty = values[4];
      if (!qty || qty.trim() === '') {
        errors.push(`Row ${rowNumber}: Quantity is required`);
      } else if (isNaN(Number(qty)) || Number(qty) <= 0) {
        errors.push(`Row ${rowNumber}: Quantity must be a valid number greater than 0`);
      }
    }

    if (values.length >= 6 && (!values[5] || values[5].trim() === '')) {
      errors.push(`Row ${rowNumber}: Unit is required`);
    }

    if (values.length >= 7) {
      const price = values[6];
      if (!price || price.trim() === '') {
        errors.push(`Row ${rowNumber}: Item Price is required`);
      } else if (isNaN(Number(price)) || Number(price) < 0) {
        errors.push(`Row ${rowNumber}: Item Price must be a valid number`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private createItemFromCSVRow(values: string[], rowNumber: number): any | null {
    try {
      // Map values to item structure (assuming standard column order)
      const item = {
        actionItemName: (values[1] || '').trim(),
        description: (values[2] || '').trim(),
        material: (values[3] || '').trim(),
        qty: this.parseNumber(values[4], 'quantity'),
        unit: this.validateAndGetUnit(values[5], rowNumber),
        itemPrice: this.parseNumber(values[6], 'price'),
        tax_type: this.validateAndGetTaxType(values[7], rowNumber),
        miscellaneous: (values[9] || '').trim(),
        tooling: (values[10] || '').trim() || 'Standard',
        bid_type: this.validateAndGetBidType(values[11], rowNumber)
      };

      // Final validation of the created item
      if (!item.actionItemName) {
        this.csvImportErrors.push(`Row ${rowNumber}: Item Name cannot be empty`);
        return null;
      }

      return item;
    } catch (error) {
      this.csvImportErrors.push(`Row ${rowNumber}: Error creating item - ${error}`);
      return null;
    }
  }

  private parseNumber(value: string, fieldName: string): number {
    const cleanValue = (value || '').toString().replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  }

  private validateAndGetUnit(unit: string, rowNumber: number): string {
    const cleanUnit = (unit || '').trim();
    if (!cleanUnit) return 'Nos'; // Default unit

    const validUnit = this.unitOptions.find(opt => 
      opt.value.toLowerCase() === cleanUnit.toLowerCase() ||
      opt.label.toLowerCase() === cleanUnit.toLowerCase()
    );

    if (!validUnit) {
      this.csvImportErrors.push(`Row ${rowNumber}: Invalid unit '${cleanUnit}'. Using default 'Nos'.`);
      return 'Nos';
    }

    return validUnit.value;
  }

  private validateAndGetTaxType(taxType: string, rowNumber: number): string {
    const cleanTaxType = (taxType || '').trim().toLowerCase();
    if (!cleanTaxType) return 'No Tax'; // Default tax type

    const validTaxType = this.taxTypeOptions.find(opt => 
      opt.value.toLowerCase() === cleanTaxType ||
      opt.label.toLowerCase() === cleanTaxType ||
      opt.label.toLowerCase().includes(cleanTaxType)
    );

    if (!validTaxType) {
      this.csvImportErrors.push(`Row ${rowNumber}: Invalid tax type '${taxType}'. Using 'No Tax'.`);
      return 'No Tax';
    }

    return validTaxType.value;
  }

  private validateAndGetBidType(bidType: string, rowNumber: number): string {
    const cleanBidType = (bidType || '').trim().toLowerCase();
      if (!cleanBidType) return 'Bid'; // Default bid type

    const validBidType = this.bidTypeOptions.find(opt => 
      opt.value.toLowerCase() === cleanBidType ||
      opt.label.toLowerCase() === cleanBidType
    );

    if (!validBidType) {
      this.csvImportErrors.push(`Row ${rowNumber}: Invalid bid type '${bidType}'. Using 'bid'.`);
      return 'Bid';
    }

    return validBidType.value;
  }

  private showCSVErrors() {
    if (this.csvImportErrors.length > 0) {
      const errorMessage = `CSV Import Failed:\n\n${this.csvImportErrors.join('\n')}`;
      this.sweetAlert.error(errorMessage);
    }
  }

  // Enhanced CSV line parsing with better quote handling
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Handle escaped quotes
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
      i++;
    }
    
    result.push(current.trim());
    
    // Clean up quotes from values
    return result.map(value => {
      if (value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1).replace(/""/g, '"');
      }
      return value;
    });
  }

  // Add method to get validation error for a specific field
  getValidationError(fieldName: string): string | null {
    if (!this.showValidationErrors || !this.validationErrors[fieldName]) {
      return null;
    }
    return this.validationErrors[fieldName][0]; // Return first error
  }

  // Add method to check if field has error
  hasValidationError(fieldName: string): boolean {
    return this.showValidationErrors && !!this.validationErrors[fieldName];
  }

  // Clear validation errors when user starts typing/changing values
  clearFieldError(fieldName: string) {
    if (this.validationErrors[fieldName]) {
      delete this.validationErrors[fieldName];
    }
  }

  storeCurrentStateForReset() {
    this.originalQuotationItems = JSON.parse(JSON.stringify(this.model.quotationItems));
  }

  resetTableConfirmation() {
    const hasData = this.model.quotationItems.some((item: any) => 
      item.actionItemName || item.description || item.material || 
      (item.qty && item.qty > 0) || (item.itemPrice && item.itemPrice > 0)
    );

    if (!hasData) {
      this.sweetAlert.info('Table is already empty or has no data to reset.');
      return;
    }

    this.sweetAlert.confirm(
      'Are you sure you want to reset the table? This will remove all current data and cannot be undone.', 
      '', 
      'question', 
      'Yes, Reset', 
      'Cancel'
    ).then((result: any) => {
      if(result.isConfirmed) {
        this.resetTable();
      }
    });
  }

  resetTable() {
    if (this.originalQuotationItems.length > 0) {
      // Reset to original state
      this.model.quotationItems = JSON.parse(JSON.stringify(this.originalQuotationItems));
    } else {
      // Reset to single empty row if no original state
      this.model.quotationItems = [
        {
          actionItemName: '',
          description: '',
          material: '',
          qty: 0,
          unit: '',
          itemPrice: 0,
          tax_type: 'No Tax',
          miscellaneous: '',
          tooling: '',
          bid_type: 'Bid'
        }
      ];
    }
    
    // Reset totals
    this.discountType = 'percentage';
    this.discountValue = 0;
    this.shippingCharges = 0;
    
    this.calculateTotals();
    this.sweetAlert.success('Table has been reset to previous state');
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
          quotationName: quotationData.quotation_name || '',
          quotationId: quotationData.name || quotationId, // Set the quotation ID from API response
          isEditMode: true, // Ensure edit mode flag is set
          totalLeadTime: this.extractDaysFromDuration(quotationData.estimated_completion_duration),
          paymentTerms: quotationData.payment_terms || 'Net 30',
          quoteValidTill: this.parseApiDateForInput(quotationData.validity),
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
          shippingCharges: quotationData.shipping_charges || 0,
          totalAmount: quotationData.grand_total || 0
        };

        // Set discount and shipping charges for calculations
        if (quotationData.discount_type === 'Amount' && quotationData.discount_amount) {
          this.discountType = 'amount';
          this.discountValue = quotationData.discount || quotationData.discount_amount;
        } else if (quotationData.discount_percentage) {
          this.discountType = 'percentage';
          this.discountValue = quotationData.discount || quotationData.discount_percentage;
        } else {
          this.discountType = 'percentage';
          this.discountValue = 0;
        }
        this.shippingCharges = quotationData.shipping_charges || 0;

        // Set the selectedTaxType based on loaded data
        if (this.model.cgstSgst) {
          this.selectedTaxType = 'SGCT & CGST';
        } else if (this.model.igst) {
          this.selectedTaxType = 'IGST';
        } else {
          this.selectedTaxType = 'No Tax';
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

        // Store original state for reset functionality
        this.storeCurrentStateForReset();

        console.log('Quotation data loaded and mapped to model:', this.model);
      }
    }, (error) => {
      console.error('Error loading quotation data:', error);
      this.sweetAlert.error('Failed to load quotation data');
    });
  }

  // Helper method to extract days from duration string like "20 days"
  private extractDaysFromDuration(duration: string): number {
    if (!duration) return 0;
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  // Helper method to parse API date format for input field
  private parseApiDateForInput(dateString: string): string | null {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      // Format as YYYY-MM-DD for HTML date input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.warn('Error parsing date:', dateString);
      return null;
    }
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
      
      // Determine tax type based on item properties
      let taxType = 'No Tax';
      if (item.tax_type) {
        taxType = item.tax_type;
      } else if (item.currency_code === 'INR') {
        if (item.igst_applicable || this.model.igst) {
          taxType = 'IGST';
        } else if (item.sgst_cgst_applicable || this.model.cgstSgst) {
          taxType = 'SGCT & CGST';
        }
      }
      
      return {
        actionItemName: item.item_code || '',
        description: item.item_description || '',
        material: parsedComments.material || '',
        qty: item.quantity || 0,
        unit: item.unit || 'Nos',
        itemPrice: item.unit_price || 0,
        tax_type: taxType,
        miscellaneous: parsedComments.miscellaneous || '',
        tooling: parsedComments.tooling || 'Standard',
        bid_type: item.bid_type || 'Bid'
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
    // Check if there are unsaved changes
    const hasUnsavedChanges = this.hasUnsavedChanges();
    
    if (hasUnsavedChanges) {
      this.sweetAlert.confirm(
        'You have unsaved changes. Are you sure you want to go back? All changes will be lost.',
        '',
        'warning',
        'Yes, Go Back',
        'Continue Editing'
      ).then((result: any) => {
        if (result.isConfirmed) {
          window.history.back();
        }
      });
    } else {
      this.navigateBack();
    }
  }

  private hasUnsavedChanges(): boolean {
    // Check if any form fields have been modified
    const hasFormChanges = 
      this.model.quotationName ||
      (this.model.totalLeadTime && this.model.totalLeadTime > 0) ||
      this.model.termsAndConditions ||
      this.model.deliveryAddress ||
      this.attachedFiles.length > 0;

    // Check if quotation items have data
    const hasItemChanges = this.model.quotationItems.some((item: any) => 
      item.actionItemName || 
      item.description || 
      item.material || 
      (item.qty && item.qty > 0) ||
      (item.itemPrice && item.itemPrice > 0) ||
      item.miscellaneous ||
      item.tooling
    );

    return hasFormChanges || hasItemChanges;
  }

  private navigateBack() {
    try {
      console.log('Cancel button clicked - navigating back...');
      console.log('Current RFQ ID:', this.model.rfqId);
      console.log('Is Edit Mode:', this.isEditMode);
      
      // Try different navigation paths based on context
      if (this.model.rfqId) {
        // If we have an RFQ ID, go back to RFQ details or supplier dashboard
        console.log('Navigating to supplier dashboard...');
        this.router.navigate(['/wefab/supplier/dashboard']).then(
          (success) => {
            console.log('Navigation successful:', success);
            if (!success) {
              console.log('Navigation failed, trying alternate route...');
              this.tryAlternateNavigation();
            }
          }
        ).catch((error) => {
          console.error('Navigation error:', error);
          this.tryAlternateNavigation();
        });
      } else {
        // Default back to quotations list
        console.log('Navigating to quotations list...');
        this.router.navigate(['/wefab/supplier/quotations']).then(
          (success) => {
            console.log('Navigation successful:', success);
            if (!success) {
              console.log('Navigation failed, trying alternate route...');
              this.tryAlternateNavigation();
            }
          }
        ).catch((error) => {
          console.error('Navigation error:', error);
          this.tryAlternateNavigation();
        });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      this.tryAlternateNavigation();
    }
  }

  private tryAlternateNavigation() {
    console.log('Trying alternate navigation routes...');
    
    // Try various fallback routes
    const fallbackRoutes = [
      '/wefab/supplier',
      '/wefab/supplier/dashboard',
      '/wefab/supplier/quotations',
      '/wefab',
      '/'
    ];

    let routeIndex = 0;
    const tryNextRoute = () => {
      if (routeIndex < fallbackRoutes.length) {
        const route = fallbackRoutes[routeIndex];
        console.log(`Trying route ${routeIndex + 1}/${fallbackRoutes.length}: ${route}`);
        
        this.router.navigate([route]).then(
          (success) => {
            if (success) {
              console.log(`Successfully navigated to: ${route}`);
              this.sweetAlert.success('Navigated back successfully.');
            } else {
              routeIndex++;
              tryNextRoute();
            }
          }
        ).catch((error) => {
          console.error(`Failed to navigate to ${route}:`, error);
          routeIndex++;
          tryNextRoute();
        });
      } else {
        console.error('All navigation attempts failed');
        this.sweetAlert.error('Unable to navigate back. Please refresh the page or use browser back button.');
        
        // As a last resort, try browser back
        try {
          window.history.back();
        } catch (historyError) {
          console.error('Browser back also failed:', historyError);
        }
      }
    };

    tryNextRoute();
  }

  // Add a test method for debugging navigation (can be removed in production)
  testNavigation() {
    console.log('=== NAVIGATION DEBUG TEST ===');
    console.log('Router instance:', this.router);
    console.log('Current URL:', this.router.url);
    console.log('Model RFQ ID:', this.model.rfqId);
    console.log('Is Edit Mode:', this.isEditMode);
    
    // Test a simple navigation
    this.router.navigate(['/wefab/supplier/dashboard']).then(
      (success) => {
        console.log('Test navigation result:', success);
        this.sweetAlert.info(`Navigation test result: ${success ? 'SUCCESS' : 'FAILED'}`);
      }
    ).catch((error) => {
      console.error('Test navigation error:', error);
      this.sweetAlert.error('Navigation test failed: ' + error.message);
    });
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
          // Generate thumbnail for image files
          if (this.isImageFile(file)) {
            this.generateThumbnail(file).then((thumbnail: string) => {
              const fileObject = {
                url: '',
                file: file,
                thumbnail: thumbnail,
                name: file.name,
                type: file.type
              };
              this.attachedFileObjects.push(fileObject);
              this.uploadFileOnS3(file, fileObject);
            });
          } else {
            const fileObject = {
              url: '',
              file: file,
              name: file.name,
              type: file.type
            };
            this.attachedFileObjects.push(fileObject);
            this.uploadFileOnS3(file, fileObject);
          }
        } else {
          this.sweetAlert.warning(`File "${file.name}" is not supported. Please use PDF, DOC, DOCX, JPG, PNG, TXT, or XLSX files.`);
        }
      }
    }
  }

  uploadFileOnS3(file: File, fileObject: any) {
    this.commonService.uploadFile(file).subscribe((res: any) => {
      if(res.body && res.body.message) {
         debugger
         console.log("file Uploaded Successfully ", res.body.message.file_url)
         this.attachedFiles.push(res.body.message.file_url)
         fileObject.url = res.body.message.file_url;
      }
    }, (error: any) => {
      console.error('Error uploading file:', error);
    });
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
          // Generate thumbnail for image files
          if (this.isImageFile(file)) {
            this.generateThumbnail(file).then((thumbnail: string) => {
              const fileObject = {
                url: '',
                file: file,
                thumbnail: thumbnail,
                name: file.name,
                type: file.type
              };
              this.attachedFileObjects.push(fileObject);
              this.uploadFileOnS3(file, fileObject);
            });
          } else {
            const fileObject = {
              url: '',
              file: file,
              name: file.name,
              type: file.type
            };
            this.attachedFileObjects.push(fileObject);
            this.uploadFileOnS3(file, fileObject);
          }
        } else {
          this.sweetAlert.warning(`File "${file.name}" is not supported. Please use PDF, DOC, DOCX, JPG, PNG, TXT, or XLSX files.`);
        }
      }
    }
  }

  removeAttachment(index: number) {
    this.attachedFiles.splice(index, 1);
    this.attachedFileObjects.splice(index, 1);
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

  private isImageFile(file: File): boolean {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return imageTypes.includes(file.type);
  }

  private generateThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set thumbnail size
          const maxWidth = 40;
          const maxHeight = 40;
          let { width, height } = img;
          
          // Calculate new dimensions maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          
          canvas.width = maxWidth;
          canvas.height = maxHeight;
          
          // Fill with white background
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, maxWidth, maxHeight);
            
            // Center the image
            const x = (maxWidth - width) / 2;
            const y = (maxHeight - height) / 2;
            
            ctx.drawImage(img, x, y, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            reject('Canvas context not available');
          }
        };
        img.onerror = () => reject('Error loading image');
        img.src = e.target.result;
      };
      reader.onerror = () => reject('Error reading file');
      reader.readAsDataURL(file);
    });
  }

  // Method to preview API data format (useful for debugging)
  previewApiData(): void {
    const apiData = this.transformToApiFormat();
    console.log('API Data Preview:', JSON.stringify(apiData, null, 2));
    
    this.sweetAlert.info('Check console for formatted API data structure');
  }

  // Method to validate required API fields
  validateApiData(apiData: any): { isValid: boolean; missingFields: string[] } {
    const requiredFields = [
      'rfq_id',
      'supplier_id', 
      'estimated_completion_duration',
      'validity',
      'payment_terms',
      'shipping_charges',
      'igst_applicable',
      'sgst_cgst_applicable',
      'items'
    ];
    
    const missingFields: string[] = [];
    
    requiredFields.forEach(field => {
      if (apiData[field] === undefined || apiData[field] === null || 
          (Array.isArray(apiData[field]) && apiData[field].length === 0)) {
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

  // Method to extract filename from URL
  getFileNameFromUrl(url: string): string {
    if (!url) return 'Unknown File';
    
    try {
      // Extract filename from URL path
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      // Remove any query parameters
      const cleanFilename = filename.split('?')[0];
      
      // If filename has underscore prefix (like SS0E29F5_Screenshot_...), remove it
      const parts = cleanFilename.split('_');
      if (parts.length > 1 && parts[0].length <= 8) {
        return parts.slice(1).join('_');
      }
      
      return cleanFilename || 'Unknown File';
    } catch (error) {
      console.error('Error extracting filename from URL:', error);
      return 'Unknown File';
    }
  }

  // Method to view attachment in new tab
  viewAttachment(fileUrl: string) {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      this.sweetAlert.error('Unable to open file. Invalid URL.');
    }
  }

  // Method to get file extension from URL
  getFileExtensionFromUrl(url: string): string {
    if (!url) return '';
    
    try {
      const filename = this.getFileNameFromUrl(url);
      const parts = filename.split('.');
      return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    } catch (error) {
      return '';
    }
  }

  // Method to get appropriate icon based on file type
  getFileIcon(url: string): string {
    const extension = this.getFileExtensionFromUrl(url);
    
    switch (extension) {
      case 'pdf':
        return 'pi-file-pdf';
      case 'doc':
      case 'docx':
        return 'pi-file-word';
      case 'xlsx':
      case 'xls':
        return 'pi-file-excel';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'pi-image';
      case 'txt':
        return 'pi-file';
      default:
        return 'pi-file';
    }
  }

  // Method to get file description from URL
  getFileDescriptionFromUrl(url: string): string {
    const extension = this.getFileExtensionFromUrl(url);
    
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

  // Method for testing attachment display (can be removed in production)
  addTestAttachments() {
    this.attachedFileObjects = [
      {
        url: "https://s3.ap-south-1.amazonaws.com/www.vendosmart.com/ap-south-1/2025/05/30/File/SS0E29F5_Screenshot_from_2025-05-30_11-38-14.png",
        name: "75TPAEH6_Screenshot_from_2025-05-30_11-38-14.png",
        type: "image/png",
        thumbnail: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2ODApLCBxdWFsaXR5ID0gODAK/9sAQwAGBAUGBQQGBgUGBwcGCAoQCgoJCQoUDg0NDhQUExMTExQUExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMT/9sAQwEHBwcKCAoTCgoTExQTFBMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMT/8AAEQgAKAAoAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBkQgUobHBwfBDUuHxCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/2Q=="
      },
      {
        url: "https://s3.ap-south-1.amazonaws.com/www.vendosmart.com/ap-south-1/2025/05/30/File/RXO4IUIM_chirag_agar.pdf",
        name: "RXO4IUIM_chirag_agar.pdf",
        type: "application/pdf"
      }
    ];
    
    // Also update the old attachedFiles array for backward compatibility
    this.attachedFiles = this.attachedFileObjects.map(obj => obj.url);
    
    this.sweetAlert.info('Sample file attachments have been added for testing');
  }

  // Add comprehensive form validation
  validateForm(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    this.validationErrors = {};

    // Basic form validation
    if (!this.model.totalLeadTime || this.model.totalLeadTime <= 0) {
      errors.push('Total Lead Time is required and must be greater than 0');
      this.validationErrors['totalLeadTime'] = ['Total Lead Time is required and must be greater than 0'];
    }

    if (!this.model.paymentTerms) {
      errors.push('Payment Terms is required');
      this.validationErrors['paymentTerms'] = ['Payment Terms is required'];
    }

    if (!this.model.quoteValidTill) {
      errors.push('Quote Valid Till date is required');
      this.validationErrors['quoteValidTill'] = ['Quote Valid Till date is required'];
    } else {
      // Validate that date is in the future
      const selectedDate = new Date(this.model.quoteValidTill);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.push('Quote Valid Till date must be in the future');
        this.validationErrors['quoteValidTill'] = ['Quote Valid Till date must be in the future'];
      }
    }

    if (!this.model.currency) {
      errors.push('Currency selection is required');
      this.validationErrors['currency'] = ['Currency selection is required'];
    }

    if (!this.model.termsAndConditions || this.model.termsAndConditions.trim() === '') {
      errors.push('Terms & Conditions is required');
      this.validationErrors['termsAndConditions'] = ['Terms & Conditions is required'];
    }

    // Email validation only when no RFQ ID
    if (!this.model.rfqId) {
      if (!this.model.email || this.model.email.trim() === '') {
        errors.push('Email is required');
        this.validationErrors['email'] = ['Email is required'];
      } else if (!this.isValidEmail(this.model.email)) {
        errors.push('Please enter a valid email address');
        this.validationErrors['email'] = ['Please enter a valid email address'];
      }
    }

    // Validate quotation items
    const itemErrors = this.validateQuotationItems();
    if (itemErrors.length > 0) {
      errors.push(...itemErrors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateQuotationItems(): string[] {
    const errors: string[] = [];
    
    if (!this.model.quotationItems || this.model.quotationItems.length === 0) {
      errors.push('At least one quotation item is required');
      return errors;
    }

    // Check if all items are empty
    const hasValidItems = this.model.quotationItems.some((item: any) => 
      item.actionItemName && item.actionItemName.trim() !== ''
    );

    if (!hasValidItems) {
      errors.push('At least one quotation item with a valid Item Name is required');
      return errors;
    }

    this.model.quotationItems.forEach((item: any, index: number) => {
      const itemErrors: string[] = [];
      const rowNumber = index + 1;

      // Skip validation for completely empty rows
      const isEmptyRow = !item.actionItemName && !item.description && 
                        !item.material && (!item.qty || item.qty === 0) && 
                        !item.unit && (!item.itemPrice || item.itemPrice === 0);

      if (isEmptyRow) {
        return; // Skip empty rows
      }

      // Item Name validation
      if (!item.actionItemName || item.actionItemName.trim() === '') {
        itemErrors.push('Item Name is required');
      }

      // Quantity validation
      if (!item.qty || item.qty <= 0) {
        itemErrors.push('Quantity must be greater than 0');
      } else if (isNaN(item.qty)) {
        itemErrors.push('Quantity must be a valid number');
      }

      // Unit validation
      if (!item.unit || item.unit.trim() === '') {
        itemErrors.push('Unit is required');
      } else if (!this.unitOptions.find(opt => opt.value === item.unit)) {
        itemErrors.push('Unit must be selected from the dropdown');
      }

      // Bid Type validation
      if (!item.bid_type) {
        itemErrors.push('Bid Type is required');
      } else if (!this.bidTypeOptions.find(opt => opt.value === item.bid_type)) {
        itemErrors.push('Bid Type must be selected from the dropdown');
      }

      // Item Price validation (only for bid items)
      if (item.bid_type === 'Bid') {
        if (!item.itemPrice || item.itemPrice <= 0) {
          itemErrors.push('Item Price must be greater than 0 for bid items');
        } else if (isNaN(item.itemPrice)) {
          itemErrors.push('Item Price must be a valid number');
        }
      }

      // Tax Type validation
      if (!item.tax_type) {
        itemErrors.push('Tax Type is required');
      } else if (!this.taxTypeOptions.find(opt => opt.value === item.tax_type)) {
        itemErrors.push('Tax Type must be selected from the dropdown');
      }

      // Tooling validation
      if (!item.tooling || item.tooling.trim() === '') {
        itemErrors.push('Tooling information is required');
      }

      if (itemErrors.length > 0) {
        this.validationErrors[`item_${index}`] = itemErrors;
        errors.push(`Row ${rowNumber}: ${itemErrors.join(', ')}`);
      }
    });

    return errors;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Add method to download CSV template for users
  downloadCSVTemplate() {
    const headers = [
      'S.No',
      'Item Name',
      'Description', 
      'Material',
      'Qty',
      'Unit',
      'Item Price',
      'Tax Type',
      'Taxable Amount',
      'Miscellaneous',
      'Tooling',
      'Bid Type'
    ];

    // Add sample data rows
    const sampleRows = [
      [1, 'Sample Item 1', 'Sample description', 'Steel', 10, 'Nos', 100, 'No Tax', '', 'Notes here', 'Standard', 'Bid'],
      [2, 'Sample Item 2', 'Another description', 'Aluminum', 5, 'Kg', 250.50, 'SGCT & CGST', '', 'Additional info', 'Required', 'Bid'],
      [3, 'Sample Item 3', 'Third item desc', 'Plastic', 20, 'Meter', 0, '', '', 'No bid item', 'Not Required', 'No Bid']
    ];

    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', 'quotation-template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.sweetAlert.success('CSV template downloaded successfully! You can use this as a reference for importing your data.');
    } catch (error) {
      console.error('Error downloading CSV template:', error);
      this.sweetAlert.error('Failed to download CSV template. Please try again.');
    }
  }

  // Add method to validate and clean table data before operations
  validateAndCleanTableData(): boolean {
    // Remove completely empty rows
    this.model.quotationItems = this.model.quotationItems.filter((item: any) => {
      const hasAnyData = item.actionItemName || item.description || 
                        item.material || (item.qty && item.qty > 0) || 
                        item.unit || (item.itemPrice && item.itemPrice > 0) ||
                        item.miscellaneous || item.tooling;
      return hasAnyData;
    });

    // Ensure at least one item exists
    if (this.model.quotationItems.length === 0) {
      this.model.quotationItems.push({
        actionItemName: '',
        description: '',
        material: '',
        qty: 0,
        unit: '',
        itemPrice: 0,
        tax_type: 'No Tax',
        miscellaneous: '',
        tooling: '',
        bid_type: 'Bid'
      });
      return false;
    }

    return true;
  }

  // Add method to get all validation errors as a summary
  getAllValidationErrors(): string[] {
    const allErrors: string[] = [];
    
    Object.keys(this.validationErrors).forEach(key => {
      if (this.validationErrors[key] && this.validationErrors[key].length > 0) {
        if (key.startsWith('item_')) {
          const itemIndex = key.replace('item_', '');
          allErrors.push(`Row ${parseInt(itemIndex) + 1}: ${this.validationErrors[key].join(', ')}`);
        } else {
          allErrors.push(...this.validationErrors[key]);
        }
      }
    });
    
    return allErrors;
  }

  // Add method to show validation summary
  showValidationSummary() {
    const errors = this.getAllValidationErrors();
    if (errors.length > 0) {
      const errorMessage = `Please fix the following issues:\n\n${errors.map((error, index) => `${index + 1}. ${error}`).join('\n')}`;
      this.sweetAlert.error(errorMessage);
    }
  }

  // Add method to add new empty row
  addNewRow() {
    const newItem = {
      actionItemName: '',
      description: '',
      material: '',
      qty: 0,
      unit: '',
      itemPrice: 0,
      tax_type: 'No Tax',
      miscellaneous: '',
      tooling: '',
      bid_type: 'Bid'
    };
    
    this.model.quotationItems.push(newItem);
    this.calculateTotals();
    this.sweetAlert.success('New row added to quotation items.');
  }

  // Add method to remove specific row
  removeRow(index: number) {
    if (this.model.quotationItems.length <= 1) {
      this.sweetAlert.warning('Cannot remove the last remaining row. At least one row is required.');
      return;
    }

    this.sweetAlert.confirm(
      `Are you sure you want to remove row ${index + 1}?`, 
      'Remove Row', 
      'question', 
      'Yes, Remove', 
      'Cancel'
    ).then((result: any) => {
      if(result.isConfirmed) {
        this.model.quotationItems.splice(index, 1);
        this.calculateTotals();
        
        // Clear any validation errors for removed items
        Object.keys(this.validationErrors).forEach(key => {
          if (key.startsWith('item_')) {
            const itemIndex = parseInt(key.replace('item_', ''));
            if (itemIndex >= index) {
              delete this.validationErrors[key];
            }
          }
        });
        
        this.sweetAlert.success('Row removed successfully.');
      }
    });
  }

  // Add method to duplicate row
  duplicateRow(index: number) {
    const itemToDuplicate = { ...this.model.quotationItems[index] };
    itemToDuplicate.actionItemName = `Copy of ${itemToDuplicate.actionItemName}`;
    
    this.model.quotationItems.splice(index + 1, 0, itemToDuplicate);
    this.calculateTotals();
    this.sweetAlert.success(`Row ${index + 1} duplicated successfully.`);
  }

  // Add method to validate specific field
  validateField(fieldName: string, value: any): string | null {
    switch (fieldName) {
      case 'totalLeadTime':
        if (!value || value <= 0) {
          return 'Total Lead Time must be greater than 0';
        }
        break;
      case 'email':
        if (!this.model.rfqId && (!value || !this.isValidEmail(value))) {
          return 'Please enter a valid email address';
        }
        break;
      case 'quoteValidTill':
        if (!value) {
          return 'Quote Valid Till date is required';
        }
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          return 'Quote Valid Till date must be in the future';
        }
        break;
    }
    return null;
  }

  // Add real-time validation for individual fields
  onFieldChange(fieldName: string, value: any) {
    const error = this.validateField(fieldName, value);
    
    if (error) {
      this.validationErrors[fieldName] = [error];
    } else {
      this.clearFieldError(fieldName);
    }
  }

  // Add getter for unit options display
  get supportedUnitsDisplay(): string {
    return this.unitOptions.map(option => option.label).join(', ');
  }

  // Method to get file extension from filename
  getFileExtensionFromName(filename: string): string {
    if (!filename) return '';
    
    try {
      const parts = filename.split('.');
      return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    } catch (error) {
      return '';
    }
  }

  // Method to get file icon based on file type
  getFileIconByType(fileType: string): string {
    if (!fileType) return 'pi-file';
    
    const type = fileType.toLowerCase();
    
    if (type.includes('pdf')) {
      return 'pi-file-pdf';
    } else if (type.includes('word') || type.includes('doc')) {
      return 'pi-file-word';
    } else if (type.includes('excel') || type.includes('sheet')) {
      return 'pi-file-excel';
    } else if (type.includes('image')) {
      return 'pi-image';
    } else if (type.includes('text')) {
      return 'pi-file';
    } else {
      return 'pi-file';
    }
  }

  // Method to view attachment by file object
  viewAttachmentByObject(fileObj: any) {
    if (fileObj.url) {
      window.open(fileObj.url, '_blank');
    } else if (fileObj.file) {
      // If file hasn't been uploaded yet, create a blob URL for preview
      const blobUrl = URL.createObjectURL(fileObj.file);
      window.open(blobUrl, '_blank');
    } else {
      this.sweetAlert.error('Unable to open file. File not available.');
    }
  }

  // Add this method for debugging purposes
  debugQuotationState() {
    console.log('=== QUOTATION STATE DEBUG ===');
    console.log('1. Component state:');
    console.log('   - isEditMode:', this.isEditMode);
    console.log('   - quotationId:', this.quotationId);
    console.log('   - showValidationErrors:', this.showValidationErrors);
    
    console.log('2. Model data:');
    console.log('   - rfqId:', this.model.rfqId);
    console.log('   - quotationName:', this.model.quotationName);
    console.log('   - totalLeadTime:', this.model.totalLeadTime);
    console.log('   - paymentTerms:', this.model.paymentTerms);
    console.log('   - quoteValidTill:', this.model.quoteValidTill);
    console.log('   - currency:', this.model.currency);
    console.log('   - termsAndConditions:', this.model.termsAndConditions);
    console.log('   - quotationItems count:', this.model.quotationItems?.length || 0);
    
    console.log('3. Form state:');
    console.log('   - form.valid:', this.form.valid);
    console.log('   - form.errors:', this.form.errors);
    console.log('   - form.value:', this.form.value);
    
    console.log('4. Validation test:');
    const validation = this.validateForm();
    console.log('   - validation.isValid:', validation.isValid);
    console.log('   - validation.errors:', validation.errors);
    
    console.log('5. Quotation items details:');
    this.model.quotationItems?.forEach((item: any, index: number) => {
      console.log(`   Item ${index + 1}:`, {
        actionItemName: item.actionItemName,
        qty: item.qty,
        unit: item.unit,
        itemPrice: item.itemPrice,
        bid_type: item.bid_type,
        tax_type: item.tax_type,
        tooling: item.tooling
      });
    });
    
    console.log('6. Supplier ID:', this.getSupplierId());
    console.log('7. RFQ ID from method:', this.getRfqId());
    
    console.log('=== END DEBUG ===');
    
    // Show summary in alert
    const summary = `
Debug Summary:
- Edit Mode: ${this.isEditMode}
- Form Valid: ${this.form.valid}
- Validation Valid: ${validation.isValid}
- Items Count: ${this.model.quotationItems?.length || 0}
- RFQ ID: ${this.model.rfqId}
- Supplier ID: ${this.getSupplierId()}

${validation.isValid ? 'Form should submit successfully!' : 'Form has validation errors - check console for details'}
    `;
    
    this.sweetAlert.info(summary);
  }

  // Test method to force API call (for debugging)
  forceCreateQuotation() {
    console.log('=== FORCE CREATE QUOTATION ===');
    
    // Skip validation and force create
    const apiData = this.transformToApiFormat();
    console.log('Forcing API call with data:', apiData);
    
    this.createNewQuotation(apiData);
  }

  // Number input validation methods
  onNumberKeyPress(event: KeyboardEvent): boolean {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (event.keyCode === 65 && event.ctrlKey === true) || // Ctrl+A
        (event.keyCode === 67 && event.ctrlKey === true) || // Ctrl+C
        (event.keyCode === 86 && event.ctrlKey === true) || // Ctrl+V
        (event.keyCode === 88 && event.ctrlKey === true) || // Ctrl+X
        // Allow: home, end, left, right
        (event.keyCode >= 35 && event.keyCode <= 39)) {
      return true;
    }
    
    // Ensure that it is a number and stop the keypress
    if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && 
        (event.keyCode < 96 || event.keyCode > 105)) {
      // Allow decimal point (period) only once
      const currentValue = (event.target as HTMLInputElement).value;
      if (event.key === '.' && !currentValue.includes('.')) {
        return true;
      }
      event.preventDefault();
      return false;
    }
    
    return true;
  }

  onNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Remove any non-numeric characters except decimal point
    value = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit decimal places to 2
    if (parts.length === 2 && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    // Update the input value if it was changed
    if (input.value !== value) {
      input.value = value;
      
      // Trigger ngModel update
      const ngModelChange = new Event('input', { bubbles: true });
      input.dispatchEvent(ngModelChange);
    }
  }

  onNumberPaste(event: ClipboardEvent): void {
    event.preventDefault();
    
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');
    
    // Clean the pasted text to allow only numbers and one decimal point
    let cleanedText = pastedText.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanedText.split('.');
    if (parts.length > 2) {
      cleanedText = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit decimal places to 2
    if (parts.length === 2 && parts[1].length > 2) {
      cleanedText = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    // Set the cleaned value
    const input = event.target as HTMLInputElement;
    const selectionStart = input.selectionStart || 0;
    const selectionEnd = input.selectionEnd || 0;
    const currentValue = input.value;
    
    const newValue = currentValue.substring(0, selectionStart) + cleanedText + currentValue.substring(selectionEnd);
    input.value = newValue;
    
    // Position cursor after pasted content
    const newCursorPosition = selectionStart + cleanedText.length;
    input.setSelectionRange(newCursorPosition, newCursorPosition);
    
    // Trigger ngModel update
    const ngModelChange = new Event('input', { bubbles: true });
    input.dispatchEvent(ngModelChange);
  }

  // Integer input validation methods (for lead time - no decimals allowed)
  onIntegerKeyPress(event: KeyboardEvent): boolean {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (event.keyCode === 65 && event.ctrlKey === true) || // Ctrl+A
        (event.keyCode === 67 && event.ctrlKey === true) || // Ctrl+C
        (event.keyCode === 86 && event.ctrlKey === true) || // Ctrl+V
        (event.keyCode === 88 && event.ctrlKey === true) || // Ctrl+X
        // Allow: home, end, left, right
        (event.keyCode >= 35 && event.keyCode <= 39)) {
      return true;
    }
    
    // Ensure that it is a number and stop the keypress
    if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) && 
        (event.keyCode < 96 || event.keyCode > 105)) {
      event.preventDefault();
      return false;
    }
    
    return true;
  }

  onIntegerInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Remove any non-numeric characters (no decimal point for integers)
    value = value.replace(/[^0-9]/g, '');
    
    // Update the input value if it was changed
    if (input.value !== value) {
      input.value = value;
      
      // Trigger ngModel update
      const ngModelChange = new Event('input', { bubbles: true });
      input.dispatchEvent(ngModelChange);
    }
  }

  onIntegerPaste(event: ClipboardEvent): void {
    event.preventDefault();
    
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');
    
    // Clean the pasted text to allow only integers
    const cleanedText = pastedText.replace(/[^0-9]/g, '');
    
    // Set the cleaned value
    const input = event.target as HTMLInputElement;
    const selectionStart = input.selectionStart || 0;
    const selectionEnd = input.selectionEnd || 0;
    const currentValue = input.value;
    
    const newValue = currentValue.substring(0, selectionStart) + cleanedText + currentValue.substring(selectionEnd);
    input.value = newValue;
    
    // Position cursor after pasted content
    const newCursorPosition = selectionStart + cleanedText.length;
    input.setSelectionRange(newCursorPosition, newCursorPosition);
    
    // Trigger ngModel update
    const ngModelChange = new Event('input', { bubbles: true });
    input.dispatchEvent(ngModelChange);
  }

  // Test method to verify quotation ID field (can be removed in production)
  testQuotationIdField() {
    console.log('=== QUOTATION ID FIELD TEST ===');
    console.log('Is Edit Mode:', this.isEditMode);
    console.log('Model Edit Mode Flag:', this.model.isEditMode);
    console.log('Quotation ID in Model:', this.model.quotationId);
    console.log('Quotation ID from Component:', this.quotationId);
    
    // Test setting a sample quotation ID
    this.model.quotationId = 'QTN0000041';
    this.isEditMode = true;
    this.model.isEditMode = true;
    
    console.log('After test update:');
    console.log('- Edit Mode:', this.isEditMode);
    console.log('- Model Edit Mode:', this.model.isEditMode);
    console.log('- Quotation ID:', this.model.quotationId);
    
    this.sweetAlert.info(`Quotation ID Test:\nEdit Mode: ${this.isEditMode}\nQuotation ID: ${this.model.quotationId}\n\nThe quotation ID field should now be visible and frozen.`);
  }

  // Method to force tax calculation update
  updateTaxCalculations() {
    // Force recalculation of all tax amounts
    this.calculateTotals();
    
    // Log for debugging
    console.log('Tax calculations updated:');
    console.log('Total CGST:', this.getTotalCGST());
    console.log('Total SGST:', this.getTotalSGST());
    console.log('Total IGST:', this.getTotalIGST());
    console.log('Total Tax Amount:', this.getTotalTaxAmount());
  }

  // Add this method for debugging purposes
  debugQuotationFixedIssues() {
    console.log('=== QUOTATION FIXED ISSUES DEBUG ===');
    console.log('1. Quote Valid Till field:');
    console.log('   - Value:', this.model.quoteValidTill);
    console.log('   - Type:', typeof this.model.quoteValidTill);
    
    console.log('2. Tax Type and Tax Amount for each item:');
    this.model.quotationItems?.forEach((item: any, index: number) => {
      console.log(`   Item ${index + 1}:`, {
        name: item.actionItemName,
        taxType: item.tax_type,
        qty: item.qty,
        price: item.itemPrice,
        taxAmount: this.getLineTaxAmount(item)
      });
    });
    
    console.log('3. Total Tax Amount:');
    console.log('   - Calculated:', this.getTotalTaxAmount());
    console.log('   - Total CGST:', this.getTotalCGST());
    console.log('   - Total SGST:', this.getTotalSGST());
    console.log('   - Total IGST:', this.getTotalIGST());
    
    console.log('4. Field Alignment:');
    console.log('   - Edit Mode:', this.isEditMode);
    console.log('   - RFQ ID:', this.model.rfqId);
    console.log('   - Quotation ID:', this.model.quotationId);
    
    console.log('=== END DEBUG ===');
    
    // Show summary in alert
    const summary = `
Fixed Issues Status:
1. Quote Valid Till: ${this.model.quoteValidTill ? 'Filled ✓' : 'Empty ✗'}
2. Tax Types Filled: ${this.model.quotationItems?.filter((item: any) => item.tax_type && item.tax_type !== 'No Tax').length || 0} items
3. Total Tax Amount: ${this.getTotalTaxAmount()} ${this.model.currency}
4. Edit Mode: ${this.isEditMode ? 'Active ✓' : 'Inactive'}

Check console for detailed information.
    `;
    
    this.sweetAlert.info(summary);
  }

  // Method to get total quantity from all quotation items
  getTotalQuantity(): number {
    if (!this.model.quotationItems || this.model.quotationItems.length === 0) {
      return 0;
    }
    
    return this.model.quotationItems.reduce((total: number, item: any) => {
      const quantity = Number(item.qty) || 0;
      return total + quantity;
    }, 0);
  }

  // Method to get discount variable - returns discount_percentage if percentage type, otherwise discount_amount
  getDiscountVariable(): number {
    if (this.discountType === 'percentage' && this.discountValue > 0) {
      return this.discountValue; // Return percentage value
    } else if (this.discountType === 'amount' && this.discountValue > 0) {
      return this.discountValue; // Return amount value
    }
    return 0;
  }
}
