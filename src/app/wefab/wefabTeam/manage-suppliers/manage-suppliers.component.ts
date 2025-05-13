import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CommonService } from '../../shared/common.service';
import { TabViewModule } from 'primeng/tabview';

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
    ToastModule,
    TabViewModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    
    <div class="suppliers-container">
      <div class="header">
        <h1>Manage your vendors</h1>
        <button pButton label="Invite Vendor" icon="pi pi-plus" class="p-button-primary" (click)="showInviteDialog()"></button>
      </div>
      <p-tabView>
        <p-tabPanel header="Active Suppliers">
          <table class="suppliers-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let supplier of suppliers">
                <td>
                  <div>{{ supplier.company_name }}</div>
                  <div class="sub-id">{{ supplier.name }}</div>
                </td>
                <td>
                  <div>{{ supplier.primary_email_id }}</div>
                  <div class="sub-id">{{ supplier.primary_phone_number }}</div>
                </td>
                <td><span class="status-badge">{{ supplier.onboarding_status }}</span></td>
                <td>0</td>
                <td>
                  <a class="action-link" (click)="viewSupplierProfile(supplier)">View</a>
                  <a class="action-link">Evaluate</a>
                </td>
              </tr>
            </tbody>
          </table>
        </p-tabPanel>
        <p-tabPanel header="Invited Suppliers">
          <table class="suppliers-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let invite of invitedSuppliers">
                <td>
                  <div>{{ invite.company_name }}</div>
                  <div class="sub-id">{{ invite.name }}</div>
                </td>
                <td>
                  <div>{{ invite.supplier_email_id }}</div>
                </td>
                <td><span class="status-badge">Invited</span></td>
                <td>0</td>
                <td>
                  <a class="action-link">Resend</a>
                </td>
              </tr>
            </tbody>
          </table>
        </p-tabPanel>
      </p-tabView>
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
          <button
            pButton
            type="submit"
            class="p-button-primary"
            [disabled]="inviteForm.invalid || isSubmitting">
            <ng-container *ngIf="isSubmitting">
              <i class="pi pi-spin pi-spinner" style="margin-right: 8px;"></i> Sending...
            </ng-container>
            <ng-container *ngIf="!isSubmitting">
              Send Invitation
            </ng-container>
          </button>
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

    .suppliers-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2rem;
    }
    .suppliers-table th, .suppliers-table td {
      border: 1px solid #e0e0e0;
      padding: 0.75rem 1rem;
      text-align: left;
    }
    .suppliers-table th {
      background: #f8f9fa;
      font-weight: 600;
    }
    .sub-id {
      color: #888;
      font-size: 0.85em;
    }
    .action-link {
      color: #007bff;
      cursor: pointer;
      margin-right: 1rem;
      text-decoration: underline;
    }
    .action-link:last-child {
      margin-right: 0;
    }
  `]
})
export class ManageSuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  invitedSuppliers: any[] = [];
  inviteDialogVisible = false;
  inviteForm: FormGroup;
  isSubmitting = false;

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router
  ) {
    this.inviteForm = this.fb.group({
      supplier_email_id: ['', [Validators.required, Validators.email]],
      supplier_name: ['', Validators.required],
      company_name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadSuppliers();
    this.loadInvitedSuppliers();
  }

  loadSuppliers() {
    const endPoint = '/api/resource/wfb_supplier_onboarding_L1?fields=["*"]&limit_page_length=0';
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

  loadInvitedSuppliers() {
    const endPoint = '/api/resource/wfb_supplier_invitation?fields=["*"]';
    this.commonService.getData(endPoint).subscribe({
      next: (response: any) => {
        this.invitedSuppliers = response.data;
      },
      error: (error) => {
        console.error('Error loading invited suppliers:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load invited suppliers'
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
          this.loadSuppliers();
          this.loadInvitedSuppliers(); // Refresh invited list
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

  viewSupplierProfile(supplier: Supplier) {
    sessionStorage.setItem('supplier_id', supplier.name);
    this.router.navigate(['/wefab/supplier/profile-review']);
  }
} 