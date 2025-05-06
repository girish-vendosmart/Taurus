import { Routes } from '@angular/router';
import { SupplierComponentComponent } from './supplier-component/supplier-component.component';
import { SupplierOnboardingComponent } from './supplier-onboarding/supplier-onboarding.component';

export const WEFAB_SUPPLIER_ROUTES: Routes = [
    {
        path: '',
        component: SupplierComponentComponent,
        children: [
            { 
                path: 'supplier-onboarding', 
                component: SupplierOnboardingComponent
            },
        ]
    }
]
