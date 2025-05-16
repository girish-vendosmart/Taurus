import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG imports
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
// These two imports are required for column reordering and resizing
import { ContextMenuModule } from 'primeng/contextmenu';
import { TreeTableModule } from 'primeng/treetable';

export interface Column {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  formatter?: (value: any, row: any) => string;
  isLink?: boolean;
  routePath?: string;
  isAction?: boolean;
  actions?: Action[];
}

export interface Action {
  label: string;
  icon: string;
  severity?: 'success' | 'info' | 'warning' | 'danger' | 'secondary';
  disabled?: boolean;
  visible?: boolean | ((row: any) => boolean);
  onClick: (row: any) => void;
}

@Component({
  selector: 'app-common-prime-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    MultiSelectModule,
    DropdownModule,
    TagModule,
    PaginatorModule,
    RouterModule,
    ContextMenuModule,
    TreeTableModule
  ],
  templateUrl: './common-prime-table.component.html',
  styleUrl: './common-prime-table.component.scss'
})
export class CommonPrimeTableComponent implements OnInit {
  @ViewChild('dt') table!: Table;
  
  @Input() data: any[] = [];
  @Input() columns: Column[] = [];
  @Input() paginator: boolean = true;
  @Input() rows: number = 10;
  @Input() rowsPerPageOptions: number[] = [5, 10, 25, 50];
  @Input() loading: boolean = false;
  @Input() totalRecords: number = 0;
  @Input() globalFilterFields: string[] = [];
  @Input() showGlobalFilter: boolean = true;
  @Input() selectionMode: 'single' | 'multiple' | null = null;
  @Input() sortField: string = '';
  @Input() sortOrder: number = 1;
  @Input() resizableColumns: boolean = true;
  @Input() reorderableColumns: boolean = true;
  @Input() showTitle: boolean = true;
  @Input() title: string = 'Data Table';
  @Input() routePrefix: string = '/detail/';
  @Input() actionColumnWidth: string = '120px';
  @Input() showActionColumn: boolean = false;
  @Input() actionColumnPosition: 'start' | 'end' = 'end';

  @Output() rowSelect = new EventEmitter<any>();
  @Output() rowUnselect = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<any>();
  @Output() linkClick = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{action: Action, row: any}>();

  selectedItems: any[] = [];
  globalFilterValue: string = '';

  // Dummy data for demonstration
  dummyData = [
    {
      id: 1,
      name: 'Project Alpha',
      status: 'Active',
      progress: 75,
      startDate: '2023-01-15',
      budget: 125000,
      location: 'Kuwait City',
      team: 'Engineering'
    },
    {
      id: 2,
      name: 'Project Beta',
      status: 'Pending',
      progress: 30,
      startDate: '2023-02-20',
      budget: 85000,
      location: 'Dubai',
      team: 'Design'
    },
    {
      id: 3,
      name: 'Project Gamma',
      status: 'Completed',
      progress: 100,
      startDate: '2022-11-05',
      budget: 95000,
      location: 'Riyadh',
      team: 'Development'
    },
    {
      id: 4,
      name: 'Project Delta',
      status: 'On Hold',
      progress: 50,
      startDate: '2023-03-10',
      budget: 175000,
      location: 'Abu Dhabi',
      team: 'Operations'
    },
    {
      id: 5,
      name: 'Project Epsilon',
      status: 'Active',
      progress: 65,
      startDate: '2023-01-28',
      budget: 145000,
      location: 'Kuwait City',
      team: 'Engineering'
    },
    {
      id: 6,
      name: 'Project Zeta',
      status: 'Pending',
      progress: 15,
      startDate: '2023-04-05',
      budget: 110000,
      location: 'Doha',
      team: 'Design'
    },
    {
      id: 7,
      name: 'Project Eta',
      status: 'Completed',
      progress: 100,
      startDate: '2022-12-12',
      budget: 82000,
      location: 'Manama',
      team: 'Development'
    },
    {
      id: 8,
      name: 'Project Theta',
      status: 'Active',
      progress: 45,
      startDate: '2023-02-15',
      budget: 130000,
      location: 'Muscat',
      team: 'Operations'
    }
  ];

  // Default columns if none provided
  defaultColumns: Column[] = [
    { field: 'id', header: 'ID', sortable: true, width: '10%' },
    { field: 'name', header: 'Name', sortable: true, filterable: true, width: '20%', isLink: true },
    { field: 'status', header: 'Status', sortable: true, filterable: true, width: '15%' },
    { field: 'progress', header: 'Progress', sortable: true, width: '10%' },
    { field: 'startDate', header: 'Start Date', sortable: true, width: '15%' },
    { field: 'budget', header: 'Budget', sortable: true, width: '15%' },
    { field: 'location', header: 'Location', sortable: true, filterable: true, width: '15%' },
    { 
      field: 'actions', 
      header: 'Actions', 
      isAction: true, 
      width: '120px',
      actions: [
        {
          label: 'Resend',
          icon: 'pi pi-send',
          severity: 'info',
          onClick: (row) => this.onActionClick(row, 'resend')
        },
        {
          label: 'Edit',
          icon: 'pi pi-pencil',
          severity: 'warning',
          onClick: (row) => this.onActionClick(row, 'edit')
        },
        {
          label: 'Delete',
          icon: 'pi pi-trash',
          severity: 'danger',
          onClick: (row) => this.onActionClick(row, 'delete')
        }
      ]
    }
  ];

  ngOnInit() {
    // Use dummy data if no data provided
    if (!this.data || this.data.length === 0) {
      this.data = this.dummyData;
    }
    
    // Use default columns if none provided
    if (!this.columns || this.columns.length === 0) {
      this.columns = this.defaultColumns;
    }
    
    // Calculate total records if not provided
    if (!this.totalRecords) {
      this.totalRecords = this.data.length;
    }
    
    // Set global filter fields if not provided
    if (!this.globalFilterFields || this.globalFilterFields.length === 0) {
      this.globalFilterFields = this.columns.map(col => col.field);
    }
  }
  
  clear() {
    this.globalFilterValue = '';
    this.table.clear();
  }
  
  onRowSelect(event: any) {
    this.rowSelect.emit(event);
  }
  
  onRowUnselect(event: any) {
    this.rowUnselect.emit(event);
  }
  
  onPageChange(event: any) {
    this.pageChange.emit(event);
  }
  
  onSortChange(event: any) {
    this.sortChange.emit(event);
  }
  
  onLinkClick(rowData: any) {
    this.linkClick.emit(rowData);
  }
  
  onColumnFilter(event: Event, field: string) {
    const target = event.target as HTMLInputElement;
    this.table.filter(target.value, field, 'contains');
  }
  
  getRouteLink(rowData: any): string {
    return this.routePrefix + rowData.id;
  }
  
  getStatusSeverity(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'on hold':
        return 'warning';
      case 'completed':
        return 'info';
      default:
        return 'secondary';
    }
  }
  
  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }
  
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  }

  onActionClick(row: any, actionType: string) {
    const action = this.columns
      .find(col => col.isAction)
      ?.actions
      ?.find(a => a.label.toLowerCase() === actionType.toLowerCase());
    
    if (action) {
      this.actionClick.emit({ action, row });
    }
  }

  isActionVisible(action: Action, row: any): boolean {
    if (typeof action.visible === 'function') {
      return action.visible(row);
    }
    return action.visible !== false;
  }
}
