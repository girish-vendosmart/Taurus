import { Routes } from '@angular/router';
import { TestComponentsComponent } from './test-component/test-components/test-components.component';
import { SupplierOnboardingComponentsTsComponent } from './supplier/supplier-onboarding.components.ts/supplier-onboarding.components.ts.component';
import { FileExplorerComponent } from './file-explorer/file-explorer.component';
import { CommonTableComponent } from './wefab/wefab-shared-component/common-table/common-table.component';
import { CommonPrimeTableComponent } from './wefab/wefab-shared-component/common-prime-table/common-prime-table.component';
import { GooglePlacesComponentComponent } from './wefab/wefab-shared-component/google-places-component/google-places-component.component';
export const routes: Routes = [
  { path: '', redirectTo: 'wefab', pathMatch: 'full' },
  { path : 'common-table', component : CommonPrimeTableComponent},
  { path: 'google-places', component: GooglePlacesComponentComponent},
  // { path: 'test', component: TestComponentsComponent },
  // { path: 'supplier-onboarding', component: SupplierOnboardingComponentsTsComponent },
  // { path: 'file-explorer', component: FileExplorerComponent },
  {
    path: 'wefab',
    loadChildren: () => import('./wefab/wefab-component.routes').then(m => m.WEFAB_ROUTES)
  }
];
