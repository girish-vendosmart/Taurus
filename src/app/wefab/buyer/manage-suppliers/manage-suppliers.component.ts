import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonService } from '../../shared/common.service';

interface Supplier {
  name: string;
  company_name: string;
  primary_email_id: string;
  primary_phone_number: string;
  onboarding_status: string;
  company_profile: string;
}

@Component({
  selector: 'app-manage-suppliers',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule],
  template: `
    <div class="suppliers-container">
      <div class="header">
        <h1>Manage Suppliers</h1>
        <button pButton label="Add New Supplier" icon="pi pi-plus" class="p-button-primary"></button>
      </div>

      <div class="suppliers-grid">
        <p-card *ngFor="let supplier of suppliers" class="supplier-card">
          <ng-template pTemplate="header">
            <div class="supplier-header">
              <h3>{{ supplier.company_name }}</h3>
              <span class="status-badge" [ngClass]="supplier.onboarding_status.toLowerCase()">
                {{ supplier.onboarding_status }}
              </span>
            </div>
          </ng-template>

          <div class="supplier-details">
            <p><strong>ID:</strong> {{ supplier.name }}</p>
            <p><strong>Email:</strong> {{ supplier.primary_email_id }}</p>
            <p><strong>Phone:</strong> {{ supplier.primary_phone_number }}</p>
          </div>

          <ng-template pTemplate="footer">
            <div class="supplier-actions">
              <button pButton icon="pi pi-eye" class="p-button-rounded p-button-text" 
                      pTooltip="View Details" tooltipPosition="top"></button>
              <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-text" 
                      pTooltip="Edit" tooltipPosition="top"></button>
              <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" 
                      pTooltip="Delete" tooltipPosition="top"></button>
            </div>
          </ng-template>
        </p-card>
      </div>
    </div>
  `,
  styles: [`
    .suppliers-container {
      padding: 2rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .suppliers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .supplier-card {
      height: 100%;
    }

    .supplier-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background-color: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }

    .supplier-header h3 {
      margin: 0;
      font-size: 1.2rem;
      color: #333;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .status-badge.in-progress {
      background-color: #fff3cd;
      color: #856404;
    }

    .status-badge.completed {
      background-color: #d4edda;
      color: #155724;
    }

    .status-badge.rejected {
      background-color: #f8d7da;
      color: #721c24;
    }

    .supplier-details {
      padding: 1rem 0;
    }

    .supplier-details p {
      margin: 0.5rem 0;
      color: #666;
    }

    .supplier-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
  `]
})
export class ManageSuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];

  constructor(private commonService: CommonService) {}

  ngOnInit() {
    this.loadSuppliers();
  }

  loadSuppliers() {
    const endPoint = '/api/resource/wfb_supplier_onboarding_L1?fields=["*"]';
    this.commonService.getData(endPoint).subscribe({
      next: (response: any) => {
        this.suppliers = response.data;
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
      }
    });
  }
} 