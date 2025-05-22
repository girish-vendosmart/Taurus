import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-cost-analysis-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule],
  template: `
    <div class="cost-analysis-table-container">
      <div class="table-actions">
        <button pButton type="button" label="Reset Table" class="p-button-sm p-button-outlined" (click)="reset.emit()"></button>
        <button pButton type="button" label="Open table" class="p-button-sm p-button-outlined" (click)="open.emit()"></button>
        <button pButton type="button" label="Quotation table" class="p-button-sm p-button-primary" (click)="quotation.emit()"></button>
      </div>
      <p-table [value]="data" [groupRowsBy]="'section'" rowGroupMode="subheader" [scrollable]="true" scrollHeight="400px">
        <ng-template pTemplate="rowgroupheader" let-rowData>
          <tr class="section-header-row">
            <td [attr.colspan]="columns.length">{{ rowData.section }}</td>
          </tr>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th *ngFor="let col of columns" [style.width]="col.width || 'auto'">{{ col.header }}</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row let-rowIndex="rowIndex">
          <tr>
            <td *ngFor="let col of columns" [ngStyle]="getCellStyle(row, col)">
              <ng-container *ngIf="col.cellTemplate; else defaultCell">
                <ng-container *ngTemplateOutlet="col.cellTemplate; context: { $implicit: row[col.field], row: row }"></ng-container>
              </ng-container>
              <ng-template #defaultCell>{{ row[col.field] }}</ng-template>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styleUrls: ['./cost-analysis-table.component.scss']
})
export class CostAnalysisTableComponent {
  @Input() data: any[] = [];
  @Input() columns: any[] = [];
  @Output() reset = new EventEmitter<void>();
  @Output() open = new EventEmitter<void>();
  @Output() quotation = new EventEmitter<void>();

  // Example: color code based on value
  getCellStyle(row: any, col: any) {
    if (col.colorBy && row[col.field] !== undefined) {
      const value = row[col.field];
      if (typeof value === 'number') {
        if (value < 200) return { background: '#ffcccc' };
        if (value < 500) return { background: '#fff7cc' };
        if (value < 1000) return { background: '#e6ffcc' };
      }
    }
    return {};
  }
} 