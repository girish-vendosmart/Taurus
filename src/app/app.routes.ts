import { Routes } from '@angular/router';
import { TestComponentsComponent } from './test-component/test-components/test-components.component';
import { SupplierOnboardingComponentsTsComponent } from './supplier/supplier-onboarding.components.ts/supplier-onboarding.components.ts.component';

export const routes: Routes = [
  { path: 'test', component: TestComponentsComponent },
  { path: 'supplier-onboarding', component: SupplierOnboardingComponentsTsComponent }
];
