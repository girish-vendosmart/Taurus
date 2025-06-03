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
import { TooltipModule } from 'primeng/tooltip';
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
    TooltipModule,
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

    .table-input-field {
      font-size: 13px !important;
      height: 32px !important;
      border-radius: 4px;
    }

    .table-input-field .p-inputtext {
      font-size: 13px !important;
      height: 32px !important;
    }

    .table-input-field .p-dropdown {
      height: 32px !important;
    }

    .table-input-field .p-dropdown .p-dropdown-label {
      font-size: 13px !important;
      padding-top: 6px !important;
      padding-bottom: 6px !important;
      line-height: 20px !important;
    }

    .table-input-field .p-dropdown .p-dropdown-trigger {
      height: 32px !important;
    }

    .table-input-field .p-inputnumber input {
      font-size: 13px !important;
      height: 32px !important;
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
    currency_code: 'USD',
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
        no_bid: 0,
        itemPrice: 0,
        tax_type: 'Non-Taxable',
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

  taxTypeOptions = [
    { label: 'Non-Taxable', value: 'Non-Taxable' },
    { label: 'GST0 [0%]', value: 'GST0 [0%]' },
    { label: 'GST5 [5%]', value: 'GST5 [5%]' },
    { label: 'GST12 [12%]', value: 'GST12 [12%]' },
    { label: 'GST18 [18%]', value: 'GST18 [18%]' },
    { label: 'GST28 [28%]', value: 'GST28 [28%]' },
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
    
    // Extract and set RFQ ID from URL
    this.extractRfqIdFromUrl();
    
    this.initializeForm();
    this.calculateTotals();
    
    // Store initial state for reset functionality
    this.storeCurrentStateForReset();
    
    // Listen for route parameter changes to update RFQ ID dynamically
    this.route.params.subscribe(params => {
      if (params['rfqId'] && params['rfqId'] !== this.model.rfqId) {
        
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
          currency_code: createQuotationData.items?.[0]?.currency_code || 'USD',
          email: 'email@example.com', // This might come from user/supplier data
          reference: createQuotationData.quotation_id || '',
          termsAndConditions: this.stripHtmlTags(createQuotationData.notes || ''),
          deliveryAddress: this.parseAddressFromQuotationTo(createQuotationData.quotation_to),
          shippingTerms: createQuotationData.shipping_terms || 'FOB Origin',
          cgstSgst: createQuotationData.sgst_cgst_applicable === 1,
          igst: createQuotationData.igst_applicable === 1,
          quotationItems: this.transformCreateQuotationItemsToModel(createQuotationData.items || []),
          subTotal: createQuotationData.total_amount || 0,
          discount: this.discountValue, // Use the processed discount value
          shippingCharges: createQuotationData.shipping_charges || 0,
          totalAmount: createQuotationData.grand_total || 0
        };

        // Set discount and shipping charges for calculations
        // First check if there's a discount variable, then check individual fields
        if (createQuotationData.discount && createQuotationData.discount > 0) {
          // Use the discount variable and determine type from discount_type
          if (createQuotationData.discount_type === 'Amount') {
            this.discountType = 'amount';
            this.discountValue = createQuotationData.discount;
          } else {
            this.discountType = 'percentage';
            this.discountValue = createQuotationData.discount;
          }
        } else if (createQuotationData.discount_type === 'Amount' && createQuotationData.discount_amount) {
          this.discountType = 'amount';
          this.discountValue = createQuotationData.discount_amount;
        } else if (createQuotationData.discount_percentage) {
          this.discountType = 'percentage';
          this.discountValue = createQuotationData.discount_percentage;
        } else {
          this.discountType = 'percentage';
          this.discountValue = 0;
        }
        this.shippingCharges = createQuotationData.shipping_charges || 0;

        console.log('Discount prefilled values:', {
          discountType: this.discountType,
          discountValue: this.discountValue,
          discountVariable: createQuotationData.discount,
          discountPercentage: createQuotationData.discount_percentage,
          discountAmount: createQuotationData.discount_amount,
          discountTypeFromAPI: createQuotationData.discount_type
        });

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

        // Ensure discount field is properly updated in the UI
        setTimeout(() => {
          this.updateTaxCalculations();
          console.log('Post-load discount state:', {
            discountType: this.discountType,
            discountValue: this.discountValue,
            modelDiscount: this.model.discount
          });
        }, 100);

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
      
      // Extract estimated rate if available (but don't use it for new quotations)
      const estimatedRate = this.extractEstimatedRate(item.comments || '');
      
      // Determine tax type based on currency and item properties
      let taxType = 'Non-Taxable';
      if (item.currency_code === 'INR') {
        if (item.igst_applicable || this.model.igst) {
          taxType = 'IGST [18%]';
        } else if (item.sgst_cgst_applicable || this.model.cgstSgst) {
          taxType = 'GST18 [18%]';
        }
      }
      
      // For new quotations, don't prefill item prices - let suppliers enter their own prices
      // Only prefill prices when editing existing quotations
      let itemPrice = 0;
      if (this.isEditMode && item.unit_price !== undefined && item.unit_price !== null) {
        itemPrice = item.unit_price;
      }
      // Note: We don't use estimatedRate for new quotations as suppliers should provide their own competitive pricing
      
      return {
        actionItemName: item.item_code || '',
        description: this.stripHtmlTags(item.item_description || ''),
        material: parsedComments.material || '',
        qty: item.quantity || 0,
        unit: item.unit || 'Nos',
        itemPrice: itemPrice,
        tax_type: taxType,
        miscellaneous: this.buildMiscellaneousFromComments(parsedComments),
        tooling: parsedComments.processRequired || 'Standard',
        no_bid: item.no_bid || 0
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
    
    // Update model with current values
    this.model.subTotal = this.subTotal;
    this.model.discount = this.discountValue; // Ensure model discount is synchronized
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

  // Method to calculate line total price (same as getRowTotal but with better naming for template)
  getLineTotalPrice(item: any): number {
    const quantity = Number(item.qty) || 0;
    const price = Number(item.itemPrice) || 0;
    return quantity * price;
  }

  onQuantityOrPriceChange(item: any) {
    this.calculateTotals();
    // Force change detection to update tax amounts in the table
    this.updateTaxAmounts();
  }

  onBidTypeChange(item: any) {
    if (item.no_bid === 1) {
      item.itemPrice = 0;
    }
    this.calculateTotals();
  }

  // Add method to handle No Bid checkbox change
  onNoBidChange(item: any, isNoBid: boolean) {
    if (isNoBid) {
      item.no_bid = 1;
      item.itemPrice = 0;
    } else {
      item.no_bid = 0;
      // Don't automatically set a price, let user enter it
    }
    this.calculateTotals();
    console.log('No Bid changed for item:', item.actionItemName, 'Is No Bid:', isNoBid);
  }

  // Helper method to check if item is No Bid
  isNoBid(item: any): boolean {
    return item.no_bid === 1;
  }

  // Helper method to get checkbox state for ngModel
  getNoBidCheckboxState(item: any): boolean {
    return item.no_bid === 1;
  }

  // Helper method to set checkbox state for ngModel
  setNoBidCheckboxState(item: any, value: boolean) {
    this.onNoBidChange(item, value);
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
      totalTax += this.getLineTaxAmount(item);
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
    
    const taxPercentage = this.getTaxPercentage(item.tax_type || 'Non-Taxable');
    return itemTotal * (taxPercentage / 100);
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
    if (this.model.currency_code === 'INR') {
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
    if (this.model.currency_code === 'USD') {
      this.selectedTaxType = 'No Tax';
      this.model.cgstSgst = false;
      this.model.igst = false;
    } else if (this.model.currency_code === 'INR' && this.selectedTaxType === 'No Tax') {
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

  updateExistingQuotation(apiData: any) {
    let endPoint = `/api/resource/Supplier Quotation/${this.quotationId}`

    this.commonService.putWefabData(endPoint, apiData).subscribe((res: any) => {
      console.log('Quotation updated successfully:', res);
      this.sweetAlert.success('Quotation Update successfully!');
      this.router.navigate(['/wefab/supplier/quotation/details', res.data.name]);
    })
  }




  private scrollToFirstError() {
    setTimeout(() => {
      const errorElement = document.querySelector('.is-invalid, .error-field');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

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

  private getSupplierId(): string {
    // You might get this from user session or service
    // For now, using a placeholder - in real app, get from authentication service
    return localStorage.getItem('supplierId') || 
           sessionStorage.getItem('supplierId') ||
           localStorage.getItem('supplier_id') || 
           sessionStorage.getItem('supplier_id') ||
           'f9m9s21tsu'; // Default supplier ID as fallback
  }

  private extractDaysFromDuration(duration: string): number {
    if (!duration) return 0;
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

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

  private stripHtmlTags(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  }

  storeCurrentStateForReset() {
    this.originalQuotationItems = JSON.parse(JSON.stringify(this.model.quotationItems));
  }

  loadQuotationForEdit(quotationId: string) {
    console.log('Loading quotation data for editing:', quotationId);
    // Implementation would go here
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

  // Add getter for unit options display
  get supportedUnitsDisplay(): string {
    return this.unitOptions.map(option => option.label).join(', ');
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

  downloadCSVTemplate() {
    const headers = [
      'S.No',
      'Item Name',
      'Description', 
      'Material',
      'Qty',
      'Unit',
      'Item Price',
      'Total Price',
      'Tax Type',
      'Taxable Amount',
      'Miscellaneous',
      'Tooling',
      'No Bid (0=Bid, 1=No Bid)'
    ];

    // Add sample data rows
    const sampleRows = [
      [1, 'Sample Item 1', 'Sample description', 'Steel', 10, 'Nos', 100, 1000, 'No Tax', '', 'Notes here', 'Standard', 0],
      [2, 'Sample Item 2', 'Another description', 'Aluminum', 5, 'Kg', 250.50, 1252.50, 'SGCT & CGST', '', 'Additional info', 'Required', 0],
      [3, 'Sample Item 3', 'Third item desc', 'Plastic', 20, 'Meter', 0, 0, '', '', 'No bid item', 'Not Required', 1]
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
          tax_type: 'Non-Taxable',
          miscellaneous: '',
          tooling: '',
          no_bid: 0
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

  importCSV() {
    // Store current state before import for potential reset
    this.storeCurrentStateForReset();
    
    // Use the ViewChild reference to trigger file selection
    if (this.csvFileInput) {
      this.csvFileInput.nativeElement.click();
    }
  }

  exportCSV() {
    console.log('Exporting CSV...');
    this.sweetAlert.info('CSV export functionality would be implemented here');
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      console.log('File selected:', file.name);
      this.sweetAlert.info('CSV import functionality would be implemented here');
    } else {
      this.sweetAlert.error('Please select a valid CSV file.');
    }
    
    // Reset the input to allow selecting the same file again
    event.target.value = '';
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

  // Integer input validation methods (no decimal points allowed)
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
    
    // Ensure that it is a number and stop the keypress (no decimal points)
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
    
    // Remove any non-numeric characters (no decimal points allowed)
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
    
    // Clean the pasted text to allow only integers (no decimal points)
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
        console.log('File selected:', file.name);
        // File processing would go here
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
        console.log('File dropped:', file.name);
        // File processing would go here
      }
    }
  }

  removeAttachment(index: number) {
    this.attachedFiles.splice(index, 1);
    this.attachedFileObjects.splice(index, 1);
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

    if (!this.model.currency_code) {
      errors.push('Currency selection is required');
      this.validationErrors['currency_code'] = ['Currency selection is required'];
    }

    if (!this.model.termsAndConditions || this.model.termsAndConditions.trim() === '') {
      errors.push('Terms & Conditions is required');
      this.validationErrors['termsAndConditions'] = ['Terms & Conditions is required'];
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  transformToApiFormat(): any {
    const calculatedDiscountAmount = this.getDiscountAmount();
    
    const apiData = {
      rfq_id: this.getRfqId(),
      quotation_name: this.model.quotationName,
      supplier_id: this.getSupplierId(),
      estimated_completion_duration: `${this.model.totalLeadTime} days`,
      validity: this.formatDateForApi(this.model.quoteValidTill),
      delivery_address: this.getDeliveryAddress(),
      quotation_from: this.quoteFrom,
      quotation_to: this.quoteTo,
      currency_code: this.model.currency_code,
      discount_type: this.discountType === 'percentage' ? 'Percentage' : 'Amount',
      discount_percentage: this.discountType === 'percentage' ? this.discountValue : 0,
      discount_amount: calculatedDiscountAmount,
      shipping_charges: this.shippingCharges || 0,
      total_tax_amount: this.getTotalTaxAmount(),
      sub_total: this.calculatedSubTotal,
      grand_total: this.calculatedTotalAmount,
      payment_terms: this.model.paymentTerms,
      shipping_terms: this.getShippingTerms(),
      notes: `<p>${this.model.termsAndConditions}</p>`,
      igst_applicable: this.selectedTaxType === 'IGST',
      sgst_cgst_applicable: this.selectedTaxType === 'SGCT & CGST',
      items: this.transformQuotationItems(),
      attachments: this.transformAttachments(),
    };

    return apiData;
  }

  transformQuotationItems(): any[] {
    return this.model.quotationItems.map((item: any, index: number) => {
      const unitPrice = item.itemPrice || 0;
      const quantity = item.qty || 0;
      const totalPrice = quantity * unitPrice;
      
      return {
        item_code: this.generateItemCode(item, index),
        item_description: item.description || item.actionItemName || '',
        quantity: quantity,
        unit: item.unit || 'Nos',
        currency_code: this.model.currency_code,
        unit_price: unitPrice,
        total_price: totalPrice,
        comments: this.buildItemComments(item),
        no_bid: item.no_bid || 0,
        tax_type: item.tax_type || 'Non-Taxable',
        tax_amount: this.getLineTaxAmount(item)
      };
    });
  }

  transformAttachments(): { file_url: string }[] {
    return this.attachedFileObjects
      .filter(fileObj => fileObj.url) // Only include files that have been uploaded
      .map((fileObj: any) => ({ file_url: fileObj.url }));
  }

  private getRfqId(): string {
    return this.model.rfqId || 'RFQ0001';
  }

  private getDeliveryAddress(): string {
    return this.model.deliveryAddress || 'Industrial Park Chicago-Shipping';
  }

  private getShippingTerms(): string {
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
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  // Add method to get tax percentage from tax type
  private getTaxPercentage(taxType: string): number {
    switch (taxType) {
      case 'Non-Taxable':
      case 'GST0 [0%]':
        return 0;
      case 'GST5 [5%]':
        return 5;
      case 'GST12 [12%]':
        return 12;
      case 'GST18 [18%]':
      case 'IGST [18%]':
        return 18;
      case 'GST28 [28%]':
      case 'IGST [28%]':
        return 28;
      default:
        return 0;
    }
  }
}
