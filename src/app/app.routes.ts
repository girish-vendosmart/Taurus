import { Routes } from '@angular/router';
import { GooglePlacesComponentComponent } from './shared/components/google-places-component/google-places-component.component';
import { CommonSidebarComponent } from './core/components/common-sidebar/common-sidebar.component';
import { CommonHeaderComponent } from './core/components/common-header/common-header.component';
import { CommonTableComponent } from './shared/components/common-table/common-table.component';
import { ConfigurableButtonDemoComponent } from './shared/components/configurable-button/configurable-button.demo.component';
import { CommonCardComponent } from './shared/components/common-card/common-card.component';
import { WorkflowProgressTestPageComponent } from './shared/components/workflow-progress/workflow-progress-test-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'wefab', pathMatch: 'full' },
  { path: 'common-sidebar', component: CommonSidebarComponent},
  { path: 'common-header', component: CommonHeaderComponent},
  { path: 'google-places', component: GooglePlacesComponentComponent},
  { path: 'common-table', component: CommonTableComponent},
  { path: 'configurable-button', component: ConfigurableButtonDemoComponent},
  { path: 'common-card', component: CommonCardComponent},
  {
    path: 'test-workflow-progress',
    component: WorkflowProgressTestPageComponent
  }, 
  {
    path: 'wefab',
    loadChildren: () => import('./wefab/wefab-component.routes').then(m => m.WEFAB_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'wefab'  // Fallback for any undefined routes
  }
];
