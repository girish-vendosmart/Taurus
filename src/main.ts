/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './enviornments/enviornment';

// Initialize Firebase manually without using provideFirebaseApp
import { initializeApp } from 'firebase/app';
const app = initializeApp(environment.firebaseConfig);

bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers
  ]
}).catch(err => console.error(err));