import { Component, Input, OnChanges, OnInit, SimpleChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
export class CommonSidebarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() menuItems: SidebarMenuItem[] = [];
  @Input() visible: boolean = true;
  @Input() position: 'left' | 'right' | 'top' | 'bottom' = 'left';
  @Input() showHeader: boolean = true;
  @Input() headerTitle: string = 'WefabTeam Portal';
  @Input() width: string = '280px';
  @Input() mobileMenuOpen: boolean = false;
  @Output() mobileMenuClose = new EventEmitter<void>();

  // Cache the converted menu items to avoid recreating them on every change detection
  convertedMenuItems: MenuItem[] = [];
  currentRoute: string = '';
  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Get current route
    this.currentRoute = this.router.url;
    
    // Convert menu items on initial load
    if (this.menuItems && this.menuItems.length > 0) {
      this.convertedMenuItems = this.convertToMenuItems();
    }

    // Listen for route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event) => {
      this.currentRoute = (event as NavigationEnd).url;
      // Refresh menu items to update active states
      this.convertedMenuItems = this.convertToMenuItems();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Only convert menu items when the menuItems input actually changes
    if (changes['menuItems'] && this.menuItems) {
      this.convertedMenuItems = this.convertToMenuItems();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

    // Check if this item or any of its children is active
    const isActive = this.isMenuItemActive(item);
    
    if (isActive) {
      menuItem.styleClass = 'active-menu-item';
    }

    if (item.children && item.children.length > 0) {
      menuItem.items = item.children.map(child => this.convertSidebarItemToMenuItem(child));
      
      // If any child is active, expand this parent
      const hasActiveChild = item.children.some(child => this.isMenuItemActive(child));
      if (hasActiveChild) {
        menuItem.expanded = true;
        menuItem.styleClass = (menuItem.styleClass || '') + ' has-active-child';
      }
    }

    return menuItem;
  }

  private isMenuItemActive(item: SidebarMenuItem): boolean {
    if (!item.route) {
      return false;
    }
    
    // Check for exact match or if current route starts with the menu item route
    return this.currentRoute === item.route || 
           (this.currentRoute.startsWith(item.route) && item.route !== '/');
  }

  // TrackBy function for better performance
  trackByMenuItem(index: number, item: MenuItem): any {
    return item.label || index;
  }

  onMobileMenuClose(): void {
    this.mobileMenuClose.emit();
  }
}
