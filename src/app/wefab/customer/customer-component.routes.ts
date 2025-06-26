import { Routes } from '@angular/router';
import { CustomerComponentComponent } from './customer-component.component';
import { LoginComponentComponent } from './login-component/login-component.component';
import { CreateRfqComponent } from './rfq/create-rfq/create-rfq.component';
import { SubmittedRfqComponent } from './rfq/submitted-rfq/submitted-rfq.component';
import { TechnicalReviewPageComponent } from './rfq/technical-review-page/technical-review-page.component';
import { AiAnalysisSummaryPagesComponent } from './rfq/ai-analysis-summary-pages/ai-analysis-summary-pages.component';
import { RfqListComponent } from './rfq/rfq-list/rfq-list.component';
import { QuotationListComponent } from './quotation/quotation-list/quotation-list.component';
import { OrderListComponent } from './order/order-list/order-list.component';
import { QuotationDetailsComponent } from './quotation/quotation-details/quotation-details.component';

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
                path: 'rfq-details/:id',
                component: SubmittedRfqComponent,
            },
            {
                path: 'technical-review-page/:id',
                component: TechnicalReviewPageComponent,
            },
            {
                path: 'ai-analysis-summary-pages',
                component: AiAnalysisSummaryPagesComponent,
            },
            {
                path: 'rfq-list',
                component: RfqListComponent,
            },
            {
                path: 'quotation-list',
                component: QuotationListComponent,
            },
            {
                path: 'quotation-details/:id',
                component: QuotationDetailsComponent,
            },
            {
                path: 'order-list',
                component: OrderListComponent,  
            }
        ]
    }   
]