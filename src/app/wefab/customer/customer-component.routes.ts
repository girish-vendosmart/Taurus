import { Routes } from '@angular/router';
import { CustomerComponentComponent } from './customer-component.component';
import { LoginComponentComponent } from './login-component/login-component.component';
import { CreateRfqComponent } from './rfq/create-rfq/create-rfq.component';
import { SubmittedRfqComponent } from './rfq/submitted-rfq/submitted-rfq.component';

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
            }
        ]
    }   
]