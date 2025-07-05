import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfaces for configuration
export interface StatusIndicator {
  active: boolean;
  color?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  completed?: boolean;
  active?: boolean;
  disabled?: boolean;
  statusIndicator?: StatusIndicator;
  route?: string;
  action?: string;
}

export interface HelpSection {
  title: string;
  description: string;
  buttonText: string;
}

export interface SidebarConfig {
  logoUrl: string;
  logoAlt: string;
  showProgress: boolean;
  progressLabel: string;
  progressValue: number;
  menuItems: MenuItem[];
  showHelpSection: boolean;
  helpSection: HelpSection;
}

@Component({
  selector: 'app-customer-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-sidebar.component.html',
  styleUrl: './customer-sidebar.component.scss'
})
export class CustomerSidebarComponent implements OnInit {
  @Input() config: SidebarConfig = this.getDefaultConfig();
  
  @Output() menuItemClick = new EventEmitter<MenuItem>();
  @Output() helpClick = new EventEmitter<void>();
  @Output() progressUpdate = new EventEmitter<number>();

  ngOnInit() {
    // Initialize with default config if none provided
    if (!this.config) {
      this.config = this.getDefaultConfig();
    }
  }

  private getDefaultConfig(): SidebarConfig {
    return {
      logoUrl: 'assets/wefab-Logo Design 1.png',
      logoAlt: 'Wefab Logo',
      showProgress: true,
      progressLabel: 'Progress',
      progressValue: 85,
      menuItems: [
        {
          id: 'rfq',
          label: 'RFQ',
          icon: 'pi pi-file-edit',
          completed: true,
          active: false,
          disabled: false
        },
        {
          id: 'quotation',
          label: 'Quotation',
          icon: 'pi pi-calculator',
          completed: false,
          active: true,
          disabled: false,
          statusIndicator: {
            active: true,
            color: '#4CAF50'
          }
        },
        {
          id: 'order',
          label: 'Order',
          icon: 'pi pi-shopping-cart',
          completed: false,
          active: false,
          disabled: false
        }
      ],
      showHelpSection: true,
      helpSection: {
        title: 'Need Help?',
        description: 'Our support team is here to assist you with your manufacturing needs.',
        buttonText: 'Contact Support'
      }
    };
  }

  onMenuItemClick(item: MenuItem): void {
    if (!item.disabled) {
      // Update active state
      this.config.menuItems.forEach(menuItem => {
        menuItem.active = menuItem.id === item.id;
      });
      
      this.menuItemClick.emit(item);
    }
  }

  onHelpClick(): void {
    this.helpClick.emit();
  }

  trackByMenuItem(index: number, item: MenuItem): string {
    return item.id;
  }

  // Public methods for external control
  public updateProgress(value: number): void {
    this.config.progressValue = Math.max(0, Math.min(100, value));
    this.progressUpdate.emit(this.config.progressValue);
  }

  public setActiveMenuItem(itemId: string): void {
    this.config.menuItems.forEach(item => {
      item.active = item.id === itemId;
    });
  }

  public markItemCompleted(itemId: string, completed: boolean = true): void {
    const item = this.config.menuItems.find(item => item.id === itemId);
    if (item) {
      item.completed = completed;
    }
  }

  public setItemDisabled(itemId: string, disabled: boolean = true): void {
    const item = this.config.menuItems.find(item => item.id === itemId);
    if (item) {
      item.disabled = disabled;
    }
  }

  public updateStatusIndicator(itemId: string, status: StatusIndicator): void {
    const item = this.config.menuItems.find(item => item.id === itemId);
    if (item) {
      item.statusIndicator = status;
    }
  }

  public updateConfig(newConfig: Partial<SidebarConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Utility methods
  public getCompletedItemsCount(): number {
    return this.config.menuItems.filter(item => item.completed).length;
  }

  public getCompletionPercentage(): number {
    const totalItems = this.config.menuItems.length;
    const completedItems = this.getCompletedItemsCount();
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  }

  public getActiveItem(): MenuItem | undefined {
    return this.config.menuItems.find(item => item.active);
  }
}
