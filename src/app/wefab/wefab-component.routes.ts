import { Routes } from "@angular/router";
import { WefabComponentComponent } from "./wefab-component/wefab-component.component";
import { LoginComponentComponent } from "./wefab-shared-component/login-component/login-component.component";

export const WEFAB_ROUTES: Routes = [
    {
        path: 'supplier/login',
        component: LoginComponentComponent
    },
    {
        path: '',
        redirectTo: 'supplier/login',
        pathMatch: 'full'
    },
    {
        path: '',
        component: WefabComponentComponent,
        children: [
            {
                path: 'supplier',
                loadChildren: () => import('./supplier/supplier-component.routes').then(m => m.WEFAB_SUPPLIER_ROUTES),
            }
        ]
    }
]