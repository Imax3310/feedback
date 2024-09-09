import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    importProvidersFrom(
      RecaptchaV3Module,
    ),
    {provide: RECAPTCHA_V3_SITE_KEY, useValue: '6LfGEDUqAAAAABdYdn7e5ISFPnUe0SyQknYMfKfq'}
  ]
};
