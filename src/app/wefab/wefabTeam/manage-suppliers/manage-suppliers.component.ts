import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
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
  imports: [
    CommonModule, 
    RouterModule, 
    ButtonModule, 
    CardModule, 
    DialogModule,
    InputTextModule,
    ReactiveFormsModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    
    <div class="suppliers-container">
      <div class="header">
        <h1>Manage Suppliers</h1>
        <button pButton label="Add New Supplier" icon="pi pi-plus" class="p-button-primary" (click)="showInviteDialog()"></button>
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

    <p-dialog 
      [(visible)]="inviteDialogVisible" 
      [style]="{width: '450px'}" 
      header="Invite New Supplier" 
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onDialogHide()">
      <form [formGroup]="inviteForm" (ngSubmit)="onSubmit()" class="invite-form">
        <div class="field">
          <label for="supplier_name">Supplier Name</label>
          <input id="supplier_name" type="text" pInputText formControlName="supplier_name" 
                 [ngClass]="{'ng-invalid ng-dirty': inviteForm.get('supplier_name')?.invalid && inviteForm.get('supplier_name')?.touched}"
                 placeholder="Enter supplier name">
          <small class="p-error" *ngIf="inviteForm.get('supplier_name')?.invalid && inviteForm.get('supplier_name')?.touched">
            Supplier name is required
          </small>
        </div>

        <div class="field">
          <label for="supplier_email_id">Email Address</label>
          <input id="supplier_email_id" type="email" pInputText formControlName="supplier_email_id"
                 [ngClass]="{'ng-invalid ng-dirty': inviteForm.get('supplier_email_id')?.invalid && inviteForm.get('supplier_email_id')?.touched}"
                 placeholder="Enter email address">
          <small class="p-error" *ngIf="inviteForm.get('supplier_email_id')?.invalid && inviteForm.get('supplier_email_id')?.touched">
            Please enter a valid email address
          </small>
        </div>

        <div class="field">
          <label for="company_name">Company Name</label>
          <input id="company_name" type="text" pInputText formControlName="company_name"
                 [ngClass]="{'ng-invalid ng-dirty': inviteForm.get('company_name')?.invalid && inviteForm.get('company_name')?.touched}"
                 placeholder="Enter company name">
          <small class="p-error" *ngIf="inviteForm.get('company_name')?.invalid && inviteForm.get('company_name')?.touched">
            Company name is required
          </small>
        </div>

        <div class="dialog-footer">
          <button pButton type="button" label="Cancel" icon="pi pi-times" class="p-button-text" (click)="hideInviteDialog()"></button>
          <button pButton type="submit" label="Send Invitation" icon="pi pi-check" class="p-button-primary" 
                  [disabled]="inviteForm.invalid || isSubmitting"></button>
        </div>
      </form>
    </p-dialog>
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

    .invite-form {
      .field {
        margin-bottom: 1.5rem;

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        input {
          width: 100%;
          padding: 0.5rem;
        }

        small {
          display: block;
          margin-top: 0.25rem;
        }
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 2rem;
    }
  `]
})
export class ManageSuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  inviteDialogVisible = false;
  inviteForm: FormGroup;
  isSubmitting = false;

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.inviteForm = this.fb.group({
      supplier_email_id: ['', [Validators.required, Validators.email]],
      supplier_name: ['', Validators.required],
      company_name: ['', Validators.required]
    });
  }

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
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load suppliers'
        });
      }
    });
  }

  showInviteDialog() {
    this.inviteDialogVisible = true;
  }

  hideInviteDialog() {
    this.inviteDialogVisible = false;
  }

  onDialogHide() {
    this.inviteForm.reset();
  }

  onSubmit() {
    if (this.inviteForm.valid) {
      this.isSubmitting = true;
      const endPoint = '/api/resource/wfb_supplier_invitation';
      
      this.commonService.postData(endPoint, this.inviteForm.value).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Supplier invitation sent successfully'
          });
          this.hideInviteDialog();
          this.loadSuppliers(); // Refresh the list
        },
        error: (error) => {
          console.error('Error inviting supplier:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to send invitation'
          });
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    }
  }
} 