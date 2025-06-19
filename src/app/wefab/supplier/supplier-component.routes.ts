import { Routes } from '@angular/router';
import { SupplierComponentComponent } from './supplier-component.component';
import { SupplierProfileReviewComponent } from './onboarding/supplier-profile-review/supplier-profile-review.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { SupplierOnboardingWelcomeComponentComponent } from './onboarding/supplier-onboarding-welcome-component/supplier-onboarding-welcome-component.component';
import { SupplierDashboardComponent } from './dashboard/supplier-dashboard/supplier-dashboard.component';
import { SupplierRfqComponent } from './rfq/supplier-rfq/supplier-rfq.component';
import { SupplierRfqDetailsComponent } from './rfq/supplier-rfq-details/supplier-rfq-details.component';
import { SupplierQuotationComponent } from './quotation/supplier-quotation/supplier-quotation.component';
import { SupplierQuotationDetailsComponent } from './quotation/supplier-quotation-details/supplier-quotation-details.component';
import { CreateQuotationComponent } from './quotation/create-quotation/create-quotation.component';
import { SupplierOnboardingCombinedComponent }  from './onboarding/supplier-onboarding-combined/supplier-onboarding-combined.component';
import { HelpSectionComponent } from './help-section/help-section.component';

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
                path: 'profile-review/:id',
                component: SupplierProfileReviewComponent,
                canActivate: [AuthGuard]
            },
             {
                path: 'supplier-onboarding-welcome',
                component: SupplierOnboardingWelcomeComponentComponent,
                canActivate: [AuthGuard]
             },
             {
                path: 'create-quotation',
                component: CreateQuotationComponent,
                canActivate: [AuthGuard]
             },
             {
                path: 'supplier-onboarding-form',
                component: SupplierOnboardingCombinedComponent,
                canActivate: [AuthGuard]
             },
             {
                path: 'help',
                component: HelpSectionComponent,
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
