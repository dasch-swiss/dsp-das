import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import {
    ReadUser,
} from '@dasch-swiss/dsp-js';
import { DialogComponent } from '../../main/dialog/dialog.component';
import { Select, Store } from '@ngxs/store';
import { LoadUserAction, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    @Input() loggedInUser?: boolean = false;

    @Output() refreshParent: EventEmitter<any> = new EventEmitter<any>();

    @Select(UserSelectors.isSysAdmin) isSysAdmin$: Observable<boolean>;
    @Select(UserSelectors.user) user$: Observable<ReadUser>;
    @Select(UserSelectors.isLoading) isLoading$: Observable<boolean>;
    
    constructor(
        private _dialog: MatDialog,
        private _titleService: Title,
        private _store: Store,
    ) {
    }

    ngOnInit() {
        this.user$.pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(user => 
                this._titleService.setTitle(`${user.username} (${user.givenName} ${user.familyName})`));
            
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    openDialog(mode: string, name: string): void {
        const dialogConfig: MatDialogConfig = {
            width: '560px',
            maxHeight: '80vh',
            position: {
                top: '112px',
            },
            data: { name: name, mode: mode },
        };

        const dialogRef = this._dialog.open(DialogComponent, dialogConfig);
        dialogRef.afterClosed()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => this._store.dispatch(new LoadUserAction(name)));
    }
}
