import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

export interface SidebarMenuItem {
  icon: string;
  name: string;
  route?: string;
  children?: SidebarMenuItem[];
  command?: () => void;
}

@Component({
  selector: 'app-common-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenuModule,
    ButtonModule,
    SidebarModule,
    PanelMenuModule
  ],
  templateUrl: './common-sidebar.component.html',
  styleUrl: './common-sidebar.component.scss'
})
export class CommonSidebarComponent implements OnInit, OnChanges {
  @Input() menuItems: SidebarMenuItem[] = [];
  @Input() visible: boolean = true;
  @Input() position: 'left' | 'right' | 'top' | 'bottom' = 'left';
  @Input() showHeader: boolean = true;
  @Input() headerTitle: string = 'WefabTeam Portal';
  @Input() width: string = '280px';

  // Cache the converted menu items to avoid recreating them on every change detection
  convertedMenuItems: MenuItem[] = [];

  ngOnInit(): void {
    // Convert menu items on initial load
    if (this.menuItems && this.menuItems.length > 0) {
      this.convertedMenuItems = this.convertToMenuItems();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Only convert menu items when the menuItems input actually changes
    if (changes['menuItems'] && this.menuItems) {
      this.convertedMenuItems = this.convertToMenuItems();
    }
  }

  private convertToMenuItems(): MenuItem[] {
    if (!this.menuItems || this.menuItems.length === 0) {
      return [];
    }
    return this.menuItems.map(item => this.convertSidebarItemToMenuItem(item));
  }

  private convertSidebarItemToMenuItem(item: SidebarMenuItem): MenuItem {
    if (!item) {
      return {};
    }

    const menuItem: MenuItem = {
      label: item.name,
      icon: item.icon,
      routerLink: item.route,
      command: item.command
    };

    if (item.children && item.children.length > 0) {
      menuItem.items = item.children.map(child => this.convertSidebarItemToMenuItem(child));
    }

    return menuItem;
  }

  // TrackBy function for better performance
  trackByMenuItem(index: number, item: MenuItem): any {
    return item.label || index;
  }
}
