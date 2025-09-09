import { enableProdMode, importProvidersFrom } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { MatJDNConvertibleCalendarDateAdapterModule } from '@dasch-swiss/jdnconvertiblecalendardateadapter';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      FormsModule,
      MatDatepickerModule,
      MatFormFieldModule,
      MatInputModule,
      MatOptionModule,
      MatSelectModule,
      MatJDNConvertibleCalendarDateAdapterModule,
      ReactiveFormsModule
    ),
    provideAnimations(),
  ],
}).catch(err => console.error(err));
