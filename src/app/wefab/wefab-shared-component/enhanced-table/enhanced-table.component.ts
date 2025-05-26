import { Component, Input, Output, EventEmitter, OnInit, ViewChild, OnChanges, SimpleChanges, TemplateRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG imports
import { TableModule, Table } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

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
  pipe?: string;
  pipeArgs?: any[];
}

export interface TabConfig {
  label: string;
  data: any[];
  count?: number;
  icon?: string;
  disabled?: boolean;
}

export interface ActionButton {
  label: string;
  icon?: string;
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger';
  outlined?: boolean;
  size?: 'small' | 'large';
  tooltip?: string;
  visible?: (row: any) => boolean;
  disabled?: (row: any) => boolean;
  action: string;
}

export interface FilterOption {
  label: string;
  value: any;
}

@Component({
  selector: 'app-enhanced-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    TabViewModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    TagModule,
    BadgeModule,
    PaginatorModule,
    TooltipModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './enhanced-table.component.html',
  styleUrl: './enhanced-table.component.scss'
})
export class EnhancedTableComponent implements OnInit, OnChanges {
  @ViewChild('dt') table!: Table;
  @ContentChild('customCell') customCellTemplate!: TemplateRef<any>;
  @ContentChild('customAction') customActionTemplate!: TemplateRef<any>;

  // Basic table configuration
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() loading: boolean = false;
  @Input() paginator: boolean = true;
  @Input() rows: number = 10;
  @Input() rowsPerPageOptions: number[] = [5, 10, 25, 50];
  @Input() totalRecords: number = 0;
  @Input() lazy: boolean = false;

  // Tab configuration
  @Input() useTabs: boolean = false;
  @Input() tabs: TabConfig[] = [];
  @Input() activeTabIndex: number = 0;

  // Search and filter configuration
  @Input() showGlobalFilter: boolean = true;
  @Input() globalFilterFields: string[] = [];
  @Input() globalFilterPlaceholder: string = 'Search...';
  @Input() showColumnFilters: boolean = true;
  @Input() filterOptions: { [key: string]: FilterOption[] } = {};

  // Selection configuration
  @Input() selectionMode: 'single' | 'multiple' | null = null;
  @Input() selectedItems: any[] = [];

  // Styling and layout
  @Input() tableTitle: string = '';
  @Input() showHeader: boolean = true;
  @Input() responsive: boolean = true;
  @Input() scrollable: boolean = false;
  @Input() scrollHeight: string = '400px';
  @Input() resizableColumns: boolean = false;
  @Input() reorderableColumns: boolean = false;
  @Input() striped: boolean = true;
  @Input() gridlines: boolean = true;

  // Action buttons configuration
  @Input() actionButtons: ActionButton[] = [];
  @Input() showActionColumn: boolean = false;
  @Input() actionColumnHeader: string = 'Actions';
  @Input() actionColumnWidth: string = '150px';

  // Link configuration
  @Input() routePrefix: string = '/detail/';
  @Input() linkField: string = 'id';

  // Status configuration
  @Input() statusField: string = 'status';
  @Input() statusSeverityMap: { [key: string]: 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' } = {
    'open': 'info',
    'in progress': 'warning',
    'completed': 'success',
    'closed': 'success',
    'cancelled': 'danger',
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  };

  // Events
  @Output() rowSelect = new EventEmitter<any>();
  @Output() rowUnselect = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<any>();
  @Output() filterChange = new EventEmitter<any>();
  @Output() tabChange = new EventEmitter<{ index: number, tab: TabConfig }>();
  @Output() linkClick = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{ action: string, row: any }>();
  @Output() selectionChange = new EventEmitter<any[]>();

  // Internal state
  globalFilterValue: string = '';
  currentData: any[] = [];
  currentTab: TabConfig | null = null;
  first: number = 0;

  constructor(private confirmationService: ConfirmationService) {}

  ngOnInit() {
    this.initializeComponent();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['tabs']) {
      this.updateCurrentData();
    }
    
