import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeTableModule } from 'primeng/treetable';
import { TableModule } from 'primeng/table';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-file-explorer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TreeTableModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    MultiSelectModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './file-explorer.component.html',
  styleUrl: './file-explorer.component.scss'
})
export class FileExplorerComponent implements OnInit {
  files: TreeNode[] = [];
  selectedFiles: TreeNode[] = [];
  cols: any[] = [];
  exportColumns: any[] = [];
  globalFilter: string = '';
  loading: boolean = false;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.initializeColumns();
    this.loadFiles();
  }

  initializeColumns() {
    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'size', header: 'Size' },
      { field: 'type', header: 'Type' },
      { field: 'dateModified', header: 'Date Modified' }
    ];

    this.exportColumns = this.cols.map(col => ({
      title: col.header,
      dataKey: col.field
    }));
  }

  loadFiles() {
    this.loading = true;
    setTimeout(() => {
      this.files = [
        {
          data: { name: 'Documents', size: '75kb', type: 'Folder', dateModified: '2023-11-15' },
          children: [
            { 
              data: { name: 'Work', size: '55kb', type: 'Folder', dateModified: '2023-11-14' },
              children: [
                { data: { name: 'Report.docx', size: '25kb', type: 'Document', dateModified: '2023-11-13' } },
                { data: { name: 'Budget.xlsx', size: '30kb', type: 'Spreadsheet', dateModified: '2023-11-12' } }
              ]
            },
            {
              data: { name: 'Personal', size: '20kb', type: 'Folder', dateModified: '2023-11-10' },
              children: [
                { data: { name: 'Resume.pdf', size: '20kb', type: 'PDF', dateModified: '2023-11-09' } }
              ]
            }
          ]
        },
        {
          data: { name: 'Pictures', size: '150kb', type: 'Folder', dateModified: '2023-11-05' },
          children: [
            { data: { name: 'vacation.jpg', size: '50kb', type: 'Image', dateModified: '2023-11-04' } },
            { data: { name: 'family.png', size: '100kb', type: 'Image', dateModified: '2023-11-03' } }
          ]
        },
        {
          data: { name: 'Music', size: '2mb', type: 'Folder', dateModified: '2023-11-01' },
          children: [
            { data: { name: 'song.mp3', size: '2mb', type: 'Audio', dateModified: '2023-10-28' } }
          ]
        }
      ];
      this.loading = false;
    }, 1000);
  }

  isSelected(rowNode: TreeNode): boolean {
    return this.selectedFiles.some(file => file === rowNode);
  }

  toggleSelection(rowNode: TreeNode, event: Event): void {
    event.stopPropagation();
    
    const index = this.selectedFiles.findIndex(file => file === rowNode);
    
    if (index !== -1) {
      // If already selected, remove from selection
      this.selectedFiles.splice(index, 1);
    } else {
      // If not selected, add to selection
      this.selectedFiles.push(rowNode);
    }
  }

  refreshFiles() {
    this.loading = true;
    this.messageService.add({ severity: 'info', summary: 'Refresh', detail: 'Refreshing file list' });
    setTimeout(() => {
      this.loadFiles();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Files refreshed successfully' });
    }, 1000);
  }

  exportCSV() {
    this.messageService.add({ severity: 'success', summary: 'Export', detail: 'Files exported to CSV' });
  }

  deleteSelected() {
    if (this.selectedFiles.length) {
      // In a real app, you'd delete the selected files here
      this.messageService.add({ 
        severity: 'success', 
        summary: 'Deleted', 
        detail: `${this.selectedFiles.length} files deleted successfully` 
      });
      this.selectedFiles = [];
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No files selected' });
    }
  }

  newFolder() {
    this.messageService.add({ severity: 'info', summary: 'New Folder', detail: 'New folder functionality' });
    // In a real app, you'd add a new folder here
  }
}
