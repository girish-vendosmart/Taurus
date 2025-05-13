import { Component, Input, Output, EventEmitter, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { RouterModule } from '@angular/router';

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'custom';
  width?: string;
  formatter?: (value: any, row: any) => string;
  customTemplate?: boolean;
  isLink?: boolean;
  routePath?: string;
}

@Component({
  selector: 'app-common-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    MultiSelectModule,
    DropdownModule,
    TagModule,
    FormsModule,
    PaginatorModule,
    RouterModule
  ],
  templateUrl: './common-table.component.html',
  styleUrl: './common-table.component.scss'
})
export class CommonTableComponent implements OnInit, OnChanges {
  @ViewChild('dt') table!: Table;
  
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() paginator: boolean = true;
  @Input() rows: number = 10;
  @Input() rowsPerPageOptions: number[] = [5, 10, 25, 50];
  @Input() loading: boolean = false;
  @Input() totalRecords: number = 0;
  @Input() globalFilterFields: string[] = [];
  @Input() showGlobalFilter: boolean = false;
  @Input() selectionMode: 'single' | 'multiple' | null = null;
  @Input() sortField: string = '';
  @Input() sortOrder: number = 1;
  @Input() headerTitle?: string;
  @Input() showExport: boolean = false;
  @Input() routePrefix: string = '/detail/';
  @Input() firstColumnLink: boolean = true;

  @Output() rowSelect = new EventEmitter<any>();
  @Output() rowUnselect = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<any>();
  @Output() linkClick = new EventEmitter<any>();

  selectedItems: any[] = [];
  filters: any = {};
  globalFilterValue: string = '';
  currentFirst: number = 0;
  currentRows: number = 0;

  // Sample data for testing
  sampleData = [
    {
      "name": "Artemis Program",
      "project_type": "construction",
      "location": "Kuwait",
      "status": "Published",
      "created_at": "2025-05-09 09:57:00"
    },
    {
      "name": "Ashaya Trail New",
      "project_type": "construction",
      "location": "Kuwait",
      "status": "Published",
      "created_at": "2025-05-07 15:08:00"
    },
    {
      "name": "Kuwait Test",
      "project_type": "construction",
      "location": "Kuwait City",
      "status": "Published",
      "created_at": "2025-04-09 16:03:00"
    },
    {
      "name": "Uppercrust",
      "project_type": "construction",
      "location": "Kuwait City",
      "status": "Published",
      "created_at": "2025-04-03 15:37:00"
    },
    {
      "name": "Raising Cane's Trial 1",
      "project_type": "construction",
      "location": "Kuwait City",
      "status": "Published",
      "created_at": "2025-03-17 14:21:00"
    },
    {
      "name": "Alshaya Construction",
      "project_type": "construction",
      "location": "Kuwait",
      "status": "Published",
      "created_at": "2025-03-17 12:19:00"
    }
  ];

  ngOnInit() {
    // For development/testing - use sample data if no data provided
    if (!this.data || this.data.length === 0) {
      this.data = this.sampleData;
      console.log('Using sample data:', this.data);
    }
    
    // Set currentRows from input rows
    this.currentRows = this.rows;
    
    // If no columns are provided, auto-generate them
    if (this.columns.length === 0 && this.data && this.data.length > 0) {
      this.autoGenerateColumns();
    }

    // If no totalRecords is provided, calculate from data
    if (!this.totalRecords && this.data) {
      this.totalRecords = this.data.length;
    }

    // Set globalFilterFields if not provided
    if (this.globalFilterFields.length === 0 && this.columns.length > 0) {
      this.globalFilterFields = this.columns.map(col => col.field);
    }

    // Make first column linkable if requested
    if (this.firstColumnLink && this.columns.length > 0) {
      this.columns[0].isLink = true;
    }
    
    console.log('Columns after initialization:', this.columns);
    console.log('Data after initialization:', this.data);
    console.log('Total records:', this.totalRecords);
  }
  
