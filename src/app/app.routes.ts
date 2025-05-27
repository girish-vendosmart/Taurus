import { Routes } from '@angular/router';
import { TestComponentsComponent } from './test-component/test-components/test-components.component';
import { SupplierOnboardingComponentsTsComponent } from './supplier/supplier-onboarding.components.ts/supplier-onboarding.components.ts.component';
import { FileExplorerComponent } from './file-explorer/file-explorer.component';
import { GooglePlacesComponentComponent } from './wefab/wefab-shared-component/google-places-component/google-places-component.component';
import { CommonSidebarComponent } from '../app/common-core-component/common-sidebar/common-sidebar.component';
import { CommonHeaderComponent } from '../app/common-core-component/common-header/common-header.component';
import { PerformanceTestComponent } from './common-core-component/common-sidebar/performance-test.component';
import { CommonTableComponent } from './wefab/wefab-shared-component/common-table/common-table.component';
export const routes: Routes = [
  { path: '', redirectTo: 'wefab', pathMatch: 'full' },
  { path: 'common-sidebar', component: CommonSidebarComponent},
  { path: 'test-component', component: TestComponentsComponent},
  { path: 'performance-test', component: PerformanceTestComponent},
  { path: 'common-header', component: CommonHeaderComponent},
  { path: 'google-places', component: GooglePlacesComponentComponent},
  { path: 'common-table', component: CommonTableComponent},
  {
    path: 'wefab',
    loadChildren: () => import('./wefab/wefab-component.routes').then(m => m.WEFAB_ROUTES)
  }
];
