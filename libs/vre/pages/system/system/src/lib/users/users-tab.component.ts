import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { map } from 'rxjs';
import { UsersTabService } from './users-tab.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-users-tab',
  template: `
    <ng-container *ngIf="!usersTabService.isLoading; else loadingTpl">
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
  providers: [UsersTabService],
})
export class UsersTabComponent {
  activeUsers$ = this.usersTabService.allUsers$.pipe(map(users => users.filter(user => user.status)));
  inactiveUsers$ = this.usersTabService.allUsers$.pipe(map(users => users.filter(user => !user.status)));

  showActiveUsers = true;

  constructor(
    private readonly _titleService: Title,
    public usersTabService: UsersTabService
  ) {
    this._titleService.setTitle('All users in DSP');
  }
}
