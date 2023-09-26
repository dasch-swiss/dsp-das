import {
    Component,
    EventEmitter,
    Inject,
    Input,
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
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { DialogComponent } from '@dsp-app/src/app/main/dialog/dialog.component';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { ApplicationStateService } from '@dasch-swiss/vre/shared/app-state-service';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { apiConnectionTokenProvider } from '../../providers/api-connection-token.provider';
import { LoadUserAction, UserSelectors } from '@dasch-swiss/vre/shared/app-state';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
    providers: [apiConnectionTokenProvider]
})
export class AccountComponent implements OnInit {
    // in case of modification
    @Output() refreshParent: EventEmitter<any> = new EventEmitter<any>();

    @Input() username: string;

    @Select(UserSelectors.user) user$: Observable<ReadUser>;
    @Select(UserSelectors.isLoading) isLoading$: Observable<boolean>;

    userId = null;

    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection,
        private _applicationStateService: ApplicationStateService,
        private _dialog: MatDialog,
        private _errorHandler: AppErrorHandler,
        private _titleService: Title,
        private store: Store,
    ) {
        // set the page title
        this._titleService.setTitle('Your account');
    }

    ngOnInit() {
        this.store.dispatch(new LoadUserAction(this.username)).pipe(
            tap((user: ReadUser) => {
                this.userId = user.id;
            })
        );
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

    deleteUser(id: string) {
        this._dspApiConnection.admin.usersEndpoint.deleteUser(id).subscribe(
            () => {
                // console.log('refresh parent after delete', response);
                // this action will deactivate own user account. The consequence is a logout
                this._dspApiConnection.v2.auth.logout().subscribe(
                    () => {
                        // destroy application state
                        this._applicationStateService.destroy();

                        // reload the page
                        window.location.reload();
                    },
                    (error: ApiResponseError) => {
                        this._errorHandler.showMessage(error);
                    }
                );
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
