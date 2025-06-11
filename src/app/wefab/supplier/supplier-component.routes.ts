import { Routes } from '@angular/router';
import { SupplierComponentComponent } from './supplier-component.component';
import { SupplierOnboardingComponent } from './onboarding/supplier-onboarding/supplier-onboarding.component';
import { SupplierOnboardingL2Component } from './onboarding/supplier-onboarding-l2/supplier-onboarding-l2.component';
import { SupplierOnboardingL3Component } from './onboarding/supplier-onboarding-l3/supplier-onboarding-l3.component';
import { SupplierProfileReviewComponent } from './profile-review/supplier-profile-review/supplier-profile-review.component';
import { SupplierOnboardingCompleteComponent } from './onboarding/supplier-onboarding-complete/supplier-onboarding-complete.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { SupplierOnboardingWelcomeComponentComponent } from './onboarding/supplier-onboarding-welcome-component/supplier-onboarding-welcome-component.component';
import { SupplierOnboardingStatusComponent } from './onboarding/supplier-onboarding-status/supplier-onboarding-status.component';
import { SupplierDashboardComponent } from './dashboard/supplier-dashboard/supplier-dashboard.component';
import { SupplierRfqComponent } from './rfq/supplier-rfq/supplier-rfq.component';
import { SupplierRfqDetailsComponent } from './rfq/supplier-rfq-details/supplier-rfq-details.component';
import { SupplierQuotationComponent } from './quotation/supplier-quotation/supplier-quotation.component';
import { SupplierQuotationDetailsComponent } from './quotation/supplier-quotation-details/supplier-quotation-details.component';
import { CreateQuotationComponent } from './quotation/create-quotation/create-quotation.component';
import { SupplierOnboardingCombinedComponent }  from './onboarding/supplier-onboarding-combined/supplier-onboarding-combined.component';

export const WEFAB_SUPPLIER_ROUTES: Routes = [
    {
        path: '',
        component: SupplierComponentComponent,
        children: [
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
                path: 'quotation/details/:id',
                component: SupplierQuotationDetailsComponent,
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
                path: 'profile-review/:id',
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
             },
             {
                path: 'create-quotation',
                component: CreateQuotationComponent,
                canActivate: [AuthGuard]
             },
             {
                path: 'supplier-onboarding-combined',
                component: SupplierOnboardingCombinedComponent,
                canActivate: [AuthGuard]
             },
             {
                path: '**',
                redirectTo: 'dashboard',
                pathMatch: 'full'
              }
        ]
    }
]
