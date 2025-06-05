import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonSidebarComponent, SidebarMenuItem } from '../core/components/common-sidebar/common-sidebar.component';
import { CommonHeaderComponent } from '../core/components/common-header/common-header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wefab-component',
  standalone: true,
  imports: [RouterOutlet, CommonModule, CommonSidebarComponent, CommonHeaderComponent ],
  templateUrl: './wefab-component.component.html',
  styleUrl: './wefab-component.component.scss'
})
export class WefabComponentComponent {

  sidebarMenuItems: SidebarMenuItem[] = [
    {
      icon: 'bi bi-people',
      name: 'Manage Suppliers',
      route: '/wefab/wefabTeam/manage-suppliers'
    },
    {
      icon: 'pi pi-search',
      name: 'Supplier Finder',
      route: '/wefab/wefabTeam/supplier-finder'
    },
  ];

}
