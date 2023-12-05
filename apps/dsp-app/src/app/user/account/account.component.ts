import {
    Component,
    EventEmitter,
    Inject,
    OnInit,
    Output,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import {
    ApiResponseError,
    KnoraApiConnection,
    ReadUser,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { DialogComponent } from '@dsp-app/src/app/main/dialog/dialog.component';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { apiConnectionTokenProvider } from '../../providers/api-connection-token.provider';
import { UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { AuthService } from '@dasch-swiss/vre/shared/app-session';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
    providers: [apiConnectionTokenProvider]
})
export class AccountComponent implements OnInit {
    // in case of modification
    @Output() refreshParent: EventEmitter<any> = new EventEmitter<any>();

    @Select(UserSelectors.user) user$: Observable<ReadUser>;
    @Select(UserSelectors.isLoading) isLoading$: Observable<boolean>;

    userId: string;
    username: string;

    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection,
        private _dialog: MatDialog,
        private _errorHandler: AppErrorHandler,
        private _titleService: Title,
        private _store: Store,
        private _authService: AuthService,
        private _route: ActivatedRoute,
        private _router: Router,
    ) {
        // set the page title
        this._titleService.setTitle('Your account');
    }

    ngOnInit() {
        this.user$.pipe(
            take(1),
            tap((user: ReadUser) => {
                this.userId = user?.id;
                this.username = user?.username;
            })
        ).subscribe();
    }

    openDialog(mode: string, name: string, id?: string): void {
        const dialogConfig: MatDialogConfig = {
            width: '560px',
            maxHeight: '80vh',
            position: {
                top: '112px',
            },
            data: { name: name, mode: mode },
        };

        const dialogRef = this._dialog.open(DialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe((response) => {
            if (response === true) {
                // get the mode
                switch (mode) {
                    case 'deleteUser':
                        this.deleteUser(id);
                        break;

                    case 'activateUser':
                        this.activateUser(id);
                        break;
                }
            } else {
                // update the view
                this.refreshParent.emit();
            }
        });
    }

    editUser() {
        this._router.navigate([
                encodeURIComponent(this.userId),
                RouteConstants.edit
            ],
            {
                relativeTo: this._route,
            });
    }

    deleteUser(id: string) {
        this._dspApiConnection.admin.usersEndpoint.deleteUser(id).subscribe(
            () => {
                this._authService.logout();
            },
            (error: ApiResponseError) => {
                this._errorHandler.showMessage(error);
            }
        );
    }

    activateUser(id: string) {
        this._dspApiConnection.admin.usersEndpoint
            .updateUserStatus(id, true)
            .subscribe(
                () => {
                    // console.log('refresh parent after activate', response);
                    this.refreshParent.emit();
                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                }
            );
    }
}
