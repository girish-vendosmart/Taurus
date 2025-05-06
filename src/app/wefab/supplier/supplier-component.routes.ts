import { Routes } from '@angular/router';
import { SupplierComponentComponent } from './supplier-component/supplier-component.component';
import { SupplierOnboardingComponent } from './supplier-onboarding/supplier-onboarding.component';
import { SupplierCreateAccountComponent } from './supplier-create-account/supplier-create-account.component';
import { SupplierOnboardingL2Component } from './supplier-onboarding-l2/supplier-onboarding-l2.component';

export const WEFAB_SUPPLIER_ROUTES: Routes = [
    {
        path: '',
        component: SupplierComponentComponent,
        children: [
            {
                path: 'create-account',
                component: SupplierCreateAccountComponent
            },
            { 
                path: 'supplier-onboarding', 
                component: SupplierOnboardingComponent
            },
            {
                path: 'supplier-onboarding-l2',
                component: SupplierOnboardingL2Component
            },
        ]
    }
]
