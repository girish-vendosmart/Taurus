import { Component, Input, Output, EventEmitter, OnInit, ViewChild, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CalendarModule } from 'primeng/calendar';
import { DateFormatPipe } from '../../pipes/date-format.pipe';

export interface ActionButton {
  label?: string;
  action: string;
  class?: string;
  icon?: string;
  iconOnly?: boolean;
  tooltip?: string;
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
}

export interface FilterOption {
  label: string;
  value: any;
}

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'dateRange' | 'dropdown' | 'multiselect';
  filterOptions?: FilterOption[];
  isLink?: boolean;
  routerLink?: string;
  routerLinkField?: string;
  isStatus?: boolean;
  isAction?: boolean;
  isHtml?: boolean;
  customTemplate?: boolean;
  width?: string;
  actions?: ActionButton[];
}

export interface TableConfig {
  columns: TableColumn[];
  enableSearch?: boolean;
  enableSort?: boolean;
  enableFilter?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  showActions?: boolean;
  actionButtons?: ActionButton[];
  enableColumnHide?: boolean 
  enableColumnResize?: boolean;
}

// Add default status options at the top level
const DEFAULT_STATUS_OPTIONS: FilterOption[] = [
  { label: 'Draft', value: 'Draft' },
  { label: 'Awarded', value: 'Awarded' },
  { label: 'Under Review', value: 'Under Review' },
  { label: 'Submitted', value: 'Submitted' },
  { label: 'Quoted', value: 'Quoted' }
];

@Component({
  selector: 'app-common-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    BadgeModule,
    InputTextModule,
    ButtonModule,
    TagModule,
    DropdownModule,
    MultiSelectModule,
    OverlayPanelModule,
    CalendarModule,
    DateFormatPipe
  ],
  templateUrl: './common-table.component.html',
  styleUrl: './common-table.component.scss'
})
export class CommonTableComponent implements OnInit, AfterViewInit {
  @ViewChild('dt') table!: Table;
  
  // Make Math available in template
  Math = Math;
  
  constructor() {}

  @Input() config: TableConfig = {
    columns: [
      { 
        field: 'company', 
        header: 'Company', 
        sortable: true, 
        filterable: true, 
        isLink: true,
        routerLink: '/company-details',
        routerLinkField: 'companyId'
      },
      { 
        field: 'contact', 
        header: 'Contact', 
        sortable: true, 
        filterable: true
      },
      { 
        field: 'status', 
        header: 'Status', 
        sortable: true, 
        filterable: true, 
        isStatus: true
      },
      {
        field: 'actions',
        header: 'Actions',
        sortable: false,
        filterable: false,
        isAction: true,
        width: '180px'
      }
    ],
    enableSearch: true,
    enableSort: true,
    enableFilter: true,
    enablePagination: true,
    pageSize: 5,
    showActions: true,
    enableColumnHide: true,
    enableColumnResize: true,
    actionButtons: [
      { 
        label: 'View', 
        action: 'view', 
        class: 'view-btn',
        icon: 'pi pi-eye',
        severity: 'secondary'
      },
      { 
        label: 'Quote', 
        action: 'quote', 
        class: 'quote-btn',
        icon: 'pi pi-file-edit',
        severity: 'primary'
      },
      // {
      //   action: 'delete',
      //   class: 'delete-btn',
      //   icon: 'pi pi-trash',
      //   iconOnly: true,
      //   tooltip: 'Delete',
      //   severity: 'danger'
      // }
    ]
  };

  @Input() data: any[] = [];
  @Input() loading: boolean = false;

  @Output() rowClick = new EventEmitter<any>();
  @Output() linkClick = new EventEmitter<{rowData: any, column: TableColumn, event: any}>();
  @Output() actionClick = new EventEmitter<{action: string, rowData: any}>();

  // Search state
  globalFilterFields: string[] = [];
  searchValue: string = '';
  
  // Sorting state
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0: none, 1: asc, -1: desc

  // Column visibility and resize state
  visibleColumns: TableColumn[] = [];
  selectedColumns: any[] = [];
  columnOptions: any[] = [];
  
  // Column resizing
  isResizing = false;
  resizingColumn: string = '';
  startX = 0;
  startWidth = 0;

  // Filter states
  dateRangeFilters: any = {};
  dropdownFilters: { [key: string]: any } = {};

  ngOnChanges(changes: SimpleChanges) {
    
    console.log('changes', changes);
  }