    if (changes['activeTabIndex']) {
      this.setActiveTab(this.activeTabIndex);
    }
  }

  private initializeComponent() {
    // Auto-generate columns if none provided
    if (this.columns.length === 0 && this.data.length > 0) {
      this.autoGenerateColumns();
    }

    // Set global filter fields if not provided
    if (this.globalFilterFields.length === 0) {
      this.globalFilterFields = this.columns.map(col => col.field);
    }

    // Initialize current data
    this.updateCurrentData();

    // Add action column if action buttons are provided
    if (this.actionButtons.length > 0 && !this.showActionColumn) {
      this.showActionColumn = true;
    }

    if (this.showActionColumn && !this.columns.find(col => col.field === 'actions')) {
      this.columns.push({
        field: 'actions',
        header: this.actionColumnHeader,
        width: this.actionColumnWidth,
        sortable: false,
        filterable: false,
        customTemplate: true
      });
    }
  }

  private autoGenerateColumns() {
    if (!this.data || this.data.length === 0) return;

    const sampleData = this.data[0];
    const excludeFields = ['id', '_id', '__v', 'createdAt', 'updatedAt'];
    
    this.columns = Object.keys(sampleData)
      .filter(key => !excludeFields.includes(key))
      .map((key, index) => ({
        field: key,
        header: this.formatHeader(key),
        sortable: true,
        filterable: true,
        isLink: index === 0,
        width: this.getColumnWidth(key)
      }));
  }

  private formatHeader(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim();
  }

  private getColumnWidth(field: string): string {
    const widthMap: { [key: string]: string } = {
      'id': '10%',
      'name': '25%',
      'title': '25%',
      'status': '12%',
      'date': '15%',
      'actions': '15%'
    };
    
    return widthMap[field] || 'auto';
  }

  private updateCurrentData() {
    if (this.useTabs && this.tabs.length > 0) {
      this.currentTab = this.tabs[this.activeTabIndex];
      this.currentData = this.currentTab?.data || [];
    } else {
      this.currentData = this.data;
    }
    
    if (!this.lazy) {
      this.totalRecords = this.currentData.length;
    }
  }

  // Tab methods
  setActiveTab(index: number) {
    if (index >= 0 && index < this.tabs.length) {
      this.activeTabIndex = index;
      this.updateCurrentData();
      this.first = 0; // Reset pagination
      this.clearFilters();
      
      this.tabChange.emit({
        index: this.activeTabIndex,
        tab: this.currentTab!
      });
    }
  }

  onTabChange(event: any) {
    this.setActiveTab(event.index);
  }

  getTabCount(index: number): number {
    return this.tabs[index]?.count ?? this.tabs[index]?.data?.length ?? 0;
  }

  // Filter methods
  onGlobalFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    this.globalFilterValue = target.value;
    
    if (this.table) {
      this.table.filterGlobal(target.value, 'contains');
    }
    
    this.filterChange.emit({
      type: 'global',
      value: target.value
    });
  }

  onColumnFilter(event: Event, field: string) {
    const target = event.target as HTMLInputElement;
    
    if (this.table) {
      this.table.filter(target.value, field, 'contains');
    }
    
    this.filterChange.emit({
      type: 'column',
      field: field,
      value: target.value
    });
  }

  onDropdownFilter(value: any, field: string) {
    if (this.table) {
      this.table.filter(value, field, 'equals');
    }
    
    this.filterChange.emit({
      type: 'dropdown',
      field: field,
      value: value
    });
  }

  clearFilters() {
    this.globalFilterValue = '';
    if (this.table) {
      this.table.clear();
    }
  }

  // Event handlers
  onRowSelect(event: any) {
    this.rowSelect.emit(event);
    this.selectionChange.emit(this.selectedItems);
  }

  onRowUnselect(event: any) {
    this.rowUnselect.emit(event);
    this.selectionChange.emit(this.selectedItems);
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.pageChange.emit(event);
  }

  onSortChange(event: any) {
    this.sortChange.emit(event);
  }

  onLinkClick(rowData: any) {
    this.linkClick.emit(rowData);
  }

  onActionClick(action: string, rowData: any) {
    if (action === 'delete') {
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete this item?',
        header: 'Confirm Delete',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.actionClick.emit({ action, row: rowData });
        }
      });
    } else {
      this.actionClick.emit({ action, row: rowData });
    }
  }

  // Utility methods
  getRouteLink(rowData: any): string {
    const id = rowData[this.linkField] || rowData.id || '';
    return this.routePrefix + id;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    if (!status) return 'info';
    
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, ' ').trim();
    return this.statusSeverityMap[normalizedStatus] || 'info';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  formatCurrency(value: number): string {
    if (value == null) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  isActionVisible(action: ActionButton, row: any): boolean {
    return action.visible ? action.visible(row) : true;
  }

  isActionDisabled(action: ActionButton, row: any): boolean {
    return action.disabled ? action.disabled(row) : false;
  }

  getCellValue(rowData: any, column: TableColumn): any {
    const value = rowData[column.field];
    
    if (column.formatter) {
      return column.formatter(value, rowData);
    }
    
    if (column.pipe) {
      // Handle common pipes
      switch (column.pipe) {
        case 'date':
          return this.formatDate(value);
        case 'currency':
          return this.formatCurrency(value);
        default:
          return value;
      }
    }
    
    return value;
  }

  // Export functionality
  exportToCSV() {
    if (this.table) {
      this.table.exportCSV();
    }
  }

  exportToExcel() {
    // Implementation for Excel export
    console.log('Excel export not implemented yet');
  }

  // Tracking functions for performance optimization
  trackByColumn(index: number, column: TableColumn): string {
    return column.field;
  }

  trackByAction(index: number, action: ActionButton): string {
    return action.action;
  }

  trackByRow(index: number, row: any): any {
    return row.id || row._id || index;
  }
} 