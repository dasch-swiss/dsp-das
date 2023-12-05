import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CookiePolicyComponent } from './main/cookie-policy/cookie-policy.component';
import { AuthGuard } from './main/guard/auth.guard';
import { HelpComponent } from './main/help/help.component';
import { StatusComponent } from './main/status/status.component';
import { OntologyClassInstanceComponent } from './project/ontology-classes/ontology-class-instance/ontology-class-instance.component';
import { SettingsComponent } from './project/settings/settings.component';
// project
import { DescriptionComponent } from './project/description/description.component';
import { CollaborationComponent } from './project/collaboration/collaboration.component';
import { DataModelsComponent } from './project/data-models/data-models.component';
import { ListInfoFormComponent } from './project/list/list-info-form/list-info-form.component';
import { ListComponent } from './project/list/list.component';
import { OntologyFormComponent } from './project/ontology/ontology-form/ontology-form.component';
import { OntologyComponent } from './project/ontology/ontology.component';
import { ProjectComponent } from './project/project.component';
import { ProjectsComponent } from './system/projects/projects.component';
// system
import { SystemComponent } from './system/system.component';
import { UsersComponent } from './system/users/users.component';
// user
import { OverviewComponent } from './user/overview/overview.component';
import { UserComponent } from './user/user.component';
// search results and resource viewer
import { ResourceComponent } from './workspace/resource/resource.component';
import { ResultsComponent } from './workspace/results/results.component';
import { AdvancedSearchContainerComponent } from './workspace/search/advanced-search/advanced-search-container.component';
import { ProjectFormComponent } from "@dsp-app/src/app/project/project-form/project-form.component";
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { UserFormComponent } from '@dsp-app/src/app/user/user-form/user-form.component';

const routes: Routes = [
    {
        path: RouteConstants.home,
        component: OverviewComponent,
    },
    {
        path: RouteConstants.help,
        component: HelpComponent,
    },
    {
        path: RouteConstants.createNewProjectRelative,
        canActivate: [AuthGuard],
        component: ProjectFormComponent
    },
    {
        path: RouteConstants.projectUuidRelative,
        component: ProjectComponent,
        children: [
            {   path: RouteConstants.edit,
                canActivate: [AuthGuard],
                component: ProjectFormComponent
            },
            {
                path: RouteConstants.home, // Todo: Change into RouteConstants.description
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
                path: RouteConstants.OntologyClassRelative,
                component: OntologyClassInstanceComponent,
            },
            {
                path: RouteConstants.OntologyClassInstanceRelative, // Todo: THIS IS PROBABLY NOT USED ANYWHERE AND NOT WORKING AT ALL!! It can logically not work. What should happen with the class? What is the purpose of this route?
                component: OntologyClassInstanceComponent,
            },
            {
                path: RouteConstants.addList,
                component: ListInfoFormComponent,
                canActivate: [AuthGuard],
            },
            {
                path: `${RouteConstants.list}/:${RouteConstants.listParameter}`,
                component: ListComponent
            },
            {
                path: RouteConstants.settings,
                component: SettingsComponent,
                canActivate: [AuthGuard],
                children: [
                    {
                        path: RouteConstants.home,
                        pathMatch: 'full',
                        redirectTo: RouteConstants.collaboration,
                    },
                    {
                        path: RouteConstants.collaboration,
                        component: CollaborationComponent,
                    },
                    {
                        path: RouteConstants.collaborationCreateUserRelative,
                        component: UserFormComponent,
                        canActivate: [AuthGuard],
                    },
                    {
                        path: RouteConstants.collaborationEditUserRelative,
                        component: UserFormComponent,
                        canActivate: [AuthGuard],
                    }
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
        pathMatch: 'full',
        canActivate: [AuthGuard],
    },
    {
        path: RouteConstants.accountEditUserRelative,
        component: UserFormComponent,
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
                path: RouteConstants.home,
                pathMatch: 'full',
                redirectTo: RouteConstants.systemProjects,
            },
            {
                path: RouteConstants.systemProjects,
                pathMatch: 'full',
                component: ProjectsComponent,
            },
            {
                path: RouteConstants.systemUsers,
                pathMatch: 'full',
                component: UsersComponent
            },
            {
                path: RouteConstants.usersEditUserRelative,
                component: UserFormComponent,
                canActivate: [AuthGuard],
            },
            {
                path: RouteConstants.usersCreateNewUserRelative,
                component: UserFormComponent,
                canActivate: [AuthGuard],
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
                component: ResourceComponent,
            },
            {
                path: RouteConstants.projectResourceRelative,
                component: ResourceComponent,
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
