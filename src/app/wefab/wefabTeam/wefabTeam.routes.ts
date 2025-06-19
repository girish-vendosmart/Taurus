import { Routes } from '@angular/router';
import { WefabTeamLayoutComponent } from './wefabTeam-layout/wefabTeam-layout.component';
import { ManageSuppliersComponent } from './manage-suppliers/manage-suppliers.component';
import { SupplierProfileReviewComponent } from '../supplier/onboarding/supplier-profile-review/supplier-profile-review.component';
import { SupplierFinderComponent } from '../wefabTeam/supplier-finder/supplier-finder.component';
import { AuthGuard } from '../../core/guards/auth.guard';

export const WEFAB_TEAM_ROUTES: Routes = [
  {
    path: '',
    component: WefabTeamLayoutComponent,
    children: [
      {
        path: 'manage-suppliers',
        component: ManageSuppliersComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'supplier-finder',
        component: SupplierFinderComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'manage-suppliers/:id',
        component: SupplierProfileReviewComponent,
        canActivate: [AuthGuard]
      },
      {
        path: '**',
        redirectTo: 'manage-suppliers',
        pathMatch: 'full'
      },
    ]
  }
]; 