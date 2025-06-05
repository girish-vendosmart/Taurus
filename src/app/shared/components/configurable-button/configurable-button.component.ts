import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-configurable-button',
  templateUrl: './configurable-button.component.html',
  styleUrls: ['./configurable-button.component.scss'],
  standalone: true,
  imports: [CommonModule, ButtonModule]
})
export class ConfigurableButtonComponent {
  @Input() configuration: any = {
    label: '',
    icon: '',
    severity: 'primary',
    size: 'normal',
    disabled: false,
    loading: false,
    iconPos: 'left',
    style: {},
    styleClass: '',
    badge: '',
    badgeClass: '',
    raised: false,
    rounded: false,
    text: false,
    outlined: false,
  };

  @Output() onClick: EventEmitter<any> = new EventEmitter<any>();

  handleClick(event: any): void {
    if (!this.configuration.disabled && !this.configuration.loading) {
      this.onClick.emit(event);
    }
  }
} 