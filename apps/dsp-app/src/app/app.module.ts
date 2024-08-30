import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, NgModule, NgZone } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MatJDNConvertibleCalendarDateAdapterModule } from '@dasch-swiss/jdnconvertiblecalendardateadapter';
import { AdvancedSearchComponent } from '@dasch-swiss/vre/advanced-search';
import { BASE_PATH } from '@dasch-swiss/vre/open-api';
import { PendoAnalyticsService } from '@dasch-swiss/vre/shared/app-analytics';
import { CommonToMoveComponents, SplitPipe } from '@dasch-swiss/vre/shared/app-common-to-move';
import {
  AppConfigService,
  buildTagFactory,
  BuildTagToken,
  DspApiConfigToken,
  DspAppConfigToken,
  DspInstrumentationToken,
} from '@dasch-swiss/vre/shared/app-config';
import { AppDatePickerComponent } from '@dasch-swiss/vre/shared/app-date-picker';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { HelpPageComponents } from '@dasch-swiss/vre/shared/app-help-page';
import { LocalizationService } from '@dasch-swiss/vre/shared/app-helper-services';
import { CreateListInfoPageComponent, ListComponents } from '@dasch-swiss/vre/shared/app-list';
import { MathJaxComponents } from '@dasch-swiss/vre/shared/app-mathjax';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { OntologyComponents } from '@dasch-swiss/vre/shared/app-ontology';
import { ListViewComponent, OntologyClassesComponents } from '@dasch-swiss/vre/shared/app-ontology-classes';
import { AppProgressIndicatorComponent, LoadingButtonDirective } from '@dasch-swiss/vre/shared/app-progress-indicator';
import {
  AddUserComponent,
  CollaborationComponent,
  DescriptionComponent,
  ProjectComponent,
  ProjectComponents,
  SelectGroupComponent,
} from '@dasch-swiss/vre/shared/app-project';
import { PropertyFormComponents } from '@dasch-swiss/vre/shared/app-property-form';
import { RepresentationsComponents } from '@dasch-swiss/vre/shared/app-representations';
import { PermissionInfoComponent, ResourcePageComponents } from '@dasch-swiss/vre/shared/app-resource-page';
import { ResourcePropertiesComponents } from '@dasch-swiss/vre/shared/app-resource-properties';
import { ResultsComponent, SearchComponents } from '@dasch-swiss/vre/shared/app-search';
import { SegmentSupportComponents } from '@dasch-swiss/vre/shared/app-segment-support';
import {
  ImageDisplayAbsoluteComponent,
  ImageDisplayRatioComponent,
  ImageSettingsComponent,
  SettingsPageComponents,
} from '@dasch-swiss/vre/shared/app-settings-page';
import { NgxsStoreModule } from '@dasch-swiss/vre/shared/app-state';
import {
  HumanReadableErrorPipe,
  MultiLanguageTextareaComponent,
  MutiLanguageInputComponent,
} from '@dasch-swiss/vre/shared/app-string-literal';
import { SystemComponents } from '@dasch-swiss/vre/shared/app-system';
import {
  DateValueHandlerComponent,
  DragDropDirective,
  TextValueHtmlLinkDirective,
  UiComponents,
  UiStandaloneComponents,
} from '@dasch-swiss/vre/shared/app-ui';
import { apiConnectionTokenProvider, UserComponents } from '@dasch-swiss/vre/shared/app-user';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import * as Sentry from '@sentry/angular-ivy';
import { IMaskModule } from 'angular-imask';
import { AngularSplitModule } from 'angular-split';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HintComponent } from './main/action/hint/hint.component';
import { CookiePolicyComponent } from './main/cookie-policy/cookie-policy.component';
import { DisableContextMenuDirective } from './main/directive/disable-context-menu.directive';
import { HeaderComponent } from './main/header/header.component';
import { AuthInterceptor } from './main/http-interceptors/auth-interceptor';
import { IiifWithCredentialsInterceptor } from './main/http-interceptors/iiif-with-credentials.interceptor';
import { KnoraDatePipe } from './main/pipes/formatting/knoradate.pipe';
import { IsFalsyPipe } from './main/pipes/isFalsy.piipe';
import { LinkifyPipe } from './main/pipes/string-transformation/linkify.pipe';
import { StringifyStringLiteralPipe } from './main/pipes/string-transformation/stringify-string-literal.pipe';
import { TitleFromCamelCasePipe } from './main/pipes/string-transformation/title-from-camel-case.pipe';
import { TruncatePipe } from './main/pipes/string-transformation/truncate.pipe';
import { TimePipe } from './main/pipes/time.pipe';
import { MaterialModule } from './material-module';

// translate: AoT requires an exported function for factories
export function httpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    ...PropertyFormComponents,
    ...ResourcePropertiesComponents,
    ...SegmentSupportComponents,
    ...ResourcePageComponents,
    ...RepresentationsComponents,
    ...CommonToMoveComponents,
    ...ListComponents,
    ...UiComponents,
    ...MathJaxComponents,
    ...HelpPageComponents,
    ...ProjectComponents,
    ...UserComponents,
    ...SearchComponents,
    ...SettingsPageComponents,
    ...OntologyClassesComponents,
    ...OntologyComponents,
    ...SystemComponents,
    AddUserComponent,
    AppComponent,
    DescriptionComponent,
    CollaborationComponent,
    CookiePolicyComponent,
    DateValueHandlerComponent,
    DisableContextMenuDirective,
    DragDropDirective,
    HeaderComponent,
    ImageDisplayRatioComponent,
    LoadingButtonDirective,
    LinkifyPipe,
    CreateListInfoPageComponent,
    ListViewComponent,
    KnoraDatePipe,
    ProjectComponent,
    ImageSettingsComponent,
    PermissionInfoComponent,
    ResultsComponent,
    SelectGroupComponent,
    SplitPipe,
    StringifyStringLiteralPipe,
    TextValueHtmlLinkDirective,
    TimePipe,
    TitleFromCamelCasePipe,
    TruncatePipe,
    HintComponent,
    IsFalsyPipe,
    ImageDisplayAbsoluteComponent,
  ],
  imports: [
    ...UiStandaloneComponents,
    AngularSplitModule,
    AppDatePickerComponent,
    AppProgressIndicatorComponent,
    HumanReadableErrorPipe,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CKEditorModule,
    ClipboardModule,
    ColorPickerModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    IMaskModule,
    MaterialModule,
    MatJDNConvertibleCalendarDateAdapterModule,
    NgxSkeletonLoaderModule,
    PdfViewerModule,
    ReactiveFormsModule,
    AdvancedSearchComponent,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    MultiLanguageTextareaComponent,
    MutiLanguageInputComponent,
    NgxsStoreModule,
  ],
  providers: [
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
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        hideRequiredMarker: true,
      },
    },
    LocalizationService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
