import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { HelpPageComponent } from '@dasch-swiss/vre/shared/app-help-page';
import { CreateListInfoPageComponent, ListPageComponent } from '@dasch-swiss/vre/shared/app-list';
import { CreateProjectFormPageComponent, EditProjectFormPageComponent } from '@dasch-swiss/vre/shared/app-project';
import { ResourcePage2Component, ResourcePageComponent } from '@dasch-swiss/vre/shared/app-resource-page';
import { CreateResourcePageComponent } from '@dasch-swiss/vre/shared/app-resource-properties';
import { ProjectComponent } from '../../../../libs/vre/shared/app-project/src/lib/project/project.component';
import { CookiePolicyComponent } from './main/cookie-policy/cookie-policy.component';
import { AuthGuard } from './main/guard/auth.guard';
import { OntologyClassInstanceGuard } from './main/guard/ontology-class-instance.guard';
import { StatusComponent } from './main/status/status.component';
import { CollaborationComponent } from './project/collaboration/collaboration.component';
import { DataModelsComponent } from './project/data-models/data-models.component';
import { DescriptionComponent } from './project/description/description.component';
import { ImageSettingsComponent } from './project/image-settings/image-settings.component';
import { OntologyFormComponent } from './project/ontology/ontology-form/ontology-form.component';
import { OntologyComponent } from './project/ontology/ontology.component';
import { OntologyClassInstanceComponent } from './project/ontology-classes/ontology-class-instance/ontology-class-instance.component';
import { SettingsPageComponent } from './project/settings/settings-page.component';
import { ProjectsComponent } from './system/projects/projects.component';
import { SystemComponent } from './system/system.component';
import { UsersComponent } from './system/users/users.component';
import { OverviewComponent } from './user/overview/overview.component';
import { UserComponent } from './user/user.component';
import { ResultsComponent } from './workspace/results/results.component';
import { AdvancedSearchContainerComponent } from './workspace/search/advanced-search/advanced-search-container.component';

const routes: Routes = [
  {
    path: RouteConstants.home,
    component: OverviewComponent,
  },
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
    path: RouteConstants.projectUuidRelative,
    component: ProjectComponent,
    children: [
      {
        path: RouteConstants.home,
        component: DescriptionComponent,
      },
      {
        path: RouteConstants.addOntology,
        component: OntologyFormComponent,
        canActivate: [AuthGuard],
      },
      {
        path: RouteConstants.dataModels,
        component: DataModelsComponent,
      },
      {
        path: RouteConstants.ontologyRelative,
        component: OntologyComponent,
        canActivate: [AuthGuard],
      },
      {
        path: RouteConstants.OntologyEditorViewRelative,
        component: OntologyComponent,
        canActivate: [AuthGuard],
      },
      {
        canActivate: [OntologyClassInstanceGuard],
        path: RouteConstants.OntologyClassRelative,
        component: OntologyClassInstanceComponent,
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
        path: RouteConstants.addList,
        component: CreateListInfoPageComponent,
        canActivate: [AuthGuard],
      },
      {
        path: `${RouteConstants.list}/:${RouteConstants.listParameter}`,
        component: ListPageComponent,
        canActivate: [AuthGuard],
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
            path: RouteConstants.imageSettings,
            component: ImageSettingsComponent,
          },
          {
            path: RouteConstants.collaboration,
            component: CollaborationComponent,
          },
        ],
      },
      {
        path: RouteConstants.advancedSearch,
        component: AdvancedSearchContainerComponent,
      },
      {
        path: RouteConstants.advancedSearchResultsRelative,
        component: ResultsComponent,
      },
      {
        path: RouteConstants.notFoundWildcard,
        component: StatusComponent,
        data: { status: RouteConstants.notFound },
      },
    ],
  },
  {
    path: RouteConstants.userAccount,
    component: UserComponent,
    canActivate: [AuthGuard],
  },
  {
    path: RouteConstants.projects,
    component: UserComponent,
    canActivate: [AuthGuard],
  },
  {
    path: RouteConstants.system,
    component: SystemComponent,
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
        component: UsersComponent,
      },
    ],
  },
  {
    path: RouteConstants.search,
    children: [
      {
        path: RouteConstants.searchProjectRelative,
        component: ResultsComponent,
      },
      {
        path: RouteConstants.searchRelative,
        component: ResultsComponent,
      },
    ],
  },
  {
    path: RouteConstants.resource,
    children: [
      {
        path: RouteConstants.projectResourceValueRelative,
        component: ResourcePage2Component,
      },
      {
        path: RouteConstants.projectResourceRelative,
        component: ResourcePage2Component,
      },
    ],
    runGuardsAndResolvers: 'always',
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
