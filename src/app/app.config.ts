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
import { FormlyFieldFileUploadComponent } from './file-upload-type.component';
import { FormlyFieldRangeSliderComponent } from './range-slider-type.component';
import { FormlyFieldDropdownComponent } from './dropdown-type.component';
import { FormlyFieldSearchableSelectComponent } from './searchable-select-type.component';
import { PMultiSelectGroupComponent } from './p-multiSelect-group.component';
import { FormlyFieldGooglePlacesComponent } from './google-places-type.component';

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
          { name: 'p-multiselect-group', component: PMultiSelectGroupComponent },
          { name: 'repeat', component: FormlyRepeatTypeComponent },
          { name: 'file', component: FormlyFieldFileComponent },
          { name: 'file-upload', component: FormlyFieldFileUploadComponent },
          { name: 'p-multiselect', component: FormlyFieldMultiSelectComponent },
          { name: 'phone-otp', component: FormlyFieldPhoneOtpComponent },
          { name: 'range-slider', component: FormlyFieldRangeSliderComponent },
          { name: 'p-dropdown', component: FormlyFieldDropdownComponent },
          { name: 'searchable-select', component: FormlyFieldSearchableSelectComponent },
          { name: 'google-places', component: FormlyFieldGooglePlacesComponent },
        ],
        wrappers: [
          { name: 'panel', component: PanelWrapperComponent },
        ],
        extras: {
          showError: function(field) {
            return !!(field.formControl && field.formControl.invalid && (field.formControl.touched || field.options.parentForm?.submitted));
          }
        },
        validationMessages: [
          { name: 'required', message: 'This field is required' },
          { name: 'email', message: 'Invalid email address' },
        ],
      }),
      FormlyBootstrapModule
    )
  ]
};