import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { LoadUsersAction, UserSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';
import { map, shareReplay } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-users-tab',
  template: `
    <ng-container *ngIf="(isLoading$ | async) === false; else loadingTpl">
      <div style="display: flex; justify-content: center; margin: 16px 0">
        <app-double-chip-selector [options]="['Active users', 'Inactive users']" [(value)]="showActiveUsers" />
      </div>

      <app-users-list
        *ngIf="showActiveUsers && (activeUsers$ | async) as activeUsers"
        [list]="activeUsers"
        [isButtonEnabledToCreateNewUser]="true" />

      <app-users-list *ngIf="!showActiveUsers && (inactiveUsers$ | async) as inactiveUsers" [list]="inactiveUsers" />
    </ng-container>

    <ng-template #loadingTpl>
      <app-progress-indicator />
    </ng-template>
  `,
})
export class UsersTabComponent implements OnInit {
  allUsers$ = this._userApiService.list().pipe(
    map(response => response.users),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    })
  );
  activeUsers$ = this.allUsers$.pipe(map(users => users.filter(user => user.status)));
  inactiveUsers$ = this.allUsers$.pipe(map(users => users.filter(user => !user.status)));
  isLoading$ = this._store.select(UserSelectors.usersLoading);

  showActiveUsers = true;

  constructor(
    private readonly _store: Store,
    private readonly _titleService: Title,
    private _userApiService: UserApiService
  ) {
    this._titleService.setTitle('All users in DSP');
  }

  ngOnInit() {
    this._store.dispatch(new LoadUsersAction());
  }
}