  ngOnChanges(changes: SimpleChanges) {
    // When data changes, update columns and totalRecords
    if (changes['data'] && !changes['data'].firstChange && this.data && this.data.length > 0) {
      console.log('Data changed:', this.data);
      
      if (this.columns.length === 0) {
        this.autoGenerateColumns();
      }
      
      if (!this.totalRecords) {
        this.totalRecords = this.data.length;
      }
    }
  }

  autoGenerateColumns() {
    if (!this.data || this.data.length === 0) {
      console.warn('Cannot generate columns: No data available');
      return;
    }
    
    const sampleData = this.data[0];
    console.log('Sample data for column generation:', sampleData);
    
    // Create fields based on screenshot keys
    const fieldsOrder = [
      'name', 'project_type', 'location', 'status', 'created_at',
      'supplier_name', 'company_name', 'creation', 'modified'
    ];
    
    // Get available fields from data
    const availableFields = Object.keys(sampleData)
      .filter(key => !key.startsWith('_') && key !== 'docstatus' && key !== 'idx');
    
    console.log('Available fields:', availableFields);
    
    // Sort fields based on predefined order or leave as is
    const sortedFields = fieldsOrder
      .filter(field => availableFields.includes(field))
      .concat(availableFields.filter(field => !fieldsOrder.includes(field)));
    
    console.log('Sorted fields:', sortedFields);
    
    // Create columns
    this.columns = sortedFields.map((key, index) => {
      const dateFields = ['creation', 'modified', 'created_at', 'created_on'];
      const statusFields = ['status', 'state'];
      
      return {
        field: key,
        header: this.formatHeader(key),
        sortable: true,
        filterable: true,
        filterType: 'text',
        isLink: index === 0 && this.firstColumnLink,
        width: key === 'name' || key === 'supplier_name' ? '20%' : 
               key === 'status' ? '10%' : undefined
      };
    });
    
    console.log('Generated columns:', this.columns);
  }

  formatHeader(key: string): string {
    // Map specific fields to better display names
    const headerMap: {[key: string]: string} = {
      'name': 'Project Name',
      'project_type': 'Project type',
      'created_at': 'Created At',
      'supplier_name': 'Supplier Name',
      'company_name': 'Company Name'
    };
    
    if (headerMap[key]) {
      return headerMap[key];
    }
    
    // Convert field names to display names
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  onRowSelect(event: any) {
    this.rowSelect.emit(event);
  }

  onRowUnselect(event: any) {
    this.rowUnselect.emit(event);
  }

  onPageChange(event: any) {
    this.currentFirst = event.first;
    this.currentRows = event.rows;
    this.pageChange.emit(event);
  }

  onSortChange(event: any) {
    this.sortChange.emit(event);
  }

  onLinkClick(rowData: any) {
    this.linkClick.emit(rowData);
  }

  onFilterInput(event: Event, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && this.table) {
      this.table.filter(inputElement.value, field, 'contains');
    }
  }

  onFilterDropdown(value: any, field: string) {
    if (this.table) {
      this.table.filter(value, field, 'equals');
    }
  }

  onGlobalFilterChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && this.table) {
      this.table.filterGlobal(inputElement.value, 'contains');
    }
  }

  clearFilters() {
    if (this.table) {
      this.table.clear();
    }
    this.filters = {};
    this.globalFilterValue = '';
  }

  getTagSeverity(status: string): string {
    if (!status) return 'info';
    
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'approved':
      case 'published':
        return 'success';
      case 'rejected':
      case 'failed':
        return 'danger';
      default:
        return 'info';
    }
  }

  formatDate(date: string): string {
    if (!date) return '';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return date;
      
      // Format: DD MMM YYYY, HH:MM {AM|PM}
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = dateObj.toLocaleString('en-US', { month: 'short' });
      const year = dateObj.getFullYear();
      
      let hours = dateObj.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
      
      return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return date;
    }
  }

  getRouteLink(rowData: any): string {
    const id = rowData.name || rowData.id || '';
    return this.routePrefix + id;
  }

  getPaginationInfo(): { first: number, last: number, total: number } {
    const first = this.totalRecords === 0 ? 0 : this.currentFirst + 1;
    const last = Math.min(this.currentFirst + this.currentRows, this.totalRecords);
    return {
      first,
      last,
      total: this.totalRecords
    };
  }
}
