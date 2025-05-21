import { Component, OnInit, ViewChild, inject } from '@angular/core';
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
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressBarModule } from 'primeng/progressbar';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SweetAlertService } from '../../shared/sweet-alert.service'

interface Supplier {
  name: string;
  company_name: string;
  primary_email_id: string;
  primary_phone_number: string;
  onboarding_status: string;
  company_profile: string;
  project_type?: string;
  location?: string;
  created_at?: string;
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
    TableModule,
    PaginatorModule,
    ProgressBarModule,
    DropdownModule,
    TabViewModule,
    MenuModule,
    FormsModule,
    OverlayPanelModule
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
                  <th>
                    <div class="header-cell" (click)="sort('company_name')">
                      <span>Company</span>
                      <i class="pi" [ngClass]="getSortIcon('company_name')"></i>
                    </div>
                    <div class="filter-row">
                      <input pInputText type="text" placeholder="Search Company" class="search-input" 
                             [(ngModel)]="filters.company" (input)="applyFilters()">
                    </div>
                  </th>
                  <th>
                    <div class="header-cell" (click)="sort('primary_email_id')">
                      <span>Contact</span>
                      <i class="pi" [ngClass]="getSortIcon('primary_email_id')"></i>
                    </div>
                    <div class="filter-row">
                      <input pInputText type="text" placeholder="Search Contact" class="search-input"
                             [(ngModel)]="filters.contact" (input)="applyFilters()">
                    </div>
                  </th>
                  <th>
                    <div class="header-cell" (click)="sort('onboarding_status')">
                      <span>Status</span>
                      <i class="pi" [ngClass]="getSortIcon('onboarding_status')"></i>
                    </div>
                    <div class="filter-row">
                      <input pInputText type="text" placeholder="Search Status" class="search-input"
                             [(ngModel)]="filters.status" (input)="applyFilters()">
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let supplier of filteredSuppliers">
                  <td>
                  <div class="project-name" (click)="viewSupplierProfile(supplier)">{{ supplier.company_name }}</div>
                    <div class="sub-id">{{ supplier.name }}</div>
                  </td>
                  <td>
                    <div>{{ supplier.primary_email_id }}</div>
                    <div class="sub-id">{{ supplier.primary_phone_number }}</div>
                  </td>
                  <td>
                    <span class="status-badge" [ngClass]="getStatusClass(supplier.onboarding_status)">
                      {{ supplier.onboarding_status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div class="pagination-footer">
              <div class="pagination-info">
                Showing 1 to {{ filteredSuppliers.length }} of {{ filteredSuppliers.length }} entries
              </div>
              <div class="pagination-controls">
                <button pButton type="button" icon="pi pi-angle-double-left" class="p-button-text p-button-sm"></button>
                <button pButton type="button" icon="pi pi-angle-left" class="p-button-text p-button-sm"></button>
                <button pButton type="button" label="1" class="p-button-sm p-button-primary"></button>
                <button pButton type="button" icon="pi pi-angle-right" class="p-button-text p-button-sm"></button>
                <button pButton type="button" icon="pi pi-angle-double-right" class="p-button-text p-button-sm"></button>
              </div>
            </div>
          </p-tabPanel>
          <p-tabPanel header="Invited Suppliers">
            <table class="suppliers-table">
              <thead>
                <tr>
                  <th>
                    <div class="header-cell" (click)="sortInvited('company_name')">
                      <span>Company</span>
                      <i class="pi" [ngClass]="getSortIconInvited('company_name')"></i>
                    </div>
                    <div class="filter-row">
                      <input pInputText type="text" placeholder="Search Company" class="search-input"
                             [(ngModel)]="invitedFilters.company" (input)="applyInvitedFilters()">
                    </div>
                  </th>
                  <th>
                    <div class="header-cell" (click)="sortInvited('supplier_email_id')">
                      <span>Contact</span>
                      <i class="pi" [ngClass]="getSortIconInvited('supplier_email_id')"></i>
                    </div>
                    <div class="filter-row">
                      <input pInputText type="text" placeholder="Search Contact" class="search-input"
                             [(ngModel)]="invitedFilters.contact" (input)="applyInvitedFilters()">
                    </div>
                  </th>
                  <th>
                    <div class="header-cell" (click)="sortInvited('status')">
                      <span>Status</span>
                      <i class="pi" [ngClass]="getSortIconInvited('status')"></i>
                    </div>
                    <div class="filter-row">
                      <input pInputText type="text" placeholder="Search Status" class="search-input"
                             [(ngModel)]="invitedFilters.status" (input)="applyInvitedFilters()">
                    </div>
                  </th>
                  <th class="actions-column">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let invite of filteredInvitedSuppliers">
                  <td>
                    <div class="project-name">{{ invite.company_name }}</div>
                    <div class="sub-id">{{ invite.supplier_name }}</div>
                  </td>
                  <td>
                    <div>{{ invite.supplier_email_id }}</div>
                    <div class="sub-id">{{ invite.creation }}</div>
                  </td>
                  <td>
                    <span class="status-badge status-pending">Invited</span>
                  </td>
                  <td class="actions-column">
                    <button pButton type="button" icon="pi pi-send" class="menu-button" title="Resend Invitation"
                      (click)="resendInvitation(invite)"></button>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div class="pagination-footer">
              <div class="pagination-info">
                Showing 1 to {{ filteredInvitedSuppliers.length }} of {{ filteredInvitedSuppliers.length }} entries
              </div>
              <div class="pagination-controls">
                <button pButton type="button" icon="pi pi-angle-double-left" class="p-button-text p-button-sm"></button>
                <button pButton type="button" icon="pi pi-angle-left" class="p-button-text p-button-sm"></button>
                <button pButton type="button" label="1" class="p-button-sm p-button-primary"></button>
                <button pButton type="button" icon="pi pi-angle-right" class="p-button-text p-button-sm"></button>
                <button pButton type="button" icon="pi pi-angle-double-right" class="p-button-text p-button-sm"></button>
              </div>
            </div>
          </p-tabPanel>
        </p-tabView>
    </div>

    <!-- Action menus -->
    <p-menu #actionMenu [popup]="true" [model]="supplierMenuItems" [styleClass]="'custom-menu'"></p-menu>
    <p-menu #inviteActionMenu [popup]="true" [model]="invitedMenuItems" [styleClass]="'custom-menu'"></p-menu>

    <p-dialog 
      [(visible)]="inviteDialogVisible" 
      [style]="{width: '450px'}" 
      header="Invite Supplier" 
      [modal]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onDialogHide()">
      <form [formGroup]="inviteForm" (ngSubmit)="onSubmit()" class="invite-form">
        <div class="field">
          <label for="supplier_name">Contact Person Name</label>
          <input id="supplier_name" type="text" pInputText formControlName="supplier_name" 
                 [ngClass]="{'ng-invalid ng-dirty': inviteForm.get('supplier_name')?.invalid && inviteForm.get('supplier_name')?.touched}"
                 placeholder="Enter contact person name">
          <small class="p-error" *ngIf="inviteForm.get('supplier_name')?.invalid && inviteForm.get('supplier_name')?.touched">
            Contact Person name is required
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
      padding: 1.2rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.2rem;
    }

    .header h1 {
      font-size: 1.6rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .card {
      background-color: transparent;
      border-radius: 0;
      box-shadow: none;
      overflow: hidden;
    }

    .suppliers-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e0e0e0;
    }

    .suppliers-table th {
      background: #f8f9fa;
      font-weight: 600;
      padding: 10px 12px;
      text-align: left;
      color: #495057;
      border: 1px solid #e0e0e0;
    }

    .suppliers-table td {
      padding: 10px 12px;
      border: 1px solid #e0e0e0;
      vertical-align: middle;
      text-align: left;
    }

    .project-name {
      color: #2563eb;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
    }

    .project-name:hover {
      text-decoration: underline;
    }

    .header-cell {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
    }

    .header-cell:hover {
      color: #0d6efd;
    }

    .search-input {
      width: 100%;
      font-size: 0.85rem;
      padding: 6px;
      border-radius: 4px;
      margin-top: 5px;
    }

    .status-badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      text-align: center;
      font-weight: 500;
    }

