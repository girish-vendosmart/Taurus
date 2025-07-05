import { Routes } from "@angular/router";
import { WefabComponentComponent } from "./wefab-component.component";
import { LoginComponentComponent } from "../shared/components/login-component/login-component.component";
import { LoginComponentComponent as CustomerLoginComponent } from "../wefab/customer/login-component/login-component.component";
import { AuthGuard } from "../core/guards/auth.guard";
import { environment } from '../../enviornments/enviornment';

export const WEFAB_ROUTES: Routes = [
  {
    path: 'supplier/login',
    component: LoginComponentComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'customer/login',
    component: CustomerLoginComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: environment.isCustomerBranch ? 'customer/login' : 'supplier/login',
    pathMatch: 'full'
  },
  {
    path: '',
    component: WefabComponentComponent,
    children: [
      {
        path: 'supplier',
        loadChildren: () =>
          import('./supplier/supplier-component.routes').then(m => m.WEFAB_SUPPLIER_ROUTES)
      },
      {
        path: 'wefabTeam',
        loadChildren: () =>
          import('./wefabTeam/wefabTeam.routes').then(m => m.WEFAB_TEAM_ROUTES)
      },
      {
        path: 'customer',
        loadChildren: () =>
          import('./customer/customer-component.routes').then(m => m.CUSTOMER_ROUTES)
      },
    ]
  },
  {
    path: '**', // wildcard route
    redirectTo: environment.isCustomerBranch ? 'customer/login' : 'supplier/login'
  }
];
