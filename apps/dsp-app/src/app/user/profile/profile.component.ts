import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { EditUserPageComponent } from '@dsp-app/src/app/user/edit-user-page/edit-user-page.component';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, takeWhile } from 'rxjs/operators';
import { DialogConfigUtil } from '../../providers/drawer-config-util';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  @Input() loggedInUser?: boolean = false;

  @Select(UserSelectors.isSysAdmin) isSysAdmin$: Observable<boolean>;
  @Select(UserSelectors.user) user$: Observable<ReadUser>;
  @Select(UserSelectors.isLoading) isLoading$: Observable<boolean>;

  constructor(
    private _dialog: MatDialog,
    private _titleService: Title,
    private _store: Store
  ) {}

  ngOnInit() {
    this.user$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        takeWhile(user => user !== null)
      )
      .subscribe(user => this._titleService.setTitle(`${user.username} (${user.givenName} ${user.familyName})`));
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  editProfile(userId) {
    const dialogConfig = DialogConfigUtil.dialogDrawerConfig<string>(userId);
    this._dialog.open(EditUserPageComponent, dialogConfig);
  }
}
