import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import { ResourceClassBrowserPage2Component } from '@dasch-swiss/vre/pages/data-browser';
import { ListPageComponent } from '@dasch-swiss/vre/pages/ontology/list';
import {
  DataModelsPageComponent,
  OntologyEditorPageComponent,
  OntologyPageComponent,
  OntologyPropertiesComponent,
} from '@dasch-swiss/vre/pages/ontology/ontology';
import {
  CollaborationPageComponent,
  CreateProjectFormPageComponent,
  EditProjectFormPageComponent,
  ImageSettingsComponent,
  LegalSettingsComponent,
  ProjectDescriptionPageComponent,
  ProjectPageComponent,
  ResourceMetadataComponent,
  SettingsPageComponent,
} from '@dasch-swiss/vre/pages/project/project';
import {
  AdvancedSearchPageComponent,
  AdvancedSearchResultsPageComponent,
  FulltextSearchResultsPageComponent,
  GlobalPageComponent,
  ProjectFulltextSearchPageComponent,
} from '@dasch-swiss/vre/pages/search/search';
import {
  CookiePolicyComponent,
  ProjectsComponent,
  SystemPageComponent,
  UsersTabComponent,
} from '@dasch-swiss/vre/pages/system/system';
import { AccountComponent, ProjectOverviewComponent, UserComponent } from '@dasch-swiss/vre/pages/user-settings/user';
import { CreateResourcePageComponent } from '@dasch-swiss/vre/resource-editor/resource-creator';
import { ResourcePageComponent, SingleResourcePageComponent } from '@dasch-swiss/vre/resource-editor/resource-editor';
import { StatusComponent } from '@dasch-swiss/vre/shared/app-common-to-move';
import { HelpPageComponent } from '@dasch-swiss/vre/shared/app-help-page';
import { AuthGuard } from './main/guard/auth.guard';
import { OntologyClassInstanceGuard } from './main/guard/ontology-class-instance.guard';

const routes: Routes = [
  {
    path: RouteConstants.projectUuidRelative,
    component: ProjectPageComponent,
    children: [
      {
        path: RouteConstants.home,
        pathMatch: 'full',
        redirectTo: RouteConstants.projectDescription,
      },
      {
        path: RouteConstants.projectDescription,
        component: ProjectDescriptionPageComponent,
      },
      {
        path: RouteConstants.dataModels,
        component: DataModelsPageComponent,
      },
      {
        path: RouteConstants.ontologyRelative,
        redirectTo: RouteConstants.ontologyEditorRelative,
        pathMatch: 'full',
      },
      {
        path: RouteConstants.ontologyEditorRelative, // TODO this route should change to /data-models/
        component: OntologyPageComponent,
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: RouteConstants.classes,
          },
          {
            path: RouteConstants.classes,
            component: OntologyEditorPageComponent,
          },
          {
            path: RouteConstants.properties,
            component: OntologyPropertiesComponent,
          },
        ],
      },
      {
        path: 'data',
        component: ResourceClassBrowserPage2Component,
      },
      {
        canActivate: [OntologyClassInstanceGuard],
        path: RouteConstants.OntologyClassAddRelative,
        component: CreateResourcePageComponent,
      },
      {
        path: RouteConstants.JulienOntologyClassRelative,
        component: ResourcePageComponent,
      },
      {
        path: `${RouteConstants.list}/:${RouteConstants.listParameter}`,
        component: ListPageComponent,
      },
      {
        path: RouteConstants.settings,
        component: SettingsPageComponent,
        canActivate: [AuthGuard],
        children: [
          {
            path: RouteConstants.home,
            pathMatch: 'full',
            redirectTo: RouteConstants.edit,
          },
          {
            path: RouteConstants.edit,
            component: EditProjectFormPageComponent,
          },
          {
            path: RouteConstants.resourceMetadata,
            component: ResourceMetadataComponent,
          },
          {
            path: RouteConstants.imageSettings,
            component: ImageSettingsComponent,
          },
          {
            path: RouteConstants.legalSettings,
            component: LegalSettingsComponent,
          },
          {
            path: RouteConstants.collaboration,
            component: CollaborationPageComponent,
          },
        ],
      },
      {
        path: 'search',
        component: ProjectFulltextSearchPageComponent,
      },
      {
        path: RouteConstants.advancedSearchResultsRelative,
        component: AdvancedSearchResultsPageComponent,
      },
      { path: 'advanced-search', component: AdvancedSearchPageComponent },
      {
        path: RouteConstants.notFoundWildcard,
        component: StatusComponent,
        data: { status: RouteConstants.notFound },
      },
    ],
  },
  {
    path: '',
    component: GlobalPageComponent,
    children: [
      {
        path: RouteConstants.home,
        component: ProjectOverviewComponent,
      },
      { path: 'search/:query', component: FulltextSearchResultsPageComponent },
      {
        path: RouteConstants.help,
        component: HelpPageComponent,
      },
      {
        path: `${RouteConstants.createNewProjectRelative}`,
        canActivate: [AuthGuard],
        component: CreateProjectFormPageComponent,
      },

      {
        path: 'my-profile',
        component: UserComponent,
        children: [
          { path: RouteConstants.userAccount, component: AccountComponent },
          { path: 'projects', component: ProjectsComponent },
        ],
        canActivate: [AuthGuard],
      },
      {
        path: RouteConstants.projects,
        component: UserComponent,
        canActivate: [AuthGuard],
      },
      {
        path: RouteConstants.system,
        component: SystemPageComponent,
        canActivate: [AuthGuard],
        children: [
          {
            path: '',
            redirectTo: RouteConstants.systemProjects,
            pathMatch: 'full',
          },
          {
            path: RouteConstants.systemProjects,
            component: ProjectsComponent,
          },
          {
            path: RouteConstants.systemUsers,
            component: UsersTabComponent,
          },
        ],
      },
      {
        path: RouteConstants.projectResourceRelative,
        component: SingleResourcePageComponent,
      },
      {
        path: RouteConstants.cookiePolicy,
        component: CookiePolicyComponent,
      },
      {
        path: RouteConstants.notFoundWildcard,
        component: StatusComponent,
        data: { status: RouteConstants.notFound },
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      bindToComponentInputs: true,
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
