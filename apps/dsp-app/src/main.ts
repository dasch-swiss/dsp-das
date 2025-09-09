import { BASE_PATH } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { AppErrorHandler } from '@dasch-swiss/vre/core/error-handler';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { AuthInterceptor } from './app/main/http-interceptors/auth-interceptor';
import { IiifWithCredentialsInterceptor } from './app/main/http-interceptors/iiif-with-credentials.interceptor';
import { Router } from '@angular/router';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';
import { AngularSplitModule } from 'angular-split';
import { AppRoutingModule } from './app/app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ColorPickerModule } from 'ngx-color-picker';
import { CommonModule } from '@angular/common';
import { HttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { enableProdMode, ErrorHandler, NgZone, APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatStepperModule } from '@angular/material/stepper';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { MatJDNConvertibleCalendarDateAdapterModule } from '@dasch-swiss/jdnconvertiblecalendardateadapter';
import { PendoAnalyticsService } from '@dasch-swiss/vre/3rd-party-services/analytics';
import {
  AppConfigToken,
  AppConfigService,
  DspApiConfigToken,
  DspAppConfigToken,
  DspInstrumentationToken,
  BuildTagToken,
  buildTagFactory,
} from '@dasch-swiss/vre/core/config';
import { SegmentSupportComponents } from '@dasch-swiss/vre/resource-editor/segment-support';
import { ResourcePageComponents } from '@dasch-swiss/vre/resource-editor/resource-editor';
import { RepresentationsComponents } from '@dasch-swiss/vre/resource-editor/representations';
import { PropertiesDisplayComponents } from '@dasch-swiss/vre/resource-editor/properties-display';
import { CommonToMoveComponents } from '@dasch-swiss/vre/shared/app-common-to-move';
import { ListComponents } from '@dasch-swiss/vre/pages/ontology/list';
import { UiComponents } from '@dasch-swiss/vre/ui/ui';
import { HelpPageComponents } from '@dasch-swiss/vre/shared/app-help-page';
import { ProjectComponents } from '@dasch-swiss/vre/pages/project/project';
import { SearchComponents } from '@dasch-swiss/vre/pages/search/search';
import { DataBrowserComponents } from '@dasch-swiss/vre/pages/data-browser';
import { OntologyComponents } from '@dasch-swiss/vre/pages/ontology/ontology';
import { SystemComponents } from '@dasch-swiss/vre/pages/system/system';
import { apiConnectionTokenProvider, UserComponents } from '@dasch-swiss/vre/pages/user-settings/user';
import { ResourceCreatorComponents } from '@dasch-swiss/vre/resource-editor/resource-creator';
import { ResourcePropertiesComponents } from '@dasch-swiss/vre/resource-editor/resource-properties';
import { DatePickerComponents } from '@dasch-swiss/vre/ui/date-picker';
import { ProgressIndicatorComponents } from '@dasch-swiss/vre/ui/progress-indicator';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import * as Sentry from '@sentry/angular';
import { IMaskModule } from 'angular-imask';
import { TemplateSwitcherComponents } from 'template-switcher';
import { AppComponent } from './app/app.component';
import { httpLoaderFactory } from './app/app.module';
import { environment } from './environments/environment';

function initSentry(environmentName: string) {
  const serverNamesListToExcludeFromSentry = [
    'demo',
    'dev',
    'dev-02',
    'dev-03',
    'dev-04',
    'dev-05',
    'dev-06',
    'dev-server',
    'local-dev',
    'ls-test',
    'perf-01',
    'test-rdu',
  ];

  if (serverNamesListToExcludeFromSentry.includes(environmentName)) return;

  Sentry.init({
    dsn: 'https://20bfc69ec9e457239886c1128cc17928@o4506122165747712.ingest.us.sentry.io/4506122171252736',
    environment: environmentName,
    release: environment.version,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}

function configListener() {
  try {
    const configuration = JSON.parse(this.responseText);
    initSentry(configuration.instrumentation.environment);
    // pass config to bootstrap process using an injection token
    // which will make the encapsulated value available inside
    // services that inject this token
    bootstrapApplication(AppComponent, {
      providers: [
        importProvidersFrom(
          AngularSplitModule,
          AppRoutingModule,
          BrowserModule,
          CKEditorModule,
          ClipboardModule,
          ColorPickerModule,
          CommonModule,
          FormsModule,
          IMaskModule,
          MatJDNConvertibleCalendarDateAdapterModule,
          MatRippleModule,
          NgxSkeletonLoaderModule,
          PdfViewerModule,
          ReactiveFormsModule,
          MatStepperModule,
          TranslateModule.forRoot({
            loader: {
              provide: TranslateLoader,
              useFactory: httpLoaderFactory,
              deps: [HttpClient],
            },
          }),
          ...TemplateSwitcherComponents,
          ...ResourcePropertiesComponents,
          ...ResourceCreatorComponents,
          ...SegmentSupportComponents,
          ...ResourcePageComponents,
          ...RepresentationsComponents,
          ...PropertiesDisplayComponents,
          ...CommonToMoveComponents,
          ...ListComponents,
          ...UiComponents,
          ...HelpPageComponents,
          ...ProjectComponents,
          ...UserComponents,
          ...SearchComponents,
          ...DataBrowserComponents,
          ...OntologyComponents,
          ...SystemComponents,
          ...ProgressIndicatorComponents,
          ...DatePickerComponents
        ),
        AppConfigService,
        PendoAnalyticsService,
        {
          provide: DspApiConfigToken,
          useFactory: (appConfigService: AppConfigService) => appConfigService.dspApiConfig,
          deps: [AppConfigService],
        },
        apiConnectionTokenProvider,
        {
          provide: DspAppConfigToken,
          useFactory: (appConfigService: AppConfigService) => appConfigService.dspAppConfig,
          deps: [AppConfigService],
        },
        {
          provide: DspInstrumentationToken,
          useFactory: (appConfigService: AppConfigService) => appConfigService.dspInstrumentationConfig,
          deps: [AppConfigService],
        },
        {
          provide: BuildTagToken,
          useFactory: buildTagFactory,
          deps: [HttpClient],
        },
        {
          provide: BASE_PATH,
          useFactory: (configService: AppConfigService) => configService.dspApiConfig.apiUrl,
          deps: [AppConfigService],
        },
        {
          provide: ErrorHandler,
          useClass: AppErrorHandler,
          deps: [NotificationService, AppConfigService, NgZone],
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: IiifWithCredentialsInterceptor,
          multi: true,
        },
        {
          provide: Sentry.TraceService,
          deps: [Router],
        },
        {
          provide: APP_INITIALIZER,
          useFactory: () => () => {},
          deps: [Sentry.TraceService],
          multi: true,
        },
        LocalizationService,
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).catch(err => console.error(err));
  } catch (error) {
    console.error(error);
  }
}

function configFailed() {
  console.error('Error: retrieving config.json');
}

if (environment.production) {
  enableProdMode();
}

const getConfigRequest = new XMLHttpRequest();
getConfigRequest.addEventListener('load', configListener);
getConfigRequest.addEventListener('error', configFailed);
getConfigRequest.open('GET', `./config/config.${environment.name}.json`);
getConfigRequest.send();
