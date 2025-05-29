import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
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

export interface ActionButton {
  label?: string;
  action: string;
  class?: string;
  icon?: string;
  iconOnly?: boolean;
  tooltip?: string;
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger';
}

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  isLink?: boolean;
  routerLink?: string;
  routerLinkField?: string;
  isStatus?: boolean;
  isAction?: boolean;
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
    OverlayPanelModule
  ],
  templateUrl: './common-table.component.html',
  styleUrl: './common-table.component.scss'
})
export class CommonTableComponent implements OnInit {
  @ViewChild('dt') table!: Table;
  
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
  @Output() linkClick = new EventEmitter<any>();
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

  // Sample data for demonstration
  sampleData = [
    {
      company: 'TATA CONSULTANCY SERVICES LIMITED',
      companyId: 'SUP-007293',
      contact: 'michael.doe@mailinator.com',
      status: 'Approved',
      routerLink: '/company-details/SUP-007293'
    },
    {
      company: 'INDIAMART INTERMESH LIMITED',
      companyId: 'SUP-007282',
      contact: 'girish.kadli@mailinator.com',
      status: 'Under Review',
      routerLink: '/company-details/SUP-007282'
    },
    {
      company: 'TATA CONSULTANCY SERVICES LIMITED',
      companyId: 'SUP-007288',
      contact: 'john.david@mailinator.com',
      status: 'Under Review',
      routerLink: '/company-details/SUP-007288'
    },
    {
      company: 'CNC INDIA ROBOTICS AND INDUSTRIAL AUTOMATIONS PRIVATE LIMITED',
      companyId: 'SUP-007280',
      contact: 'david.doe@mailinator.com',
      status: 'Approved',
      routerLink: '/company-details/SUP-007280'
    },
    {
      company: 'INFOSYS LIMITED',
      companyId: 'SUP-007295',
      contact: 'sarah.wilson@mailinator.com',
      status: 'Approved',
      routerLink: '/company-details/SUP-007295'
    },
    {
      company: 'WIPRO LIMITED',
      companyId: 'SUP-007296',
      contact: 'james.brown@mailinator.com',
      status: 'Under Review',
      routerLink: '/company-details/SUP-007296'
    },
    {
      company: 'HCL TECHNOLOGIES LIMITED',
      companyId: 'SUP-007297',
      contact: 'emma.davis@mailinator.com',
      status: 'Approved',
      routerLink: '/company-details/SUP-007297'
    },
    {
      company: 'TECH MAHINDRA LIMITED',
      companyId: 'SUP-007298',
      contact: 'robert.miller@mailinator.com',
      status: 'Under Review',
      routerLink: '/company-details/SUP-007298'
    },
    {
      company: 'LARSEN & TOUBRO LIMITED',
      companyId: 'SUP-007299',
      contact: 'lisa.garcia@mailinator.com',
      status: 'Approved',
      routerLink: '/company-details/SUP-007299'
    },
    {
      company: 'RELIANCE INDUSTRIES LIMITED',
      companyId: 'SUP-007300',
      contact: 'mark.rodriguez@mailinator.com',
      status: 'Under Review',
      routerLink: '/company-details/SUP-007300'
    },
    {
      company: 'BHARTI AIRTEL LIMITED',
      companyId: 'SUP-007301',
      contact: 'anna.martinez@mailinator.com',
      status: 'Approved',
      routerLink: '/company-details/SUP-007301'
    },
    {
      company: 'ICICI BANK LIMITED',
      companyId: 'SUP-007302',
      contact: 'kevin.anderson@mailinator.com',
      status: 'Under Review',
      routerLink: '/company-details/SUP-007302'
    }
  ];

  ngOnInit() {
    this.globalFilterFields = this.config.columns
      .filter(col => col.filterable)
      .map(col => col.field);
    
    // Initialize column visibility
    this.initializeColumnVisibility();
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
    this.linkClick.emit({ rowData, column });
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
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'under review':
        return 'status-under-review';
      case 'request to resubmit':
        return 'status-resubmit';
      case 'open':
        return 'status-open';
      case 'in progress':
        return 'status-in-progress';
      case 'closed':
        return 'status-closed';
      case 'invited':
        return 'status-under-review'; // Use same styling as under review
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
}
