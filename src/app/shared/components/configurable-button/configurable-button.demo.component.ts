import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurableButtonComponent } from './configurable-button.component';
// import { any } from './button-configuration.interface';

@Component({
  selector: 'app-configurable-button-demo',
  standalone: true,
  imports: [CommonModule, ConfigurableButtonComponent],
  template: `
    <div class="demo-container">
      <h2>Configurable Button Demo</h2>
      
      <section class="demo-section">
        <h3>Basic Buttons</h3>
        <div class="button-row">
          <app-configurable-button
            [configuration]="basicButton"
            (onClick)="handleClick('Basic button clicked')">
          </app-configurable-button>

          <app-configurable-button
            [configuration]="iconButton"
            (onClick)="handleClick('Icon button clicked')">
          </app-configurable-button>

          <app-configurable-button
            [configuration]="loadingButton"
            (onClick)="handleClick('Loading button clicked')">
          </app-configurable-button>
        </div>
      </section>

      <section class="demo-section">
        <h3>Severity Variations</h3>
        <div class="button-row">
          <app-configurable-button
            [configuration]="successButton"
            (onClick)="handleClick('Success button clicked')">
          </app-configurable-button>

          <app-configurable-button
            [configuration]="warningButton"
            (onClick)="handleClick('Warning button clicked')">
          </app-configurable-button>

          <app-configurable-button
            [configuration]="dangerButton"
            (onClick)="handleClick('Danger button clicked')">
          </app-configurable-button>
        </div>
      </section>

      <section class="demo-section">
        <h3>Styles & Sizes</h3>
        <div class="button-row">
          <app-configurable-button
            [configuration]="outlinedButton"
            (onClick)="handleClick('Outlined button clicked')">
          </app-configurable-button>

          <app-configurable-button
            [configuration]="raisedButton"
            (onClick)="handleClick('Raised button clicked')">
          </app-configurable-button>

          <app-configurable-button
            [configuration]="roundedButton"
            (onClick)="handleClick('Rounded button clicked')">
          </app-configurable-button>
        </div>
      </section>

      <section class="demo-section">
        <h3>Sizes</h3>
        <div class="button-row">
          <app-configurable-button
            [configuration]="smallButton"
            (onClick)="handleClick('Small button clicked')">
          </app-configurable-button>

          <app-configurable-button
            [configuration]="normalButton"
            (onClick)="handleClick('Normal button clicked')">
          </app-configurable-button>

          <app-configurable-button
            [configuration]="largeButton"
            (onClick)="handleClick('Large button clicked')">
          </app-configurable-button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .demo-section {
      margin-bottom: 2rem;
    }

    h2 {
      color: #2c3e50;
      margin-bottom: 2rem;
    }

    h3 {
      color: #34495e;
      margin-bottom: 1rem;
    }

    .button-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }
  `]
})
export class ConfigurableButtonDemoComponent {
  basicButton: any = {
    label: 'Click Me',
    severity: 'primary'
  };

  iconButton: any = {
    label: 'Add Item',
    icon: 'pi pi-plus',
    severity: 'primary'
  };

  loadingButton: any = {
    label: 'Loading',
    icon: 'pi pi-spin pi-spinner',
    loading: true,
    severity: 'primary'
  };

  successButton: any = {
    label: 'Success',
    icon: 'pi pi-check',
    severity: 'success'
  };

  warningButton: any = {
    label: 'Warning',
    icon: 'pi pi-exclamation-triangle',
    severity: 'warning'
  };

  dangerButton: any = {
    label: 'Danger',
    icon: 'pi pi-times',
    severity: 'danger'
  };

  outlinedButton: any = {
    label: 'Outlined',
    outlined: true,
    severity: 'primary'
  };

  raisedButton: any = {
    label: 'Raised',
    raised: true,
    severity: 'primary'
  };

  roundedButton: any = {
    label: 'Rounded',
    rounded: true,
    severity: 'primary'
  };

  smallButton: any = {
    label: 'Small',
    size: 'small',
    severity: 'primary'
  };

  normalButton: any = {
    label: 'Normal',
    size: 'normal',
    severity: 'primary'
  };

  largeButton: any = {
    label: 'Large',
    size: 'large',
    severity: 'primary'
  };

  handleClick(message: string): void {
    console.log(message);
  }
} 