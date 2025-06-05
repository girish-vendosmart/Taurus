import { Component, Input, Output, EventEmitter, OnInit, ViewChild, SimpleChanges } from '@angular/core';
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
    CalendarModule
  ],
  templateUrl: './common-table.component.html',
  styleUrl: './common-table.component.scss'
})
export class CommonTableComponent implements OnInit {
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
  dateRangeFilters: { [key: string]: Date[] } = {};
  dropdownFilters: { [key: string]: any } = {};

  // Sample data for demonstration
  sampleData = [];

  ngOnChanges(changes: SimpleChanges) {
    
    console.log('changes', changes);
  }

  ngOnInit() {
    this.globalFilterFields = this.config.columns
      .filter(col => col.filterable)
      .map(col => col.field);
    
    // Initialize column visibility
    this.initializeColumnVisibility();
    
    // Initialize filter states
    this.initializeFilters();
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
    if (!status) return 'status-default';
    
    status = status.toLowerCase();
    console.log('status', status);
    switch (status) {
      case 'Draft':
        return 'status-draft';
      case '':
        return 'status-open';
      case 'under review':
        return 'status-under-review';
      case 'approved':
        return 'status-approved';
      case 'closed':
        return 'status-closed';
      case 'request to resubmit':
        return 'status-resubmit';
      case 'in progress':
        return 'status-in-progress';
      case 'invited':
        return 'status-under-review'; // Use same styling as under review
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
      case 'rejected':
        return 'status-rejected';
      case 'pending':
        return 'status-pending';
      case 'review':
        return 'status-review';
      default:
        return 'status-default';
    }
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
      return `${column.routerLink}/${rowData[column.routerLinkField]}`;
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
    const totalRecords = this.data.length || this.sampleData.length;
    return Math.ceil(totalRecords / this.table.rows);
  }

  isFirstPage(): boolean {
    if (!this.table || this.table.first === undefined || this.table.first === null) return true;
    return this.table.first === 0;
  }

  isLastPage(): boolean {
    if (!this.table || this.table.first === undefined || this.table.first === null || this.table.rows === undefined) return true;
    const totalRecords = this.data.length || this.sampleData.length;
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
    const totalRecords = this.data.length || this.sampleData.length;
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

  onDateRangeChange(field: string, dates: Date[] | Date) {
    console.log('Date range changed:', field, dates);
    // Handle both array and single date events from PrimeNG calendar
    let dateArray: Date[];
    if (Array.isArray(dates)) {
      dateArray = dates;
    } else if (dates) {
      dateArray = [dates];
    } else {
      dateArray = [];
    }
    
    this.dateRangeFilters[field] = dateArray;
    console.log('Updated date filters:', this.dateRangeFilters);
    this.applyDateRangeFilter(field, dateArray);
  }

  private parseDateFromString(dateStr: string): Date | null {
    if (!dateStr) return null;
    
    try {
      // Handle different date formats
      if (typeof dateStr === 'string') {
        // Format: "28 May 2025, 11:26 PM" or "28 May 2025"
        if (dateStr.includes(',')) {
          const datePart = dateStr.split(',')[0].trim();
          return new Date(datePart);
        }
        // Standard date string
        return new Date(dateStr);
      }
      return new Date(dateStr);
    } catch (error) {
      console.error('Error parsing date:', dateStr, error);
      return null;
    }
  }

  applyDateRangeFilter(field: string, dates: Date[]) {
    if (!this.table) return;

    if (!dates || dates.length === 0) {
      // Clear date range filter
      this.table.filteredValue = null;
      this.applyAllFilters();
      return;
    }

    const startDate = dates[0];
    const endDate = dates[1] || dates[0]; // If only one date selected, use it as both start and end

    // Apply all active filters
    this.applyAllFilters();
  }

  applyAllFilters() {
    if (!this.table) return;
    
    console.log('Applying all filters. Data length:', this.data.length);
    console.log('Date filters:', this.dateRangeFilters);
    console.log('Dropdown filters:', this.dropdownFilters);

    let filteredData = [...this.data];

    // Apply date range filters
    Object.keys(this.dateRangeFilters).forEach(field => {
      const dates = this.dateRangeFilters[field];
      if (dates && dates.length > 0) {
        console.log(`Applying date filter for ${field}:`, dates);
        const startDate = dates[0];
        const endDate = dates[1] || dates[0];

        filteredData = filteredData.filter(item => {
          const itemDateStr = item[field];
          if (!itemDateStr) return false;
          
          const itemDate = this.parseDateFromString(itemDateStr);
          
          // Check if date is valid
          if (!itemDate || isNaN(itemDate.getTime())) {
            return false;
          }
          
          const start = new Date(startDate);
          const end = new Date(endDate);
          
          // Set time to start/end of day for proper comparison
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          itemDate.setHours(0, 0, 0, 0);
          
          const isInRange = itemDate >= start && itemDate <= end;
          console.log(`Date check: ${itemDateStr} (${itemDate}) between ${start} and ${end}: ${isInRange}`);
          return isInRange;
        });
        
        console.log(`After date filter for ${field}: ${filteredData.length} items`);
      }
    });

    // Apply dropdown filters
    Object.keys(this.dropdownFilters).forEach(field => {
      const value = this.dropdownFilters[field];
      if (value !== null && value !== undefined && value !== '') {
        console.log(`Applying dropdown filter for ${field}:`, value);
        const beforeLength = filteredData.length;
        filteredData = filteredData.filter(item => item[field] === value);
        console.log(`After dropdown filter for ${field}: ${filteredData.length} items (was ${beforeLength})`);
      }
    });

    // Update table with filtered data
    this.table.filteredValue = filteredData.length === this.data.length ? null : filteredData;
    this.table._filter();
    
    console.log('Final filtered data length:', filteredData.length);
  }

  onDropdownChange(field: string, value: any) {
    console.log('Dropdown changed:', field, value);
    this.dropdownFilters[field] = value;
    console.log('Updated dropdown filters:', this.dropdownFilters);
    this.applyAllFilters();
  }

  clearDateRangeFilter(field: string) {
    this.dateRangeFilters[field] = [];
    this.applyAllFilters();
  }

  clearDropdownFilter(field: string) {
    console.log('Clearing dropdown filter:', field);
    this.dropdownFilters[field] = null;
    this.applyAllFilters();
  }

  getFilterOptions(column: TableColumn): FilterOption[] {
    if (column.filterOptions && column.filterOptions.length > 0) {
      return column.filterOptions;
    }

    // Auto-generate filter options for status columns
    if (column.isStatus && this.data && this.data.length > 0) {
      const uniqueValues = [...new Set(this.data.map(item => item[column.field]).filter(val => val != null && val !== ''))];
      console.log('Auto-generated filter options for', column.field, ':', uniqueValues);
      return uniqueValues.map(value => ({
        label: value,
        value: value
      }));
    }

    return [];
  }
}
