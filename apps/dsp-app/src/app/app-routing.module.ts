import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HintComponent } from './main/action/hint/hint.component';
import { LoginFormComponent } from './main/action/login-form/login-form.component';
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
import { PermissionComponent } from './project/permission/permission.component';
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
import { AdvancedSearchComponent } from '@dasch-swiss/vre/advanced-search';
import { AdvancedSearchContainerComponent } from './workspace/search/advanced-search/advanced-search-container.component';

const routes: Routes = [
    {
        path: '',
        component: OverviewComponent,
    },
    {
        path: 'advanced-search',
        component: AdvancedSearchContainerComponent,
    },
    {
        path: 'help',
        component: HelpComponent,
    },
    {
        path: 'login',
        component: LoginFormComponent,
    },
    {
        path: 'project/:uuid',
        component: ProjectComponent,
        children: [
            {
                path: '',
                component: DescriptionComponent
            },
            {
                path: 'add-ontology',
                component: OntologyFormComponent,
                canActivate: [AuthGuard],
            },
            {
                path: 'ontology',
                component: HintComponent,
                data: { topic: 'ontology' },
            },
            {
                path: 'data-models',
                component: DataModelsComponent
            },
            {
                path: 'ontology/:onto',
                component: OntologyComponent,
                canActivate: [AuthGuard],
            },
            {
                path: 'ontology/:onto/editor/:view',
                component: OntologyComponent,
                canActivate: [AuthGuard],
            },
            {
                path: 'ontology/:onto/:class',
                component: OntologyClassInstanceComponent,
            },
            {
                path: 'ontology/:onto/:class/conf',
                component: StatusComponent,
                data: {
                    status: 501,
                    comment:
                        'Here you will be able to configure the resource class.',
                },
                canActivate: [AuthGuard],
            },
            {
                path: 'ontology/:onto/:class/:instance',
                component: OntologyClassInstanceComponent,
            },
            {
                path: 'add-list',
                component: ListInfoFormComponent,
                canActivate: [AuthGuard],
            },
            {
                path: 'list',
                component: HintComponent,
                data: { topic: 'list' },
            },
            {
                path: 'list/:list',
                component: ListComponent
            },
            {
                path: 'settings',
                component: SettingsComponent,
                canActivate: [AuthGuard],
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: 'collaboration',
                    },
                    {
                        path: 'collaboration',
                        component: CollaborationComponent,
                    },
                    {
                        path: 'permissions',
                        component: PermissionComponent,
                    },
                ],
            },
            {
                path: 'advanced-search',
                component: AdvancedSearchComponent,
            },
            {
                path: '**',
                component: StatusComponent,
                data: { status: 404 },
            },
        ],
    },
    /*
    {
        path: 'user/:name',
        component: ProfileComponent
    },
    */
    {
        path: 'profile',
        component: UserComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'account',
        component: UserComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'projects',
        component: UserComponent,
        canActivate: [AuthGuard],
    },
    /* {
        path: 'collections',
        component: UserComponent,
        canActivate: [AuthGuard]
    }, */
    {
        path: 'system',
        component: SystemComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'projects',
            },
            {
                path: 'projects',
                component: ProjectsComponent,
            },
            {
                path: 'users',
                component: UsersComponent,
            },
        ],
    },
    {
        path: 'search',
        children: [
            {
                path: ':mode/:q/:project',
                component: ResultsComponent,
            },
            {
                path: ':mode/:q',
                component: ResultsComponent,
            },
        ],
    },
    {
        path: 'resource',
        children: [
            {
                path: ':project/:resource/:value',
                component: ResourceComponent,
            },
            {
                path: ':project/:resource',
                component: ResourceComponent,
            },
        ],
        runGuardsAndResolvers: 'always',
    },
    {
        path: 'cookie-policy',
        component: CookiePolicyComponent,
    },
    {
        path: 'teapot',
        component: StatusComponent,
        data: { status: 418 },
    },
    {
        path: '**',
        component: StatusComponent,
        data: { status: 404 },
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