  ngOnInit() {
    // Initialize filter fields
    this.globalFilterFields = this.config.columns
      .filter(col => col.filterable)
      .map(col => col.field);
    
    // Initialize column visibility
    this.initializeColumnVisibility();
    
    // Initialize filters
    this.initializeFilters();

    // Set default filter options for status columns
    this.config.columns.forEach(col => {
      if (col.isStatus && !col.filterType) {
        col.filterType = 'dropdown';
        col.filterOptions = DEFAULT_STATUS_OPTIONS;
      }
    });

    // Initialize date range filters
    this.config.columns.forEach(col => {
      if (col.filterable && col.filterType === 'dateRange') {
        this.dateRangeFilters[col.field] = [];
      }
    });
  }

  ngAfterViewInit() {
    // Register custom filter match mode for date ranges
    if (this.table && this.table.filterService) {
      this.table.filterService.register('dateRange', (value: any, filter: any): boolean => {
        if (!filter || (!filter.startDate && !filter.dates)) {
          return true;
        }

        if (!value) {
          return false;
        }

        // Parse the date value from various formats
        const dateValue = this.parseDateFromString(value);
        if (!dateValue) {
          return false;
        }

        // Set time to start of day for comparison
        dateValue.setHours(0, 0, 0, 0);

        let startDate: Date, endDate: Date;
        
        if (filter.dates && Array.isArray(filter.dates)) {
          // Handle array of dates from calendar
          startDate = new Date(filter.dates[0]);
          endDate = filter.dates[1] ? new Date(filter.dates[1]) : startDate;
        } else {
          // Handle single date or date range object
          startDate = new Date(filter.startDate);
          endDate = filter.endDate ? new Date(filter.endDate) : startDate;
        }

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        return dateValue >= startDate && dateValue <= endDate;
      });
    }
  }

  initializeColumnVisibility() {
    this.visibleColumns = [...this.config.columns];
    this.columnOptions = this.config.columns.map(col => ({
      label: col.header,
      value: col.field,
      column: col
    }));
    this.selectedColumns = this.columnOptions.map(opt => opt.value);
  }

  onColumnSelectionChange() {
    this.visibleColumns = this.config.columns.filter(col => 
      this.selectedColumns.includes(col.field)
    );
  }

  getVisibleColumns(): TableColumn[] {
    return this.visibleColumns;
  }

  // Column resizing methods
  onResizeStart(event: MouseEvent, column: string) {
    if (!this.config.enableColumnResize) return;
    
    this.isResizing = true;
    this.resizingColumn = column;
    this.startX = event.clientX;
    
    const headerCell = (event.target as HTMLElement).closest('.header-cell') as HTMLElement;
    if (headerCell) {
      this.startWidth = headerCell.offsetWidth;
    }
    
    // Add class to prevent text selection
    document.body.classList.add('resizing');
    
    document.addEventListener('mousemove', this.onResize.bind(this));
    document.addEventListener('mouseup', this.onResizeEnd.bind(this));
    
    event.preventDefault();
  }

  onResize(event: MouseEvent) {
    if (!this.isResizing) return;
    
    const diff = event.clientX - this.startX;
    const newWidth = Math.max(100, this.startWidth + diff); // Minimum width of 100px
    
    const column = this.config.columns.find(col => col.field === this.resizingColumn);
    if (column) {
      column.width = `${newWidth}px`;
    }
  }

  onResizeEnd() {
    this.isResizing = false;
    this.resizingColumn = '';
    
    // Remove class to re-enable text selection
    document.body.classList.remove('resizing');
    
    document.removeEventListener('mousemove', this.onResize.bind(this));
    document.removeEventListener('mouseup', this.onResizeEnd.bind(this));
  }

  onRowClick(event: any, rowData: any) {
    this.rowClick.emit({ event, rowData });
  }

  onLinkClick(event: any, rowData: any, column: TableColumn) {
    event.preventDefault();
    event.stopPropagation();
    this.linkClick.emit({ rowData, column, event });
  }

  onActionClick(action: string, rowData: any, event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.actionClick.emit({ action, rowData });
  }

  getStatusSeverity(status: string): 'success' | 'warning' | 'danger' | 'info' {
    status = status.toLowerCase();
    switch (status) {
      case 'approved':
      case 'closed':
        return 'success';
      case 'under review':
      case 'in progress':
        return 'warning';
      case 'request to resubmit':
        return 'danger';
      case 'open':
        return 'info';
      default:
        return 'info';
    }
  }

