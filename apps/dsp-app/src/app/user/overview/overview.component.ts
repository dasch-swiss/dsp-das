import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
    StoredProject,
    ReadUser,
    User,
} from '@dasch-swiss/dsp-js';
import {DspApiConnectionToken, RouteConstants} from '@dasch-swiss/vre/shared/app-config';
import { DialogComponent } from '@dsp-app/src/app/main/dialog/dialog.component';
import { ProjectService } from '@dsp-app/src/app/workspace/resource/services/project.service';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { AuthService } from '@dasch-swiss/vre/shared/app-session';
import { LoadAllProjectsAction, LoadUserProjectsAction, ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/shared/app-state';

// should only be used by this component and child components
export type TileLinks = 'workspace' | 'settings';

// should only be used by this component and child components
export interface routeParams {
    id: string;
    path: TileLinks;
}

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
    private destroyed$ = new Subject<void>();
    
    loginSuccessfulSubscription: Subscription;
    isLoggedIn$ = this._authService.isLoggedIn$;
    
    @Select(UserSelectors.user) user$: Observable<ReadUser>;
    // list of projects a user is a member of
    @Select(UserSelectors.userActiveProjects) userActiveProjects$: Observable<StoredProject>;
    @Select(ProjectsSelectors.userOtherActiveProjects) userOtherActiveProjects$: Observable<StoredProject>;
    @Select(ProjectsSelectors.allProjects) allProjects$: Observable<StoredProject>;
    @Select(ProjectsSelectors.allActiveProjects) allActiveProjects$: Observable<StoredProject>;
    @Select(ProjectsSelectors.isProjectsLoading) isProjectsLoading$: Observable<boolean>;
    @Select(UserSelectors.isSysAdmin) isSysAdmin$: Observable<boolean>;

    constructor(
        @Inject(DspApiConnectionToken)
        private _dialog: MatDialog,
        private _titleService: Title,
        private _router: Router,
        private _projectService: ProjectService,
        private _authService: AuthService,
        private store: Store,
    ) {
        this._titleService.setTitle('Projects Overview');
        this.loginSuccessfulSubscription = this._authService.loginSuccessfulEvent.subscribe((user: User) => {
            if (!user.systemAdmin) {
                this.store.dispatch(new LoadUserProjectsAction());
            }
        });
    }

    ngOnInit() {
        const isSysAdmin = this.store.selectSnapshot(UserSelectors.isSysAdmin);
        // if user is a system admin or not logged in, get all the projects
        // system admin can create new projects and edit projects
        // users not logged in can only view projects
        if (isSysAdmin || !this._authService.isLoggedIn()) {
            this.store.dispatch(new LoadAllProjectsAction());
        } else {
            // logged-in user is NOT a system admin: get all projects the user is a member of. Acts on refresh/init.
            this.store.dispatch(new LoadUserProjectsAction());
        }
    }

    openDialog(mode: string, name?: string, id?: string): void {
        const dialogConfig: MatDialogConfig = {
            width: '560px',
            maxHeight: '80vh',
            position: {
                top: '112px',
            },
            data: { name: name, mode: mode, project: id },
        };

        this._dialog.open(DialogComponent, dialogConfig);
    }

    navigateTo(params: routeParams) {
        const uuid = this._projectService.iriToUuid(params.id);

        switch (params.path) {
            case 'workspace':
                this._router.navigate([RouteConstants.project, uuid]);
                break;

            case 'settings':
                this._router.navigate([
                    RouteConstants.project, uuid, RouteConstants.settings, RouteConstants.collaboration
                ]);
                break;

            default:
                break;
        }
    }

    createNewProject() {
        this._router.navigate([RouteConstants.newProjectRelative]);
    }
    
    ngOnDestroy(): void {
        this.loginSuccessfulSubscription.unsubscribe();
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
