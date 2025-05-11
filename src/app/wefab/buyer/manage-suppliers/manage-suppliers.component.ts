import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-suppliers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="manage-suppliers">
      <div class="header">
        <h1>Manage Suppliers</h1>
        <button class="add-supplier-btn">
          <i class="fas fa-plus"></i> Add New Supplier
        </button>
      </div>

      <div class="suppliers-grid">
        <div class="supplier-card" *ngFor="let supplier of suppliers">
          <div class="supplier-info">
            <h3>{{supplier.name}}</h3>
            <p class="category">{{supplier.category}}</p>
            <p class="status" [ngClass]="supplier.status.toLowerCase()">
              {{supplier.status}}
            </p>
          </div>
          <div class="supplier-actions">
            <button class="action-btn view">
              <i class="fas fa-eye"></i> View
            </button>
            <button class="action-btn edit">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="action-btn delete">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .manage-suppliers {
      padding: 2rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .add-supplier-btn {
      background-color: #2ecc71;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.3s;

      &:hover {
        background-color: #27ae60;
      }
    }

    .suppliers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .supplier-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .supplier-info {
      margin-bottom: 1rem;

      h3 {
        margin: 0 0 0.5rem 0;
        color: #2c3e50;
      }

      .category {
        color: #7f8c8d;
        margin: 0 0 0.5rem 0;
      }

      .status {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.875rem;
        margin: 0;

        &.active {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        &.pending {
          background-color: #fff3e0;
          color: #ef6c00;
        }

        &.inactive {
          background-color: #ffebee;
          color: #c62828;
        }
      }
    }

    .supplier-actions {
      display: flex;
      gap: 0.5rem;

      .action-btn {
        flex: 1;
        padding: 8px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        transition: background-color 0.3s;

        &.view {
          background-color: #3498db;
          color: white;

          &:hover {
            background-color: #2980b9;
          }
        }

        &.edit {
          background-color: #f1c40f;
          color: white;

          &:hover {
            background-color: #f39c12;
          }
        }

        &.delete {
          background-color: #e74c3c;
          color: white;

          &:hover {
            background-color: #c0392b;
          }
        }
      }
    }
  `]
})
export class ManageSuppliersComponent {
  suppliers = [
    {
      name: 'ABC Manufacturing',
      category: 'Electronics',
      status: 'Active'
    },
    {
      name: 'XYZ Industries',
      category: 'Textiles',
      status: 'Pending'
    },
    {
      name: 'Global Suppliers Ltd',
      category: 'Automotive',
      status: 'Inactive'
    }
  ];
} 