  getStatusClass(status: string): string {
    if (this.isEmptyValue(status)) return 'status-default';
    
    // Convert to lowercase and replace spaces with hyphens
    status = status.toLowerCase().replace(/\s+/g, '-');
    
    switch (status) {
      case 'missing-data':
        return 'status-review';
      case 'complete':
        return 'status-approved'
      case 'not-opened':
        return 'status-draft';
      case 'published':
        return 'status-approved';
      case 'deactivated':
        return 'status-paused'; 
      case 'invited':
        return 'status-open';
      case 'not-started':
        return 'status-draft';
      case 'under-review':
        return 'status-review';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'draft':
        return 'status-draft';
      case 'open':
        return 'status-open';
      case 'in-progress':
        return 'status-progress';
      case 'closed':
        return 'status-closed';
      case 'awarded':
        return 'status-awarded';
      case 'quoted':
        return 'status-awarded';
      case 'opened':
        return 'status-open';
      case 'cancelled':
        return 'status-rejected';
      case 'deactivate':
        return 'status-deactivate';
      case 'paused':
        return 'status-paused';
      case 'submitted':
        return 'status-awarded';
      case 'pending':
        return 'status-pending';
      case 'review':
        return 'status-review';
      case 'not-started':
        return 'status-draft';
      default:
        return 'status-default';
    }
  }

