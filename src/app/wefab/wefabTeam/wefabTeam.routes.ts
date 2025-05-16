import { Routes } from '@angular/router';
import { WefabTeamDashboardComponent } from './wefabTeam-dashboard/wefabTeam-dashboard.component';
import { ManageSuppliersComponent } from './manage-suppliers/manage-suppliers.component';
import { WefabTeamLayoutComponent } from './wefabTeam-layout/wefabTeam-layout.component';
import { WefabteamsupplierProfileReviewComponent } from './wefabteamsupplier-profile-review/wefabteamsupplier-profile-review.component';
import { SupplierFinderComponent } from '../wefabTeam/supplier-finder/supplier-finder.component';

export const WEFAB_TEAM_ROUTES: Routes = [
  {
    path: '',
    component: WefabTeamLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: WefabTeamDashboardComponent
      },
      {
        path: 'manage-suppliers',
        component: ManageSuppliersComponent
      },
      {
        path: 'supplier-finder',
        component: SupplierFinderComponent
      },
      {
        path: 'manage-suppliers/:id',
        component: WefabteamsupplierProfileReviewComponent
      }
    ]
  }
]; 