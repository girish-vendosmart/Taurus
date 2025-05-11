import { Routes } from '@angular/router';
import { BuyerDashboardComponent } from './buyer-dashboard/buyer-dashboard.component';
import { ManageSuppliersComponent } from './manage-suppliers/manage-suppliers.component';
import { BuyerLayoutComponent } from './buyer-layout/buyer-layout.component';

export const BUYER_ROUTES: Routes = [
  {
    path: '',
    component: BuyerLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: BuyerDashboardComponent
      },
      {
        path: 'manage-suppliers',
        component: ManageSuppliersComponent
      }
    ]
  }
]; 