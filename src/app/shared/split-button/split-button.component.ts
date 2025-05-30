import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, OnInit, OnChanges, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SplitButtonOption {
  label: string;
  value: any;
  icon?: string;
  disabled?: boolean;
  separator?: boolean;
}

@Component({
  selector: 'app-split-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, MenuModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SplitButtonComponent),
      multi: true
    }
  ],
  template: `
    <div class="split-button-container" [class.disabled]="disabled" #container>
      <button 
        pButton 
        type="button"
        [class]="'p-button p-component split-button-main ' + severity"
        [disabled]="disabled"
        (click)="onMainButtonClick()"
        [attr.aria-label]="selectedOption?.label || placeholder">
        <i *ngIf="selectedOption?.icon" [class]="selectedOption?.icon + ' mr-2'"></i>
        <span>{{ selectedOption?.label || placeholder }}</span>
      </button>
      
      <button 
        pButton 
        type="button"
        [class]="'p-button p-component split-button-dropdown ' + severity"
        [disabled]="disabled"
        (click)="toggleDropdown($event)"
        [attr.aria-label]="'Open dropdown options'"
        #dropdownBtn>
        <i class="pi pi-chevron-down"></i>
      </button>
      
      <p-menu 
        #menu 
        [model]="menuItems" 
        [popup]="true"
        [baseZIndex]="10000"
        [appendTo]="container"
        styleClass="split-button-menu">
      </p-menu>
    </div>
  `,
  styleUrls: ['./split-button.component.scss']
})
export class SplitButtonComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() options: SplitButtonOption[] = [];
  @Input() placeholder: string = 'Select option';
  @Input() disabled: boolean = false;
  @Input() severity: string = 'primary'; // primary, secondary, success, info, warning, help, danger
  @Input() allowMainButtonAction: boolean = true;
  
  @Output() optionSelected = new EventEmitter<SplitButtonOption>();
  @Output() mainButtonClicked = new EventEmitter<SplitButtonOption | null>();

  @ViewChild('menu') menu!: Menu;
  @ViewChild('container') container!: ElementRef;

  selectedOption: SplitButtonOption | null = null;
  menuItems: MenuItem[] = [];

  private onChange = (value: any) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.updateMenuItems();
  }

  ngOnChanges() {
    this.updateMenuItems();
  }

  private updateMenuItems() {
    this.menuItems = this.options.map(option => ({
      label: option.label,
      icon: option.icon,
      disabled: option.disabled,
      separator: option.separator,
      command: () => this.selectOption(option)
    }));
  }

  selectOption(option: SplitButtonOption) {
    if (option.disabled) return;
    
    this.selectedOption = option;
    this.onChange(option.value);
    this.onTouched();
    this.optionSelected.emit(option);
  }

  onMainButtonClick() {
    if (!this.allowMainButtonAction) return;
    this.mainButtonClicked.emit(this.selectedOption);
  }

  toggleDropdown(event: Event) {
    if (this.menu) {
      this.menu.toggle(event);
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    if (value) {
      const option = this.options.find(opt => opt.value === value);
      this.selectedOption = option || null;
    } else {
      this.selectedOption = null;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
} 