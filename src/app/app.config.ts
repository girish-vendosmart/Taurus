import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { FormlyFieldGstVerifyComponent } from './gst-verify-type.component';
import { FormlyFieldPDropdownGroupSearchComponent } from './p-dropdown-group-search-type.component';
import { loaderInterceptor } from './core/interceptors/loader.interceptor';


// ADD THESE FIREBASE IMPORTS
import { initializeApp } from 'firebase/app';
import { provideFirebaseApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { environment } from '../enviornments/enviornment';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([loaderInterceptor])
    ),
    provideAnimations(),
    provideClientHydration(),

    // ADD FIREBASE PROVIDERS HERE
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),

    importProvidersFrom(
      ReactiveFormsModule,
      FormsModule,
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
          { name: 'gst-verify', component: FormlyFieldGstVerifyComponent },
          { name: 'p-dropdown-group-search', component: FormlyFieldPDropdownGroupSearchComponent }
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