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
        bidType: 'bid',
        itemPrice: 0,
        taxType: 'none',
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
  selectedTaxType: string = 'none'; // 'cgstSgst', 'igst', or 'none'

  // Attachment properties
  attachedFiles: string[] = [];

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
    { label: 'Bid', value: 'bid' },
    { label: 'No Bid', value: 'no-bid' }
  ];

  taxTypeOptions = [
    { label: 'No Tax', value: 'none' },
    { label: 'CGST & SGST', value: 'cgstSgst' },
    { label: 'IGST', value: 'igst' }
  ];

  @ViewChild('csvFileInput', { static: false }) csvFileInput!: ElementRef;
  @ViewChild('attachmentFileInput', { static: false }) attachmentFileInput!: ElementRef;
  quoteFrom: any;
  quoteTo: any;

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
        this.quotationId = params['quotationId'];
        console.log('Edit mode activated for quotation:', this.quotationId);
        this.loadQuotationForEdit(this.quotationId);
      } else {
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
          quoteValidTill: this.parseApiDate(createQuotationData.validity),
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
          this.discountValue = createQuotationData.discount_amount;
        } else {
          this.discountType = 'percentage';
          this.discountValue = createQuotationData.discount_percentage || 0;
        }
        this.shippingCharges = createQuotationData.shipping_charges || 0;

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
      
      return {
        actionItemName: item.item_code || '',
        description: this.stripHtmlTags(item.item_description || ''),
        material: parsedComments.material || '',
        qty: item.quantity || 0,
        unit: item.unit || 'Pieces',
        itemPrice: item.unit_price || 0,
        taxType: item.taxType || 'none',
        miscellaneous: this.buildMiscellaneousFromComments(parsedComments),
        tooling: parsedComments.processRequired || '',
        bidType: item.bidType || 'bid'
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
  }

  onBidTypeChange(item: any) {
    if (item.bidType === 'no-bid') {
      item.itemPrice = 0;
    }
    this.calculateTotals();
  }

  onItemTaxTypeChange(item: any) {
    // Recalculate totals when tax type changes for any item
    this.calculateTotals();
  }

  // Methods to get aggregated tax amounts from all line items
  getTotalCGST(): number {
    return this.model.quotationItems?.reduce((total: number, item: any) => {
      if (item.taxType === 'cgstSgst') {
        const itemTotal = (item.qty || 0) * (item.itemPrice || 0);
        return total + (itemTotal * 0.09); // 9% CGST
      }
      return total;
    }, 0) || 0;
  }

  getTotalSGST(): number {
    return this.model.quotationItems?.reduce((total: number, item: any) => {
      if (item.taxType === 'cgstSgst') {
        const itemTotal = (item.qty || 0) * (item.itemPrice || 0);
        return total + (itemTotal * 0.09); // 9% SGST
      }
      return total;
    }, 0) || 0;
  }

  getTotalIGST(): number {
    return this.model.quotationItems?.reduce((total: number, item: any) => {
      if (item.taxType === 'igst') {
        const itemTotal = (item.qty || 0) * (item.itemPrice || 0);
        return total + (itemTotal * 0.18); // 18% IGST
      }
      return total;
    }, 0) || 0;
  }

  // Method to get total tax amount from all line items
  getTotalTaxAmount(): number {
    return this.getTotalCGST() + this.getTotalSGST() + this.getTotalIGST();
  }

  // Method to get tax amount for a specific line item
  getLineTaxAmount(item: any): number {
    const itemTotal = (item.qty || 0) * (item.itemPrice || 0);
    if (item.taxType === 'cgstSgst') {
      return itemTotal * 0.18; // 9% CGST + 9% SGST = 18%
    } else if (item.taxType === 'igst') {
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
      if (taxType === 'cgstSgst') {
        this.model.cgstSgst = true;
      } else if (taxType === 'igst') {
        this.model.igst = true;
      }
      // 'none' case: both remain false
    }
    
    this.calculateTotals();
  }

  // Method to handle currency change
  onCurrencyChange() {
    // If currency is changed to USD, reset tax options
    if (this.model.currency === 'USD') {
      this.selectedTaxType = 'none';
      this.model.cgstSgst = false;
      this.model.igst = false;
    } else if (this.model.currency === 'INR' && this.selectedTaxType === 'none') {
      // If currency is changed to INR and no tax was selected, you might want to set a default
      // Uncomment the following line if you want to default to 'none' for INR as well
      // this.selectedTaxType = 'none';
    }
    
    this.calculateTotals();
  }

  onSubmit() {
    // Check if basic required fields are filled
    const isBasicValidation = this.model.termsAndConditions && this.model.totalLeadTime;
    
    // Check email only if no RFQ ID (when field is visible)
    const isEmailValidation = !this.model.rfqId ? this.model.email : true;
    
    if (this.form.valid && isBasicValidation && isEmailValidation) {
      // Transform data to API format
      const apiData = this.transformToApiFormat();
      
      // Validate API data
      const validation = this.validateApiData(apiData);
      
      if (!validation.isValid) {
        this.sweetAlert.warning(`Some fields may be missing: ${validation.missingFields.join(', ')}`);
        console.warn('Missing API fields:', validation.missingFields);
      }

      debugger
      console.log("Api Data ", apiData);
      
      if (this.isEditMode) {
        this.updateExistingQuotation(apiData);
      } else {
        // Create new quotation
        this.createNewQuotation(apiData);
      }
    } else {
      let errorMessage = 'Please fill all required fields';
      
      // More specific error messages
      if (!this.model.termsAndConditions) {
        errorMessage = 'Terms & Conditions is required';
      } else if (!this.model.totalLeadTime) {
        errorMessage = 'Total Lead Time is required';
      } else if (!this.model.rfqId && !this.model.email) {
        errorMessage = 'Email is required';
      }
      
      this.sweetAlert.error(errorMessage);
    }
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
    let endpoint = `/api/resource/Supplier Quotation`

    this.commonService.postWefabData(endpoint, apiData).subscribe((res: any) => {
      console.log('Quotation created successfully:', res);
      this.sweetAlert.success('Quotation sent successfully!');
      this.router.navigate(['/wefab/supplier/quotation/details', res.data.name]);
    })
  }

  // Transform current form data to API expected format
  transformToApiFormat(): any {
    const apiData = {
      rfq_id: this.getRfqId(),
      supplier_id: this.getSupplierId(),
      estimated_completion_duration: `${this.model.totalLeadTime} days`,
      validity: this.formatDateForApi(this.model.quoteValidTill),
      delivery_address: this.getDeliveryAddress(),
      quotation_from: this.quoteFrom,
      quotation_to: this.quoteTo,
      discount_type: this.discountType === 'percentage' ? 'Percentage' : 'Amount',
      discount_percentage: this.discountType === 'percentage' ? this.discountValue : 0,
      discount_amount: this.discountType === 'amount' ? this.discountValue : 0,
      shipping_charges: this.shippingCharges || 0,
      payment_terms: this.model.paymentTerms,
      shipping_terms: this.getShippingTerms(),
      notes: `<p>${this.model.termsAndConditions}</p>`,
      igst_applicable: this.selectedTaxType === 'igst',
      sgst_cgst_applicable: this.selectedTaxType === 'cgstSgst',
      items: this.transformQuotationItems(),
      attachments: this.transformAttachments()
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
        comments: this.buildItemComments(item),
        bidType: item.bidType || 'bid',
        taxType: item.taxType || 'none'
      };
    });
  }

  // Transform attachments to API format
  transformAttachments(): any[] {
    return this.attachedFiles.map((fileUrl: string) => ({
      file_name: this.getFileNameFromUrl(fileUrl),
      file_url: fileUrl,
      description: this.getFileDescriptionFromUrl(fileUrl)
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

  exportCSV() {
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
        `"${item.taxType || 'none'}"`,
        this.getLineTaxAmount(item),
        `"${(item.miscellaneous || '').replace(/"/g, '""')}"`,
        `"${(item.tooling || '').replace(/"/g, '""')}"`,
        `"${item.bidType || 'bid'}"`,
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
    const lines = csvContent.split('\n');
    
    // Skip header row and filter out empty lines
    const dataLines = lines.slice(1).filter(line => line.trim() !== '');
    
    if (dataLines.length === 0) {
      this.sweetAlert.warning('No data found in CSV file.');
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
            unit: values[5] || 'Nos',
            itemPrice: parseFloat(values[6]) || 0,
            taxType: values[7] || 'none',
            miscellaneous: values[9] || '',
            tooling: values[10] || '',
            bidType: values[11] || 'bid'
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
      this.sweetAlert.success(`Successfully imported ${importedItems.length} quotation items from CSV.`);
    } else {
      this.sweetAlert.error('No valid data could be imported from the CSV file.');
    }
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
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
    }
    
    result.push(current.trim());
    return result;
  }

  storeCurrentStateForReset() {
    this.originalQuotationItems = JSON.parse(JSON.stringify(this.model.quotationItems));
  }

  resetTableConfirmation() {
    this.sweetAlert.confirm('Are you sure you want to reset the table?', 'Reset Table', 'question', 'Yes', 'No').then((result: any) => {
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
          taxType: 'none',
          miscellaneous: '',
          tooling: '',
          bidType: 'bid'
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
          shippingCharges: quotationData.shipping_charges || 0,
          totalAmount: quotationData.grand_total || 0
        };

        // Set discount and shipping charges for calculations
        if (quotationData.discount_type === 'Amount' && quotationData.discount_amount) {
          this.discountType = 'amount';
          this.discountValue = quotationData.discount_amount;
        } else {
          this.discountType = 'percentage';
          this.discountValue = quotationData.discount_percentage || 0;
        }
        this.shippingCharges = quotationData.shipping_charges || 0;

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
        taxType: item.taxType || 'none',
        miscellaneous: parsedComments.miscellaneous || '',
        tooling: parsedComments.tooling || '',
        bidType: item.bidType || 'bid'
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
          this.uploadFileOnS3(file)
          // this.attachedFiles.push(file);
        } else {
          this.sweetAlert.warning(`File "${file.name}" is not supported. Please use PDF, DOC, DOCX, JPG, PNG, TXT, or XLSX files.`);
        }
      }
    }
  }

  uploadFileOnS3(file: File) {
    this.commonService.uploadFile(file).subscribe((res: any) => {
      if(res.body && res.body.message) {
         debugger
         console.log("file Uploaded Successfully ", res.body.message.file_url)
         this.attachedFiles.push(res.body.message.file_url)
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
          this.uploadFileOnS3(file)
        } else {
          this.sweetAlert.warning(`File "${file.name}" is not supported. Please use PDF, DOC, DOCX, JPG, PNG, TXT, or XLSX files.`);
        }
      }
    }
  }

  removeAttachment(index: number) {
    this.attachedFiles.splice(index, 1);
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
    this.attachedFiles = [
      "https://s3.ap-south-1.amazonaws.com/www.vendosmart.com/ap-south-1/2025/05/30/File/SS0E29F5_Screenshot_from_2025-05-30_11-38-14.png",
      "https://s3.ap-south-1.amazonaws.com/www.vendosmart.com/ap-south-1/2025/05/30/File/TVX4YE51_Screenshot_from_2025-05-30_12-57-47.png",
      "https://s3.ap-south-1.amazonaws.com/www.vendosmart.com/ap-south-1/2025/05/30/File/ABC123_Technical_Specifications.pdf",
      "https://s3.ap-south-1.amazonaws.com/www.vendosmart.com/ap-south-1/2025/05/30/File/XYZ789_Project_Details.docx"
    ];
    this.sweetAlert.info('Sample file attachments have been added for testing');
  }
}
