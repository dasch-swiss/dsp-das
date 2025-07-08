import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { LoadUsersAction, ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-users-tab',
  template: `
    <ng-container *ngIf="(isLoading$ | async) === false; else loadingTpl">
      <ng-container *ngIf="project$ | async as project">
        <app-users-list
          *ngIf="activeUsers$ | async as activeUsers"
          [list]="activeUsers"
          [project]="project"
          [status]="true"
          [isButtonEnabledToCreateNewUser]="true" />

        <app-users-list
          *ngIf="inactiveUsers$ | async as inactiveUsers"
          [list]="inactiveUsers"
          [project]="project"
          [status]="false" />
      </ng-container>
    </ng-container>

    <ng-template #loadingTpl>
      <app-progress-indicator />
    </ng-template>
  `,
})
export class UsersTabComponent implements OnInit {
  activeUsers$ = this._store.select(UserSelectors.activeUsers);
  inactiveUsers$ = this._store.select(UserSelectors.inactiveUsers);
  isLoading$ = this._store.select(UserSelectors.usersLoading);
  project$ = this._store.select(ProjectsSelectors.currentProject);

  constructor(
    private readonly _store: Store,
    private readonly _titleService: Title
  ) {
    this._titleService.setTitle('All users in DSP');
  }

  ngOnInit() {
    this._store.dispatch(new LoadUsersAction());
  }
}
