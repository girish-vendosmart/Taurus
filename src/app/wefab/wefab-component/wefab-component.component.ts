import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationBarComponent } from '../wefab-shared-component/navigation-bar/navigation-bar.component';
import { CommonSidebarComponent, SidebarMenuItem } from '../../common-core-component/common-sidebar/common-sidebar.component';
import { CommonHeaderComponent } from '../../common-core-component/common-header/common-header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wefab-component',
  standalone: true,
  imports: [RouterOutlet, NavigationBarComponent, CommonModule, CommonSidebarComponent, CommonHeaderComponent ],
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
