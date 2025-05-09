import { Routes } from '@angular/router';
import { SupplierComponentComponent } from './supplier-component/supplier-component.component';
import { SupplierOnboardingComponent } from './supplier-onboarding/supplier-onboarding.component';
import { SupplierCreateAccountComponent } from './supplier-create-account/supplier-create-account.component';
import { SupplierOnboardingL2Component } from './supplier-onboarding-l2/supplier-onboarding-l2.component';
import { SupplierOnboardingL3Component } from './supplier-onboarding-l3/supplier-onboarding-l3.component';
import { SupplierOnboardingReviewComponent } from './supplier-onboarding-review/supplier-onboarding-review.component';
import { SupplierProfileReviewComponent } from './supplier-profile-review/supplier-profile-review.component';
import { SupplierVerificationComponent } from './supplier-verification/supplier-verification.component';

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
                path: 'supplier-verification',
                component: SupplierVerificationComponent
            },
            {
                path: 'supplier-onboarding-l2',
                component: SupplierOnboardingL2Component
            },
            {
                path: 'supplier-onboarding-l3',
                component: SupplierOnboardingL3Component
            },
            {
                path: 'supplier-onboarding-review',
                component: SupplierOnboardingReviewComponent
            },
            {
                path: 'profile-review',
                component: SupplierProfileReviewComponent
            }
        ]
    }
]
