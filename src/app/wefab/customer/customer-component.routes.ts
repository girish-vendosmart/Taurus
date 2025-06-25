import { Routes } from '@angular/router';
import { CustomerComponentComponent } from './customer-component.component';
import { LoginComponentComponent } from './login-component/login-component.component';
import { CreateRfqComponent } from './rfq/create-rfq/create-rfq.component';
import { SubmittedRfqComponent } from './rfq/submitted-rfq/submitted-rfq.component';
import { TechnicalReviewPageComponent } from './rfq/technical-review-page/technical-review-page.component';
import { AiAnalysisSummaryPagesComponent } from './rfq/ai-analysis-summary-pages/ai-analysis-summary-pages.component';

export const WEFAB_CUSTOMER_ROUTES: Routes = [
    {
        path: '',
        component: CustomerComponentComponent,
        children: [
            {
                path: 'login',
                component: LoginComponentComponent,
            },
            {
                path: 'create-rfq',
                component: CreateRfqComponent,
            },
            {
                path: 'submitted-rfq',
                component: SubmittedRfqComponent,
            },
            {
                path: 'technical-review-page',
                component: TechnicalReviewPageComponent,
            },
            {
                path: 'ai-analysis-summary-pages',
                component: AiAnalysisSummaryPagesComponent,
            }
        ]
    }   
]