    .status-active {
      background-color: #e8f5e9;
      color: #1b9b62;
    }

    .status-pending {
      background-color: #fff1ec;
      color: #f76b42;
    }

    .status-completed {
      background-color: #e7f9ee;
      color: #1a9b61;
    }

    .status-inprogress {
      background-color: #fff3cd;
      color: #856404;
    }

    .status-review {
      background-color: #fff3cd;
      color: #856404;
    }

    .status-rejected {
      background-color: #f8d7da;
      color: #721c24;
    }

    .actions-column {
      white-space: nowrap;
      text-align: center;
    }

    .menu-button {
      background: none;
      border: 1px solid #E0E0E0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #6c757d;
      border-radius: 4px;
      margin: 0;
    }

    .menu-button:hover {
      background-color: #f8f9fa;
    }

    .menu-button i {
      font-size: 1rem;
    }

    .sub-id {
      color: #888;
      font-size: 0.85em;
      text-align: left;
      margin-top: 3px;
    }

    .pagination-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-top: 1px solid #e0e0e0;
      background-color: #f8f9fa;
    }

    .pagination-info {
      font-size: 0.9rem;
      color: #6c757d;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .pagination-controls button {
      margin: 0 2px;
    }

    .pagination-controls .p-button-primary {
      background-color: #3b82f6;
      border-color: #3b82f6;
    }

    .invite-form .field {
      margin-bottom: 1.2rem;
    }

    .invite-form .field label {
      display: block;
      margin-bottom: 0.4rem;
      font-weight: 500;
    }

    .invite-form .field input {
      width: 100%;
      padding: 0.5rem;
    }

    .invite-form .field small {
      display: block;
      margin-top: 0.25rem;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }

    /* Custom menu styling to match screenshot */
    :host ::ng-deep .custom-menu {
      border: 1px solid #e0e0e0 !important;
      border-radius: 4px !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
      min-width: 180px !important;
      padding: 0 !important;
    }
    
    :host ::ng-deep .custom-menu .p-menuitem-link {
      padding: 0.7rem 1rem !important;
    }
    
    :host ::ng-deep .custom-menu .p-menuitem-icon {
      color: #495057 !important;
      margin-right: 0.75rem !important;
    }
    
    :host ::ng-deep .custom-menu .p-menuitem-text {
      color: #495057 !important;
      font-weight: 400 !important;
    }
    
    :host ::ng-deep .custom-menu .p-menuitem-link:hover {
      background-color: #f8f9fa !important;
    }

    /* PrimeNG component overrides for better alignment */
    :host ::ng-deep .p-tabview .p-tabview-nav {
      justify-content: flex-start;
    }

    :host ::ng-deep .p-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    /* Add some breathing room between rows */
    .suppliers-table tr:hover {
      background-color: #f5f9ff;
    }
  `]
})
export class ManageSuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  invitedSuppliers: any[] = [];
  filteredSuppliers: Supplier[] = [];
  filteredInvitedSuppliers: any[] = [];
  inviteDialogVisible = false;
  inviteForm: FormGroup;
  isSubmitting = false;
  
  // Selected items for actions
  selectedSupplier: Supplier | null = null;
  selectedInvite: any = null;
  
  // Menu items
  supplierMenuItems: MenuItem[] = [];
  invitedMenuItems: MenuItem[] = [];
  
  // Sorting state
  sortField: string = 'company_name';
  sortOrder: number = 1; // 1 for ascending, -1 for descending
  invitedSortField: string = 'company_name';
  invitedSortOrder: number = 1;
  
  // Filtering state
  filters = {
    company: '',
    contact: '',
    status: ''
  };
  
  invitedFilters = {
    company: '',
    contact: '',
    status: ''
  };

  // References to menu components
  @ViewChild('actionMenu') actionMenu: any;
  @ViewChild('inviteActionMenu') inviteActionMenu: any;

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
    
    // Initialize menu items
    this.initializeMenuItems();
  }

  ngOnInit() {
    this.loadSuppliers();
    this.loadInvitedSuppliers();
  }

  initializeMenuItems() {
    // Only keep View Profile in supplier menu
    this.supplierMenuItems = [
      {
        label: 'View Profile',
        icon: 'pi pi-eye',
        command: () => {
          if (this.selectedSupplier) {
            this.viewSupplierProfile(this.selectedSupplier);
          }
        }
      }
    ];
    
    // Only keep Resend Invitation in invited menu
    this.invitedMenuItems = [
      {
        label: 'Resend Invitation',
        icon: 'pi pi-send',
        command: () => {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Resend', 
            detail: 'Invitation resent successfully' 
          });
        }
      }
    ];
  }

  loadSuppliers() {
    const endPoint = '/api/resource/wfb_supplier_onboarding_L1?fields=["*"]&limit_page_length=0';
    this.commonService.getData(endPoint).subscribe({
      next: (response: any) => {
        this.suppliers = response.data;
        this.filteredSuppliers = [...this.suppliers];
        this.sortSuppliers();
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
        this.filteredInvitedSuppliers = [...this.invitedSuppliers];
        this.sortInvitedSuppliers();
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

  // Sorting functions
  sort(field: string) {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder * -1;
    } else {
      this.sortField = field;
      this.sortOrder = 1;
    }
    this.sortSuppliers();
  }
  
  sortInvited(field: string) {
    if (this.invitedSortField === field) {
      this.invitedSortOrder = this.invitedSortOrder * -1;
    } else {
      this.invitedSortField = field;
      this.invitedSortOrder = 1;
    }
    this.sortInvitedSuppliers();
  }
  
  sortSuppliers() {
    this.filteredSuppliers.sort((a: any, b: any) => {
      const valueA = a[this.sortField]?.toLowerCase() || '';
      const valueB = b[this.sortField]?.toLowerCase() || '';
      return this.sortOrder * (valueA > valueB ? 1 : valueA < valueB ? -1 : 0);
    });
  }
  
  sortInvitedSuppliers() {
    this.filteredInvitedSuppliers.sort((a: any, b: any) => {
      const valueA = a[this.invitedSortField]?.toLowerCase() || '';
      const valueB = b[this.invitedSortField]?.toLowerCase() || '';
      return this.invitedSortOrder * (valueA > valueB ? 1 : valueA < valueB ? -1 : 0);
    });
  }
  
  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return 'pi-sort-alt';
    }
    return this.sortOrder === 1 ? 'pi-sort-amount-up' : 'pi-sort-amount-down';
  }
  
  getSortIconInvited(field: string): string {
    if (this.invitedSortField !== field) {
      return 'pi-sort-alt';
    }
    return this.invitedSortOrder === 1 ? 'pi-sort-amount-up' : 'pi-sort-amount-down';
  }
  
  // Filtering functions
  applyFilters() {
    this.filteredSuppliers = this.suppliers.filter(supplier => {
      return (
        (this.filters.company === '' || 
          supplier.company_name.toLowerCase().includes(this.filters.company.toLowerCase()) || 
          supplier.name.toLowerCase().includes(this.filters.company.toLowerCase())) &&
        (this.filters.contact === '' || 
          supplier.primary_email_id.toLowerCase().includes(this.filters.contact.toLowerCase()) || 
          (supplier.primary_phone_number && supplier.primary_phone_number.toLowerCase().includes(this.filters.contact.toLowerCase()))) &&
        (this.filters.status === '' || 
          supplier.onboarding_status.toLowerCase().includes(this.filters.status.toLowerCase()))
      );
    });
    this.sortSuppliers();
  }
  
  applyInvitedFilters() {
    this.filteredInvitedSuppliers = this.invitedSuppliers.filter(invite => {
      return (
        (this.invitedFilters.company === '' || 
          invite.company_name.toLowerCase().includes(this.invitedFilters.company.toLowerCase()) || 
          (invite.supplier_name && invite.supplier_name.toLowerCase().includes(this.invitedFilters.company.toLowerCase()))) &&
        (this.invitedFilters.contact === '' || 
          invite.supplier_email_id.toLowerCase().includes(this.invitedFilters.contact.toLowerCase())) &&
        (this.invitedFilters.status === '' || 'invited'.includes(this.invitedFilters.status.toLowerCase()))
      );
    });
    this.sortInvitedSuppliers();
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

  getStatusClass(status: string): string {
    if (!status) return '';
    status = status.toLowerCase();
    
    if (status.includes('active') || status.includes('approved')) {
      return 'status-active';
    } else if (status.includes('pending') || status.includes('invited')) {
      return 'status-pending';
    } else if (status.includes('complete')) {
      return 'status-completed';
    } else if (status.includes('progress')) {
      return 'status-inprogress';
    } else if (status.includes('review')) {
      return 'status-review';
    } else if (status.includes('reject') || status.includes('declined')) {
      return 'status-rejected';
    }
    return '';
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

  resendInvitation(invite: any) {
    // this.sweetAlert.success('Invitation resent successfully');
  }
} 