import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-with-button',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="input-with-button-container">
      <input
        [type]="type || 'text'"
        class="form-control"
        [formControl]="control"
        [placeholder]="placeholder || ''"
        [attr.disabled]="disabled ? true : null"
      />
      <div class="gst-verify-btn-container">
        <button
          type="button"
          [disabled]="isButtonDisabled"
          [class]="isVerified ? buttonSuccessClass : 'btn btn-primary ' + buttonClass"
          (click)="onButtonClick()"
        >
          {{ isVerified ? buttonSuccessText : buttonText }}
        </button>
      </div>
    </div>
    <small *ngIf="description" class="form-text text-muted">{{ description }}</small>
  `,
  styles: [`
    .input-with-button-container {
      position: relative;
      width: 100%;
    }
    .gst-verify-btn-container {
      position: absolute;
      top: 0;
      right: 0;
      height: 100%;
      z-index: 5;
    }
    button {
      height: 100%;
      width: 120px;
      padding: 0;
      margin: 0;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 0.5px;
      white-space: nowrap;
      display: flex;
      align-items: center;
      justify-content: center;
      text-transform: uppercase;
    }
    .form-control {
      padding-right: 125px;
    }
  `]
})
export class InputWithButtonComponent {
  @Input() control!: FormControl;
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() description = '';
  @Input() buttonText = 'VERIFY';
  @Input() buttonClass = '';
  @Input() buttonSuccessText = 'VERIFIED';
  @Input() buttonSuccessClass = 'btn-success';
  @Input() isVerified = false;
  @Input() isButtonDisabled = false;
  @Input() disabled = false;
  
  @Input() onClick: () => void = () => {};
  
  onButtonClick() {
    if (this.onClick) {
      this.onClick();
    }
  }
} 