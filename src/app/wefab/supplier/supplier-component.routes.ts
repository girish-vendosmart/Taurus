import { Routes } from '@angular/router';
import { SupplierComponentComponent } from './supplier-component.component';
import { SupplierOnboardingComponent } from './module/onboarding/supplier-onboarding/supplier-onboarding.component';
import { SupplierOnboardingL2Component } from './module/onboarding/supplier-onboarding-l2/supplier-onboarding-l2.component';
import { SupplierOnboardingL3Component } from './module/onboarding/supplier-onboarding-l3/supplier-onboarding-l3.component';
import { SupplierProfileReviewComponent } from './module/profile-review/supplier-profile-review/supplier-profile-review.component';
import { SupplierOnboardingCompleteComponent } from './module/onboarding/supplier-onboarding-complete/supplier-onboarding-complete.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { SupplierOnboardingWelcomeComponentComponent } from './module/onboarding/supplier-onboarding-welcome-component/supplier-onboarding-welcome-component.component';
import { SupplierOnboardingStatusComponent } from './module/onboarding/supplier-onboarding-status/supplier-onboarding-status.component';
import { SupplierDashboardComponent } from './module/dashboard/supplier-dashboard/supplier-dashboard.component';
import { SupplierRfqComponent } from './module/rfq/supplier-rfq/supplier-rfq.component';
import { SupplierRfqDetailsComponent } from './module/rfq/supplier-rfq-details/supplier-rfq-details.component';
import { SupplierQuotationComponent } from './module/quotation/supplier-quotation/supplier-quotation.component';
import { SupplierQuotationDetailsComponent } from './module/quotation/supplier-quotation-details/supplier-quotation-details.component';
import { CreateQuotationComponent } from './module/quotation/create-quotation/create-quotation.component';

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
                path: '**',
                redirectTo: 'dashboard',
                pathMatch: 'full'
              },
        ]
    }
]
