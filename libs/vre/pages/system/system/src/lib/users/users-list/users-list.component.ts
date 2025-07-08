import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReadProject, ReadUser } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/core/state';
import { SortingService } from '@dasch-swiss/vre/shared/app-helper-services';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { CreateUserDialogComponent } from '../create-user-dialog.component';

interface SortProperty {
  key: keyof ReadUser;
  label: string;
}

type UserSortKey = 'familyName' | 'givenName' | 'email' | 'username';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-users-list',
  template: `
    <div *ngIf="list">
      <!-- header toolbar -->
      <div class="app-toolbar" *ngIf="list.length > 0">
        <div class="app-toolbar-row">
          <h3 class="mat-body subtitle">
            <span *ngIf="status">Active</span>
            <span *ngIf="!status">Suspended</span>
          </h3>
          <span class="fill-remaining-space"></span>
          <span class="app-toolbar-action"> </span>
        </div>
        <div class="app-toolbar-row">
          <span class="app-toolbar-action button left">
            <!-- sort button if more than one item in the list -->
            <app-sort-button
              *ngIf="list.length > 1"
              [icon]="'sort_by_alpha'"
              [sortProps]="sortProps"
              [activeKey]="sortBy"
              (sortKeyChange)="sortList($event)" />
          </span>
          <h2 class="mat-headline-6">
            <span data-cy="user-count">{{ list.length | i18nPlural: itemPluralMapping['user'] }}</span>
          </h2>
          <span class="fill-remaining-space"></span>
          <span
            class="app-toolbar-action button right"
            *ngIf="status && isButtonEnabledToCreateNewUser && (isSysAdmin$ | async)">
            <button mat-flat-button [color]="'primary'" (click)="createUser()">Create new</button>
          </span>
        </div>
      </div>
      <!-- content: list -->
      <table class="table more-space-bottom" [class.deactivated]="!status">
        <tr class="table-entry" *ngFor="let user of list; trackBy: trackByFn; let last = last" [class.no-border]="last">
          <app-users-list-row [user]="user" />
        </tr>
      </table>
    </div>
  `,
  styleUrls: ['./users-list.component.scss'],
})
export class UsersListComponent {
  @Input({ required: true }) status!: boolean;

  _list!: ReadUser[];
  get list(): ReadUser[] {
    return this._list;
  }

  @Input() set list(value: ReadUser[]) {
    this._list = this._sortingService.keySortByAlphabetical(value, this.sortBy as keyof ReadUser);
  }

  @Input() isButtonEnabledToCreateNewUser = false;
  @Input({ required: true }) project!: ReadProject;
  @Output() refreshParent = new EventEmitter<void>();

  // i18n plural mapping
  itemPluralMapping = {
    user: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '=1': '1 User',
      other: '# Users',
    },
    member: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '=1': '1 Member',
      other: '# Members',
    },
  };

  readonly sortProps: SortProperty[] = [
    {
      key: 'familyName',
      label: this._ts.instant('pages.system.usersList.sortFamilyName'),
    },
    {
      key: 'givenName',
      label: this._ts.instant('pages.system.usersList.sortGivenName'),
    },
    {
      key: 'email',
      label: 'E-mail',
    },
    {
      key: 'username',
      label: 'Username',
    },
  ];

  sortBy: UserSortKey = (localStorage.getItem('sortUsersBy') as UserSortKey) || 'username';

  isSysAdmin$ = this._store.select(UserSelectors.isSysAdmin);
  project$ = this._store.select(ProjectsSelectors.currentProject);

  constructor(
    private readonly _matDialog: MatDialog,
    private readonly _sortingService: SortingService,
    private readonly _store: Store,
    private readonly _ts: TranslateService
  ) {}

  trackByFn = (index: number, item: ReadUser) => `${index}-${item.id}`;

  createUser() {
    this._matDialog
      .open(CreateUserDialogComponent, DspDialogConfig.dialogDrawerConfig({}, true))
      .afterClosed()
      .subscribe(() => {
        this.refreshParent.emit();
      });
  }

  sortList(key: UserSortKey) {
    this.sortBy = key;
    this.list = this._sortingService.keySortByAlphabetical(this.list, this.sortBy);
    localStorage.setItem('sortUsersBy', key);
  }
}
