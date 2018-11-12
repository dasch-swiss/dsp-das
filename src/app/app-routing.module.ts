import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { LoginComponent } from './main/login/login.component';
import { ProjectComponent } from './project/project.component';
import { BoardComponent } from './project/board/board.component';
import { CollaborationComponent } from './project/collaboration/collaboration.component';
import { OntologyListComponent } from './project/ontology-list/ontology-list.component';
import { OntologyComponent } from './project/ontology/ontology.component';
import { ProjectFormComponent } from './project/project-form/project-form.component';
import { ErrorComponent } from './main/error/error.component';
import { CollectionListComponent } from './user/collection-list/collection-list.component';
import { ProfileComponent } from './user/profile/profile.component';
import { UserComponent } from './user/user.component';
import { UserFormComponent } from './user/user-form/user-form.component';
import { ProjectListComponent } from './user/project-list/project-list.component';

const routes: Routes = [
    {
        path: '',
        component: MainComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'project/new',
        component: ProjectFormComponent
    },
    {
        path: 'project/:shortcode',
        component: ProjectComponent,

        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'board'
            },
            {
                path: 'board',
                component: BoardComponent
            },
            {
                path: 'edit',
                component: ProjectFormComponent
            },
            {
                path: 'collaboration',
                component: CollaborationComponent
            },
            {
                path: 'ontologies',
                component: OntologyListComponent
            },
            {
                path: 'ontology/:id',
                component: OntologyComponent,
            },
            {
                path: '**',
                component: ErrorComponent,
                data: {status: 404}
            }
        ]
    },
    {
        path: 'user/new',
        component: UserFormComponent
    },
    {
        path: 'user/:name',
        component: UserComponent
    },
    {
        path: 'account',
        component: UserFormComponent
    },
    {
        path: 'projects',
        component: ProjectListComponent,
        data: {list: true}
    },
    {
        path: 'collections',
        component: CollectionListComponent,
        data: {list: true}
    },
    {
        path: '**',
        component: ErrorComponent,
        data: {status: 404}
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
