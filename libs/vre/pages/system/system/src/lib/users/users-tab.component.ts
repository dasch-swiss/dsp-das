import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { MatChipListbox, MatChipListboxChange } from '@angular/material/chips';
import { Title } from '@angular/platform-browser';
import { LoadUsersAction, UserSelectors } from '@dasch-swiss/vre/core/state';
import { Store } from '@ngxs/store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-users-tab',
  template: `
    <ng-container *ngIf="(isLoading$ | async) === false; else loadingTpl">
      <div style="display: flex; justify-content: center; margin: 16px 0">
        <mat-chip-listbox
          aria-label="File source"
          style="margin-bottom: 8px; margin-top: 8px"
          [required]="true"
          [value]="showActiveUsers"
          (change)="change($event)">
          <mat-chip-option [value]="true">Active users</mat-chip-option>
          <mat-chip-option [value]="false">Inactive users</mat-chip-option>
        </mat-chip-listbox>
      </div>

      <app-users-list
        *ngIf="showActiveUsers && (activeUsers$ | async) as activeUsers"
        [list]="activeUsers"
        [status]="true"
        [isButtonEnabledToCreateNewUser]="true" />

      <app-users-list
        *ngIf="!showActiveUsers && (inactiveUsers$ | async) as inactiveUsers"
        [list]="inactiveUsers"
        [status]="false" />
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

  @ViewChild(MatChipListbox) matChipListbox!: MatChipListbox;
  showActiveUsers = true;

  constructor(
    private readonly _store: Store,
    private readonly _titleService: Title
  ) {
    this._titleService.setTitle('All users in DSP');
  }

  ngOnInit() {
    this._store.dispatch(new LoadUsersAction());
  }

  change(event: MatChipListboxChange) {
    if (event.value === undefined) {
      this.matChipListbox.value = this.showActiveUsers;
      return;
    }
    this.showActiveUsers = !this.showActiveUsers;
  }
}
