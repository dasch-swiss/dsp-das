import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { Select, Store } from '@ngxs/store';
import { UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {

    @Output() refreshParent: EventEmitter<void> = new EventEmitter<void>();

    @Select(UserSelectors.isSysAdmin) isSysAdmin$: Observable<boolean>;
    @Select(UserSelectors.user) user$: Observable<ReadUser>;
    @Select(UserSelectors.isLoading) isLoading$: Observable<boolean>;

    constructor(
        private _dialog: MatDialog,
        private _titleService: Title,
        private _store: Store,
    ) {
        this.user$.pipe(
            take(1),
            tap((user: ReadUser) => {
                if (user) {
                    this._titleService.setTitle(`${user.givenName} ${user.familyName}`);
                }
            })
        ).subscribe()
    }
}
