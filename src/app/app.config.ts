import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { PanelWrapperComponent } from './formly.config';
import { FormlyRepeatTypeComponent } from './formly-repeat-type.component';
import { FormlyFieldFileComponent } from './file-type.component';
import { FormlyFieldMultiSelectComponent } from './multiselect-type.component';
import { FormlyFieldPhoneOtpComponent } from './phone-otp-type.component';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    importProvidersFrom(
      ReactiveFormsModule,
      FormlyModule.forRoot({
        types: [
          { name: 'repeat', component: FormlyRepeatTypeComponent },
          { name: 'file', component: FormlyFieldFileComponent },
          { name: 'p-multiselect', component: FormlyFieldMultiSelectComponent },
          { name: 'phone-otp', component: FormlyFieldPhoneOtpComponent },
        ],
        wrappers: [
          { name: 'panel', component: PanelWrapperComponent },
        ],
        validationMessages: [
          { name: 'required', message: 'This field is required' },
          { name: 'email', message: 'Invalid email address' },
        ],
      }),
      FormlyBootstrapModule
    )
  ]
};