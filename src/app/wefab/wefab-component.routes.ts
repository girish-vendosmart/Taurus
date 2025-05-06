import { Routes } from "@angular/router";
import { WefabComponentComponent } from "./wefab-component/wefab-component.component";

export const WEFAB_ROUTES: Routes = [
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