  formatStatusText(status: string): string {
    if (this.isEmptyValue(status)) return '-------';
    
    // Split by spaces or hyphens and capitalize each word
    return status
      .toLowerCase()
      .split(/[\s-]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  sortTable(field: string) {
    if (this.table) {
      if (this.currentSortField === field) {
        // Cycle through: none -> asc -> desc -> none
        this.currentSortOrder = this.currentSortOrder === 1 ? -1 : this.currentSortOrder === -1 ? 0 : 1;
      } else {
        // New field, start with ascending
        this.currentSortField = field;
        this.currentSortOrder = 1;
      }

      if (this.currentSortOrder === 0) {
        // Reset sorting
        this.table.reset();
        this.currentSortField = '';
      } else {
        this.table.sortField = field;
        this.table.sortOrder = this.currentSortOrder;
        this.table.sortSingle();
      }
    }
  }

  getSortIcon(field: string): string {
    if (this.currentSortField !== field || this.currentSortOrder === 0) {
      return 'pi pi-sort-alt';
    }
    return this.currentSortOrder === 1 ? 'pi pi-sort-amount-up-alt' : 'pi pi-sort-amount-down-alt';
  }

  getActionButtons(): ActionButton[] {
    return this.config.actionButtons || [];
  }

  getRouterLink(column: TableColumn, rowData: any): string {
    if (!column.routerLink) return '';
    
    if (column.routerLinkField) {
      const fieldValue = rowData[column.routerLinkField];
      if (this.isEmptyValue(fieldValue)) return '';
      return `${column.routerLink}/${fieldValue}`;
    }
    
    return column.routerLink;
  }

  getSubInfo(field: string, rowData: any): string {
    // Handle contact fields
    if (field === 'primary_email_id' && rowData.contactSubInfo) {
      return rowData.contactSubInfo;
    }
    if (field === 'primary_email_id' && rowData.primary_phone_number) {
      return rowData.primary_phone_number;
    }
    if (field === 'supplier_email_id' && rowData.contactSubInfo) {
      return rowData.contactSubInfo;
    }
    
    // Handle company fields
    if (field === 'company_name' && rowData.companySubInfo) {
      return rowData.companySubInfo;
    }
    if (field === 'company_name' && rowData.name) {
      return rowData.name;
    }
    
    return '';
  }

  getSeverityClass(severity?: string): string {
    switch (severity) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'success':
        return 'btn-success';
      case 'info':
        return 'btn-info';
      case 'warning':
        return 'btn-warning';
      case 'danger':
        return 'btn-danger';
      default:
        return 'btn-default';
    }
  }

  getCurrentPage(): number {
    if (!this.table || this.table.first === undefined || this.table.first === null || this.table.rows === undefined) return 1;
    return Math.floor(this.table.first / this.table.rows) + 1;
  }

  getTotalPages(): number {
    if (!this.table || this.table.rows === undefined) return 1;
    const totalRecords = this.data.length;
    return Math.ceil(totalRecords / this.table.rows);
  }

  isFirstPage(): boolean {
    if (!this.table || this.table.first === undefined || this.table.first === null) return true;
    return this.table.first === 0;
  }

  isLastPage(): boolean {
    if (!this.table || this.table.first === undefined || this.table.first === null || this.table.rows === undefined) return true;
    const totalRecords = this.data.length;
    return this.table.first + this.table.rows >= totalRecords;
  }

  goToPreviousPage(): void {
    if (!this.table || this.isFirstPage()) return;
    const newFirst = Math.max(0, (this.table.first || 0) - (this.table.rows || 10));
    this.table.first = newFirst;
    this.table.onPageChange({
      first: newFirst,
      rows: this.table.rows || 10
    });
  }

  goToNextPage(): void {
    if (!this.table || this.isLastPage()) return;
    const newFirst = (this.table.first || 0) + (this.table.rows || 10);
    const totalRecords = this.data.length;
    if (newFirst < totalRecords) {
      this.table.first = newFirst;
      this.table.onPageChange({
        first: newFirst,
        rows: this.table.rows || 10
      });
    }
  }

  initializeFilters() {
    this.config.columns.forEach(col => {
      if (col.filterable) {
        if (col.filterType === 'dateRange') {
          this.dateRangeFilters[col.field] = [];
        } else if (col.filterType === 'dropdown') {
          this.dropdownFilters[col.field] = null;
        }
      }
    });
  }

  private parseDateFromString(dateStr: string | Date): Date | null {
    if (!dateStr) return null;
    
    try {
      // If already a Date object, return it
      if (dateStr instanceof Date) {
        return dateStr;
      }
      
      // Handle different date formats
      if (typeof dateStr === 'string') {
        // Remove extra whitespace and normalize
        const cleanDateStr = dateStr.trim();
        
        // Try parsing with different formats
        let date: Date | null = null;
        
        // Format: "DD MMM YYYY, HH:mm" or "DD MMM YYYY"
        if (cleanDateStr.includes(',')) {
          const [datePart] = cleanDateStr.split(',');
          date = new Date(datePart.trim());
        } else {
          // Try standard date parsing
          date = new Date(cleanDateStr);
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          // Try alternative parsing for formats like "DD-MM-YYYY" or "DD/MM/YYYY"
          const datePatterns = [
            /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/,  // DD/MM/YYYY or DD-MM-YYYY
            /^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/   // YYYY/MM/DD or YYYY-MM-DD
          ];
          
          for (const pattern of datePatterns) {
            const match = cleanDateStr.match(pattern);
            if (match) {
              // Assume first pattern is DD/MM/YYYY, second is YYYY/MM/DD
              if (pattern === datePatterns[0]) {
                date = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
              } else {
                date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
              }
              break;
            }
          }
        }
        
        return (date && !isNaN(date.getTime())) ? date : null;
      }
      return null;
    } catch (error) {
      console.error('Error parsing date:', dateStr, error);
      return null;
    }
  }

  onDateRangeChange(field: string, dates: Date[] | Date | null) {
    console.log('Date range changed for field:', field, 'dates:', dates);
    
    let dateArray: Date[] = [];
    
    if (Array.isArray(dates)) {
      // Filter out null/undefined values and ensure we have valid dates
      dateArray = dates.filter(date => date != null && date instanceof Date);
    } else if (dates instanceof Date) {
      dateArray = [dates];
    } else if (dates === null || dates === undefined) {
      // Handle clear case
      dateArray = [];
    }
    
    // Update the filter state
    this.dateRangeFilters[field] = dateArray;
    
    // Apply the filter
    this.applyDateRangeFilter(field, dateArray);
  }

  applyDateRangeFilter(field: string, dates: Date[]) {
    console.log('Applying date range filter for field:', field, 'dates:', dates);
    
    if (!this.table) {
      console.error('Table reference not available');
      return;
    }

    if (!dates || dates.length === 0) {
      // Clear filter if no dates
      this.table.filter(null, field, 'equals');
      return;
    }

    // Filter by date range using custom filter
    this.table.filter({ dates }, field, 'dateRange');
  }

  onDropdownChange(field: string, value: any) {
    if (this.table) {
      if (value === null || value === undefined) {
        this.table.filter('', field, 'equals');
      } else {
        this.table.filter(value, field, 'equals');
      }
    }
  }

  clearDateRangeFilter(field: string) {
    console.log('Clearing date range filter for field:', field);
    this.dateRangeFilters[field] = [];
    if (this.table) {
      this.table.filter(null, field, 'equals');
    }
  }

  clearDropdownFilter(field: string) {
    console.log('Clearing dropdown filter:', field);
    this.dropdownFilters[field] = null;
    if (this.table) {
      this.table.filter(null, field, 'equals');
    }
  }

  getFilterOptions(column: TableColumn): FilterOption[] {
    if (column.isStatus) {
      return DEFAULT_STATUS_OPTIONS;
    }
    return column.filterOptions || [];
  }

  /**
   * Checks if a value is empty (null, undefined, empty string, or only whitespace)
   */
  isEmptyValue(value: any): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    return false;
  }

  /**
   * Gets the display value for a cell, returning "-------" for empty values
   */
  getCellDisplayValue(value: any): string {
    return this.isEmptyValue(value) ? '-------' : String(value);
  }
}
