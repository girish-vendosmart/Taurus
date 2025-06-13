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
import { CommonService } from '../../../shared/services/common.service';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressBarModule } from 'primeng/progressbar';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TagModule } from 'primeng/tag';
import { SweetAlertService } from '../../../shared/services/sweet-alert.service'
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { CommonTableComponent, TableConfig, TableColumn, ActionButton } from '../../../shared/components/common-table/common-table.component';
import { ConfigurableButtonComponent } from '../../../shared/components/configurable-button/configurable-button.component';

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
  resubmit_request?: boolean;
  companySubInfo?: string;
  contactSubInfo?: string;
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
    OverlayPanelModule,
    TagModule,
    DateFormatPipe,
    CommonTableComponent,
    ConfigurableButtonComponent
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    
    <div class="suppliers-container">
      <div class="header">
        <h3>Manage your vendors</h3>
        <app-configurable-button
          [configuration]="inviteButtonConfig"
          (onClick)="showInviteDialog()">
        </app-configurable-button>
      </div>

      <p-tabView>
        <p-tabPanel header="Active Suppliers">
          <div class="table-section">
          <app-common-table 
            [config]="activeSupplierTableConfig" 
            [data]="suppliers"
            [loading]="loadingSuppliers"
            (rowClick)="onActiveSupplierRowClick($event)"
            (linkClick)="onActiveSupplierLinkClick($event)"
            (actionClick)="onActiveSupplierActionClick($event)">
          </app-common-table>
          </div>
        </p-tabPanel>
        
        <p-tabPanel header="Invited Suppliers">
          <div class="table-section">
          <app-common-table 
            [config]="invitedSupplierTableConfig" 
            [data]="invitedSuppliers"
            [loading]="loadingInvitedSuppliers"
            (rowClick)="onInvitedSupplierRowClick($event)"
            (linkClick)="onInvitedSupplierLinkClick($event)"
            (actionClick)="onInvitedSupplierActionClick($event)">
          </app-common-table>
          </div>
        </p-tabPanel>
      </p-tabView>
    </div>

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
          <app-configurable-button
            [configuration]="cancelButtonConfig"
            (onClick)="hideInviteDialog()">
          </app-configurable-button>
          <app-configurable-button
            [configuration]="sendInvitationButtonConfig"
            (onClick)="onSubmit()">
          </app-configurable-button>
        </div>
      </form>
    </p-dialog>
  `,
  styles: [`
    .table-section {
      background: white;
      border-radius: 10px !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.1);
      position: relative;
      width: 100%;
    }

    /* Ensure proper table scrolling */
    ::ng-deep .p-datatable {
      overflow-x: auto !important;
      display: block;
    }

    ::ng-deep .p-datatable-wrapper {
      overflow-x: auto !important;
      min-width: 100%;
      width: max-content;
    }

    ::ng-deep .p-datatable-table {
      min-width: 1500px !important;
      width: 100%;
    }

    /* Column widths */
    ::ng-deep .p-datatable .p-datatable-thead > tr > th:first-child,
    ::ng-deep .p-datatable .p-datatable-tbody > tr > td:first-child {
      min-width: 400px;
    }

    ::ng-deep .p-datatable .p-datatable-thead > tr > th:nth-child(2),
    ::ng-deep .p-datatable .p-datatable-tbody > tr > td:nth-child(2) {
      min-width: 300px;
    }

    ::ng-deep .p-datatable .p-datatable-thead > tr > th:last-child,
    ::ng-deep .p-datatable .p-datatable-tbody > tr > td:last-child {
      min-width: 150px;
    }

    /* Cell content handling */
    ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Tab panel container */
    ::ng-deep .p-tabview .p-tabview-panels {
      padding: 0 !important;
    }

    ::ng-deep .p-tabview-panel {
      overflow: hidden;
    }

    .suppliers-container {
      padding: 1.2rem;
      width: 100%;
      overflow: hidden;
    }

    @media (max-width: 768px) {
      .suppliers-container {
        padding: 0.8rem;
      }

      ::ng-deep .p-tabview-panel {
        padding: 1rem 0;
      }
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.2rem;
    }

    

    .invite-form .field {
      margin-bottom: 1rem;
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
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid #dee2e6;
    }

    /* PrimeNG component overrides for better alignment */
    :host ::ng-deep .p-tabview .p-tabview-nav {
      justify-content: flex-start;
      padding: 0 !important;
    }

    :host ::ng-deep .p-button {
      padding: 0.4rem 0.8rem !important;
      font-size: 0.875rem !important;
      border-radius: 5px !important;
    }

    :host ::ng-deep .p-dialog .p-dialog-content {
      padding: 1rem !important;
    }

    ::ng-deep .p-tabview .p-tabview-panels {
      padding: 0 !important;
      color: black !important;
      font-weight: 500 !important;
      border-radius: 10px !important;
    }

    ::ng-deep .p-tabview .p-tabview-nav li .p-tabview-nav-link {
      padding: 14px !important;
    }

    ::ng-deep .p-tabview-nav-link {
      text-decoration: none !important;
    }

    ::ng-deep .p-dialog-header {
      padding-bottom: 0px !important;
      padding-left: 15px !important;
      padding-right: 15px !important;
    }
  `]
})
export class ManageSuppliersComponent implements OnInit {
  private sweetAlert = inject(SweetAlertService);
  suppliers: Supplier[] = [];
  invitedSuppliers: any[] = [];
  inviteDialogVisible = false;
  inviteForm: FormGroup;
  isSubmitting = false;
  loadingSuppliers = false;
  loadingInvitedSuppliers = false;
  
  // Table configurations
  activeSupplierTableConfig: TableConfig = {
    columns: [
      {
        field: 'company_name',
        header: 'Company',
        sortable: true,
        filterable: true,
        isLink: true,
        width: '40%'
      },
      {
        field: 'primary_email_id',
        header: 'Contact',
        sortable: true,
        filterable: true,
        width: '35%'
      },
      {
        field: 'onboarding_status',
        header: 'Status',
        sortable: true,
        filterable: true,
        isStatus: true,
        width: '25%'
      }
    ],
    enableSearch: true,
    enableSort: true,
    enableFilter: true,
    enablePagination: true,
    pageSize: 10
  };

  invitedSupplierTableConfig: TableConfig = {
    columns: [
      {
        field: 'company_name',
        header: 'Company',
        sortable: true,
        filterable: true,
        width: '35%'
      },
      {
        field: 'supplier_email_id',
        header: 'Contact',
        sortable: true,
        filterable: true,
        width: '35%'
      },
      {
        field: 'status',
        header: 'Status',
        sortable: true,
        filterable: true,
        isStatus: true,
        width: '20%'
      },
      {
        field: 'actions',
        header: 'Action',
        sortable: false,
        filterable: false,
        isAction: true,
        width: '10%'
      }
    ],
    enableSearch: true,
    enableSort: true,
    enableFilter: true,
    enablePagination: true,
    pageSize: 10,
    showActions: true,
    actionButtons: [
      {
        action: 'resend',
        icon: 'pi pi-send',
        iconOnly: true,
        tooltip: 'Resend Invitation',
        severity: 'secondary'
      }
    ]
  };

  inviteButtonConfig = {
    label: 'Invite Vendor',
    icon: 'pi pi-plus',
    severity: 'primary',
    style: {
      fontSize: '0.875rem',
      padding: '0.4rem 0.8rem',
      borderRadius: '5px'
    }
  };

  cancelButtonConfig = {
    label: 'Cancel',
    icon: 'pi pi-times',
    severity: 'secondary',
    outlined: true,
    style: {
      marginRight: '0.5rem',
      padding: '0.4rem 0.8rem',
      fontSize: '0.875rem',
      borderRadius: '5px'
    }
  };

  sendInvitationButtonConfig = {
    label: 'Send Invitation',
    icon: 'pi pi-send',
    severity: 'primary',
    loading: false,
    disabled: false,
    style: {
      padding: '0.4rem 0.8rem',
      fontSize: '0.875rem',
      borderRadius: '5px'
    }
  };

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private sweetAlertService: SweetAlertService
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
    this.accessFirebaseTrigger('Supplier Invitation_list_view', 'invitation_list_view');
    this.accessFirebaseTriggerLoad('Supplier Onboarding L1_list_view', 'L1_list_view');
  }

  loadSuppliers() {
    this.loadingSuppliers = true;
    const endPoint = '/api/resource/Supplier Onboarding L1?fields=["*"]&limit_page_length=0&order_by=modified desc';
    this.commonService.getData(endPoint).subscribe({
      next: (response: any) => {
        // Transform data to include sub-information for display
        this.suppliers = response.data.map((supplier: any) => ({
          ...supplier,
          // Add sub-information that will be displayed in the company cell
          companySubInfo: supplier.name,
          // Add sub-information for contact column (phone number)
          contactSubInfo: supplier.primary_phone_number
        }));
        this.loadingSuppliers = false;
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
        this.sweetAlert.error('Failed to load suppliers');
        this.loadingSuppliers = false;
      }
    });
  }

  loadInvitedSuppliers() {
    this.loadingInvitedSuppliers = true;
    const endPoint = '/api/resource/Supplier Invitation?fields=["*"]&limit_page_length=0&order_by=modified desc';
    this.commonService.getData(endPoint).subscribe({
      next: (response: any) => {
        // Transform data to add status and sub-information
        this.invitedSuppliers = response.data.map((invite: any) => ({
          ...invite,
          status: 'Invited',
          companySubInfo: invite.supplier_name,
          contactSubInfo: this.formatDate(invite.creation)
        }));
        this.loadingInvitedSuppliers = false;
      },
      error: (error) => {
        console.error('Error loading invited suppliers:', error);
        this.sweetAlert.error('Failed to load invited suppliers');
        this.loadingInvitedSuppliers = false;
      }
    });
  }

  // Event handlers for Active Suppliers table
  onActiveSupplierRowClick(event: { event: Event, rowData: any }) {
    // Handle row click if needed
  }

  onActiveSupplierLinkClick(event: { rowData: any, column: TableColumn }) {
    this.viewSupplierProfile(event.rowData);
  }

  onActiveSupplierActionClick(event: { action: string, rowData: any }) {
    // Handle actions if any are added later
  }

  // Event handlers for Invited Suppliers table
  onInvitedSupplierRowClick(event: { event: Event, rowData: any }) {
    // Handle row click if needed
  }

  onInvitedSupplierLinkClick(event: { rowData: any, column: TableColumn }) {
    // Handle link click if needed
  }

  onInvitedSupplierActionClick(event: { action: string, rowData: any }) {
    if (event.action === 'resend') {
      this.resendInvitation(event.rowData);
    }
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
      this.sendInvitationButtonConfig = {
        ...this.sendInvitationButtonConfig,
        loading: true,
        disabled: true
      };
      
      const endPoint = '/api/resource/Supplier Invitation';
      
      this.commonService.postData(endPoint, this.inviteForm.value).subscribe({
        next: (response) => {
          this.sweetAlert.success('Supplier invitation sent successfully!');
          this.hideInviteDialog();
          this.loadInvitedSuppliers();
          this.loadSuppliers();
        },
        error: (error) => {
          this.sendInvitationButtonConfig = {
            ...this.sendInvitationButtonConfig,
            loading: false,
            disabled: false
          };
          console.error('Error inviting supplier:', error);
          this.hideInviteDialog();
          
          // Extract proper error message from server response
          let errorMessage = 'Failed to send supplier invitation. Please try again.';
          
          if (error?.error?._server_messages) {
            try {
              // Parse the server messages which come as JSON string
              const serverMessages = JSON.parse(error.error._server_messages);
              if (serverMessages && serverMessages.length > 0) {
                const firstMessage = JSON.parse(serverMessages[0]);
                errorMessage = firstMessage.message || errorMessage;
              }
            } catch (parseError) {
              console.error('Error parsing server messages:', parseError);
            }
          } else if (error?.error?.exception) {
            // Handle specific exception types
            if (error.error.exc_type === 'DuplicateEntryError') {
              errorMessage = 'This supplier has already been invited. Please check the invited suppliers list.';
            } else {
              errorMessage = 'An error occurred while processing your request.';
            }
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          // Handle specific HTTP status codes
          if (error?.status === 409) {
            errorMessage = errorMessage || 'This supplier has already been invited.';
          } else if (error?.status === 400) {
            errorMessage = 'Invalid data provided. Please check your input.';
          } else if (error?.status === 500) {
            errorMessage = 'Server error occurred. Please try again later.';
          }
          
          this.sweetAlert.error(errorMessage);
        },
        complete: () => {
          this.sendInvitationButtonConfig = {
            ...this.sendInvitationButtonConfig,
            loading: false,
            disabled: false
          };
        }
      });
    } else {
      // Handle form validation errors
      this.markFormGroupTouched(this.inviteForm);
    }
  }

  // Helper method to mark all form controls as touched for validation display
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  viewSupplierProfile(supplier: Supplier) {
    localStorage.setItem('supplier_id', supplier.name);
    this.router.navigate(['/wefab/supplier/profile-review/', localStorage.getItem('supplier_id')]);
  }

  resendInvitation(invite: any) {
    this.sweetAlertService.confirm(
      '',
      'Are you sure you want to resend the invitation to supplier?',
      'question',
      'Yes',
      'No'
    ).then((result:any) => {
      if (result.isConfirmed) {
        console.log("Invitation ", invite);
        let data = {
          company_name: invite.company_name,
          supplier_email_id: invite.supplier_email_id,
        }
        this.commonService.postData('/api/method/wefab.wefab.api.wefab_team.supplier_management.supplier_management.resend_supplier_invitation', data).subscribe((res: any) => {
          this.sweetAlert.success('Invitation resent successfully');
          this.loadInvitedSuppliers(); // Refresh the invited list after resending
        });
      }
    });
  }

  accessFirebaseTrigger(doctType_name: string, doctypeId: string) {
    this.commonService.commonFirebaseTrigger('Supplier Onboarding L1_list_view', 'L1_list_view').subscribe((res: any) => {
      this.loadSuppliers();
    });
  }

  accessFirebaseTriggerLoad(doctType_name: string, doctypeId: string) {
    this.commonService.commonFirebaseTrigger('Supplier Invitation_list_view', 'invitation_list_view').subscribe((res: any) => {
      this.loadInvitedSuppliers();
    });
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  }
} 