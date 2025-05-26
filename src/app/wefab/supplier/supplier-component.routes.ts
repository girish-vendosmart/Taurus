import { Routes } from '@angular/router';
import { SupplierComponentComponent } from './supplier-component/supplier-component.component';
import { SupplierOnboardingComponent } from './supplier-onboarding/supplier-onboarding.component';
import { SupplierCreateAccountComponent } from './supplier-create-account/supplier-create-account.component';
import { SupplierOnboardingL2Component } from './supplier-onboarding-l2/supplier-onboarding-l2.component';
import { SupplierOnboardingL3Component } from './supplier-onboarding-l3/supplier-onboarding-l3.component';
import { SupplierOnboardingReviewComponent } from './supplier-onboarding-review/supplier-onboarding-review.component';
import { SupplierProfileReviewComponent } from './supplier-profile-review/supplier-profile-review.component';
import { SupplierVerificationComponent } from './supplier-verification/supplier-verification.component';
import { ManufacturingVerificationComponent } from './manufacturing-verification/manufacturing-verification.component';
import { SupplierOnboardingCompleteComponent } from './supplier-onboarding-complete/supplier-onboarding-complete.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { SupplierOnboardingWelcomeComponentComponent } from './supplier-onboarding-welcome-component/supplier-onboarding-welcome-component.component';
import { SupplierOnboardingStatusComponent } from './supplier-onboarding-status/supplier-onboarding-status.component';
import { SupplierDashboardComponent } from './supplier-dashboard/supplier-dashboard.component';
import { SupplierRfqComponent } from './supplier-rfq/supplier-rfq.component';
import { SupplierRfqDetailsComponent } from './supplier-rfq-details/supplier-rfq-details.component';
import { SupplierQuotationComponent } from './supplier-quotation/supplier-quotation.component';

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
                path: 'dashboard',
                component: SupplierDashboardComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'rfq',
                component: SupplierRfqComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'quotation',
                component: SupplierQuotationComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'rfq/details/:id',
                component: SupplierRfqDetailsComponent,
                canActivate: [AuthGuard]
            },
            { 
                path: 'supplier-onboarding', 
                component: SupplierOnboardingComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'supplier-verification',
                component: SupplierVerificationComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'manufacturing-verification',
                component: ManufacturingVerificationComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'supplier-onboarding-l2',
                component: SupplierOnboardingL2Component,
                canActivate: [AuthGuard]
            },
            {
                path: 'supplier-onboarding-l3',
                component: SupplierOnboardingL3Component,
                canActivate: [AuthGuard]
            },
            {
                path: 'supplier-onboarding-review',
                component: SupplierOnboardingReviewComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'profile-review',
                component: SupplierProfileReviewComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'onboarding-complete',
                component: SupplierOnboardingCompleteComponent,
                canActivate: [AuthGuard]
            },
             {
                path: 'supplier-onboarding-welcome',
                component: SupplierOnboardingWelcomeComponentComponent,
                canActivate: [AuthGuard]
             },
             {
                path: 'supplier-onboarding-status',
                component: SupplierOnboardingStatusComponent,
                canActivate: [AuthGuard]
             }
        ]
    }
]
