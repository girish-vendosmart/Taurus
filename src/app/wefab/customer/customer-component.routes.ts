import { Routes } from '@angular/router';
import { CustomerComponentComponent } from './customer-component.component';
import { LoginComponentComponent } from './login-component/login-component.component';

export const WEFAB_CUSTOMER_ROUTES: Routes = [
    {
        path: '',
        component: CustomerComponentComponent,
        children: [
            {
                path: 'login',
                component: LoginComponentComponent,
            }
        ]
    }
]