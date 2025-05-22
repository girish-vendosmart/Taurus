import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CostAnalysisTableComponent } from './cost-analysis-table.component';

@Component({
  selector: 'app-cost-analysis-table-demo',
  standalone: true,
  imports: [CommonModule, CostAnalysisTableComponent],
  template: `
    <app-cost-analysis-table
      [data]="data"
      [columns]="columns"
      (reset)="onReset()"
      (open)="onOpen()"
      (quotation)="onQuotation()"
    ></app-cost-analysis-table>
  `
})
export class CostAnalysisTableDemoComponent {
  columns = [
    { field: 'item', header: 'Item', width: '200px' },
    { field: 'notes', header: 'Notes', width: '200px' },
    { field: 'targetPrice', header: 'Target Price', colorBy: true },
    { field: 'quantity', header: 'Quantity' },
    { field: 'supplier1', header: 'Supplier 1', colorBy: true },
    { field: 'supplier2', header: 'Supplier 2', colorBy: true },
    { field: 'supplier3', header: 'Supplier 3', colorBy: true },
    { field: 'supplier4', header: 'Supplier 4', colorBy: true }
  ];
  data = [
    { section: 'HVAC system', item: 'Complete Mechanical works incl.', notes: '', targetPrice: 400, quantity: 2, supplier1: 150, supplier2: 401, supplier3: 485, supplier4: 348 },
    { section: 'HVAC system', item: 'Others (Please list the items)', notes: '', targetPrice: 200, quantity: 1, supplier1: 210, supplier2: 220, supplier3: 230, supplier4: 240 },
    { section: 'Plumbing and Drainage System', item: 'Complete Including H/F', notes: '', targetPrice: 900, quantity: 3, supplier1: 972, supplier2: 766, supplier3: 837, supplier4: 974 },
    { section: 'Walls and Partitioning', item: 'Box 0.6 x 0.6m', notes: '', targetPrice: 120, quantity: 2, supplier1: 132, supplier2: 112, supplier3: 198, supplier4: 181 }
  ];

  onReset() { alert('Reset Table'); }
  onOpen() { alert('Open Table'); }
  onQuotation() { alert('Quotation Table'); }
} 