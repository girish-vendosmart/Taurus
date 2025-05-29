// Example usage of the enhanced Common Table Component

import { Component } from '@angular/core';
import { TableConfig, TableColumn } from './common-table.component';

@Component({
  selector: 'app-table-demo',
  template: `
    <div class="demo-container">
      <h2>Enhanced Common Table Demo</h2>
      
      <app-common-table
        [config]="tableConfig"
        [data]="sampleData"
        [loading]="false"
        (rowClick)="onRowClick($event)"
        (linkClick)="onLinkClick($event)"
        (actionClick)="onActionClick($event)">
      </app-common-table>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h2 {
      margin-bottom: 1.5rem;
      color: #333;
    }
  `]
})
export class TableDemoComponent {
  
  // Enhanced table configuration with all new features
  tableConfig: TableConfig = {
    columns: [
      { 
        field: 'quotationId', 
        header: 'Quotation ID', 
        sortable: true, 
        filterable: true, 
        isLink: true,  // This column will show link indicators
        routerLink: '/quotation-details',
        routerLinkField: 'quotationId',
        width: '150px'
      },
      { 
        field: 'rfqId', 
        header: 'RFQ ID', 
        sortable: true, 
        filterable: true,
        width: '120px'
      },
      { 
        field: 'totalAmount', 
        header: 'Total Amount', 
        sortable: true, 
        filterable: true,
        width: '140px'
      },
      { 
        field: 'grandTotal', 
        header: 'Grand Total', 
        sortable: true, 
        filterable: true,
        width: '140px'
      },
      { 
        field: 'submittedDate', 
        header: 'Submitted Date', 
        sortable: true, 
        filterable: true,
        width: '160px'
      },
      { 
        field: 'validity', 
        header: 'Validity', 
        sortable: true, 
        filterable: true,
        width: '120px'
      },
      { 
        field: 'status', 
        header: 'Status', 
        sortable: true, 
        filterable: true, 
        isStatus: true,  // This column will show status badges
        width: '120px'
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
    pageSize: 10,
    showActions: true,
    enableColumnHide: true,    // NEW: Enable column hide feature
    enableColumnResize: true,  // NEW: Enable column resize feature
    actionButtons: [
      { 
        label: 'View', 
        action: 'view', 
        icon: 'pi pi-eye',
        severity: 'secondary',
        tooltip: 'View Details'
      },
      { 
        label: 'Edit', 
        action: 'edit', 
        icon: 'pi pi-pencil',
        severity: 'primary',
        tooltip: 'Edit Quotation'
      },
      {
        action: 'download',
        icon: 'pi pi-download',
        iconOnly: true,
        tooltip: 'Download PDF',
        severity: 'info'
      }
    ]
  };

  sampleData = [
    {
      quotationId: 'QTN0014',
      rfqId: 'RFQ0001',
      totalAmount: '$9,250.00',
      grandTotal: '$9,250.00',
      submittedDate: 'May 29, 2025',
      validity: 'Jul 10, 2025',
      status: 'Awarded'
    },
    {
      quotationId: 'QTN0015',
      rfqId: 'RFQ0001',
      totalAmount: '$8,750.00',
      grandTotal: '$8,750.00',
      submittedDate: 'May 29, 2025',
      validity: 'Jul 8, 2025',
      status: 'Submitted'
    },
    {
      quotationId: 'QTN0016',
      rfqId: 'RFQ0001',
      totalAmount: '$10,550.00',
      grandTotal: '$10,550.00',
      submittedDate: 'May 29, 2025',
      validity: 'Jul 12, 2025',
      status: 'Submitted'
    },
    {
      quotationId: 'QTN0017',
      rfqId: 'RFQ0001',
      totalAmount: '$8,050.00',
      grandTotal: '$8,050.00',
      submittedDate: 'May 29, 2025',
      validity: 'Jul 5, 2025',
      status: 'Draft'
    },
    {
      quotationId: 'QTN0018',
      rfqId: 'RFQ0001',
      totalAmount: '$9,650.00',
      grandTotal: '$9,650.00',
      submittedDate: 'May 29, 2025',
      validity: 'Jul 15, 2025',
      status: 'Submitted'
    }
  ];

  onRowClick(event: any) {
    console.log('Row clicked:', event.rowData);
  }

  onLinkClick(event: any) {
    console.log('Link clicked:', event.rowData, event.column);
    // Handle navigation or custom logic here
  }

  onActionClick(event: any) {
    console.log('Action clicked:', event.action, event.rowData);
    
    switch (event.action) {
      case 'view':
        // Navigate to view page
        console.log('Viewing:', event.rowData.quotationId);
        break;
      case 'edit':
        // Navigate to edit page
        console.log('Editing:', event.rowData.quotationId);
        break;
      case 'download':
        // Download PDF
        console.log('Downloading:', event.rowData.quotationId);
        break;
    }
  }
}

/*
NEW FEATURES ADDED:

1. LINK INDICATORS:
   - Columns with isLink: true now show a small external link icon in the header
   - Link cells show a clickable icon next to the text
   - Makes it clear which columns are interactive

2. IMPROVED PAGINATION:
   - Previous/Next buttons now use chevron icons instead of text
   - Better visual design with proper button styling
   - Tooltips for accessibility

3. COLUMN HIDE FEATURE:
   - Set enableColumnHide: true in config
   - Users can select/deselect columns from a multi-select dropdown
   - Column visibility is maintained during sorting/filtering
   - Configurable feature - can be disabled by setting to false

4. COLUMN RESIZE FEATURE:
   - Set enableColumnResize: true in config
   - Users can drag the right edge of column headers to resize
   - Minimum width of 100px enforced
   - Smooth resizing with visual feedback
   - Prevents text selection during resize

HOW TO USE:
1. Import the CommonTableComponent in your module
2. Configure the TableConfig object with desired features
3. Set enableColumnHide and enableColumnResize to true
4. Optionally set initial column widths
5. Use the component with your data

CONFIGURATION OPTIONS:
- enableColumnHide: boolean - Shows/hides the column selector dropdown
- enableColumnResize: boolean - Enables column resizing handles
- Individual column width can be set via the width property
*/ 