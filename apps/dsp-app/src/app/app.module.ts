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
import {
  CreateListInfoPageComponent,
  ListComponents,
  ReusableListInfoFormComponent,
} from '@dasch-swiss/vre/shared/app-list';
import { MathJaxComponents } from '@dasch-swiss/vre/shared/app-mathjax';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { OntologyComponents } from '@dasch-swiss/vre/shared/app-ontology';
import { OntologyClassesComponents } from '@dasch-swiss/vre/shared/app-ontology-classes';
import {
  AppProgressIndicatorComponent,
  CenteredLayoutComponent,
  LoadingButtonDirective,
} from '@dasch-swiss/vre/shared/app-progress-indicator';
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
import { ResourcePageComponents } from '@dasch-swiss/vre/shared/app-resource-page';
import { ResourcePropertiesComponents } from '@dasch-swiss/vre/shared/app-resource-properties';
import { SearchComponents } from '@dasch-swiss/vre/shared/app-search';
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
import { UiComponents, UiStandaloneComponents } from '@dasch-swiss/vre/shared/app-ui';
import { apiConnectionTokenProvider, ProjectTileComponent, UserComponents } from '@dasch-swiss/vre/shared/app-user';
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
import { LoginFormComponent } from './main/action/login-form/login-form.component';
import { SelectedResourcesComponent } from './main/action/selected-resources/selected-resources.component';
import { SortButtonComponent } from './main/action/sort-button/sort-button.component';
import { CookiePolicyComponent } from './main/cookie-policy/cookie-policy.component';
import { AdminImageDirective } from './main/directive/admin-image/admin-image.directive';
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
import { StatusComponent } from './main/status/status.component';
import { MaterialModule } from './material-module';
import { EraseProjectDialogComponent } from './system/projects/projects-list/erase-project-dialog/erase-project-dialog.component';
import { ProjectsListComponent } from './system/projects/projects-list/projects-list.component';
import { ProjectsComponent } from './system/projects/projects.component';
import { SystemComponent } from './system/system.component';
import { UsersListComponent } from './system/users/users-list/users-list.component';
import { UsersComponent } from './system/users/users.component';
import { ComparisonComponent } from './workspace/comparison/comparison.component';
import { IntermediateComponent } from './workspace/intermediate/intermediate.component';
import { DragDropDirective } from './workspace/resource/directives/drag-drop.directive';
import { TextValueHtmlLinkDirective } from './workspace/resource/directives/text-value-html-link.directive';
import { PermissionInfoComponent } from './workspace/resource/permission-info/permission-info.component';
import { SelectProjectComponent } from './workspace/resource/resource-instance-form/select-project/select-project.component';
import { ResourceLinkFormComponent } from './workspace/resource/resource-link-form/resource-link-form.component';
import { ColorPickerComponent } from './workspace/resource/values/color-value/color-picker/color-picker.component';
import { DateValueHandlerComponent } from './workspace/resource/values/date-value/date-value-handler/date-value-handler.component';
import { JDNDatepickerDirective } from './workspace/resource/values/jdn-datepicker-directive/jdndatepicker.directive';
import { ListViewComponent } from './workspace/results/list-view/list-view.component';
import { ResourceListComponent } from './workspace/results/list-view/resource-list/resource-list.component';
import { ResultsComponent } from './workspace/results/results.component';

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
    AddUserComponent,
    AdminImageDirective,
    AppComponent,
    DescriptionComponent,
    CenteredLayoutComponent,
    CollaborationComponent,
    ColorPickerComponent,
    ComparisonComponent,
    CookiePolicyComponent,
    DateValueHandlerComponent,
    DisableContextMenuDirective,
    DragDropDirective,
    HeaderComponent,
    ImageDisplayRatioComponent,
    IntermediateComponent,
    JDNDatepickerDirective,
    LoadingButtonDirective,
    LinkifyPipe,
    CreateListInfoPageComponent,
    ReusableListInfoFormComponent,
    ListViewComponent,
    LoginFormComponent,
    KnoraDatePipe,
    ProjectComponent,
    ImageSettingsComponent,
    PermissionInfoComponent,
    ProjectsComponent,
    ProjectsListComponent,
    ResourceLinkFormComponent,
    ResourceListComponent,
    ResultsComponent,
    SelectedResourcesComponent,
    SelectGroupComponent,
    SelectProjectComponent,
    SortButtonComponent,
    SplitPipe,
    StatusComponent,
    StringifyStringLiteralPipe,
    SystemComponent,
    TextValueHtmlLinkDirective,
    TimePipe,
    TitleFromCamelCasePipe,
    TruncatePipe,
    UsersComponent,
    UsersListComponent,
    HintComponent,
    ProjectTileComponent,
    IsFalsyPipe,
    ImageDisplayAbsoluteComponent,
    EraseProjectDialogComponent,
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
