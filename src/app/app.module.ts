import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KuiActionModule } from '@knora/action';
import { JwtInterceptor, KuiAuthenticationModule } from '@knora/authentication';
import { KuiCoreModule } from '@knora/core';
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoremIpsumComponent } from './dev/lorem-ipsum/lorem-ipsum.component';
import { ConfirmComponent } from './main/dialog/confirm/confirm.component';
import { DialogComponent } from './main/dialog/dialog.component';
import { ErrorComponent } from './main/error/error.component';
import { HeaderComponent } from './main/header/header.component';
import { LoginComponent } from './main/login/login.component';
import { MainComponent } from './main/main.component';
import { NavigationItemComponent } from './main/navigation/navigation-item/navigation-item.component';
import { NavigationComponent } from './main/navigation/navigation.component';
import { MaterialModule } from './material-module';
import { BoardComponent } from './project/board/board.component';
import { CollaborationComponent } from './project/collaboration/collaboration.component';
import { UserItemComponent } from './project/collaboration/user-item/user-item.component';
import { UserListComponent } from './project/collaboration/user-list/user-list.component';
import { OntologyListComponent } from './project/ontology-list/ontology-list.component';
import { OntologyComponent } from './project/ontology/ontology.component';
import { PropertyItemComponent } from './project/ontology/property-item/property-item.component';
import { PropertyListComponent } from './project/ontology/property-list/property-list.component';
import { ResourceItemComponent } from './project/ontology/resource-item/resource-item.component';
import { ResourceListComponent } from './project/ontology/resource-list/resource-list.component';
import { SelectItemComponent } from './project/ontology/select-item/select-item.component';
import { SelectListComponent } from './project/ontology/select-list/select-list.component';
import { ProjectFormComponent } from './project/project-form/project-form.component';
import { ProjectComponent } from './project/project.component';
import { AccountComponent } from './user/account/account.component';
import { CollectionListComponent } from './user/collection-list/collection-list.component';
import { CreateMenuComponent } from './user/create-menu/create-menu.component';
import { ProfileComponent } from './user/profile/profile.component';
import { ProjectListComponent } from './user/project-list/project-list.component';
import { UserFormComponent } from './user/user-form/user-form.component';
import { UserMenuComponent } from './user/user-menu/user-menu.component';
import { UserComponent } from './user/user.component';


@NgModule({
    declarations: [
        AppComponent,
        ProjectComponent,
        BoardComponent,
        ProjectFormComponent,
        CollaborationComponent,
        UserListComponent,
        UserItemComponent,
        OntologyListComponent,
        OntologyComponent,
        PropertyListComponent,
        PropertyItemComponent,
        ResourceListComponent,
        ResourceItemComponent,
        SelectListComponent,
        SelectItemComponent,
        UserComponent,
        ProfileComponent,
        ProjectListComponent,
        UserFormComponent,
        CollectionListComponent,
        UserMenuComponent,
        CreateMenuComponent,
        MainComponent,
        HeaderComponent,
        NavigationComponent,
        NavigationItemComponent,
        DialogComponent,
        ConfirmComponent,
        ErrorComponent,
        LoginComponent,
        LoremIpsumComponent,
        AccountComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        BrowserAnimationsModule,
        FlexLayoutModule,
        HttpClientModule,
        KuiActionModule,
        KuiAuthenticationModule,
        KuiCoreModule.forRoot({
            name: environment.appName,
            api: environment.apiUrl,
            media: environment.iiifUrl,
            app: environment.appUrl,
        }),
        MaterialModule
    ],
    providers: [
        {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
