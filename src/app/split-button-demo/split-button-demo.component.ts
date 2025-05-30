import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { SplitButtonComponent, SplitButtonOption } from '../shared/split-button/split-button.component';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-split-button-demo',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    SplitButtonComponent,
    CardModule,
    PanelModule,
    DividerModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="demo-container">
      <div class="demo-header">
        <h1 class="demo-title">Split Button Component Demo</h1>
        <p class="demo-description">
          A customizable split button component with dropdown functionality, 
          following WE-FAB brand guidelines and built with PrimeNG.
        </p>
      </div>

      <div class="demo-grid">
        <!-- Basic Example -->
        <p-card header="Basic Split Button" styleClass="demo-card">
          <div class="demo-section">
            <app-split-button
              [options]="basicOptions"
              placeholder="Select Action"
              severity="primary"
              (optionSelected)="onOptionSelected('Basic', $event)"
              (mainButtonClicked)="onMainButtonClicked('Basic', $event)">
            </app-split-button>
            
            <div class="demo-info">
              <strong>Selected Value:</strong> {{ basicSelectedValue || 'None' }}
            </div>
          </div>
        </p-card>

        <!-- Severity Variants -->
        <p-card header="Severity Variants" styleClass="demo-card">
          <div class="demo-section">
            <div class="button-group">
              <app-split-button
                [options]="severityOptions"
                placeholder="Primary"
                severity="primary"
                class="mb-3">
              </app-split-button>
              
              <app-split-button
                [options]="severityOptions"
                placeholder="Secondary"
                severity="secondary"
                class="mb-3">
              </app-split-button>
              
              <app-split-button
                [options]="severityOptions"
                placeholder="Success"
                severity="success"
                class="mb-3">
              </app-split-button>
              
              <app-split-button
                [options]="severityOptions"
                placeholder="Danger"
                severity="danger"
                class="mb-3">
              </app-split-button>
              
              <app-split-button
                [options]="severityOptions"
                placeholder="Warning"
                severity="warning"
                class="mb-3">
              </app-split-button>
              
              <app-split-button
                [options]="severityOptions"
                placeholder="Info"
                severity="info">
              </app-split-button>
            </div>
          </div>
        </p-card>

        <!-- With Icons -->
        <p-card header="With Icons" styleClass="demo-card">
          <div class="demo-section">
            <app-split-button
              [options]="iconOptions"
              placeholder="Select Tool"
              severity="primary"
              (optionSelected)="onOptionSelected('Icon', $event)">
            </app-split-button>
            
            <div class="demo-info">
              <strong>Selected Tool:</strong> {{ iconSelectedValue || 'None' }}
            </div>
          </div>
        </p-card>

        <!-- File Operations -->
        <p-card header="File Operations" styleClass="demo-card">
          <div class="demo-section">
            <app-split-button
              [options]="fileOptions"
              placeholder="Save As..."
              severity="success"
              (optionSelected)="onOptionSelected('File', $event)"
              (mainButtonClicked)="onMainButtonClicked('File', $event)">
            </app-split-button>
            
            <div class="demo-info">
              <strong>Last Action:</strong> {{ fileAction || 'None' }}
            </div>
          </div>
        </p-card>

        <!-- Disabled State -->
        <p-card header="Disabled State" styleClass="demo-card">
          <div class="demo-section">
            <app-split-button
              [options]="basicOptions"
              placeholder="Disabled Button"
              severity="secondary"
              [disabled]="true">
            </app-split-button>
            
            <div class="demo-info">
              This button is disabled and cannot be interacted with.
            </div>
          </div>
        </p-card>

        <!-- Form Integration -->
        <p-card header="Form Integration" styleClass="demo-card">
          <div class="demo-section">
            <form [formGroup]="demoForm" class="form-container">
              <app-split-button
                [options]="formOptions"
                placeholder="Select Priority"
                severity="warning"
                formControlName="priority"
                (optionSelected)="onFormOptionSelected($event)">
              </app-split-button>
              
              <div class="demo-info">
                <strong>Form Value:</strong> {{ demoForm.get('priority')?.value || 'None' }}
                <br>
                <strong>Form Valid:</strong> {{ demoForm.valid }}
              </div>
            </form>
          </div>
        </p-card>

        <!-- Separator Example -->
        <p-card header="With Separators" styleClass="demo-card">
          <div class="demo-section">
            <app-split-button
              [options]="separatorOptions"
              placeholder="User Actions"
              severity="secondary"
              (optionSelected)="onOptionSelected('Separator', $event)">
            </app-split-button>
            
            <div class="demo-info">
              <strong>Selected Action:</strong> {{ separatorSelectedValue || 'None' }}
            </div>
          </div>
        </p-card>

        <!-- Custom Disabled Options -->
        <p-card header="Mixed Disabled Options" styleClass="demo-card">
          <div class="demo-section">
            <app-split-button
              [options]="mixedOptions"
              placeholder="Mixed States"
              severity="info"
              (optionSelected)="onOptionSelected('Mixed', $event)">
            </app-split-button>
            
            <div class="demo-info">
              Some options are disabled in this dropdown.
            </div>
          </div>
        </p-card>
      </div>

      <p-toast></p-toast>
    </div>
  `,
  styleUrls: ['./split-button-demo.component.scss']
})
export class SplitButtonDemoComponent {
  basicSelectedValue: string = '';
  iconSelectedValue: string = '';
  fileAction: string = '';
  separatorSelectedValue: string = '';
  demoForm: FormGroup;

  basicOptions: SplitButtonOption[] = [
    { label: 'Create New', value: 'create', icon: 'pi pi-plus' },
    { label: 'Edit', value: 'edit', icon: 'pi pi-pencil' },
    { label: 'Delete', value: 'delete', icon: 'pi pi-trash' },
    { label: 'View Details', value: 'view', icon: 'pi pi-eye' }
  ];

  severityOptions: SplitButtonOption[] = [
    { label: 'Action 1', value: 'action1' },
    { label: 'Action 2', value: 'action2' },
    { label: 'Action 3', value: 'action3' }
  ];

  iconOptions: SplitButtonOption[] = [
    { label: 'Hammer', value: 'hammer', icon: 'pi pi-hammer' },
    { label: 'Wrench', value: 'wrench', icon: 'pi pi-wrench' },
    { label: 'Cog', value: 'cog', icon: 'pi pi-cog' },
    { label: 'Build', value: 'build', icon: 'pi pi-building' }
  ];

  fileOptions: SplitButtonOption[] = [
    { label: 'Save as PDF', value: 'pdf', icon: 'pi pi-file-pdf' },
    { label: 'Save as Excel', value: 'excel', icon: 'pi pi-file-excel' },
    { label: 'Save as Word', value: 'word', icon: 'pi pi-file-word' },
    { label: 'Save as Image', value: 'image', icon: 'pi pi-image' }
  ];

  formOptions: SplitButtonOption[] = [
    { label: 'Low Priority', value: 'low', icon: 'pi pi-arrow-down' },
    { label: 'Medium Priority', value: 'medium', icon: 'pi pi-minus' },
    { label: 'High Priority', value: 'high', icon: 'pi pi-arrow-up' },
    { label: 'Critical', value: 'critical', icon: 'pi pi-exclamation-triangle' }
  ];

  separatorOptions: SplitButtonOption[] = [
    { label: 'View Profile', value: 'profile', icon: 'pi pi-user' },
    { label: 'Edit Profile', value: 'edit-profile', icon: 'pi pi-user-edit' },
    { label: '', value: '', separator: true },
    { label: 'Settings', value: 'settings', icon: 'pi pi-cog' },
    { label: 'Preferences', value: 'preferences', icon: 'pi pi-sliders-h' },
    { label: '', value: '', separator: true },
    { label: 'Logout', value: 'logout', icon: 'pi pi-sign-out' }
  ];

  mixedOptions: SplitButtonOption[] = [
    { label: 'Available Action', value: 'available', icon: 'pi pi-check' },
    { label: 'Disabled Action', value: 'disabled', icon: 'pi pi-ban', disabled: true },
    { label: 'Another Available', value: 'available2', icon: 'pi pi-star' },
    { label: 'Also Disabled', value: 'disabled2', icon: 'pi pi-times', disabled: true }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.demoForm = this.fb.group({
      priority: ['']
    });
  }

  onOptionSelected(context: string, option: SplitButtonOption) {
    switch (context) {
      case 'Basic':
        this.basicSelectedValue = option.label;
        break;
      case 'Icon':
        this.iconSelectedValue = option.label;
        break;
      case 'File':
        this.fileAction = `Selected: ${option.label}`;
        break;
      case 'Separator':
        this.separatorSelectedValue = option.label;
        break;
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Option Selected',
      detail: `${context}: ${option.label}`,
      life: 3000
    });
  }

  onMainButtonClicked(context: string, option: SplitButtonOption | null) {
    const action = option ? option.label : 'No selection';
    
    if (context === 'File') {
      this.fileAction = `Main Action: ${action}`;
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Main Button Clicked',
      detail: `${context}: ${action}`,
      life: 3000
    });
  }

  onFormOptionSelected(option: SplitButtonOption) {
    this.messageService.add({
      severity: 'info',
      summary: 'Form Updated',
      detail: `Priority set to: ${option.label}`,
      life: 3000
    });
  }
} 